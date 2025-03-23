import React, { useState, useEffect } from 'react';
import axios from 'axios';

//  List of service options for admin to assign to shops
const SERVICE_OPTIONS = [
  "Oil Change", "Tire Replacement", "Engine Tune-Up", "Battery Replacement",
  "Brake Inspection", "Transmission Repair", "Wheel Alignment", "AC Repair",
  "Windshield Replacement", "Exhaust System Repair", "Suspension Check",
  "Radiator Flush", "Timing Belt Replacement", "Headlight/Taillight Replacement"
];

function AdminDashboard() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    services: [],
    image: ''
  });

  const [message, setMessage] = useState('');
  const [bookings, setBookings] = useState([]);

  //  Load all bookings for admin on initial render
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };

    fetchBookings();
  }, []);

  //  Toggle service checkbox (add/remove)
  const handleServiceChange = (service) => {
    const selected = formData.services.find(s => s.name === service);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(s => s.name !== service)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, { name: service, price: '' }]
      }));
    }
  };

  //  Handle price input for each service
  const handlePriceChange = (service, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s =>
        s.name === service ? { ...s, price: value } : s
      )
    }));
  };

  //  Handle name, location, image input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  //  Submit form to create a new shop
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const ownerID = decoded.userId;

      const payload = {
        name: formData.name,
        location: formData.location,
        serviceOffered: formData.services,
        image: formData.image,
        ownerID
      };

      await axios.post('http://localhost:5000/api/shops', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(" Shop created successfully!");
      setFormData({ name: '', location: '', services: [], image: '' });
    } catch (err) {
      console.error("Shop creation error:", err);
      setMessage(" Failed to create shop.");
    }
  };

  //  Cancel a booking (admin only)
  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (err) {
      console.error("Booking cancellation failed:", err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard - Create New Shop</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {/*  Shop Creation Form */}
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          className="form-control mb-2"
          placeholder="Shop Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />

        <input
          name="location"
          className="form-control mb-2"
          placeholder="Location"
          value={formData.location}
          onChange={handleInputChange}
          required
        />

        <input
          name="image"
          className="form-control mb-3"
          placeholder="Image Path (e.g. /shop-images/Shop1.jpg)"
          value={formData.image}
          onChange={handleInputChange}
        />

        {/*  Service List with price fields */}
        <div className="mb-3">
          <h5>Select Services:</h5>
          {SERVICE_OPTIONS.map(service => {
            const selected = formData.services.find(s => s.name === service);
            return (
              <div key={service} className="mb-2">
                <label>
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => handleServiceChange(service)}
                    className="me-2"
                  />
                  {service}
                </label>
                {selected && (
                  <input
                    type="number"
                    min="0"
                    placeholder="Price"
                    className="form-control mt-1"
                    value={selected.price}
                    onChange={(e) => handlePriceChange(service, e.target.value)}
                    required
                  />
                )}
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary">Create Shop</button>
      </form>

      {/*  Booking Management */}
      <hr />
      <h3 className="mt-5">All Bookings</h3>
      {bookings.length > 0 ? (
        bookings.map(booking => (
          <div key={booking._id} className="card mb-3">
            <div className="card-body">
              <h5>Shop: {booking.shopID?.name || 'N/A'}</h5>
              <p>Customer: {booking.userID?.email || booking.userID}</p>
              <p>Service: {booking.service}</p>
              <p>Date: {new Date(booking.dateTime).toLocaleString()}</p>
              <p>Status: {booking.status}</p>
              <button className="btn btn-danger" onClick={() => cancelBooking(booking._id)}>
                Cancel Booking
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No bookings available.</p>
      )}
    </div>
  );
}

export default AdminDashboard;
