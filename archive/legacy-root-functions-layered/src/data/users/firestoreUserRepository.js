const { db } = require('../../config/firebase');

function createFirestoreUserRepository() {
  return {
    async findById(uid) {
      const snap = await db.collection('users').doc(uid).get();
      if (!snap.exists) return null;
      return snap.data();
    },
    async updateById(uid, data) {
      await db.collection('users').doc(uid).update(data);
    },
  };
}

module.exports = { createFirestoreUserRepository };
