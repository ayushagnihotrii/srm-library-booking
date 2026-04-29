const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block/Unblock a user
// @access  Private/Admin
router.put('/users/:id/block', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot block an admin' });
      }
      user.isBlocked = !user.isBlocked;
      await user.save();
      res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}` });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Private/Admin
router.get('/bookings', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email studentId')
      .populate('seat', 'seatNumber type')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/seats
// @desc    Add a new seat
// @access  Private/Admin
router.post('/seats', protect, admin, async (req, res) => {
  const { seatNumber, type } = req.body;
  try {
    const seatExists = await Seat.findOne({ seatNumber });
    if (seatExists) {
      return res.status(400).json({ message: 'Seat already exists' });
    }
    const seat = await Seat.create({ seatNumber, type });
    res.status(201).json(seat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
