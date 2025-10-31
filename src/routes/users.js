const { Router } = require("express");
const router = Router();
const { db, admin } = require("../firebase.js");
const authMiddleware = require("../middleware/auth.js");

// Función utilitaria para construir la ruta completa de la colección del usuario.
// CORRECCIÓN: Esta ruta coincide con la estructura de tu captura de pantalla.
// Path: appbase (Col) -> User (Doc) -> User (Col) -> {userId} (Doc) -> contacts (Col)
const getContactsCollectionRef = (userId) => {
  // Usamos una colección de acceso simple y plano (sin anidación por usuario)
  const collectionName = 'general_contacts';
  // Añadimos el userId al documento, no a la ruta
  return db.collection(collectionName);
};

// --- Ruta de verificación para los tests ---
router.get("/check", (req, res) => {
  res.status(200).send("Users Router Loaded");
});

if (process.env.NODE_ENV !== "test") {
  console.log("🔥 Conectado al proyecto:", admin.app().options.credential.projectId);
}

// RUTA PRINCIPAL (GET /users) - Responde a /api/users
router.get("/", authMiddleware, async (req, res) => {

  console.log(`[GET /] UID de usuario recibido: ${req.user?.uid}`); // Verificamos el uid que obtiene

  try {
    const requestingUserId = req.user.uid;
    const contactsRef = getContactsCollectionRef(requestingUserId);

    const querySnapshot = await contactsRef.get();
    const contacts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
    const requestingUserId = req.user.uid;

    // 2. Construir el objeto contactData e incluir el ID del propietario
    // Sanitización: Solo incluir campos definidos en el JSON
    const contactData = Object.keys(req.body).reduce((acc, key) => {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        acc[key] = req.body[key];
      }
      return acc;
    }, {});

    // Añadir metadatos
    contactData.userId = requestingUserId;
    contactData.createdAt = new Date();

    // 3. Guardar en Firestore
    const contactsRef = getContactsCollectionRef(requestingUserId);
    const newContact = await contactsRef.add(contactData);

    // 4. Respuesta
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
    const requestingUserId = req.user.uid;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send("No se proporcionaron datos para actualizar.");
    }

    const contactsRef = getContactsCollectionRef(requestingUserId);
    const contactRef = contactsRef.doc(id);
    const contactDoc = await contactRef.get();

    if (!contactDoc.exists) {
      return res.status(404).send("Contacto no encontrado.");
    }

    if (contactDoc.data().userId !== requestingUserId) {
      return res.status(403).send("Prohibido: No eres el propietario de este contacto.");
    }

    // Sanitizar campos de actualización
    const validUpdateFields = Object.keys(updateFields).reduce((acc, key) => {
      if (updateFields[key] !== undefined && updateFields[key] !== null) {
        acc[key] = updateFields[key];
      }
      return acc;
    }, {});

    await contactRef.update(validUpdateFields);

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

    const contactsRef = getContactsCollectionRef(requestingUserId);
    const contactRef = contactsRef.doc(contactId);
    const contactDoc = await contactRef.get();

    if (!contactDoc.exists) {
      return res.status(404).send("Contacto no encontrado.");
    }

    if (contactDoc.data().userId !== requestingUserId) {
      return res.status(403).send("Prohibido: No tienes permiso para eliminar este contacto.");
    }

    await contactRef.delete();
    res.status(204).send();

  } catch (error) {
    console.error("Error al eliminar el contacto:", error);
    res.status(500).send("Error interno del servidor al eliminar el contacto.");
  }
});

module.exports = router;

