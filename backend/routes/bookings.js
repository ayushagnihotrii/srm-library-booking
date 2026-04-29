const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const { protect } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Book a seat
// @access  Private
router.post('/', protect, async (req, res) => {
  const { seatId, date, timeSlot } = req.body;

  try {
    // Check if seat exists and is active
    const seat = await Seat.findById(seatId);
    if (!seat || seat.status !== 'active') {
      return res.status(400).json({ message: 'Seat not available' });
    }

    // Check if the slot is already booked
    const existingBooking = await Booking.findOne({
      seat: seatId,
      date,
      timeSlot,
      status: 'booked'
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Seat is already booked for this time slot' });
    }

    // Optional: Check if user already has a booking for the same date and time slot
    const userExistingBooking = await Booking.findOne({
      user: req.user._id,
      date,
      timeSlot,
      status: 'booked'
    });

    if (userExistingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this time slot' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      seat: seatId,
      date,
      timeSlot,
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Seat is already booked for this time slot (duplicate)' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/mybookings
// @desc    Get logged in user bookings
// @access  Private
router.get('/mybookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('seat', 'seatNumber type')
      .sort({ date: 1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure user owns the booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
