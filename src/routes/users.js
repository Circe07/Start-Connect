const { Router } = require("express");
const router = Router();
const { db, admin } = require("../firebase.js");
const authMiddleware = require("../middleware/auth.js");

// Función para obtener la referencia a los contactos del usuario
const getContactsCollectionRef = (userId) => {
  return db.collection("User").doc(userId).collection("contacts");
};

// --- Ruta de verificación ---
router.get("/check", (req, res) => {
  res.status(200).send("Users Router Loaded");
});

if (process.env.NODE_ENV !== "test") {
  console.log("🔥 Conectado al proyecto:", admin.app().options.projectId);
}

// --- GET /users (obtener contactos del usuario autenticado) ---
router.get("/", authMiddleware, async (req, res) => {
  console.log(`[GET /] UID de usuario recibido: ${req.user?.uid}`);

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

// --- POST /new-contact (crear nuevo contacto) ---
router.post("/new-contact", authMiddleware, async (req, res) => {
  console.log("Usuario autenticado:", req.user);

  const userId = req.user.uid;
  const contactData = req.body;

  try {
    const userRef = db.collection("User").doc(userId);


    // 1️⃣ Verifica si el documento del usuario existe
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`Usuario ${userId} no existía. Creando documento...`);
      await userRef.set({
        createdAt: new Date(),
        email: req.user.email || null,
      });
    }

    // 2️⃣ Crea el contacto
    const newContact = await userRef.collection("contacts").add({
      ...contactData,
      userId: req.user.uid,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Contacto creado correctamente",
      contactId: newContact.id,
    });
  } catch (error) {
    console.error("Error al crear el contacto:", error);
    res.status(500).json({
      message: "Error al crear el contacto",
      error: error.message,
    });
  }
});

// --- PATCH /update-contact/:id (actualizar contacto) ---
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

    await contactRef.update(updateFields);

    const updatedContact = await contactRef.get();
    res.status(200).json({
      message: "Contacto actualizado exitosamente.",
      contact: { id: updatedContact.id, ...updatedContact.data() },
    });
  } catch (error) {
    console.error("Error al actualizar el contacto:", error);
    res.status(500).send("Error interno del servidor al actualizar el contacto.");
  }
});

// --- DELETE /delete-contact/:id (eliminar contacto) ---
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
