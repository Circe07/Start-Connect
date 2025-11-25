const functions = require("firebase-functions");
const { db } = require("../config/firebase");
const Group = require("../models/group.model");

/* ==========================================================
   GET /maps/nearby
   Query Params: lat, lng, radius (meters)
========================================================== */
exports.getNearbyPlaces = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitud (lat) y Longitud (lng) son obligatorias." });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const searchRadius = parseFloat(radius) || 5000; // Default 5km

        // 1. Obtener todos los grupos (Optimización: filtrar por ciudad si estuviera disponible)
        const snapshot = await db.collection("groups").get();

        if (snapshot.empty) {
            return res.status(200).json({
                success: true,
                count: 0,
                places: []
            });
        }

        const places = [];

        // 2. Filtrar por distancia (Fórmula de Haversine)
        snapshot.forEach(doc => {
            const group = Group.fromFirestore(doc);

            // Verificar que el grupo tenga ubicación válida
            if (group.location && typeof group.location.lat === 'number' && typeof group.location.lng === 'number') {
                const distance = getDistanceFromLatLonInKm(userLat, userLng, group.location.lat, group.location.lng) * 1000; // Convertir a metros

                if (distance <= searchRadius) {
                    places.push({
                        id: group.id,
                        name: group.name,
                        description: group.description,
                        sport: group.sport,
                        location: group.location,
                        distance: Math.round(distance), // Metros
                        membersCount: group.members.length,
                        isPublic: group.isPublic
                    });
                }
            }
        });

        // Ordenar por distancia
        places.sort((a, b) => a.distance - b.distance);

        res.status(200).json({
            success: true,
            count: places.length,
            places: places
        });

    } catch (error) {
        console.error("Error getNearbyPlaces:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

// Función auxiliar: Fórmula de Haversine
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la tierra en km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distancia en km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
