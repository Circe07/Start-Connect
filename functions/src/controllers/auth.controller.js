// ! PARA LAS RUTAS ES NECESARIO LA API KEY EN FRONTEND

const { admin } = require("../config/firebase");
const functions = require("firebase-functions");
const fetch = require('node-fetch');

// POST -> CREAR USUARIO
exports.register = async (req, res) => {
  try {

    // ! OBLIGADO A PASAR EMAIL Y CONTRASEÑA
    // ? OPCIONAL displayName QUE SERIA EL NOMBRE DEL USUARIO
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Si la contraseña es menor a 6 caracteres, devolver un error
    const user = await admin.auth().createUser({
      email,
      password,
      displayName
    });

    res.status(201).json({ message: 'Usuario creado correctamente', user });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

// POST -> INICIAR SESIÓN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña requeridos" });
    }

    const apiKey = process.env.AUTH_API_KEY;

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(401).json({ message: data.error.message });
    }

    return res.json({
      success: true,
      token: data.idToken,
      refreshToken: data.refreshToken,
      uid: data.localId,
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};



// POST -> CERRAR SESIÓN
exports.logut = async (req, res) => {
  try {
    const uid = req.user.uid;

    await admin.auth().revokeRefreshTokens(uid);

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ message: 'Error al cerrar sesión', error: error.message });
  }
};

// GET -> OBTENER INFORMACIÓN DEL USUARIO
exports.me = async (req, res) => {
  try {
    const user = await admin.auth().getUser(req.user.uid);

    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({ message: 'Error al obtener información del usuario', error: error.message });
  }
};

// POST -> ENVIAR CORREO DE RESTABLECIMIENTO DE CONTRASEÑA
exports.changePassword = async (req, res) => {

  try {
    const { email } = req.body;

    const resetLink = await admin.auth().generatePasswordResetLink(email);

    res.status(200).json({ message: 'Enlace generado correctamente', resetLink });
  } catch (error) {
    console.error('Error al enviar el correo de restablecimiento de contraseña:', error);
    res.status(500).json({ message: 'Error al enviar el correo de restablecimiento de contraseña', error: error.message });
  }
};
