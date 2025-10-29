const { Router } = require("express");
const router = Router();
const { db, admin } = require("../firebase.js");
const authMiddleware = require("../middleware/auth.js");

console.log("🔥 Conectado al proyecto:", admin.app().options.credential.projectId);

// RUTA PRINCIPAL (GET /users) - Responde a /api/users
// Esta ruta estaba en router.get("/"), pero debe ser router.get("/users") 
// para responder a /api/users después del reescrito de Firebase Hosting.
router.get("/users", async (req, res) => {
  try {
    const querySnapshot = await db.collection("contacts").get();
    const contacts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // No es necesario console.log(contacts) en producción, pero lo dejamos para depuración
    console.log("Contactos obtenidos:", contacts.length);
    res.send(contacts);
  } catch (error) {
    console.error("Error al obtener los contactos:", error);
    res.status(500).send("Error al obtener los contactos.");
  }
});

// Rutas protegidas - Añade authMiddleware antes de la lógica de la ruta
router.post("/new-contact", authMiddleware, async (req, res) => {
  console.log(req.body);
  try {
    // 1. Obtener los campos del cuerpo de la petición
    const { firstname, lastname, email, phone } = req.body;

    // 2. Construir el objeto contactData e incluir el ID del propietario
    const contactData = {
      firstname,
      lastname,
      email,
      phone,
      // 🚨 CRUCIAL PARA LA SEGURIDAD: Añade el UID del usuario autenticado
      userId: req.user.uid,
      createdAt: new Date() // Opcional, pero recomendado
    };

    // 3. Guardar en Firestore
    const newContact = await db.collection("contacts").add(contactData);

    // 4. Respuesta (Mejorado: Retorna JSON en lugar de redireccionar)
    res.status(201).json({
      message: "Contacto creado exitosamente.",
      id: newContact.id
    });

  } catch (error) {
    console.error("Error al crear el contacto:", error);
    res.status(500).send("Error interno del servidor al crear el contacto.");
  }
});

router.patch("/update-contact/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // 1. Validación: Asegurar que hay datos en el cuerpo
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send("No se proporcionaron datos para actualizar.");
    }

    // 2. Seguridad: Verificar el propietario del contacto
    const contactRef = db.collection("contacts").doc(id);
    const contactDoc = await contactRef.get();

    if (!contactDoc.exists) {
      return res.status(404).send("Contacto no encontrado.");
    }

    const contactData = contactDoc.data();
    const requestingUserId = req.user.uid;

    // Si el usuario autenticado no es el dueño del contacto, denegar.
    if (contactData.userId !== requestingUserId) {
      return res.status(403).send("Prohibido: No eres el propietario de este contacto.");
    }

    // 3. Actualización de Firestore
    await contactRef.update(updateFields);

    res.status(200).json({ message: "Contacto actualizado exitosamente." });

  } catch (error) {
    console.error("Error al actualizar el contacto:", error);
    res.status(500).send("Error interno del servidor al actualizar el contacto.");
  }
});

router.delete("/delete-contact/:id", authMiddleware, async (req, res) => {
  try {
    const contactId = req.params.id;
    const requestingUserId = req.user.uid;

    const contactRef = db.collection("contacts").doc(contactId);
    const contactDoc = await contactRef.get();

    // 1. Verificar si el documento existe
    if (!contactDoc.exists) {
      return res.status(404).send("Contacto no encontrado.");
    }

    // 2. 🚨 VERIFICACIÓN DE PROPIEDAD: Si el usuario no es el dueño, denegar.
    if (contactDoc.data().userId !== requestingUserId) {
      return res.status(403).send("Prohibido: No tienes permiso para eliminar este contacto.");
    }

    // 3. Eliminar el documento
    await contactRef.delete();

    // 4. Devolver 204 No Content (Éxito sin contenido)
    res.status(204).send();

  } catch (error) {
    console.error("Error al eliminar el contacto:", error);
    // 403 y 404 ya están manejados arriba. 500 es para fallos internos.
    res.status(500).send("Error interno del servidor al eliminar el contacto.");
  }
});

module.exports = router;

