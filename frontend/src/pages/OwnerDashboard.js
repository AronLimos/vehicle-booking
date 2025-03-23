import React, { useEffect, useState } from 'react';
import axios from 'axios';

function OwnerDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    };
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBookings(prev => prev.filter(b => b._id !== id));
  };

  return (
    <div className="container mt-5">
      <h2>Bookings at Your Shops</h2>
      {bookings.length > 0 ? bookings.map(booking => (
        <div key={booking._id} className="card mb-3">
          <div className="card-body">
            <h5>Customer: {booking.userID}</h5>
            <p>Service: {booking.service}</p>
            <p>Shop: {booking.shopID?.name}</p>
            <p>Date: {new Date(booking.dateTime).toLocaleString()}</p>
            <p>Status: {booking.status}</p>
            <button className="btn btn-danger" onClick={() => cancelBooking(booking._id)}>Cancel</button>
          </div>
        </div>
      )) : <p>No bookings found.</p>}
    </div>
  );
}

export default OwnerDashboard;
