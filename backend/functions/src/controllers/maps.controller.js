/**
 * GET - Find nearby places (sports centers) from user's location
 * Uses Haversine formula for accurate distance calculation
 * Requires authentication
 * @param {Request} req - Express request object
 * @param {Request} req.query.lat - User's latitude (required)
 * @param {Request} req.query.lng - User's longitude (required)
 * @param {Request} req.query.radius - Search radius in meters (default 5000)
 * @param {Response} res - Express response object
 * @returns {Object} Array of nearby centers with distance in meters
 */
exports.getNearbyPlaces = async (req, res) => {
    try {
        /**
         * Extract and parse query parameters
         * lat, lng - User's current coordinates
         * radius - Search radius in meters (defaults to 5000m)
         */
        const { lat, lng, radius } = req.query;

        // Validate required parameters
        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitud (lat) y Longitud (lng) son obligatorias." });
        }

        /**
         * Parse numeric values
         * userLat, userLng - User's coordinates as floats
         * searchRadius - Search radius in meters (default 5000m)
         */
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const searchRadius = parseFloat(radius) || 5000;

        // Fetch all centers from database
        const snapshot = await db.collection("centers").get();

        console.log(`[DEBUG] Centros encontrados en DB: ${snapshot.size}`);

        if (snapshot.empty) {
            return res.status(200).json({
                success: true,
                count: 0,
                places: []
            });
        }

        /**
         * Filter centers by distance using Haversine formula
         * Build result array with center data and calculated distances
         */
        const places = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`[DEBUG] Procesando centro ID: ${doc.id}`, JSON.stringify(data));

            const center = Center.fromFirestore(doc);

            // Parse location coordinates (handle string or numeric formats)
            const centerLat = parseFloat(center.location?.lat);
            const centerLng = parseFloat(center.location?.lng);

            console.log(`[DEBUG] Coordenadas parseadas: lat=${centerLat}, lng=${centerLng}`);

            // Validate parsed coordinates
            if (!isNaN(centerLat) && !isNaN(centerLng)) {
                // Calculate distance using Haversine formula (result in meters)
                const distance = getDistanceFromLatLonInKm(userLat, userLng, centerLat, centerLng) * 1000;
                console.log(`[DEBUG] Distancia calculada: ${distance} metros (Radio: ${searchRadius})`);

                // Only include centers within search radius
                if (distance <= searchRadius) {
                    places.push({
                        id: center.id,
                        name: center.name,
                        description: center.description,
                        address: center.address,
                        location: center.location,
                        distance: Math.round(distance), // Round to meters
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

        // Sort results by distance (closest first)
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
 * GET - Search for sports centers by text and optional location
 * Supports text search (name/description) and location-based filtering
 * @param {Request} req - Express request object
 * @param {Request} req.query.q - Text search query
 * @param {Request} req.query.lat - Optional latitude for distance filtering
 * @param {Request} req.query.lng - Optional longitude for distance filtering
 * @param {Request} req.query.radius - Search radius in meters (default 5000)
 * @param {Response} res - Express response object
 * @returns {Array} Matching centers sorted by relevance or distance
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

        // Fetch all centers
        const snapshot = await db.collection("centers").get();

        if (snapshot.empty) {
            return res.status(200).json({ success: true, count: 0, places: [] });
        }

        // Parse location coordinates if provided
        const userLat = hasCoordinates ? parseFloat(lat) : null;
        const userLng = hasCoordinates ? parseFloat(lng) : null;
        const searchRadius = hasCoordinates ? parseFloat(radius) || 5000 : null;

        // Validate coordinates format
        if (hasCoordinates && (Number.isNaN(userLat) || Number.isNaN(userLng))) {
            return res.status(400).json({
                success: false,
                message: "Las coordenadas proporcionadas no son válidas.",
            });
        }

        // Convert Firestore documents to Center models
        const centers = snapshot.docs.map(doc => Center.fromFirestore(doc));

        /**
         * Filter centers by text query if provided
         * Searches in name, description, and address fields
         */
        const filteredCenters = hasQuery
            ? centers.filter(center => {
                const haystack = `${center.name} ${center.description || ""} ${center.address || ""}`.toLowerCase();
                return haystack.includes(normalizedQuery);
            })
            : centers;

        const places = [];

        /**
         * Build result array with center information
         * If coordinates provided, calculate distance and filter by radius
         * Otherwise, include all matching centers
         */
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

            // If no coordinates, return center as-is
            if (!hasCoordinates) {
                places.push(basePlace);
                return;
            }

            // Parse center coordinates
            const centerLat = parseFloat(center.location?.lat);
            const centerLng = parseFloat(center.location?.lng);

            // Skip centers with invalid coordinates
            if (Number.isNaN(centerLat) || Number.isNaN(centerLng)) {
                return;
            }

            // Calculate distance in meters
            const distance = getDistanceFromLatLonInKm(userLat, userLng, centerLat, centerLng) * 1000;

            // Only include centers within search radius
            if (searchRadius && distance > searchRadius) {
                return;
            }

            places.push({ ...basePlace, distance: Math.round(distance) });
        });

        /**
         * Sort results by relevance:
         * - If coordinates provided: sort by distance (closest first)
         * - If text search: sort alphabetically by name
         */
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

/**
 * Helper function - Calculate distance between two geographic coordinates
 * Uses Haversine formula for great-circle distance
 * @param {number} lat1 - First point latitude
 * @param {number} lon1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lon2 - Second point longitude
 * @returns {number} Distance in kilometers
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

/**
 * Helper function - Convert degrees to radians
 * @param {number} deg - Angle in degrees
 * @returns {number} Angle in radians
 */
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
