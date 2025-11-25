const functions = require("firebase-functions");
const { db } = require("../config/firebase");
const Center = require("../models/center.model");

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

        // 1. Obtener todos los centros
        const snapshot = await db.collection("centers").get();
        console.log(`[DEBUG] Centros encontrados en DB: ${snapshot.size}`);

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
            const data = doc.data();
            console.log(`[DEBUG] Procesando centro ID: ${doc.id}`, JSON.stringify(data));

            const center = Center.fromFirestore(doc);

            // Verificar que el centro tenga ubicación válida (permitir strings numéricos)
            const centerLat = parseFloat(center.location?.lat);
            const centerLng = parseFloat(center.location?.lng);

            console.log(`[DEBUG] Coordenadas parseadas: lat=${centerLat}, lng=${centerLng}`);

            if (!isNaN(centerLat) && !isNaN(centerLng)) {
                const distance = getDistanceFromLatLonInKm(userLat, userLng, centerLat, centerLng) * 1000; // Convertir a metros
                console.log(`[DEBUG] Distancia calculada: ${distance} metros (Radio: ${searchRadius})`);

                if (distance <= searchRadius) {
                    places.push({
                        id: center.id,
                        name: center.name,
                        description: center.description,
                        address: center.address,
                        location: center.location,
                        distance: Math.round(distance), // Metros
                        services: center.services,
                        prices: center.prices,
                        socialMedia: center.socialMedia
                    });
                } else {
                    console.log(`[DEBUG] Centro fuera de rango.`);
                }
            } else {
                console.log(`[DEBUG] Coordenadas inválidas.`);
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
