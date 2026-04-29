const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Seat',
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      enum: [
        '9:00 AM - 12:00 PM',
        '12:00 PM - 3:00 PM',
        '3:00 PM - 6:00 PM',
        '6:00 PM - 9:00 PM'
      ],
    },
    status: {
      type: String,
      enum: ['booked', 'cancelled'],
      default: 'booked',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double booking of the same seat on the same date and time slot
bookingSchema.index({ seat: 1, date: 1, timeSlot: 1 }, { unique: true, partialFilterExpression: { status: 'booked' } });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
