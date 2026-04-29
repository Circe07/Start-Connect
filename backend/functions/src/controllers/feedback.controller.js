const { db, FieldValue } = require('../config/firebase');
const Feedback = require('../models/feedback.model');

exports.createFeedback = async (req, res) => {
  try {
    const user_id = req.user.uid;
    const payload = {
      user_id,
      experience_id: req.body.experience_id,
      nota_1_10: req.body.nota_1_10,
      repetiria: req.body.repetiria,
      traeria_amigo: req.body.traeria_amigo,
      comentario: req.body.comentario || '',
    };

    const validationError = Feedback.validate(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const duplicated = await db
      .collection('feedback')
      .where('user_id', '==', user_id)
      .where('experience_id', '==', payload.experience_id)
      .limit(1)
      .get();
    if (!duplicated.empty) {
      return res
        .status(409)
        .json({ message: 'Ya existe feedback de este usuario para esta experience' });
    }

    const feedback = new Feedback(payload);
    const ref = db.collection('feedback').doc();
    feedback.id = ref.id;
    await ref.set(feedback.toFirestore(FieldValue));

    return res.status(201).json({ success: true, feedback });
  } catch (error) {
    console.error('Error createFeedback:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.listFeedbackByExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const snapshot = await db
      .collection('feedback')
      .where('experience_id', '==', experienceId)
      .orderBy('createdAt', 'desc')
      .get();

    const feedback = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ success: true, feedback });
  } catch (error) {
    console.error('Error listFeedbackByExperience:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};
