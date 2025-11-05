// src/controllers/contactController.js
const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * Crear un nuevo contacto para un usuario
 */
exports.createContact = async (req, res) => {
    try {
        const { userId, name, description, city, isPublic } = req.body;

        console.log("Intentando crear contacto para usuario:", userId);

        // Validar que vengan los campos necesarios
        if (!userId || !name) {
            return res.status(400).json({ error: "Faltan campos obligatorios." });
        }

        // Construir los datos del contacto
        const contactData = {
            userId,
            name,
            description: description || "",
            city: city || "",
            isPublic: isPublic || false,
            createdAt: new Date(),
        };

        // Referencia correcta a la colección de contactos dentro del usuario
        const userRef = db.collection("User").doc(userId);
        const contactRef = await userRef.collection("contacts").add(contactData);

        console.log("✅ Contacto creado con ID:", contactRef.id);
        res.status(201).json({ message: "Contacto creado exitosamente", id: contactRef.id });

    } catch (error) {
        console.error("Error al crear el contacto:", error);
        res.status(500).json({ error: error.message });
    }
};
