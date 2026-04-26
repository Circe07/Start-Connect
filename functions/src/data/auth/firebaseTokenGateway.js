const { AppError } = require('../../shared/AppError');

function createFirebaseTokenGateway() {
  return {
    async login({ email, password }) {
      const apiKey = process.env.AUTH_API_KEY;
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const payload = await response.json();
      if (!response.ok || payload?.error) {
        throw new AppError({
          message: payload?.error?.message || 'Credenciales inválidas',
          code: 'UNAUTHORIZED',
          status: 401,
          details: payload?.error || null,
        });
      }

      return {
        idToken: payload.idToken,
        refreshToken: payload.refreshToken,
        uid: payload.localId,
      };
    },
    async refresh(refreshToken) {
      const apiKey = process.env.AUTH_API_KEY;
      if (!apiKey) {
        throw new AppError({
          message: 'Configuración incompleta del servidor.',
          code: 'SERVER_CONFIG_ERROR',
          status: 500,
        });
      }

      const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new AppError({
          message: 'Refresh token inválido o expirado.',
          code: 'UNAUTHORIZED',
          status: 401,
          details: payload?.error || null,
        });
      }

      return {
        idToken: payload.id_token,
        refreshToken: payload.refresh_token,
        uid: payload.user_id,
      };
    },
  };
}

module.exports = { createFirebaseTokenGateway };
