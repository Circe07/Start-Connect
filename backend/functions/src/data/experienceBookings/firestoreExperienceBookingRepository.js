const { db, FieldValue } = require('../../config/firebase');

const OCCUPYING_STATUSES = ['pendiente', 'confirmada', 'pagada'];

function createFirestoreExperienceBookingRepository() {
  return {
    async createWithSeat(payload) {
      const bookingsRef = db.collection('experience_bookings');
      const experienceRef = db.collection('experiences').doc(payload.experience_id);

      const duplicateSnap = await bookingsRef
        .where('experience_id', '==', payload.experience_id)
        .where('user_id', '==', payload.user_id)
        .where('estado', 'in', OCCUPYING_STATUSES)
        .limit(1)
        .get();
      if (!duplicateSnap.empty) {
        const err = new Error('Ya tienes una reserva activa para esta experiencia');
        err.status = 409;
        throw err;
      }

      const bookingRef = bookingsRef.doc();
      const booking = { id: bookingRef.id, ...payload };

      await db.runTransaction(async (trx) => {
        const experienceSnap = await trx.get(experienceRef);
        if (!experienceSnap.exists) {
          const err = new Error('Experience no encontrada');
          err.status = 404;
          throw err;
        }
        const experience = experienceSnap.data();
        if (!['publicada', 'llena'].includes(experience.estado)) {
          const err = new Error('La experience no está disponible para reservas');
          err.status = 400;
          throw err;
        }
        const available = Number(experience.plazas_disponibles || 0);
        if (available <= 0) {
          const err = new Error('No hay plazas disponibles');
          err.status = 409;
          throw err;
        }

        const nextAvailable = available - 1;
        trx.set(bookingRef, {
          ...booking,
          fecha_reserva: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        if (payload.codigo_referido) {
          trx.set(db.collection('referrals').doc(), {
            user_id: payload.user_id,
            codigo: payload.codigo_referido,
            referido_id: payload.user_id,
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

      return booking;
    },

    async listByUser(userId) {
      const snap = await db
        .collection('experience_bookings')
        .where('user_id', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },

    async listByExperience(experienceId) {
      const snap = await db
        .collection('experience_bookings')
        .where('experience_id', '==', experienceId)
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },

    async getById(id) {
      const snap = await db.collection('experience_bookings').doc(id).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() };
    },

    async updateStatus(id, estado) {
      await db.collection('experience_bookings').doc(id).update({
        estado,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id, estado };
    },

    async cancelAndReleaseSeat(id) {
      const bookingRef = db.collection('experience_bookings').doc(id);
      await db.runTransaction(async (trx) => {
        const bookingSnap = await trx.get(bookingRef);
        if (!bookingSnap.exists) {
          const err = new Error('Reserva no encontrada');
          err.status = 404;
          throw err;
        }
        const booking = bookingSnap.data();
        if (booking.estado === 'cancelada') {
          const err = new Error('La reserva ya está cancelada');
          err.status = 409;
          throw err;
        }
        const experienceRef = db.collection('experiences').doc(booking.experience_id);
        const experienceSnap = await trx.get(experienceRef);
        if (!experienceSnap.exists) {
          const err = new Error('Experience no encontrada');
          err.status = 404;
          throw err;
        }
        const experience = experienceSnap.data();
        const shouldReleaseSeat = OCCUPYING_STATUSES.includes(booking.estado);
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
      return { id, estado: 'cancelada' };
    },
  };
}

module.exports = { createFirestoreExperienceBookingRepository };
