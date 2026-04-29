import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, BookMarked, ShieldAlert, CheckCircle, Plus } from 'lucide-react';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [newSeat, setNewSeat] = useState({ seatNumber: '', type: 'regular' });
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'users', 'seats'

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [usersRes, bookingsRes] = await Promise.all([
        axios.get('/api/admin/users', config),
        axios.get('/api/admin/bookings', config)
      ]);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const handleBlockUser = async (userId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/admin/users/${userId}/block`, {}, config);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error blocking user');
    }
  };

  const handleAddSeat = async (e) => {
    e.preventDefault();
    try {
      setMessage(null);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/admin/seats', newSeat, config);
      setMessage({ type: 'success', text: `Seat ${newSeat.seatNumber} added successfully!` });
      setNewSeat({ seatNumber: '', type: 'regular' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response && error.response.data.message ? error.response.data.message : 'Error adding seat'
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="container py-4 text-center">Not authorized as admin.</div>;
  }

  return (
    <div className="container py-4 animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert color="var(--accent-primary)" />
          Admin Dashboard
        </h1>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('bookings')}
          >
            <BookMarked size={18} /> All Bookings
          </button>
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Manage Users
          </button>
          <button 
            className={`btn ${activeTab === 'seats' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('seats')}
          >
            <Plus size={18} /> Add Seats
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Bookings</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem 0' }}>User</th>
                    <th style={{ padding: '1rem 0' }}>Student ID</th>
                    <th style={{ padding: '1rem 0' }}>Seat</th>
                    <th style={{ padding: '1rem 0' }}>Date & Time</th>
                    <th style={{ padding: '1rem 0' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0' }}>{booking.user?.name}</td>
                      <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{booking.user?.studentId}</td>
                      <td style={{ padding: '1rem 0' }}>{booking.seat?.seatNumber} ({booking.seat?.type})</td>
                      <td style={{ padding: '1rem 0' }}>{booking.date} | {booking.timeSlot}</td>
                      <td style={{ padding: '1rem 0' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '12px', 
                          background: booking.status === 'booked' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: booking.status === 'booked' ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && <tr><td colSpan="5" className="text-center" style={{ padding: '2rem 0' }}>No bookings found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>User Management</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem 0' }}>Name</th>
                    <th style={{ padding: '1rem 0' }}>Email</th>
                    <th style={{ padding: '1rem 0' }}>Role</th>
                    <th style={{ padding: '1rem 0' }}>Status</th>
                    <th style={{ padding: '1rem 0' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0' }}>{u.name}</td>
                      <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '1rem 0' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '12px', 
                          background: u.role === 'admin' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)',
                          color: u.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-primary)'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        {u.isBlocked ? (
                          <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>Blocked</span>
                        ) : (
                          <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>Active</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleBlockUser(u._id)}
                            className={`btn ${u.isBlocked ? 'btn-primary' : 'btn-danger'}`}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'seats' && (
          <div style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add New Seat</h2>
            
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

            <form onSubmit={handleAddSeat}>
              <div className="form-group">
                <label className="form-label">Seat Number / Identifier</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. A1, B12, Q1"
                  value={newSeat.seatNumber}
                  onChange={(e) => setNewSeat({...newSeat, seatNumber: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Seat Type</label>
                <select 
                  className="form-input"
                  value={newSeat.type}
                  onChange={(e) => setNewSeat({...newSeat, type: e.target.value})}
                >
                  <option value="regular">Regular</option>
                  <option value="quiet zone">Quiet Zone</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Add Seat</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
