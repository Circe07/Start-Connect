/**
 * Controller Contacts
 * This controller is responsible for managing user contacts (addresses, phones, etc.)
 * Features: Create, Read, Update, Delete (CRUD) operations on contacts
 */

const { db, admin } = require("../config/firebase");
const Contact = require("../models/contact.model");

/**
 * Helper function to get a user's contacts subcollection reference
 * @param {string} userId - The user ID
 * @returns {CollectionReference} Reference to user's contacts collection
 */
const getContactsCollectionRef = (userId) =>
    db.collection("users").doc(userId).collection("contacts");

// Log connection status (local development only)
if (process.env.NODE_ENV !== "production") {
    console.log("🔥 Proyecto conectado:", admin.app().options.projectId);
}

/**
 * GET - Retrieve all contacts for the authenticated user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Object} List of contacts with success status
 */
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

/**
 * POST - Create a new contact for the authenticated user
 * @param {Request} req - Express request object with contact data in body
 * @param {Request} req.body.name - Contact name
 * @param {Request} req.body.email - Contact email
 * @param {Request} req.body.phone - Contact phone number
 * @param {Response} res - Express response object
 * @returns {Object} Success message with newly created contact ID
 */
exports.createContact = async (req, res) => {
    try {
        const userId = req.user.uid;
        const contactData = req.body;

        // Validate input is not empty
        if (!contactData || typeof contactData !== "object" || Array.isArray(contactData)) {
            return res.status(400).json({ success: false, message: "Datos vacíos o inválidos" });
        }

        // Ensure user document exists
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({ createdAt: new Date(), email: req.user.email || null });
        }

        // Use Contact model to create and validate contact
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

/**
 * PATCH - Update an existing contact
 * @param {Request} req - Express request object
 * @param {Request} req.params.id - Contact ID to update
 * @param {Request} req.body - Fields to update (name, email, phone, etc.)
 * @param {Response} res - Express response object
 * @returns {Object} Updated contact data
 */
exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = req.user.uid;

        // Validate that update data is provided
        if (!Object.keys(updates).length) {
            return res.status(400).json({ success: false, message: "No hay datos para actualizar" });
        }

        const contactRef = getContactsCollectionRef(userId).doc(id);
        const contactDoc = await contactRef.get();

        // Check if contact exists
        if (!contactDoc.exists) {
            return res.status(404).json({ success: false, message: "Contacto no encontrado" });
        }

        // Verify ownership - only contact owner can update
        if (contactDoc.data().userId !== userId) {
            return res.status(403).json({ success: false, message: "No autorizado" });
        }

        // Add updated timestamp
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

/**
 * DELETE - Remove a contact
 * @param {Request} req - Express request object
 * @param {Request} req.params.id - Contact ID to delete
 * @param {Response} res - Express response object
 * @returns {Object} Success message
 */
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const contactRef = getContactsCollectionRef(userId).doc(id);
        const contactDoc = await contactRef.get();

        // Check if contact exists
        if (!contactDoc.exists) {
            return res.status(404).json({ success: false, message: "Contacto no encontrado" });
        }

        // Verify ownership - only contact owner can delete
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
