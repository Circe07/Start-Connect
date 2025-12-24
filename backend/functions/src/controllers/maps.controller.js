/**
 * Controller Maps
 * This controller is responsible for handling map-related operations.
 * Author: Unai Villar
 */

const functions = require("firebase-functions");
const { db } = require("../config/firebase");
const Center = require("../models/center.model");

/**
 * GET -> Get nearby places
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

exports.getNearbyPlaces = async (req, res) => {
    try {
        /**
         * Query Params
         * lat -> User latitude
         * lng -> User longitude
         * radius -> Search radius
         */
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitud (lat) y Longitud (lng) son obligatorias." });
        }

        /**
         * userLat references -> User latitude
         * userLng references -> User longitude
         * searchRadius references -> Search radius(default value = 5000m)
         */
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const searchRadius = parseFloat(radius) || 5000;

        const snapshot = await db.collection("centers").get();
        /**
         * LOG for depuration and get centers
         */
        console.log(`[DEBUG] Centros encontrados en DB: ${snapshot.size}`);

        if (snapshot.empty) {
            return res.status(200).json({
                success: true,
                count: 0,
                places: []
            });
        }

        /**
         * TODO: Finish documentation
         */
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

/**
 * GET -> Search places by text query and optional coordinates
 */
exports.searchPlaces = async (req, res) => {
    try {
        const { q = "", lat, lng, radius } = req.query;
        const normalizedQuery = q.trim().toLowerCase();
        const hasQuery = normalizedQuery.length > 0;
        const hasCoordinates = lat !== undefined && lng !== undefined;

        if (!hasQuery && !hasCoordinates) {
            return res.status(400).json({
                success: false,
                message: "Debe proporcionar al menos un texto de búsqueda o coordenadas.",
            });
        }

        const snapshot = await db.collection("centers").get();

        if (snapshot.empty) {
            return res.status(200).json({ success: true, count: 0, places: [] });
        }

        const userLat = hasCoordinates ? parseFloat(lat) : null;
        const userLng = hasCoordinates ? parseFloat(lng) : null;
        const searchRadius = hasCoordinates ? parseFloat(radius) || 5000 : null;

        if (hasCoordinates && (Number.isNaN(userLat) || Number.isNaN(userLng))) {
            return res.status(400).json({
                success: false,
                message: "Las coordenadas proporcionadas no son válidas.",
            });
        }

        const centers = snapshot.docs.map(doc => Center.fromFirestore(doc));
        const filteredCenters = hasQuery
            ? centers.filter(center => {
                const haystack = `${center.name} ${center.description || ""} ${center.address || ""}`.toLowerCase();
                return haystack.includes(normalizedQuery);
            })
            : centers;

        const places = [];

        filteredCenters.forEach(center => {
            const basePlace = {
                id: center.id,
                name: center.name,
                description: center.description,
                address: center.address,
                location: center.location,
                services: center.services,
                prices: center.prices,
                socialMedia: center.socialMedia,
            };

            if (!hasCoordinates) {
                places.push(basePlace);
                return;
            }

            const centerLat = parseFloat(center.location?.lat);
            const centerLng = parseFloat(center.location?.lng);

            if (Number.isNaN(centerLat) || Number.isNaN(centerLng)) {
                return;
            }

            const distance = getDistanceFromLatLonInKm(userLat, userLng, centerLat, centerLng) * 1000;

            if (searchRadius && distance > searchRadius) {
                return;
            }

            places.push({ ...basePlace, distance: Math.round(distance) });
        });

        if (hasCoordinates) {
            places.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        } else {
            places.sort((a, b) => a.name.localeCompare(b.name));
        }

        res.status(200).json({
            success: true,
            count: places.length,
            places,
        });
    } catch (error) {
        console.error("Error searchPlaces:", error);
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
