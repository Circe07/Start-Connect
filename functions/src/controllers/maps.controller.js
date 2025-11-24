const functions = require("firebase-functions");

/* ==========================================================
   GET /maps/nearby
   Query Params: lat, lng, radius (meters), type (gym, park, etc.)
========================================================== */
exports.getNearbyPlaces = async (req, res) => {
    try {
        const { lat, lng, radius, type, keyword } = req.query;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.error("Falta la API Key de Google Maps (GOOGLE_MAPS_API_KEY)");
            return res.status(500).json({ message: "Error de configuración del servidor." });
        }

        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitud (lat) y Longitud (lng) son obligatorias." });
        }

        const searchRadius = radius || 1500; // Default 1.5km
        const placeType = type || "gym"; // Default gym

        // Construir URL de Google Places API (Nearby Search)
        let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${searchRadius}&type=${placeType}&key=${apiKey}`;

        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }

        // Usar fetch nativo (Node 18+)
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            console.error("Error Google Places API:", data);
            return res.status(502).json({
                message: "Error al consultar Google Maps API",
                details: data.status,
                errorMessage: data.error_message
            });
        }

        // Mapear resultados para devolver solo lo necesario
        const places = data.results.map(place => ({
            id: place.place_id,
            name: place.name,
            location: place.geometry.location,
            vicinity: place.vicinity,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            icon: place.icon,
            photos: place.photos ? place.photos.map(p => ({
                photo_reference: p.photo_reference,
                height: p.height,
                width: p.width
            })) : [],
            isOpen: place.opening_hours ? place.opening_hours.open_now : null
        }));

        res.status(200).json({
            success: true,
            count: places.length,
            places: places,
            next_page_token: data.next_page_token || null
        });

    } catch (error) {
        console.error("Error getNearbyPlaces:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};
