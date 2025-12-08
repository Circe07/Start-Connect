class Booking {
  constructor({ userId, venueId, facilityId, date, startTime, endTime }) {
    this.id = null;
    this.userId = userId;
    this.venueId = venueId;
    this.facilityId = facilityId;
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
    this.status = "active";
    this.createdAt = null;
  }

  static validate(data) {
    const required = ["userId", "venueId", "facilityId", "date", "startTime", "endTime"];

    for (const field of required) {
      if (!data[field]) {
        return `Campo requerido: ${field}`;
      }
    }

    if (data.startTime >= data.endTime) {
      return "La hora de inicio debe ser menor que la hora de fin";
    }

    return null;
  }

  toFirestore(FieldValue) {
    return {
      userId: this.userId,
      venueId: this.venueId,
      facilityId: this.facilityId,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      status: this.status,
      createdAt: FieldValue.serverTimestamp()
    };
  }
}

module.exports = Booking;
