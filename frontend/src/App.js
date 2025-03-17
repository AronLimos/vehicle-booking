import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [activeLink, setActiveLink] = useState('home');
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); // ✅ Ensure authentication
    const storedRole = localStorage.getItem('role');
  
    if (token && storedRole) {
      setRole(storedRole);  // ✅ Set role only if both token & role exist
      console.log("🔍 Retrieved Role from LocalStorage:", storedRole);
    } else {
      setRole(null); // ✅ Prevents Logout from appearing incorrectly
      console.warn("⚠️ No valid user session found!");
    }
  }, []);
  
  
  //  Function to handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Function to handle click on a nav link
  const handleNavClick = (link) => {
    setActiveLink(link);
  };

  return (
    <Router>
      <div className="App">
        {/* Navbar */}
        <nav id="main-nav">
          <div className="navbar-title">AutoLocate</div>
          <div className="navbar-links">
  <Link to="/" className={`nav-links ${activeLink === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>Home</Link>
  <Link to="/search" className={`nav-links ${activeLink === 'search' ? 'active' : ''}`} onClick={() => handleNavClick('search')}>Search</Link>
  <Link to="/book" className={`nav-links ${activeLink === 'book' ? 'active' : ''}`} onClick={() => handleNavClick('book')}>Book</Link>
  <Link to="/rating" className={`nav-links ${activeLink === 'rating' ? 'active' : ''}`} onClick={() => handleNavClick('rating')}>Rating</Link>

  {!role ? (
    <>
      <Link to="/login" className="nav-links">Login</Link>
      <Link to="/register" className="nav-links">Register</Link>
    </>
  ) : (
    <>
      <Link to={`/dashboard/${role}`} className="nav-links">Dashboard</Link>
      <button onClick={handleLogout}>Logout</button> {/* ✅ Show Logout Only if Logged In */}
    </>
  )}
</div>

         
        </nav>

        {/* Routes for Different Pages */}
        <Routes>
          <Route path="/" element={<Home />} /> {/*  Home Page Restored */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          <Route path="/dashboard/owner" element={<OwnerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />

          {/*  Redirect users to their role-specific dashboard */}
          <Route path="/dashboard" element={role ? <Navigate to={`/dashboard/${role}`} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

//  Home Page Component (Preserving Original Layout)
const Home = () => (
  <div>
    {/* Home Section */}
    <div id="home">
      <h2>CAR REPAIR AND MAINTENANCE SERVICE</h2>
    </div>

    {/* Search Section */}
    <div id="search">
      <h2>Search Section</h2>

      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <input type="text" id="myInput" placeholder="Search for AutoShop..."></input>
          </div>
        </div>
      </div>

      {/* Mechanic Shop Cards */}
      <div className='shop-container mt-4'>
        <div className='shop-card col-md-4'><h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span></h3></div>
        <div className='shop-card col-md-4'><h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span></h3></div>
        <div className='shop-card col-md-4'><h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span></h3></div>
        <div className='shop-card col-md-4'><h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span></h3></div>
        <div className='shop-card col-md-4'><h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span></h3></div>
        <div className='shop-card col-md-4'><h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span></h3></div>
        <div className='shop-card col-md-4'><h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span></h3></div>
        <div className='shop-card col-md-4'><h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span></h3></div>
      </div>
    </div>

    <div id="book">
      <h2>Book Section</h2>
    </div>
    <div id="rating">
      <h2>Rating Section</h2>
    </div>
  </div>
);

export default App;
