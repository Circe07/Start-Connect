const { db, FieldValue } = require("../config/firebase");
const Center = require("../models/center.model");

// POST /centers (Admin Only)
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

// DELETE /centers/:id (Admin Only)
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

// PATCH /centers/:id (Admin Only)
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

// GET /centers (Public)
exports.getCenters = async (req, res) => {
    try {
        const snapshot = await db.collection("centers").get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const centers = snapshot.docs.map(doc => Center.fromFirestore(doc));
        res.status(200).json(centers);

    } catch (error) {
        console.error("Error getCenters:", error);
        res.status(500).json({ message: "Error al obtener los centros." });
    }
};

// GET /centers/search (Public) - Búsqueda por nombre o cercanía
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

// Helper Haversine
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

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
