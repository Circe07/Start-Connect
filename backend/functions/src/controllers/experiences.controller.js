const { db, FieldValue } = require('../config/firebase');
const Experience = require('../models/experience.model');

exports.createExperience = async (req, res) => {
  try {
    const payload = { ...req.body, estado: 'borrador' };
    const validationError = Experience.validate(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const experience = new Experience(payload);
    const ref = db.collection('experiences').doc();
    experience.id = ref.id;
    await ref.set(experience.toFirestore(FieldValue));

    return res.status(201).json({ success: true, experience });
  } catch (error) {
    console.error('Error createExperience:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.publishExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection('experiences').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'Experience no encontrada' });

    const data = snap.data();
    const validationError = Experience.validate(data, { requirePublishFields: true });
    if (validationError) return res.status(400).json({ message: validationError });

    const nextStatus = data.plazas_disponibles <= 0 ? 'llena' : 'publicada';
    await ref.update({
      estado: nextStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true, estado: nextStatus });
  } catch (error) {
    console.error('Error publishExperience:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'titulo',
      'descripcion',
      'deporte_vertical',
      'ciudad',
      'club',
      'direccion',
      'fecha',
      'hora_inicio',
      'hora_fin',
      'nivel_permitido',
      'plazas_totales',
      'plazas_disponibles',
      'precio',
      'host_asignado',
      'estado',
      'politica_cancelacion',
      'instrucciones',
    ];

    const patch = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    if (!Object.keys(patch).length) {
      return res
        .status(400)
        .json({ message: 'No se proporcionaron campos válidos para actualizar' });
    }

    const validationError = Experience.validate(patch);
    if (validationError) return res.status(400).json({ message: validationError });

    patch.updatedAt = FieldValue.serverTimestamp();
    await db.collection('experiences').doc(id).update(patch);

    return res.status(200).json({ success: true, message: 'Experience actualizada correctamente' });
  } catch (error) {
    console.error('Error updateExperience:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.listExperiences = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const status = req.query.estado;
    let query = db.collection('experiences').orderBy('createdAt', 'desc').limit(limit);
    if (status) query = query.where('estado', '==', status);

    const snapshot = await query.get();
    const experiences = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ success: true, experiences });
  } catch (error) {
    console.error('Error listExperiences:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;
    const snap = await db.collection('experiences').doc(id).get();
    if (!snap.exists) return res.status(404).json({ message: 'Experience no encontrada' });
    return res.status(200).json({ success: true, experience: { id: snap.id, ...snap.data() } });
  } catch (error) {
    console.error('Error getExperienceById:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};
