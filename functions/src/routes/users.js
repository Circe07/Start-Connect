// functions/src/routes/users.js
const { Router } = require("express");
const { db, admin } = require("../config/firebase");
const authMiddleware = require("../middleware/auth");

const router = Router();

// Referencia a la subcolección de contactos de un usuario
const getContactsCollectionRef = (userId) =>
  db.collection("User").doc(userId).collection("contacts");

// Ruta de verificación
router.get("/check", (_, res) => {
  return res.status(200).json({ success: true, message: "Users Router funcionando correctamente" });
});

// Log de conexión del proyecto (solo en local)
if (process.env.NODE_ENV !== "production") {
  console.log("🔥 Proyecto conectado:", admin.app().options.projectId);
}

/* =======================================================
   📍 GET /users → Obtener todos los contactos del usuario
======================================================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const contactsSnapshot = await getContactsCollectionRef(userId).get();

    const contacts = contactsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("❌ Error al obtener contactos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los contactos",
      error: error.message,
    });
  }
});

/* =======================================================
   📍 POST /users/new-contact → Crear un nuevo contacto
======================================================= */
router.post("/new-contact", authMiddleware, async (req, res) => {
  const userId = req.user.uid;
  const contactData = req.body;

  if (!contactData || Object.keys(contactData).length === 0) {
    return res.status(400).json({ success: false, message: "Datos del contacto vacíos o inválidos" });
  }

  try {
    console.log(`🟢 Creando contacto para usuario: ${userId}`);

    const userRef = db.collection("User").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        createdAt: new Date(),
        email: req.user.email || null,
      });
      console.log(`🟢 Documento de usuario ${userId} creado.`);
    }

    const newContactRef = await userRef.collection("contacts").add({
      ...contactData,
      userId,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Contacto creado correctamente",
      contactId: newContactRef.id,
    });
  } catch (error) {
    console.error("❌ Error al crear el contacto:", error);
    return res.status(500).json({
      success: false,
      message: "Error al crear el contacto",
      error: error.message,
    });
  }
});

/* =======================================================
   📍 PATCH /users/update-contact/:id → Actualizar contacto
======================================================= */
router.patch("/update-contact/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.uid;

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: "No hay datos para actualizar" });
    }

    const contactRef = getContactsCollectionRef(userId).doc(id);
    const contactDoc = await contactRef.get();

    if (!contactDoc.exists) {
      return res.status(404).json({ success: false, message: "Contacto no encontrado" });
    }

    if (contactDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    await contactRef.update(updates);

    const updatedContact = await contactRef.get();
    return res.status(200).json({
      success: true,
      message: "Contacto actualizado correctamente",
      contact: { id, ...updatedContact.data() },
    });
  } catch (error) {
    console.error("❌ Error al actualizar contacto:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al actualizar el contacto",
      error: error.message,
    });
  }
});

/* =======================================================
   📍 DELETE /users/delete-contact/:id → Eliminar contacto
======================================================= */
router.delete("/delete-contact/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const contactRef = getContactsCollectionRef(userId).doc(id);
    const contactDoc = await contactRef.get();

    if (!contactDoc.exists) {
      return res.status(404).json({ success: false, message: "Contacto no encontrado" });
    }

    if (contactDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    await contactRef.delete();

    return res.status(200).json({ success: true, message: "Contacto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar contacto:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al eliminar el contacto",
      error: error.message,
    });
  }
});

module.exports = router;
