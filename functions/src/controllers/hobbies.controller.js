const { db } = require("../config/firebase");

// GET -> Obtiene todos los hobbies
exports.getAllHobbies = async (req, res) => {

    try {
        const snap = await db.collection("hobbies").get();
        const hobbies = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(hobbies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET -> Obtiene los hobbies de un usuario
exports.getMyHobbies = async (req, res) => {
    try {
        const uid = req.user.uid;
        const snap = await db.collection("users").doc(uid).collection("hobbies").get();
        const hobbies = snap.docs.map(doc => doc.id);

        res.json(hobbies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST -> Agrega hobbies a un usuario
exports.addHobbiesToUser = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { hobbies } = req.body

        if (!hobbies || !Array.isArray(hobbies)) {
            return res.status(400).json({ message: "Debe proporcionar un array de hobbies" });
        };

        const batch = db.batch();
        hobbies.forEach(hobbyId => {
            const ref = db.collection("users").doc(uid).collection("hobbies").doc(hobbyId);
            batch.set(ref, { active: true });
        });

        await batch.commit();

        res.json({ success: true, message: "Hobbies agregados correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET -> Obtiene los usuarios que tienen un hobby
exports.getUsersByHobby = async (req, res) => {
    try {
        const { hobbyId } = req.params;
        console.log("=== getUsersByHobby ===");
        console.log("hobbyId recibido:", hobbyId);

        const snap = await db.collectionGroup("hobbies")
            .where("active", "==", true)
            .get();

        console.log("Total docs encontrados en collectionGroup:", snap.size);

        const mapped = snap.docs.map(doc => ({
            docId: doc.id,
            fullPath: doc.ref.path,
            parentPath: doc.ref.parent.parent.path
        }));

        console.log("Documentos encontrados:", mapped);

        const filtered = mapped.filter(item =>
            item.parentPath.startsWith("users/") && item.docId === hobbyId
        );

        console.log("Documentos filtrados:", filtered);

        const users = filtered.map(item => item.parentPath.split("/")[1]);

        res.json(users);

    } catch (err) {
        console.error("🔥 ERROR en getUsersByHobby:", err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE -> Elimina hobbies de un usuario
exports.removeHobbiesFromUser = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { hobbies } = req.body;

        await db.collection("users").doc(uid).collection("hobbies").doc(hobbyId).delete();

        res.json({ success: true, message: "Hobbies eliminados correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};