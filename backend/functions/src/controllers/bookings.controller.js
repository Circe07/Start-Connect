/**
 * Controller Bookings
 * This controller manages venue/facility bookings and reservations
 * Features: Create bookings, retrieve user bookings, check availability
 * Author: Unai Villar
 */

const { db, admin, FieldValue } = require("../config/firebase");
const Booking = require("../models/booking.model");

/**
 * POST - Create a new booking for a venue facility
 * Validates availability and prevents double-booking
 * @param {Request} req - Express request object
 * @param {Request} req.body.venueId - Venue/center ID
 * @param {Request} req.body.facilityId - Facility ID (e.g., pool, gym)
 * @param {Request} req.body.date - Booking date (YYYY-MM-DD)
 * @param {Request} req.body.startTime - Start time (HH:MM)
 * @param {Request} req.body.endTime - End time (HH:MM)
 * @param {Response} res - Express response object
 * @returns {Object} Created booking with ID and details
 */
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Data of booking
    const data = {
      userId,
      venueId: req.body.venueId,
      facilityId: req.body.facilityId,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    };

    /**
     * Validate booking data using Booking model
     * Checks: required fields, time format, data consistency
     */
    const validationError = Booking.validate(data);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    /**
     * Check for booking conflicts
     * Query existing bookings for same venue/facility/date
     * to ensure no overlapping time slots
     */
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

    /**
     * Create booking document in Firestore
     * Uses Booking model for data consistency
     */
    const booking = new Booking(data);
    const ref = db.collection("bookings").doc();

    // Set generated document ID
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

/**
 * GET - Retrieve all bookings for the authenticated user
 * Returns user's bookings sorted by date (newest first)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Array} List of user's bookings
 */
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

/**
 * GET - Get available time slots for a facility on a specific date
 * Returns all booked time slots so client can show availability
 * No authentication required (public availability check)
 * @param {Request} req - Express request object
 * @param {Request} req.params.venueId - Venue ID
 * @param {Request} req.params.facilityId - Facility ID  
 * @param {Request} req.params.date - Date to check (YYYY-MM-DD)
 * @param {Response} res - Express response object
 * @returns {Array} Array of booked time slots with start and end times
 */
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
