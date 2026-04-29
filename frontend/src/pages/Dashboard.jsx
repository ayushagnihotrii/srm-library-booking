import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { format, addDays } from 'date-fns';
import { Calendar, Clock, Trash2, CheckCircle } from 'lucide-react';

const TIME_SLOTS = [
  '9:00 AM - 12:00 PM',
  '12:00 PM - 3:00 PM',
  '3:00 PM - 6:00 PM',
  '6:00 PM - 9:00 PM'
];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [seats, setSeats] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/seats?date=${date}&timeSlot=${selectedSlot}`, config);
      setSeats(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/bookings/mybookings', config);
      setMyBookings(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSeats();
      fetchMyBookings();
    }
  }, [date, selectedSlot, user]);

  const handleBookSeat = async (seatId) => {
    try {
      setBookingLoading(true);
      setMessage(null);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/bookings', { seatId, date, timeSlot: selectedSlot }, config);
      setMessage({ type: 'success', text: 'Seat booked successfully!' });
      fetchSeats();
      fetchMyBookings();
      setBookingLoading(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response && error.response.data.message ? error.response.data.message : 'Error booking seat'
      });
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`/api/bookings/${bookingId}/cancel`, {}, config);
        setMessage({ type: 'success', text: 'Booking cancelled.' });
        fetchSeats();
        fetchMyBookings();
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error.response && error.response.data.message ? error.response.data.message : 'Error cancelling booking'
        });
      }
    }
  };

  return (
    <div className="container py-4 animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Booking Interface */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar color="var(--accent-primary)" />
            Book a Seat
          </h2>

          {message && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem', 
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {message.type === 'success' && <CheckCircle size={18} />}
              {message.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={date} 
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 7), 'yyyy-MM-dd')}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
              <label className="form-label">Time Slot</label>
              <select 
                className="form-input" 
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                {TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Select a Seat</h3>
          
          {loading ? (
            <div className="text-center" style={{ padding: '2rem' }}>Loading seats...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '1rem' }}>
              {seats.map(seat => (
                <button
                  key={seat._id}
                  disabled={seat.isBooked || bookingLoading}
                  onClick={() => handleBookSeat(seat._id)}
                  style={{
                    padding: '1rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: seat.isBooked ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                    color: seat.isBooked ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    cursor: seat.isBooked ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s ease',
                    opacity: seat.isBooked ? 0.6 : 1
                  }}
                  onMouseOver={(e) => {
                    if(!seat.isBooked) e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseOut={(e) => {
                    if(!seat.isBooked) e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{seat.seatNumber}</span>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{seat.type === 'quiet zone' ? 'Quiet' : 'Reg'}</span>
                </button>
              ))}
              {seats.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-tertiary)' }}>No seats available</p>}
            </div>
          )}
        </div>

        {/* Right Column: My Bookings */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock color="var(--accent-primary)" />
            My Bookings
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
            {myBookings.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem 0' }}>
                You have no bookings yet.
              </div>
            ) : (
              myBookings.map(booking => (
                <div key={booking._id} style={{ 
                  padding: '1.25rem', 
                  borderRadius: '12px', 
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: booking.status === 'cancelled' ? 0.6 : 1
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Seat {booking.seat?.seatNumber}</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.1rem 0.5rem', 
                        borderRadius: '12px', 
                        background: booking.status === 'booked' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: booking.status === 'booked' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {booking.status}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} /> {booking.date}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} /> {booking.timeSlot}
                    </div>
                  </div>
                  
                  {booking.status === 'booked' && (
                    <button 
                      onClick={() => handleCancelBooking(booking._id)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      title="Cancel Booking"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
