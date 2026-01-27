/**
 * Controller Authentication
 * This controller is responsible for handling user login and registration.
 * It uses Firebase Authentication and Firestore to store user data.
 * Author: Unai Villar
 */


const { admin, db } = require("../config/firebase");
const fetch = require('node-fetch');

/**
 * POST - Register a new user
 * Creates a Firebase Authentication account and stores user profile in Firestore
 * Validates password strength (min 8 chars, letter, number, special character)
 * @param {Request} req - Express request object
 * @param {Request} req.body.email - User email (required, unique)
 * @param {Request} req.body.password - User password (required)
 * @param {Request} req.body.name - User full name (required)
 * @param {Request} req.body.username - Unique username (required)
 * @param {Request} req.body.bio - Optional user biography
 * @param {Request} req.body.photo - Optional profile photo URL
 * @param {Request} req.body.sports - Optional array of sports interests
 * @param {Request} req.body.phoneNumber - Optional phone number
 * @param {Request} req.body.location - Optional location
 * @param {Response} res - Express response object
 * @returns {Object} Created user with Firebase UID
 */
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      username,
      bio,
      photo,
      sports,
      phoneNumber,
      location
    } = req.body;

    /**
     * Email, password, name and username are required
     * Password validation:
     * - Minimum 8 characters
     * - Must contain at least one letter, one number, and one special character
     */
    if (!email || !password || !name || !username) {
      return res.status(400).json({
        message: "email, password, name y username son requeridos"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 8 caracteres"
      });
    }

    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!regex.test(password)) {
      return res.status(400).json({
        message: "La contraseña debe contener al menos una letra, un número y un carácter especial"
      });
    }

    /**
     * Create user in Firebase Authentication
     */
    const user = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    /**
     * Save user data in Firestore
     * Collection --> users
     * Document --> uid
     * Fields --> uid, email, name, username, bio, photo, sports, phoneNumber, location
     */
    await db.collection("users").doc(user.uid).set({
      uid: user.uid,
      email,
      name,
      username,
      bio: bio || "",
      photo: photo || "",
      sports: sports || [],
      phoneNumber: phoneNumber || "",
      location: location || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: "Usuario creado correctamente",
      user
    });

  } catch (error) {
    console.error("Error al crear el usuario:", error);
    res.status(500).json({
      message: "Error al crear el usuario",
      error: error.message
    });
  }
};

/**
 * POST - Login user with email and password
 * Authenticates user via Firebase Authentication API
 * Returns ID token and refresh token for session management
 * @param {Request} req - Express request object
 * @param {Request} req.body.email - User email (required)
 * @param {Request} req.body.password - User password (required)
 * @param {Response} res - Express response object
 * @returns {Object} ID token, refresh token, and user UID
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    /**
     * Email and password are required
     */
    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña requeridos" });
    }

    /**
     * Get API key from environment variable
     * API key authenticates requests to Firebase Authentication API
     * Generated in Firebase Console > Authentication > API keys
     * Used to sign in users without Firebase SDK
     */
    const apiKey = process.env.AUTH_API_KEY;

    /**
     * Call Firebase Authentication API for user login
     * Returns tokens for authenticated session
     */
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



/**
 * POST - Logout user
 * Revokes all refresh tokens to invalidate all sessions
 * Requires authentication
 * @param {Request} req - Express request object (authenticated)
 * @param {Response} res - Express response object
 * @returns {Object} Success message
 */
exports.logout = async (req, res) => {
  try {
    const uid = req.user.uid;

    // Revoke refresh token to invalidate session
    await admin.auth().revokeRefreshTokens(uid);

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ message: 'Error al cerrar sesión', error: error.message });
  }
};

/**
 * Get -->  GET MY INFORMATION
 * @param {*} req 
 * @param {*} res 
 */
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

/**
 * POST --> CHANGE PASSWORD VIA LINK
 * @param {*} req 
 * @param {*} res 
 */
exports.changePassword = async (req, res) => {

  try {
    const { email } = req.body;
    /**
     * Generate password reset link for user
     * Password reset link is sent to user's email
     */

    if (!email) {
      return res.status(400).json({ message: 'El email es requerido' })
    }

    const resetLink = await admin.auth().generatePasswordResetLink(email);



    res.status(200).json({ message: 'Enlace generado correctamente', resetLink });
  } catch (error) {
    console.error('Error al enviar el correo de restablecimiento de contraseña:', error);
    res.status(500).json({ message: 'Error al enviar el correo de restablecimiento de contraseña', error: error.message });
  }
};