const { db, FieldValue } = require('../config/firebase');
const Referral = require('../models/referral.model');

exports.createReferral = async (req, res) => {
  try {
    const user_id = req.user.uid;
    const payload = {
      user_id,
      codigo: req.body.codigo,
      referido_id: req.body.referido_id || '',
      estado: req.body.estado || 'pendiente',
      descuento_aplicado: req.body.descuento_aplicado || false,
    };
    const validationError = Referral.validate(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const referral = new Referral(payload);
    const ref = db.collection('referrals').doc();
    referral.id = ref.id;
    await ref.set(referral.toFirestore(FieldValue));

    return res.status(201).json({ success: true, referral });
  } catch (error) {
    console.error('Error createReferral:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.listMyReferrals = async (req, res) => {
  try {
    const user_id = req.user.uid;
    const snapshot = await db
      .collection('referrals')
      .where('user_id', '==', user_id)
      .orderBy('createdAt', 'desc')
      .get();
    const referrals = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ success: true, referrals });
  } catch (error) {
    console.error('Error listMyReferrals:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};
