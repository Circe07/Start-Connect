const { db, FieldValue } = require('../../config/firebase');

function createFirestoreHostRepository() {
  return {
    async create(host) {
      const ref = db.collection('hosts').doc();
      await ref.set({
        ...host,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: ref.id, ...host };
    },
    async update(id, patch) {
      await db
        .collection('hosts')
        .doc(id)
        .update({
          ...patch,
          updatedAt: FieldValue.serverTimestamp(),
        });
      return { id, ...patch };
    },
    async list() {
      const snap = await db.collection('hosts').orderBy('createdAt', 'desc').get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    async getById(id) {
      const snap = await db.collection('hosts').doc(id).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() };
    },
  };
}

module.exports = { createFirestoreHostRepository };
