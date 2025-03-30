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
import { Modal, Button } from "react-bootstrap";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BookingPage from "./pages/BookingPage";
import ReviewForm from "./components/ReviewForm"; 

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
        {/* Navbar */}
        <nav id="main-nav">
          <div className="navbar-title">AutoLocate</div>
          <div className="navbar-links">
            <Link to="/" className={`nav-links ${activeLink === "home" ? "active" : ""}`} onClick={() => handleNavClick("home")}>Home</Link>
            {!role ? (
              <>
                <Link to="/login" className="nav-links">Login</Link>
                <Link to="/register" className="nav-links">Register</Link>
              </>
            ) : (
              <>
                <Link to={`/dashboard/${role}`} className="nav-links">Dashboard</Link>
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home role={role} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book/:shopId" element={<BookingPage />} />
          <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          <Route path="/dashboard/owner" element={<OwnerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={role ? <Navigate to={`/dashboard/${role}`} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

/*  HOME COMPONENT */
const Home = ({ role }) => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch shops from backend (includes avgRating and reviews)
  const fetchShops = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/shops");
      setShops(res.data);
    } catch (err) {
      console.error("Failed to fetch shops:", err);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleOpenModal = (shop) => {
    setSelectedShop(shop);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedShop(null);
    setShowModal(false);
  };

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
              <input type="text" id="myInput" placeholder="Search for AutoShop..." />
            </div>
          </div>
        </div>

        <div className="shop-container mt-4">
          {shops.length > 0 ? (
            shops.map((shop) => (
              <div key={shop._id} className="shop-card col-md-4" onClick={() => handleOpenModal(shop)}>
                <h3>
                  {shop.name}
                  <span className="stars">
                    {"★".repeat(Math.round(shop.avgRating || 0))} ({shop.avgRating?.toFixed(1) || "0.0"})
                  </span>
                </h3>
                <p><strong>Location:</strong> {shop.location}</p>
                {shop.image && (
                  <img
                    src={shop.image}
                    alt={shop.name}
                    style={{ width: "100%", height: "150px", objectFit: "cover" }}
                  />
                )}
                {role === "customer" && (
                  <Link to={`/book/${shop._id}`} className="btn btn-sm btn-success mt-2">
                    Book Now
                  </Link>
                )}
              </div>
            ))
          ) : (
            <p>No shops available.</p>
          )}
        </div>
      </div>

      {/* Modal for Shop Details */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedShop?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedShop && (
            <>
              <p><strong>Location:</strong> {selectedShop.location}</p>
              <p><strong>Services:</strong></p>
              <ul>
                {selectedShop.serviceOffered.map((s, idx) => (
                  <li key={idx}>{s.name} - ${s.price}</li>
                ))}
              </ul>
              {selectedShop.image && (
                <img
                  src={selectedShop.image}
                  alt="Shop"
                  style={{ width: "100%", objectFit: "cover", marginTop: "10px" }}
                />
              )}
              <ReviewForm shopId={selectedShop._id} onReviewSubmitted={fetchShops} />
              <hr />
              <h5>Reviews</h5>
              {selectedShop.reviews && selectedShop.reviews.length > 0 ? (
                selectedShop.reviews.map((review, idx) => (
                  <div key={idx} className="border p-2 mb-2">
                    <strong>{review.rating}★</strong> - {review.comment}
                    <br />
                    <small>by {review.user?.email || "Anonymous"}</small>
                  </div>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;
