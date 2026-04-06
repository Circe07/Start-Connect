const { db } = require("../config/firebase");

/**
 * GET /matches
 * Lists user likes as MVP "matches".
 * Query: limit, startAfterId (activityId doc id)
 */
exports.listMatches = async (req, res) => {
  try {
    const uid = req.user.uid;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const startAfterId = req.query.startAfterId;

    let query = db
      .collection("users")
      .doc(uid)
      .collection("swipes")
      .where("direction", "==", "like")
      .orderBy("createdAt", "desc");

    if (startAfterId) {
      const lastDoc = await db
        .collection("users")
        .doc(uid)
        .collection("swipes")
        .doc(startAfterId)
        .get();
      if (lastDoc.exists) query = query.startAfter(lastDoc);
    }

    const snapshot = await query.limit(limit).get();
    const likes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    return res.status(200).json({
      matches: likes,
      hasMore: snapshot.size === limit,
      nextStartAfterId: snapshot.size === limit ? snapshot.docs.at(-1).id : null,
    });
  } catch (error) {
    console.error("Error listMatches:", error);
    return res.status(500).json({ message: "Error interno." });
  }
};

