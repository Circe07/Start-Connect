const { db } = require("../config/firebase");


// GET -> Obtiene el perfil de un usuario
exports.getMyProfile = async (req, res) => {
    try {
        const uid = req.user.uid;

        const snap = await db.collection("users").doc(uid).get();

        if (!snap.exists) {
            return res.status(404).json({ message: "El usuario no existe" });
        }

        res.json(snap.data());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

// PATCH -> Actualiza el perfil de un usuario
exports.updateMyProfile = async (req, res) => {
    try {
        const uid = req.user.uid;
        const body = req.body;

        const allowedFields = [
            "name",
            "username",
            "bio",
            "photo",
            "sports",
            "phoneNumber",
            "location"
        ];

        const data = {};
        allowedFields.forEach(field => {
            if (body[field] !== undefined) data[field] = body[field];
        });



        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: "No se proporcionaron campos válidos para actualizar" });
        }

        await db.collection("users").doc(uid).update(data);

        res.json({ message: "Perfil actualizado correctamente" });
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message });
    };
};


// GET -> Obtiene un usuario por su ID
exports.getUserProfile = async (req, res) => {
    try {
        const { uid } = req.params;

        const snap = await db.collection("users").doc(uid).get();

        if (!snap.exists) {
            return res.status(404).json({ message: "El usuario no existe" });
        }

        res.json(snap.data());

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    };
};