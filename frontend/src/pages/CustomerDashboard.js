import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);

  //Fetch bookings for current user
  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const userId = decoded.userId;

      try {
        const res = await axios.get('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userBookings = res.data.filter(b => b.userID._id === userId);
        setBookings(userBookings);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      }
    };

    fetchBookings();
  }, []);

  //Cacncel Booking
  const cancelBooking = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: "canceled" } : b));
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>My Bookings</h2>
      {bookings.map((booking) => (
        <div key={booking._id} className="card p-3 mb-3">
          <p><strong>Shop:</strong> {booking.shopID?.name}</p>
          <p><strong>Service:</strong> {booking.service}</p>
          <p><strong>Date:</strong> {new Date(booking.dateTime).toLocaleString()}</p>
          <p><strong>Status:</strong> {booking.status}</p>
          {booking.status !== 'canceled' && (
            <button className="btn btn-danger" onClick={() => cancelBooking(booking._id)}>
              Cancel Booking
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default CustomerDashboard;
