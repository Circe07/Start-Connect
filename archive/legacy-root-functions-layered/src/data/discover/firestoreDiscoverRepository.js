const { db } = require('../../config/firebase');
const { AppError } = require('../../shared/AppError');

function createFirestoreDiscoverRepository() {
  return {
    async listActivities({ city, limit = 10, startAfterId }) {
      let query = db.collection('activities').orderBy('createdAt', 'desc');
      if (city) query = query.where('city', '==', city);
      if (startAfterId) {
        const lastDoc = await db.collection('activities').doc(startAfterId).get();
        if (lastDoc.exists) query = query.startAfter(lastDoc);
      }
      const parsedLimit = Number(limit) || 10;
      const snapshot = await query.limit(parsedLimit).get();
      const activities = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return {
        activities,
        hasMore: snapshot.size === parsedLimit,
        nextStartAfterId: snapshot.size === parsedLimit ? snapshot.docs.at(-1).id : null,
      };
    },

    async recordSwipe({ uid, activityId, direction }) {
      const activityDoc = await db.collection('activities').doc(activityId).get();
      if (!activityDoc.exists) {
        throw new AppError({ message: 'La actividad no existe.', code: 'NOT_FOUND', status: 404 });
      }
      await db
        .collection('users')
        .doc(uid)
        .collection('swipes')
        .doc(activityId)
        .set({ activityId, direction, updatedAt: new Date() }, { merge: true });
      return { message: 'Swipe registrado.' };
    },

    async listMatches({ uid, limit = 10, startAfterId }) {
      let query = db
        .collection('users')
        .doc(uid)
        .collection('swipes')
        .where('direction', '==', 'like')
        .orderBy('updatedAt', 'desc');
      if (startAfterId) {
        const lastDoc = await db
          .collection('users')
          .doc(uid)
          .collection('swipes')
          .doc(startAfterId)
          .get();
        if (lastDoc.exists) query = query.startAfter(lastDoc);
      }
      const parsedLimit = Number(limit) || 10;
      const snapshot = await query.limit(parsedLimit).get();
      const matches = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return {
        matches,
        hasMore: snapshot.size === parsedLimit,
        nextStartAfterId: snapshot.size === parsedLimit ? snapshot.docs.at(-1).id : null,
      };
    },
  };
}

module.exports = { createFirestoreDiscoverRepository };
