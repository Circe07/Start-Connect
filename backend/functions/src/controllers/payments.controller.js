const { db, FieldValue } = require('../config/firebase');
const {
  getStripeMode,
  getFixedCheckoutUrl,
  getStripeSuccessUrl,
  getStripeCancelUrl,
  createStripeClient,
} = require('../config/payments');

function getEventPaymentStatus(eventType) {
  if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
    return 'paid';
  }
  if (eventType === 'payment_intent.payment_failed') {
    return 'failed';
  }
  if (eventType === 'charge.refunded') {
    return 'refunded';
  }
  return null;
}

function timestampToMs(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  return 0;
}

async function getBookingOwnedByUser(bookingId, user) {
  const snap = await db.collection('experience_bookings').doc(bookingId).get();
  if (!snap.exists) return { error: 'BOOKING_NOT_FOUND' };
  const booking = { id: snap.id, ...snap.data() };
  const isAdmin = user?.role === 'admin';
  if (!isAdmin && booking.user_id !== user?.uid) {
    return { error: 'FORBIDDEN' };
  }
  return { booking, ref: snap.ref };
}

exports.createCheckout = async (req, res) => {
  try {
    const { booking_id: bookingId } = req.body || {};
    if (!bookingId) return res.status(400).json({ message: 'Campo requerido: booking_id' });

    const owned = await getBookingOwnedByUser(bookingId, req.user);
    if (owned.error === 'BOOKING_NOT_FOUND')
      return res.status(404).json({ message: 'Booking no encontrada' });
    if (owned.error === 'FORBIDDEN')
      return res.status(403).json({ message: 'No autorizado para esta booking' });

    if (owned.booking.estado === 'pagada') {
      return res.status(409).json({ message: 'La booking ya está pagada' });
    }

    const mode = getStripeMode();
    const attemptsRef = db.collection('payment_attempts').doc();
    const baseAttempt = {
      booking_id: bookingId,
      user_id: req.user.uid,
      mode,
      status: 'initiated',
      amount: Number(owned.booking.importe || 0),
      currency: 'eur',
      stripe_session_id: null,
      stripe_payment_intent_id: null,
      event_ids_processed: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await attemptsRef.set(baseAttempt);

    if (mode === 'fixed') {
      const url = getFixedCheckoutUrl();
      if (!url) {
        return res.status(500).json({ message: 'Checkout fijo no configurado' });
      }
      await attemptsRef.set(
        {
          status: 'checkout_link_issued',
          checkout_url: url,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return res.status(200).json({
        success: true,
        mode,
        checkout_url: url,
        payment_attempt_id: attemptsRef.id,
      });
    }

    const amountCents = Math.round(Number(owned.booking.importe || 0) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return res.status(400).json({ message: 'Importe inválido para generar el pago' });
    }

    const stripe = createStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: getStripeSuccessUrl(),
      cancel_url: getStripeCancelUrl(),
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Reserva ${bookingId}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: bookingId,
        user_id: req.user.uid,
        payment_attempt_id: attemptsRef.id,
      },
    });

    await attemptsRef.set(
      {
        status: 'checkout_session_created',
        checkout_url: session.url || null,
        stripe_session_id: session.id || null,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({
      success: true,
      mode,
      checkout_url: session.url,
      payment_attempt_id: attemptsRef.id,
      stripe_session_id: session.id,
    });
  } catch (error) {
    console.error('Error createCheckout:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) return res.status(400).json({ message: 'Missing stripe-signature header' });

    const secret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
    if (!secret) return res.status(500).json({ message: 'Webhook secret no configurado' });

    const stripe = createStripeClient();
    const raw = req.rawBody || Buffer.from(JSON.stringify(req.body || {}), 'utf8');
    const event = stripe.webhooks.constructEvent(raw, signature, secret);

    const eventRef = db.collection('stripe_webhook_events').doc(event.id);
    try {
      await eventRef.create({
        type: event.type,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      if (e.code === 6 || e.code === 'ALREADY_EXISTS') {
        return res.status(200).json({ success: true, duplicate: true });
      }
      throw e;
    }

    const status = getEventPaymentStatus(event.type);
    if (!status) return res.status(200).json({ success: true, ignored: true });

    const obj = event.data?.object || {};
    const metadata = obj.metadata || {};
    const bookingId = metadata.booking_id || null;
    const attemptId = metadata.payment_attempt_id || null;
    const paymentIntentId =
      obj.payment_intent || obj.id || obj.payment_intent_id || metadata.payment_intent_id || null;

    let bookingRef = null;
    let effectiveBookingId = bookingId;
    let attemptRef = null;

    if (attemptId) {
      attemptRef = db.collection('payment_attempts').doc(attemptId);
      const attemptSnap = await attemptRef.get();
      if (attemptSnap.exists && !effectiveBookingId) {
        effectiveBookingId = attemptSnap.data().booking_id;
      }
    }

    if (!attemptRef && paymentIntentId) {
      const match = await db
        .collection('payment_attempts')
        .where('stripe_payment_intent_id', '==', paymentIntentId)
        .limit(1)
        .get();
      if (!match.empty) {
        attemptRef = match.docs[0].ref;
        if (!effectiveBookingId) effectiveBookingId = match.docs[0].data().booking_id;
      }
    }

    if (effectiveBookingId) {
      bookingRef = db.collection('experience_bookings').doc(effectiveBookingId);
    }

    if (!attemptRef) {
      attemptRef = db.collection('payment_attempts').doc();
      await attemptRef.set({
        booking_id: effectiveBookingId,
        user_id: metadata.user_id || null,
        mode: getStripeMode(),
        status,
        amount: Number(obj.amount_total || obj.amount || 0) / 100,
        currency: (obj.currency || 'eur').toLowerCase(),
        stripe_session_id: obj.id && event.type === 'checkout.session.completed' ? obj.id : null,
        stripe_payment_intent_id: typeof paymentIntentId === 'string' ? paymentIntentId : null,
        event_ids_processed: [event.id],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await attemptRef.set(
        {
          status,
          stripe_payment_intent_id: typeof paymentIntentId === 'string' ? paymentIntentId : null,
          event_ids_processed: FieldValue.arrayUnion(event.id),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    if (bookingRef) {
      const bookingStatus =
        status === 'paid' ? 'pagada' : status === 'refunded' ? 'cancelada' : 'pendiente';
      await bookingRef.set(
        {
          estado: bookingStatus,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handleStripeWebhook:', error);
    return res.status(400).json({ message: 'Webhook inválido o error de procesamiento' });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const owned = await getBookingOwnedByUser(bookingId, req.user);
    if (owned.error === 'BOOKING_NOT_FOUND')
      return res.status(404).json({ message: 'Booking no encontrada' });
    if (owned.error === 'FORBIDDEN')
      return res.status(403).json({ message: 'No autorizado para esta booking' });

    const attemptsSnap = await db
      .collection('payment_attempts')
      .where('booking_id', '==', bookingId)
      .limit(20)
      .get();
    const attempts = attemptsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    attempts.sort(
      (a, b) =>
        timestampToMs(b.updatedAt || b.createdAt) - timestampToMs(a.updatedAt || a.createdAt)
    );
    const latest = attempts[0] || null;

    return res.status(200).json({
      success: true,
      booking_id: bookingId,
      booking_status: owned.booking.estado,
      payment: latest
        ? {
            payment_attempt_id: latest.id,
            mode: latest.mode,
            status: latest.status,
            checkout_url: latest.checkout_url || null,
            stripe_session_id: latest.stripe_session_id || null,
            stripe_payment_intent_id: latest.stripe_payment_intent_id || null,
            updatedAt: latest.updatedAt || latest.createdAt || null,
          }
        : null,
    });
  } catch (error) {
    console.error('Error getPaymentStatus:', error);
    return res.status(500).json({ message: 'Error interno.' });
  }
};

exports.__testables = {
  getEventPaymentStatus,
};
