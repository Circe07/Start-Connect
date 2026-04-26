const { admin } = require('../../config/firebase');

function createFirebaseAuthGateway() {
  return {
    async getUserByUid(uid) {
      return admin.auth().getUser(uid);
    },
    async revokeRefreshTokens(uid) {
      return admin.auth().revokeRefreshTokens(uid);
    },
  };
}

module.exports = { createFirebaseAuthGateway };
