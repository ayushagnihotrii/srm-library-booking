const cron = require('node-cron');
const Booking = require('../models/Booking');
const sendEmail = require('./email');

const startCronJobs = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Get the current date in YYYY-MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${year}-${month}-${day}`;

      // We want to find bookings that start exactly 15 minutes from now.
      const targetTime = new Date(now.getTime() + 15 * 60000);
      
      // Fixed time slots:
      // '9:00 AM - 12:00 PM' -> starts at 9:00 AM
      // '12:00 PM - 3:00 PM' -> starts at 12:00 PM
      // '3:00 PM - 6:00 PM' -> starts at 3:00 PM
      // '6:00 PM - 9:00 PM' -> starts at 6:00 PM

      // Determine which slot starts in 15 mins
      let targetSlot = null;

      const targetHour = targetTime.getHours();
      const targetMinute = targetTime.getMinutes();

      if (targetHour === 9 && targetMinute === 0) {
        targetSlot = '9:00 AM - 12:00 PM';
      } else if (targetHour === 12 && targetMinute === 0) {
        targetSlot = '12:00 PM - 3:00 PM';
      } else if (targetHour === 15 && targetMinute === 0) {
        targetSlot = '3:00 PM - 6:00 PM';
      } else if (targetHour === 18 && targetMinute === 0) {
        targetSlot = '6:00 PM - 9:00 PM';
      }

      if (targetSlot) {
        console.log(`Checking for bookings in slot: ${targetSlot} for date: ${todayDateStr}`);
        
        const upcomingBookings = await Booking.find({
          date: todayDateStr,
          timeSlot: targetSlot,
          status: 'booked'
        }).populate('user', 'name email');

        for (let booking of upcomingBookings) {
          if (booking.user && booking.user.email) {
            const message = `Hello ${booking.user.name},\n\nThis is a friendly reminder that your library seat booking for ${targetSlot} is starting in 15 minutes.\n\nThank you,\nSRM AP Library`;
            
            try {
              await sendEmail({
                email: booking.user.email,
                subject: 'Library Seat Booking Reminder',
                message,
                html: `<p>Hello ${booking.user.name},</p><p>This is a friendly reminder that your library seat booking for <strong>${targetSlot}</strong> is starting in 15 minutes.</p><p>Thank you,<br/>SRM AP Library</p>`
              });
              console.log(`Reminder email sent to ${booking.user.email}`);
            } catch (err) {
              console.error(`Error sending email to ${booking.user.email}:`, err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });

  console.log('Cron jobs started');
};

module.exports = startCronJobs;
