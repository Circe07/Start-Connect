// functions/src/routes/users.js
const { db, admin } = require("../config/firebase");
const Contact = require("../models/contact.model");

// Referencia a la subcolección de contactos de un usuario
const getContactsCollectionRef = (userId) =>
    db.collection("users").doc(userId).collection("contacts");

// Log de conexión del proyecto (solo en local)
if (process.env.NODE_ENV !== "production") {
    console.log("🔥 Proyecto conectado:", admin.app().options.projectId);
}

exports.getAllContacts = async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await getContactsCollectionRef(userId).get();

        const contacts = snapshot.docs.map((doc) => Contact.fromFirestore(doc));

        return res.status(200).json({
            success: true,
            count: contacts.length,
            contacts,
        });
    } catch (error) {
        console.error("Error al obtener contactos:", error);
        res.status(500).json({ success: false, message: "Error al obtener contactos", error: error.message });
    }
};

exports.createContact = async (req, res) => {
    try {
        const userId = req.user.uid;
        const contactData = req.body;

        if (!contactData || typeof contactData !== "object" || Array.isArray(contactData)) {
            return res.status(400).json({ success: false, message: "Datos vacíos o inválidos" });
        }

        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({ createdAt: new Date(), email: req.user.email || null });
        }

        // Uso del modelo Contact para crear el contacto
        const newContact = new Contact(null, userId, contactData);
        const contactRef = await userRef.collection("contacts").add(newContact.toFirestore());

        return res.status(201).json({
            success: true,
            message: "Contacto creado correctamente",
            contactId: contactRef.id,
        });
    } catch (error) {
        console.error("Error creando contacto:", error);
        res.status(500).json({ success: false, message: "Error creando contacto", error: error.message });
    }
};

exports.updateContact = async (req, res) => {
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

        updates.updatedAt = new Date();
        await contactRef.update(updates);

        const updatedContact = await contactRef.get();
        return res.status(200).json({
            success: true,
            message: "Contacto actualizado correctamente",
            contact: { id, ...updatedContact.data() },
        });
    } catch (error) {
        console.error("Error al actualizar contacto:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno al actualizar el contacto",
            error: error.message,
        });
    }
};

exports.deleteContact = async (req, res) => {
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
        console.error("Error al eliminar contacto:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno al eliminar el contacto",
            error: error.message,
        });
    }
};
