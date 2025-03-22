import React, { useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    serviceOffered: '',
    image: '' 
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //  Extract userId from JWT token
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const ownerID = decodedToken.userId;

      const payload = {
        name: formData.name,
        location: formData.location,
        serviceOffered: formData.serviceOffered.split(',').map(service => service.trim()),
        image: formData.image, 
        ownerID: ownerID
      };

      await axios.post('http://localhost:5000/api/shops', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(' Shop created successfully!');
      setFormData({ name: '', location: '', serviceOffered: '', image: '' });

    } catch (err) {
      console.error(" Shop creation failed:", err);
      setMessage(' Failed to create shop');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard - Create New Shop</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" className="form-control mb-2" placeholder="Shop Name" value={formData.name} onChange={handleChange} required />
        <input type="text" name="location" className="form-control mb-2" placeholder="Location" value={formData.location} onChange={handleChange} required />
        <input type="text" name="serviceOffered" className="form-control mb-2" placeholder="Services (comma-separated)" value={formData.serviceOffered} onChange={handleChange} required />
        <input type="text" name="image" className="form-control mb-3" placeholder="/shop-images/fastfix.png" value={formData.image} onChange={handleChange} />

        <button className="btn btn-primary">Create Shop</button>
      </form>
    </div>
  );
}

export default AdminDashboard;
