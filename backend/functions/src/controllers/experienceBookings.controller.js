const { db, FieldValue } = require('../config/firebase');
const ExperienceBooking = require('../models/experienceBooking.model');
const { canTransitionBookingStatus, canCancelBooking } = require('../domain/bookingRules');

const OCCUPYING_STATUSES = new Set(['pendiente', 'confirmada', 'pagada']);

exports.createExperienceBooking = async (req, res) => {
  try {
    const user_id = req.user.uid;
    const payload = {
      user_id,
      experience_id: req.body.experience_id,
      estado: 'pendiente',
      metodo_pago: req.body.metodo_pago || '',
      importe: req.body.importe || 0,
      codigo_referido: req.body.codigo_referido || '',
      viene_con_amigo: req.body.viene_con_amigo || false,
    };

    const validationError = ExperienceBooking.validate(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const bookingsRef = db.collection('experience_bookings');
    const experienceRef = db.collection('experiences').doc(payload.experience_id);
    const duplicateSnap = await bookingsRef
      .where('experience_id', '==', payload.experience_id)
      .where('user_id', '==', user_id)
      .where('estado', 'in', Array.from(OCCUPYING_STATUSES))
      .limit(1)
      .get();
    if (!duplicateSnap.empty) {
      return res
        .status(409)
        .json({ message: 'Ya tienes una reserva activa para esta experiencia' });
    }

    const bookingRef = bookingsRef.doc();
    const booking = new ExperienceBooking(payload);
    booking.id = bookingRef.id;

    await db.runTransaction(async (trx) => {
      const experienceSnap = await trx.get(experienceRef);
      if (!experienceSnap.exists) throw new Error('EXPERIENCE_NOT_FOUND');

      const experience = experienceSnap.data();
      if (!['publicada', 'llena'].includes(experience.estado))
        throw new Error('EXPERIENCE_NOT_BOOKABLE');
      const available = Number(experience.plazas_disponibles || 0);
      if (available <= 0) throw new Error('NO_CAPACITY');

      const nextAvailable = available - 1;
      trx.set(bookingRef, booking.toFirestore(FieldValue));
      if (payload.codigo_referido) {
        const referralLinkRef = db.collection('referrals').doc();
        trx.set(referralLinkRef, {
          user_id,
          codigo: payload.codigo_referido,
          referido_id: user_id,
          estado: 'aplicado',
          descuento_aplicado: false,
          source_booking_id: bookingRef.id,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      trx.update(experienceRef, {
        plazas_disponibles: nextAvailable,
        estado: nextAvailable === 0 ? 'llena' : 'publicada',
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return res.status(201).json({ success: true, booking });
  } catch (error) {
    if (error.message === 'EXPERIENCE_NOT_FOUND') {
      return res.status(404).json({ message: 'Experience no encontrada' });
    }
    if (error.message === 'EXPERIENCE_NOT_BOOKABLE') {
      return res.status(400).json({ message: 'La experience no está disponible para reservas' });
    }
    if (error.message === 'NO_CAPACITY') {
      return res.status(409).json({ message: 'No hay plazas disponibles' });
    }
    console.error('Error createExperienceBooking:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.listMyExperienceBookings = async (req, res) => {
  try {
    const user_id = req.user.uid;
    const snapshot = await db
      .collection('experience_bookings')
      .where('user_id', '==', user_id)
      .orderBy('createdAt', 'desc')
      .get();

    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('Error listMyExperienceBookings:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.listExperienceBookingsByExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const snapshot = await db
      .collection('experience_bookings')
      .where('experience_id', '==', experienceId)
      .orderBy('createdAt', 'desc')
      .get();

    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('Error listExperienceBookingsByExperience:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.updateExperienceBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!ExperienceBooking.statuses().includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const bookingRef = db.collection('experience_bookings').doc(id);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) return res.status(404).json({ message: 'Reserva no encontrada' });

    const booking = bookingSnap.data();
    if (!canTransitionBookingStatus(booking.estado, estado)) {
      return res
        .status(400)
        .json({ message: `Transición inválida: ${booking.estado} -> ${estado}` });
    }

    if (estado === 'asistio' || estado === 'no_show') {
      const experienceSnap = await db.collection('experiences').doc(booking.experience_id).get();
      if (!experienceSnap.exists)
        return res.status(404).json({ message: 'Experience no encontrada' });
      const experience = experienceSnap.data();
      const isCompleted = experience.estado === 'completada';
      const startsAt = Date.parse(`${experience.fecha}T${experience.hora_inicio || '00:00'}:00`);
      if (!isCompleted && (!Number.isFinite(startsAt) || startsAt > Date.now())) {
        return res.status(400).json({
          message:
            'Solo se puede marcar asistencia/no_show cuando la experience inició o está completada',
        });
      }
    }

    await bookingRef.update({
      estado,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true, estado });
  } catch (error) {
    console.error('Error updateExperienceBookingStatus:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.cancelExperienceBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingRef = db.collection('experience_bookings').doc(id);
    const currentUserId = req.user?.uid || null;
    const isAdmin = req.user?.role === 'admin';

    const currentSnap = await bookingRef.get();
    if (!currentSnap.exists) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    const currentBooking = currentSnap.data();
    if (
      !canCancelBooking({
        bookingUserId: currentBooking.user_id,
        currentUserId,
        role: isAdmin ? 'admin' : 'user',
      })
    ) {
      return res.status(403).json({ message: 'No puedes cancelar reservas de otro usuario' });
    }

    await db.runTransaction(async (trx) => {
      const bookingSnap = await trx.get(bookingRef);
      if (!bookingSnap.exists) throw new Error('BOOKING_NOT_FOUND');

      const booking = bookingSnap.data();
      if (booking.estado === 'cancelada') throw new Error('ALREADY_CANCELLED');

      const experienceRef = db.collection('experiences').doc(booking.experience_id);
      const experienceSnap = await trx.get(experienceRef);
      if (!experienceSnap.exists) throw new Error('EXPERIENCE_NOT_FOUND');

      const experience = experienceSnap.data();
      const shouldReleaseSeat = OCCUPYING_STATUSES.has(booking.estado);
      const nextAvailable = shouldReleaseSeat
        ? Math.min(
            Number(experience.plazas_totales || 0),
            Number(experience.plazas_disponibles || 0) + 1
          )
        : Number(experience.plazas_disponibles || 0);

      trx.update(bookingRef, {
        estado: 'cancelada',
        updatedAt: FieldValue.serverTimestamp(),
      });

      trx.update(experienceRef, {
        plazas_disponibles: nextAvailable,
        estado: nextAvailable > 0 ? 'publicada' : experience.estado,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return res.status(200).json({ success: true, estado: 'cancelada' });
  } catch (error) {
    if (error.message === 'BOOKING_NOT_FOUND') {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    if (error.message === 'ALREADY_CANCELLED') {
      return res.status(409).json({ message: 'La reserva ya está cancelada' });
    }
    if (error.message === 'EXPERIENCE_NOT_FOUND') {
      return res.status(404).json({ message: 'Experience no encontrada' });
    }
    console.error('Error cancelExperienceBooking:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};
