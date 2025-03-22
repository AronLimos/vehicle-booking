import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import axios from "axios";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [activeLink, setActiveLink] = useState("home");
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (token && storedRole) {
      setRole(storedRole);
    } else {
      setRole(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleNavClick = (link) => {
    setActiveLink(link);
  };

  return (
    <Router>
      <div className="App">
        <nav id="main-nav">
          <div className="navbar-title">AutoLocate</div>
          <div className="navbar-links">
            <Link
              to="/"
              className={`nav-links ${activeLink === "home" ? "active" : ""}`}
              onClick={() => handleNavClick("home")}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={`nav-links ${activeLink === "search" ? "active" : ""}`}
              onClick={() => handleNavClick("search")}
            >
              Search
            </Link>
            <Link
              to="/book"
              className={`nav-links ${activeLink === "book" ? "active" : ""}`}
              onClick={() => handleNavClick("book")}
            >
              Book
            </Link>
            <Link
              to="/rating"
              className={`nav-links ${activeLink === "rating" ? "active" : ""}`}
              onClick={() => handleNavClick("rating")}
            >
              Rating
            </Link>

            {!role ? (
              <>
                <Link to="/login" className="nav-links">
                  Login
                </Link>
                <Link to="/register" className="nav-links">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to={`/dashboard/${role}`} className="nav-links">
                  Dashboard
                </Link>
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          <Route path="/dashboard/owner" element={<OwnerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route
            path="/dashboard"
            element={
              role ? (
                <Navigate to={`/dashboard/${role}`} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

const Home = () => {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/shops");
        setShops(res.data);
      } catch (err) {
        console.error("Failed to fetch shops:", err);
      }
    };
    fetchShops();
  }, []);

  return (
    <div>
      <div id="home">
        <h2>CAR REPAIR AND MAINTENANCE SERVICE</h2>
      </div>

      <div id="search">
        <h2>Search Section</h2>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <input
                type="text"
                id="myInput"
                placeholder="Search for AutoShop..."
              />
            </div>
          </div>
        </div>

        {/* Dynamic Shop Cards */}
        <div className="shop-container mt-4">
          {shops.length > 0 ? (
            shops.map((shop) => (
              <div key={shop._id} className="shop-card col-md-4">
                <h3>
                  {shop.name} <span className="stars">★★★★★</span>
                </h3>
                <p>
                  <strong>Location:</strong> {shop.location}
                </p>

                <p>
                  <strong>Services:</strong>
                </p>
                <ul>
                  {shop.serviceOffered.map((service, idx) => (
                    <li key={idx}>
                      {service.name} - ${service.price}
                    </li>
                  ))}
                </ul>

                {shop.image && (
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="shop-image"
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>
            ))
          ) : (
            <p>No shops available.</p>
          )}
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
};

export default App;
