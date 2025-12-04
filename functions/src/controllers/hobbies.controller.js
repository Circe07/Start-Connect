/**
 * Controller Hobbies
 * This controller is responsible for creating and managing hobbies.
 */

const { db } = require("../config/firebase");

/**
 * GET -> Get all hobbies
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllHobbies = async (_, res) => {

    try {
        const snap = await db.collection("globalHobbies").get();
        const hobbies = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(hobbies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET -> Get my hobbies
 * @param {*} req 
 * @param {*} res 
 */
exports.getMyHobbies = async (req, res) => {
    try {
        const uid = req.user.uid;

        /**
         * snap -> contain the query for getting the hobbies
         * hobbies -> contain the array of hobbies
         */
        const snap = await db
            .collection("users")
            .doc(uid)
            .collection("hobbies")
            .get();
        const hobbies = snap.docs.map((doc) => doc.id);

        res.json(hobbies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST -> Add hobbies to user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.addHobbiesToUser = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { hobbies } = req.body;

        if (!hobbies || !Array.isArray(hobbies)) {
            return res
                .status(400)
                .json({ message: "Debe proporcionar un array de hobbies" });
        }

        const batch = db.batch();

        hobbies.forEach((hobbyId) => {
            const ref = db
                .collection("users")
                .doc(uid)
                .collection("hobbies")
                .doc(hobbyId);
            batch.set(ref, { active: true });
        });

        await batch.commit();

        res.json({ success: true, message: "Hobbies agregados correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET -> Get all users for a specific hobby
 * @param {*} req 
 * @param {*} res 
 */
exports.getUsersByHobby = async (req, res) => {
    try {
        const { hobbyId } = req.params;

        if (!hobbyId) {
            res.status(400).json({ message: 'Debe proporcionar un id de hobby' });
        }

        const snap = await db.collectionGroup("hobbies").get();


        const users = snap.docs
            .filter((doc) => doc.id === hobbyId)
            .map((doc) => doc.ref.parent.parent.id);

        res.json(users);
    } catch (err) {
        console.error("🔥 ERROR en getUsersByHobby:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * DELETE -> Delete hobbies from user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.removeHobbiesFromUser = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { hobbies } = req.body;

        if (!hobbies || !Array.isArray(hobbies)) {
            return res
                .status(400)
                .json({ message: "Debe proporcionar un array de hobbies" });
        }

        const batch = db.batch();
        const rootRef = db.collection("users").doc(uid).collection("hobbies");

        // hobbyId -> references to each hobby
        hobbies.forEach((hobbyId) => {
            const ref = rootRef.doc(hobbyId);
            batch.delete(ref);
        });

        await batch.commit();

        res.json({ success: true, message: "Hobbies eliminados correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
