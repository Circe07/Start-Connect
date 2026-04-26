const { db, FieldValue } = require('../config/firebase');

/**
 * POST /swipes
 * Body: { activityId: string, direction: 'like'|'dislike' }
 */
exports.recordSwipe = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { activityId, direction } = req.body || {};

    if (!activityId || typeof activityId !== 'string') {
      return res.status(400).json({ message: 'activityId es requerido' });
    }
    if (direction !== 'like' && direction !== 'dislike') {
      return res.status(400).json({ message: "direction debe ser 'like' o 'dislike'" });
    }

    const activityRef = db.collection('activities').doc(activityId);
    const activityDoc = await activityRef.get();
    if (!activityDoc.exists) {
      return res.status(404).json({ message: 'La actividad no existe.' });
    }

    const swipeRef = db.collection('users').doc(uid).collection('swipes').doc(activityId);
    const existing = await swipeRef.get();

    if (existing.exists) {
      const prev = existing.data();
      if (prev?.direction === direction) {
        return res.status(200).json({ message: 'Swipe ya registrado.' });
      }
    }

    await swipeRef.set(
      {
        activityId,
        direction,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(201).json({ message: 'Swipe registrado.', activityId, direction });
  } catch (error) {
    console.error('Error recordSwipe:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};
