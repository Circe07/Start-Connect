const { db, FieldValue } = require('../../config/firebase');

function createFirestoreReferralRepository() {
  return {
    async create(payload) {
      const ref = db.collection('referrals').doc();
      await ref.set({
        ...payload,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: ref.id, ...payload };
    },
    async listByUser(userId) {
      const snap = await db
        .collection('referrals')
        .where('user_id', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  };
}

module.exports = { createFirestoreReferralRepository };
