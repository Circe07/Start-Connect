const { db, admin, FieldValue } = require("../config/firebase");
const Booking = require("../models/booking.model");

// POST --> CREAR RESERVA
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.uid;

    const data = {
      userId,
      venueId: req.body.venueId,
      facilityId: req.body.facilityId,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    };

    // Validación del modelo
    const validationError = Booking.validate(data);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Validación de solapamientos
    const overlap = await db
      .collection("bookings")
      .where("venueId", "==", data.venueId)
      .where("facilityId", "==", data.facilityId)
      .where("date", "==", data.date)
      .where("startTime", "<", data.endTime)
      .where("endTime", ">", data.startTime)
      .get();

    if (!overlap.empty) {
      return res.status(400).json({ message: "Horario no disponible" });
    }

    // Crear reserva
    const booking = new Booking(data);
    const ref = db.collection("bookings").doc();

    booking.id = ref.id;

    await ref.set(booking.toFirestore(FieldValue));

    res.status(201).json({
      success: true,
      message: "Reserva creada correctamente",
      booking
    });

  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET --> OBTENER MIS RESERVAS
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db
      .collection("bookings")
      .where("userId", "==", userId)
      .orderBy("date", "desc")
      .get();

    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({ success: true, bookings });

  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET --> OBTENER DISPONIBILIDAD
exports.getAvailability = async (req, res) => {
  try {
    const { venueId, facilityId, date } = req.params;

    const snapshot = await db
      .collection("bookings")
      .where("venueId", "==", venueId)
      .where("facilityId", "==", facilityId)
      .where("date", "==", date)
      .get();

    const taken = snapshot.docs.map((d) => ({
      start: d.data().startTime,
      end: d.data().endTime
    }));

    res.json({ success: true, taken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
