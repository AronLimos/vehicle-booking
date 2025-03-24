import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'customer',      // default role
    adminKey: '',
    ownerKey: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      //  Include secret key if needed
      if (formData.role === 'admin') {
        payload.adminKey = formData.adminKey;
      } else if (formData.role === 'owner') {
        payload.ownerKey = formData.ownerKey;
      }

      const res = await axios.post('http://localhost:5000/api/auth/register', payload);
      setMessage('✅ Registration successful!');
    } catch (error) {
      console.error('❌ Registration Error:', error);
      setMessage('❌ Registration failed. Please check your input or secret key.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleRegister}>
        <input type="text" name="firstName" placeholder="First Name" className="form-control mb-2" onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" className="form-control mb-2" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" className="form-control mb-2" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" className="form-control mb-2" onChange={handleChange} required />

        {/* Role Dropdown */}
        <select name="role" className="form-control mb-3" onChange={handleChange} value={formData.role}>
          <option value="customer">Customer</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
        </select>

        {/* Conditional Admin/Owner Secret Key Input */}
        {formData.role === 'admin' && (
          <input
            type="text"
            name="adminKey"
            placeholder="Admin Secret Key"
            className="form-control mb-2"
            onChange={handleChange}
            required
          />
        )}
        {formData.role === 'owner' && (
          <input
            type="text"
            name="ownerKey"
            placeholder="Owner Secret Key"
            className="form-control mb-2"
            onChange={handleChange}
            required
          />
        )}

        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
}

export default Register;
