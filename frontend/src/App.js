import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
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

// Components
import ReviewForm from "./components/ReviewForm";

const Navbar = ({ role, handleLogout }) => {
  const location = useLocation();
  return (
    <nav id="main-nav">
      <div className="navbar-title">AutoLocate</div>
      <div className="navbar-links">
        <Link to="/" className={`nav-links ${location.pathname === "/" ? "active" : ""}`}>Home</Link>
        {!role ? (
          <>
            <Link to="/login" className={`nav-links ${location.pathname === "/login" ? "active" : ""}`}>Login</Link>
            <Link to="/register" className={`nav-links ${location.pathname === "/register" ? "active" : ""}`}>Register</Link>
          </>
        ) : (
          <>
            <Link to={`/dashboard/${role}`} className={`nav-links ${location.pathname.startsWith("/dashboard") ? "active" : ""}`}>Profile</Link>
            <Link to="/login" className="nav-links" onClick={handleLogout}>Logout</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const Home = ({ role }) => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  // Fetch all shops with avgRating and embedded reviews
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

  const filteredShops = shops.filter((shop) =>
    (shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     shop.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!serviceFilter || shop.serviceOffered.some((s) => s.name === serviceFilter))
  );

  return (
    <div>
      <div id="home"><h2>CAR REPAIR AND MAINTENANCE SERVICE</h2></div>
      <SearchSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        serviceFilter={serviceFilter}
        setServiceFilter={setServiceFilter}
        shops={shops}
      />
      <ShopList
        shops={filteredShops}
        role={role}
        setSelectedShop={setSelectedShop}
        setShowModal={setShowModal}
      />
      <ShopModal
        showModal={showModal}
        handleClose={() => setShowModal(false)}
        selectedShop={selectedShop}
        refreshShops={fetchShops}
      />
    </div>
  );
};

// Search bar and service filter dropdown
const SearchSection = ({ searchTerm, setSearchTerm, serviceFilter, setServiceFilter, shops }) => {
  return (
    <div id="search" className="container">
      <h2>Search Section</h2>
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            placeholder="Search by shop name or location..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-control"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="">All Services</option>
            {[...new Set(shops.flatMap((shop) => shop.serviceOffered.map((s) => s.name)))].map((service, idx) => (
              <option key={idx} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// Shop cards display
const ShopList = ({ shops, role, setSelectedShop, setShowModal }) => {
  return (
    <div className="shop-container mt-4">
      {shops.length > 0 ? shops.map((shop) => (
        <div
          key={shop._id}
          className="shop-card col-md-4"
          onClick={() => { setSelectedShop(shop); setShowModal(true); }}
        >
          <h3>{shop.name}
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
            <Link to={`/book/${shop._id}`} className="btn btn-sm btn-success mt-2">Book Now</Link>
          )}
        </div>
      )) : <p>No shops available.</p>}
    </div>
  );
};

// Modal with review section and review form
const ShopModal = ({ showModal, handleClose, selectedShop, refreshShops }) => (
  <Modal show={showModal} onHide={handleClose} size="lg">
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

          {/* Review form to submit new reviews */}
          <ReviewForm shopId={selectedShop._id} onReviewSubmitted={refreshShops} />

          {/* Display Reviews Below */}
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
      <Button variant="secondary" onClick={handleClose}>Close</Button>
    </Modal.Footer>
  </Modal>
);

function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setRole(token ? localStorage.getItem("role") : null);
  }, []);

  return (
    <Router>
      <Navbar role={role} handleLogout={() => { localStorage.clear(); window.location.href = "/login"; }} />
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
    </Router>
  );
}

export default App;
