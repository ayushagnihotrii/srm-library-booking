const mongoose = require('mongoose');

const seatSchema = mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    type: {
      type: String,
      enum: ['regular', 'quiet zone'],
      default: 'regular',
    },
  },
  {
    timestamps: true,
  }
);

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;
