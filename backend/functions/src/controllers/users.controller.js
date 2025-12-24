/**
 * Controller Users
 * This controller is responsible for creating and managing users and their profiles.
 * Author: Unai Villar
 */

const { db } = require("../config/firebase");

const MIN_SEARCH_LENGTH = 2;
const FALLBACK_SCAN_LIMIT = 150;

const toLowerCase = (value = "") =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

const buildSearchTokens = (sources = []) => {
    const tokens = new Set();

    sources.forEach((value) => {
        if (typeof value !== "string") return;
        value
            .toLowerCase()
            .split(/[\s,.;:¡!¿?\-_/]+/g)
            .filter(Boolean)
            .forEach((token) => tokens.add(token));
    });

    return Array.from(tokens).slice(0, 50);
};

const sanitizeUserSummary = (doc) => {
    if (!doc || !doc.exists) {
        return null;
    }

    const data = doc.data() || {};

    return {
        id: doc.id,
        uid: doc.id,
        name: data.name || "",
        username: data.username || "",
        photo: data.photo || data.profile_img_path || "",
        bio: data.bio || "",
        interests: data.interests || [],
    };
};


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

        if (data.username) {
            data.usernameLower = toLowerCase(data.username);
        }

        if (data.name) {
            data.nameLower = toLowerCase(data.name);
        }

        if (data.username || data.name || data.bio) {
            data.searchKeywords = buildSearchTokens([
                data.username,
                data.name,
                data.bio,
            ]);
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

exports.searchUsers = async (req, res) => {
    try {
        const requesterId = req.user.uid;
        const { q = "", query = "", limit = 20 } = req.query || {};
        const keyword = toLowerCase(q || query);
        const limitNumber = Math.min(parseInt(limit, 10) || 20, 50);

        if (!keyword || keyword.length < MIN_SEARCH_LENGTH) {
            return res.status(200).json({ success: true, users: [] });
        }

        const executeRangeQuery = async (fieldName) => {
            try {
                const snapshot = await db
                    .collection("users")
                    .orderBy(fieldName)
                    .startAt(keyword)
                    .endAt(`${keyword}\uf8ff`)
                    .limit(limitNumber)
                    .get();

                return snapshot.docs;
            } catch (error) {
                console.warn(`[searchUsers] falling back for field ${fieldName}:`, error.message);
                return [];
            }
        };

        const [byUsernameDocs, byNameDocs] = await Promise.all([
            executeRangeQuery("usernameLower"),
            executeRangeQuery("nameLower"),
        ]);

        const results = new Map();
        const pushDoc = (doc) => {
            if (!doc || !doc.exists) return;
            if (doc.id === requesterId) return;
            if (results.has(doc.id)) return;

            const summary = sanitizeUserSummary(doc);
            if (summary) {
                results.set(doc.id, summary);
            }
        };

        byUsernameDocs.forEach(pushDoc);
        byNameDocs.forEach(pushDoc);

        if (results.size < limitNumber) {
            const fallbackSnapshot = await db
                .collection("users")
                .limit(FALLBACK_SCAN_LIMIT)
                .get();

            for (const doc of fallbackSnapshot.docs) {
                if (results.size >= limitNumber) {
                    break;
                }

                if (!doc || !doc.exists || doc.id === requesterId) {
                    continue;
                }

                const data = doc.data() || {};
                const haystack = [
                    data.username,
                    data.name,
                    data.email,
                    data.bio,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                if (haystack.includes(keyword)) {
                    pushDoc(doc);
                }
            }
        }

        const users = Array.from(results.values()).slice(0, limitNumber);

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Error searchUsers:", error);
        res.status(500).json({ message: "Error al buscar usuarios." });
    }
};