// ! NO EJECTUAR A MENOS QUE SE AGREGEN MAS HOBBIES

const router = require('express').Router();
const adminMiddleware = require('../middleware/admin');
const hobbiesSeed = require('../../scripts/hobbiesSeed');
const venuesSeed = require('../../scripts/venuesSeed');
const activitiesSeed = require('../../scripts/activitiesSeed');
const groupsSeed = require('../../scripts/groupsSeed');
const { db } = require('../config/firebase');
const { ok, fail } = require('../shared/httpResponse');

router.get('/check', (req, res) => {
  return ok(res, { message: 'Rutas de admin funcionando correctamente' }, 200, req.requestId);
});

// Everything below requires admin
router.use(adminMiddleware);

router.post('/seed-hobbies', async (req, res) => {
  try {
    const batch = db.batch();

    hobbiesSeed.forEach((hobby) => {
      const ref = db.collection('globalHobbies').doc(hobby.id);
      batch.set(ref, hobby);
    });

    await batch.commit();

    res.json({ success: true, message: 'Hobbies cargados' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno.' });
  }
});

router.post('/seed-venues', async (req, res) => {
  try {
    for (const venue of venuesSeed) {
      const venueRef = db.collection('globalVenues').doc(venue.id);

      const venueData = { ...venue };
      delete venueData.facilities;
      await venueRef.set(venueData);

      for (const facility of venue.facilities) {
        const facilityRef = venueRef.collection('facilities').doc(facility.id);
        await facilityRef.set(facility);
      }
    }

    res.json({ success: true, message: 'Venues y facilities cargados' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno.' });
  }
});

router.post('/seed-activities', async (req, res) => {
  try {
    const batch = db.batch();
    activitiesSeed.forEach((activity) => {
      const ref = db.collection('activities').doc(activity.id);
      batch.set(
        ref,
        {
          ...activity.data,
          createdAt: new Date(),
        },
        { merge: true }
      );
    });
    await batch.commit();
    res.json({ success: true, message: 'Activities cargadas' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno.' });
  }
});

router.post('/seed-groups', async (req, res) => {
  try {
    const batch = db.batch();
    groupsSeed.forEach((group) => {
      const ref = db.collection('groups').doc(group.id);
      batch.set(ref, group.data, { merge: true });
    });
    await batch.commit();
    res.json({ success: true, message: 'Groups cargados' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno.' });
  }
});
const { admin } = require('../config/firebase');

router.post('/make-admin', async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: 'UID es requerido' });

    await admin.auth().setCustomUserClaims(uid, { role: 'admin' });

    res.json({ success: true, message: `Usuario ${uid} es ahora Administrador.` });
  } catch (error) {
    res.status(500).json({ message: 'Error interno.' });
  }
});

router.get('/experiences/export', async (req, res) => {
  try {
    const { estado, ciudad, fecha } = req.query;
    const limit = Math.min(Number(req.query.limit) || 200, 1000);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    let query = db.collection('experiences');
    if (estado) query = query.where('estado', '==', estado);
    if (ciudad) query = query.where('ciudad', '==', ciudad);
    if (fecha) query = query.where('fecha', '==', fecha);
    const snapshot = await query.limit(offset + limit).get();
    const allData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const data = allData.slice(offset, offset + limit);
    return ok(
      res,
      { total: allData.length, count: data.length, offset, limit, items: data },
      200,
      req.requestId
    );
  } catch (error) {
    console.error('Error admin export experiences:', error);
    return fail(
      res,
      { status: 500, code: 'INTERNAL_ERROR', message: 'Error interno.' },
      req.requestId
    );
  }
});

router.get('/experience-bookings/export', async (req, res) => {
  try {
    const { estado, experience_id } = req.query;
    const limit = Math.min(Number(req.query.limit) || 200, 1000);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    let query = db.collection('experience_bookings');
    if (estado) query = query.where('estado', '==', estado);
    if (experience_id) query = query.where('experience_id', '==', experience_id);
    const snapshot = await query.limit(offset + limit).get();
    const allData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const data = allData.slice(offset, offset + limit);
    return ok(
      res,
      { total: allData.length, count: data.length, offset, limit, items: data },
      200,
      req.requestId
    );
  } catch (error) {
    console.error('Error admin export bookings:', error);
    return fail(
      res,
      { status: 500, code: 'INTERNAL_ERROR', message: 'Error interno.' },
      req.requestId
    );
  }
});

router.get('/users/export', async (req, res) => {
  try {
    const { fuente_adquisicion, canal_adquisicion } = req.query;
    const limit = Math.min(Number(req.query.limit) || 200, 1000);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    let query = db.collection('users');
    if (fuente_adquisicion) query = query.where('fuente_adquisicion', '==', fuente_adquisicion);
    if (canal_adquisicion) query = query.where('canal_adquisicion', '==', canal_adquisicion);
    const snapshot = await query.limit(offset + limit).get();
    const allData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const data = allData.slice(offset, offset + limit);
    return ok(
      res,
      { total: allData.length, count: data.length, offset, limit, items: data },
      200,
      req.requestId
    );
  } catch (error) {
    console.error('Error admin export users:', error);
    return fail(
      res,
      { status: 500, code: 'INTERNAL_ERROR', message: 'Error interno.' },
      req.requestId
    );
  }
});

module.exports = router;
