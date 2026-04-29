const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @route   GET /api/seats
// @desc    Get all active seats and their availability for a specific date and time slot
// @access  Private
router.get('/', protect, async (req, res) => {
  const { date, timeSlot } = req.query;

  try {
    const seats = await Seat.find({ status: 'active' });

    if (!date || !timeSlot) {
      return res.json(seats);
    }

    // Find all bookings for this date and time slot
    const bookings = await Booking.find({
      date,
      timeSlot,
      status: 'booked'
    });

    const bookedSeatIds = bookings.map(b => b.seat.toString());

    const seatsWithAvailability = seats.map(seat => ({
      ...seat._doc,
      isBooked: bookedSeatIds.includes(seat._id.toString())
    }));

    res.json(seatsWithAvailability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
