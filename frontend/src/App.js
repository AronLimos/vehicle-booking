import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useParams,
  useNavigate,
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
            <Link to="/search" className={`nav-links ${activeLink === "search" ? "active" : ""}`} onClick={() => handleNavClick("search")}>Search</Link>
            <Link to="/book" className={`nav-links ${activeLink === "book" ? "active" : ""}`} onClick={() => handleNavClick("book")}>Book</Link>
            <Link to="/rating" className={`nav-links ${activeLink === "rating" ? "active" : ""}`} onClick={() => handleNavClick("rating")}>Rating</Link>

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

const Home = ({ role }) => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      {/* Hero Section */}
      <div id="home">
        <h2>CAR REPAIR AND MAINTENANCE SERVICE</h2>
      </div>

      {/* Search & Shop Cards */}
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
                <h3>{shop.name} <span className="stars">★★★★★</span></h3>
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

      {/* Static sections */}
      <div id="book"><h2>Book Section</h2></div>
      <div id="rating"><h2>Rating Section</h2></div>

      {/* Modal for detailed view */}
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
              <hr />
              <h5>Reviews</h5>
              <p>⭐ Feature coming soon...</p>
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