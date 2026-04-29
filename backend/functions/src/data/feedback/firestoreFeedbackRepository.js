const { db, FieldValue } = require('../../config/firebase');

function createFirestoreFeedbackRepository() {
  return {
    async create(payload) {
      const duplicate = await db
        .collection('feedback')
        .where('user_id', '==', payload.user_id)
        .where('experience_id', '==', payload.experience_id)
        .limit(1)
        .get();
      if (!duplicate.empty) {
        const err = new Error('Ya existe feedback de este usuario para esta experience');
        err.status = 409;
        throw err;
      }
      const ref = db.collection('feedback').doc();
      await ref.set({
        ...payload,
        fecha: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      });
      return { id: ref.id, ...payload };
    },

    async listByExperience(experienceId) {
      const snap = await db
        .collection('feedback')
        .where('experience_id', '==', experienceId)
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  };
}

module.exports = { createFirestoreFeedbackRepository };
