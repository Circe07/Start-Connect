const { db, FieldValue } = require('../../config/firebase');

function createFirestoreExperienceRepository() {
  return {
    async create(experience) {
      const ref = db.collection('experiences').doc();
      await ref.set({
        ...experience,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: ref.id, ...experience };
    },

    async getById(id) {
      const snap = await db.collection('experiences').doc(id).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() };
    },

    async update(id, patch) {
      await db
        .collection('experiences')
        .doc(id)
        .update({
          ...patch,
          updatedAt: FieldValue.serverTimestamp(),
        });
      return { id, ...patch };
    },

    async list({ estado, limit = 30 }) {
      let query = db.collection('experiences').orderBy('createdAt', 'desc');
      if (estado) query = query.where('estado', '==', estado);
      const snap = await query.limit(Math.min(Number(limit) || 30, 100)).get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  };
}

module.exports = { createFirestoreExperienceRepository };
