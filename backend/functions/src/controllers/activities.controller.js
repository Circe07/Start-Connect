const { db } = require('../config/firebase');

function parseInterests(raw) {
  if (!raw) return [];
  if (Array.isArray(raw))
    return raw
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function toNumber(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * GET /activities
 * Query:
 * - city (string)
 * - zone (string)
 * - interests (csv)
 * - limit (int)
 * - startAfterId (doc id)
 * - lat,lng,radius (optional, meters) best-effort MVP filtering
 */
exports.listActivities = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const startAfterId = req.query.startAfterId;
    const city = (req.query.city || '').toString().trim();
    const zone = (req.query.zone || '').toString().trim();
    const interests = parseInterests(req.query.interests);

    const lat = toNumber(req.query.lat);
    const lng = toNumber(req.query.lng);
    const radius = toNumber(req.query.radius);
    const useDistance = lat !== null && lng !== null && radius !== null && radius > 0;

    let query = db.collection('activities').orderBy('createdAt', 'desc');

    if (city) query = query.where('city', '==', city);
    if (zone) query = query.where('zone', '==', zone);
    if (interests.length > 0) {
      query = query.where('interests', 'array-contains-any', interests.slice(0, 10));
    }

    if (startAfterId) {
      const lastDoc = await db.collection('activities').doc(startAfterId).get();
      if (lastDoc.exists) query = query.startAfter(lastDoc);
    }

    // If distance filtering is requested, we may need a slightly larger page
    // (best-effort, MVP).
    const pageSize = useDistance ? Math.min(limit * 3, 150) : limit;

    const snapshot = await query.limit(pageSize).get();

    let activities = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (useDistance) {
      activities = activities
        .map((a) => {
          const gp = a.location;
          const aLat = gp?.latitude ?? gp?.lat;
          const aLng = gp?.longitude ?? gp?.lng;
          if (typeof aLat !== 'number' || typeof aLng !== 'number') return null;
          const distance = haversineMeters(lat, lng, aLat, aLng);
          if (distance > radius) return null;
          return { ...a, distance: Math.round(distance) };
        })
        .filter(Boolean)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, limit);
    } else {
      activities = activities.slice(0, limit);
    }

    return res.status(200).json({
      activities,
      hasMore: snapshot.size === pageSize,
      nextStartAfterId: snapshot.size === pageSize ? snapshot.docs.at(-1).id : null,
    });
  } catch (error) {
    console.error('Error listActivities:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};
