/**
 * Controller Hobbies
 * This controller manages user hobbies and interests
 * Features: List all hobbies, manage user hobbies, find users by hobby
 */

const { db } = require("../config/firebase");

/**
 * GET - Retrieve all available hobbies from global collection
 * Returns complete hobby catalog for users to select from
 * @param {Request} req - Express request object (unused)
 * @param {Response} res - Express response object
 * @returns {Array} List of all available hobbies with IDs
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
 * GET - Retrieve current user's hobbies
 * Returns only hobby IDs that the user has selected
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Array} Array of hobby IDs the user follows
 */
exports.getMyHobbies = async (req, res) => {
    try {
        const uid = req.user.uid;

        /**
         * Query the user's hobbies subcollection
         * snap - contains the query result
         * hobbies - array of hobby IDs extracted from document IDs
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
 * POST - Add hobbies to the current user
 * Accepts array of hobby IDs and adds them to user's profile
 * @param {Request} req - Express request object
 * @param {Request} req.body.hobbies - Array of hobby IDs to add
 * @param {Response} res - Express response object
 * @returns {Object} Success message
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
 * GET - Find all users who follow a specific hobby
 * Searches across all users' hobby collections for a given hobby ID
 * @param {Request} req - Express request object
 * @param {Request} req.params.hobbyId - The hobby ID to search for
 * @param {Response} res - Express response object
 * @returns {Array} List of user IDs who follow this hobby
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
 * DELETE - Remove hobbies from current user
 * Accepts array of hobby IDs and removes them from user's profile
 * @param {Request} req - Express request object
 * @param {Request} req.body.hobbies - Array of hobby IDs to remove
 * @param {Response} res - Express response object
 * @returns {Object} Success message
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

        // For each hobby ID, delete the corresponding document
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
