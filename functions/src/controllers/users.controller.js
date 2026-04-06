/**
 * Controller Users
 * This controller is responsible for creating and managing users and their profiles.
 * Author: Unai Villar
 */

const { db } = require("../config/firebase");


/**
 * GET -> Get my profile
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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

/**
 *  PATCH -> Update my profile
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.updateMyProfile = async (req, res) => {
    try {
        const uid = req.user.uid;
        const body = req.body;

        /**
         * Allowed fields to update
         * This fields will be updated
         * name -> string
         * username -> string
         * bio -> string
         * photo -> string
         * sports -> array
         * phoneNumber -> string
         * location -> string
         * TODO: Recommend to add more fields and validate data type with ../model
         */
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


/**
 * GET -> Get user profile with uid(id)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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