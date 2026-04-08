const { db } = require('../../config/firebase');

function createFirestoreUserRepository() {
  return {
    async findById(uid) {
      const snap = await db.collection('users').doc(uid).get();
      if (!snap.exists) return null;
      return snap.data();
    },
  };
}

module.exports = { createFirestoreUserRepository };
