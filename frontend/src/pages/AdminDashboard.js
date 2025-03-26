import React, { useState, useEffect } from 'react';
import axios from 'axios';

// List of services admin can assign to a shop
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
  const [reviews, setReviews] = useState([]);

  // Fetch all reviews when the dashboard loads
  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/reviews', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReviews(res.data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };

    fetchReviews();
  }, []);

  // Handle checkbox toggling for services
  const handleServiceChange = (service) => {
    const existing = formData.services.find(s => s.name === service);
    if (existing) {
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

  const handlePriceChange = (service, price) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s =>
        s.name === service ? { ...s, price } : s
      )
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
        ownerID,
        image: formData.image
      };

      await axios.post('http://localhost:5000/api/shops', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(' Shop created successfully!');
      setFormData({ name: '', location: '', services: [], image: '' });
    } catch (err) {
      console.error(err);
      setMessage(' Failed to create shop.');
    }
  };

  // Admin deletes any review
  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>

      {/* Shop Creation Form */}
      <div className="mt-4">
        <h4>Create New Shop</h4>
        {message && <div className="alert alert-info">{message}</div>}
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

          <div className="mb-3">
            <h5>Select Services</h5>
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
      </div>

      {/* Review Management */}
      <div className="mt-5">
        <h4>All Customer Reviews</h4>
        {reviews.length === 0 ? (
          <p>No reviews available.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="card mb-3 p-3">
              <p><strong>User:</strong> {review.userID?.firstName} {review.userID?.lastName}</p>
              <p><strong>Shop:</strong> {review.shopID?.name}</p>
              <p><strong>Rating:</strong> {review.rating} ⭐</p>
              <p>{review.comment}</p>
              <button
              className="btn btn-sm btn-danger"
              style={{ width: "auto", maxWidth: "100px", padding: "4px 8px" }}
              onClick={() => handleDeleteReview(review._id)}
            >
              Delete 
            </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
