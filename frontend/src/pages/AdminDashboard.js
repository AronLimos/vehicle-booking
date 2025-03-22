import React, { useState } from 'react';
import axios from 'axios';

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

  const handleServiceChange = (service, price) => {
    const existing = formData.services.find(s => s.name === service);
    if (existing) {
      // Uncheck
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(s => s.name !== service)
      }));
    } else {
      // Check
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, { name: service, price: price || '' }]
      }));
    }
  };

  const handlePriceChange = (service, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s =>
        s.name === service ? { ...s, price: value } : s
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
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const ownerID = decoded.userId;

    try {
      await axios.post('http://localhost:5000/api/shops', {
        name: formData.name,
        location: formData.location,
        serviceOffered: formData.services,
        ownerID,
        image: formData.image
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('✅ Shop created successfully!');
      setFormData({ name: '', location: '', services: [], image: '' });
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to create shop.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard - Create New Shop</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input name="name" className="form-control mb-2" placeholder="Shop Name" value={formData.name} onChange={handleInputChange} required />
        <input name="location" className="form-control mb-2" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
        <input name="image" className="form-control mb-2" placeholder="Image Path (e.g. /shop-images/Shop1.jpg)" value={formData.image} onChange={handleInputChange} />

        <div className="mb-3">
          <h5>Select Services:</h5>
          {SERVICE_OPTIONS.map(service => {
            const selected = formData.services.find(s => s.name === service);
            return (
              <div key={service} className="mb-2">
                <input
                  type="checkbox"
                  checked={!!selected}
                  onChange={() => handleServiceChange(service)}
                />{' '}
                {service}
                {selected && (
                  <input
                    type="number"
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
  );
}

export default AdminDashboard;
