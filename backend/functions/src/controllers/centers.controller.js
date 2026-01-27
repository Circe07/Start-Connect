/**
 * Controller Centers
 * This controller manages sports centers/venues and their facilities
 * Admin-only operations for creating/updating centers
 * Public operations for listing and searching
 */

const { db, FieldValue } = require("../config/firebase");
const Center = require("../models/center.model");

/**
 * POST - Create a new sports center (Admin only)
 * Requires admin authentication
 * @param {Request} req - Express request object
 * @param {Request} req.body.name - Center name (required)
 * @param {Request} req.body.address - Center address (required)
 * @param {Request} req.body.location - Location object with lat/lng (required)
 * @param {Request} req.body.description - Optional description
 * @param {Request} req.body.services - Array of services offered
 * @param {Request} req.body.prices - Pricing information
 * @param {Request} req.body.socialMedia - Social media links
 * @param {Response} res - Express response object
 * @returns {Object} Created center with generated ID
 */
exports.createCenter = async (req, res) => {
    try {
        const { name, description, address, location, services, prices, socialMedia } = req.body;

        if (!name || !address || !location || !location.lat || !location.lng) {
            return res.status(400).json({ message: "Nombre, dirección y coordenadas (lat, lng) son obligatorios." });
        }

        const newCenter = new Center(null, {
            name,
            description,
            address,
            location,
            services,
            prices,
            socialMedia,
            createdAt: FieldValue.serverTimestamp()
        });

        const docRef = await db.collection("centers").add(newCenter.toFirestore());

        res.status(201).json({
            message: "Centro creado exitosamente.",
            id: docRef.id,
            center: newCenter
        });

    } catch (error) {
        console.error("Error createCenter:", error);
        res.status(500).json({ message: "Error interno al crear el centro." });
    }
};

/**
 * DELETE - Delete a sports center (Admin only)
 * Removes center and all associated data
 * @param {Request} req - Express request object
 * @param {Request} req.params.id - Center ID to delete
 * @param {Response} res - Express response object
 * @returns {Object} Success message
 */
exports.deleteCenter = async (req, res) => {
    try {
        const { id } = req.params;
        const centerRef = db.collection("centers").doc(id);
        const doc = await centerRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "El centro no existe." });
        }

        await centerRef.delete();
        res.status(200).json({ message: "Centro eliminado correctamente." });

    } catch (error) {
        console.error("Error deleteCenter:", error);
        res.status(500).json({ message: "Error interno al eliminar el centro." });
    }
};

/**
 * PATCH - Update an existing sports center (Admin only)
 * Allows updating center details (name, description, services, pricing, etc.)
 * Preserves createdAt and automatically updates updatedAt timestamp
 * @param {Request} req - Express request object
 * @param {Request} req.params.id - Center ID to update
 * @param {Request} req.body - Fields to update (any Center fields)
 * @param {Response} res - Express response object
 * @returns {Object} Success message
 */
exports.updateCenter = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Evitar que se actualice el ID o fechas de creación manualmente
        delete updates.id;
        delete updates.createdAt;

        updates.updatedAt = FieldValue.serverTimestamp();

        const centerRef = db.collection("centers").doc(id);
        const doc = await centerRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "El centro no existe." });
        }

        await centerRef.update(updates);

        res.status(200).json({ message: "Centro actualizado correctamente." });

    } catch (error) {
        console.error("Error updateCenter:", error);
        res.status(500).json({ message: "Error interno al actualizar el centro." });
    }
};

/**
 * GET - List all sports centers (Public)
 * Returns complete list of all available centers
 * No authentication required
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Array} List of all centers with complete information
 */
exports.getCenters = async (req, res) => {
    try {
        const snapshot = await db.collection("centers").get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const centers = snapshot.docs.map(doc => Center.fromFirestore(doc));
        res.status(200).json({ centers });

    } catch (error) {
        console.error("Error getCenters:", error);
        res.status(500).json({ message: "Error al obtener los centros." });
    }
};

/**
 * GET - Search for sports centers (Public)
 * Supports filtering by name, description and location-based distance
 * Uses Haversine formula for accurate distance calculation
 * @param {Request} req - Express request object
 * @param {Request} req.query.q - Text search query (name/description)
 * @param {Request} req.query.lat - Latitude for distance-based search
 * @param {Request} req.query.lng - Longitude for distance-based search
 * @param {Request} req.query.radius - Search radius in meters (default 10000)
 * @param {Response} res - Express response object
 * @returns {Array} Matching centers sorted by relevance or distance
 */
exports.searchCenters = async (req, res) => {
    try {
        const { q, lat, lng, radius } = req.query;

        let centers = [];
        const snapshot = await db.collection("centers").get();

        snapshot.forEach(doc => {
            centers.push(Center.fromFirestore(doc));
        });

        // Filtrar por nombre (si se proporciona 'q')
        if (q) {
            const query = q.toLowerCase();
            centers = centers.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.description.toLowerCase().includes(query)
            );
        }

        // Filtrar por cercanía (si se proporcionan coordenadas)
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const searchRadius = parseFloat(radius) || 10000; // 10km default

            centers = centers.map(c => {
                if (c.location && c.location.lat && c.location.lng) {
                    const dist = getDistanceFromLatLonInKm(userLat, userLng, c.location.lat, c.location.lng) * 1000;
                    return { ...c, distance: Math.round(dist) };
                }
                return null;
            }).filter(c => c && c.distance <= searchRadius)
                .sort((a, b) => a.distance - b.distance);
        }

        res.status(200).json(centers);

    } catch (error) {
        console.error("Error searchCenters:", error);
        res.status(500).json({ message: "Error en la búsqueda." });
    }
};

/**
 * Helper function - Calculate distance between two geographic points
 * Uses Haversine formula for accurate great-circle distance
 * Earth radius: 6371 km
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Helper function - Convert degrees to radians
 * @param {number} deg - Angle in degrees
 * @returns {number} Angle in radians
 */
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
