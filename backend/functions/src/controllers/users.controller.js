/**
 * Controller Users
 * This file is responsible for creating and managing users and their profiles.
 * Author: Unai Villar
 */

const { db } = require('../config/firebase');
const { fail } = require('../shared/httpResponse');
const { pickPublicUserFields } = require('../domain/users/publicProfile');

function internalError(res, req, logError) {
  if (logError) console.error(logError);
  return fail(
    res,
    { status: 500, code: 'INTERNAL_ERROR', message: 'Error interno.' },
    req.requestId
  );
}

/**
 * GET -> Get my profile
 */
exports.getMyProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    const snap = await db.collection('users').doc(uid).get();

    if (!snap.exists) {
      return res.status(404).json({ message: 'El usuario no existe' });
    }

    res.json(snap.data());
  } catch (error) {
    return internalError(res, req, error);
  }
};

/**
 * PATCH -> Update my profile (allowlist; email / fecha_registro only via server flows)
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const body = req.body;

    const allowedFields = [
      'name',
      'username',
      'bio',
      'photo',
      'sports',
      'phoneNumber',
      'location',
      'nombre',
      'edad',
      'telefono_whatsapp',
      'zona',
      'veces_jugadas',
      'idioma',
      'fuente_adquisicion',
      'canal_adquisicion',
    ];

    const data = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) data[field] = body[field];
    });

    if (Object.prototype.hasOwnProperty.call(data, 'edad')) {
      const n = Number(data.edad);
      data.edad = Number.isFinite(n) ? Math.max(0, Math.min(120, Math.round(n))) : null;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'veces_jugadas')) {
      const n = Number(data.veces_jugadas);
      data.veces_jugadas = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ message: 'No se proporcionaron campos válidos para actualizar' });
    }

    await db.collection('users').doc(uid).update(data);

    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    return internalError(res, req, error);
  }
};

/**
 * GET -> Get user profile by uid (full doc for self; public subset for others)
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const requesterUid = req.user.uid;

    const snap = await db.collection('users').doc(uid).get();

    if (!snap.exists) {
      return res.status(404).json({ message: 'El usuario no existe' });
    }

    const data = snap.data();
    if (requesterUid === uid) {
      return res.json(data);
    }

    return res.json(pickPublicUserFields(data));
  } catch (error) {
    return internalError(res, req, error);
  }
};
