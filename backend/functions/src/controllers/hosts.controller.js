const { db, FieldValue } = require('../config/firebase');
const Host = require('../models/host.model');

exports.createHost = async (req, res) => {
  try {
    const validationError = Host.validate(req.body || {});
    if (validationError) return res.status(400).json({ message: validationError });

    const host = new Host(req.body);
    const ref = db.collection('hosts').doc();
    host.id = ref.id;
    await ref.set(host.toFirestore(FieldValue));
    return res.status(201).json({ success: true, host });
  } catch (error) {
    console.error('Error createHost:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.updateHost = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = [
      'nombre',
      'telefono',
      'nivel_aproximado',
      'disponibilidad',
      'estado',
      'partidas_realizadas',
      'nps_medio',
      'observaciones',
    ];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    if (!Object.keys(patch).length) {
      return res
        .status(400)
        .json({ message: 'No se proporcionaron campos válidos para actualizar' });
    }
    const validationError = Host.validate({ ...patch, nombre: patch.nombre || 'ok' });
    if (validationError && !validationError.includes('nombre')) {
      return res.status(400).json({ message: validationError });
    }
    patch.updatedAt = FieldValue.serverTimestamp();
    await db.collection('hosts').doc(id).update(patch);
    return res.status(200).json({ success: true, message: 'Host actualizado correctamente' });
  } catch (error) {
    console.error('Error updateHost:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.listHosts = async (_, res) => {
  try {
    const snapshot = await db.collection('hosts').orderBy('createdAt', 'desc').get();
    const hosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ success: true, hosts });
  } catch (error) {
    console.error('Error listHosts:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.getHostById = async (req, res) => {
  try {
    const { id } = req.params;
    const snap = await db.collection('hosts').doc(id).get();
    if (!snap.exists) return res.status(404).json({ message: 'Host no encontrado' });
    return res.status(200).json({ success: true, host: { id: snap.id, ...snap.data() } });
  } catch (error) {
    console.error('Error getHostById:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};
