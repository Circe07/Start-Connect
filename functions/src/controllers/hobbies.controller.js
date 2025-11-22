const { db } = require("../config/firebase");

// GET -> Obtiene todos los hobbies
exports.getAllHobbies = async (req, res) => {

    try {
        const snap = await db.collection("globalHobbies").get();
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
            .get();

        console.log("Total docs encontrados en collectionGroup:", snap.size);

        const users = snap.docs
            .filter(doc => doc.id === hobbyId)
            .map(doc => doc.ref.parent.parent.id);

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

        if (!hobbies || !Array.isArray(hobbies)) {
            return res.status(400).json({ message: "Debe proporcionar un array de hobbies" });
        };

        const batch = db.batch();
        const rootRef = db.collection("users").doc(uid).collection("hobbies")

        // hobbyId hace referencia al id de cada hobby
        // ! no utilizar fuera de este scope por el hecho que hobbyId no esta definido
        hobbies.forEach(hobbyId => {
            const ref = rootRef.doc(hobbyId);
            batch.delete(ref);
        });

        await batch.commit();

        res.json({ success: true, message: "Hobbies eliminados correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};