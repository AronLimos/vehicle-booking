import React, { useEffect, useState } from "react";
import axios from "axios";

// Available services
const SERVICE_OPTIONS = [
  "Oil Change", "Tire Replacement", "Engine Tune-Up", "Battery Replacement",
  "Brake Inspection", "Transmission Repair", "Wheel Alignment", "AC Repair",
  "Windshield Replacement", "Exhaust System Repair", "Suspension Check",
  "Radiator Flush", "Timing Belt Replacement", "Headlight/Taillight Replacement"
];

function OwnerDashboard() {
  const [shops, setShops] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState("shops"); // Toggle between tabs
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const decoded = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const ownerID = decoded.userId;

  // Fetch shops owned by the logged-in owner
  const fetchMyShops = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/shops", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myShops = res.data.filter(shop => shop.ownerID === ownerID);
      setShops(myShops);
    } catch (err) {
      console.error("Error fetching shops:", err);
    }
  };

  // Fetch bookings related to owner's shops
  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shopIds = shops.map(shop => shop._id.toString());
      const ownerBookings = res.data.filter(b => shopIds.includes(b.shopID._id));
      setBookings(ownerBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  // Cancel booking by owner
  const cancelBooking = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: "canceled" } : b));
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    }
  };

  useEffect(() => {
    fetchMyShops();
  }, []);

  useEffect(() => {
    if (view === "bookings" && shops.length > 0) {
      fetchBookings();
    }
  }, [view, shops]);

  // Form Handlers
  const handleInputChange = (shopIndex, field, value) => {
    const updatedShops = [...shops];
    updatedShops[shopIndex][field] = value;
    setShops(updatedShops);
  };

  const toggleService = (shopIndex, serviceName) => {
    const updatedShops = [...shops];
    const shop = updatedShops[shopIndex];
    const existing = shop.serviceOffered.find(s => s.name === serviceName);

    if (existing) {
      shop.serviceOffered = shop.serviceOffered.filter(s => s.name !== serviceName);
    } else {
      shop.serviceOffered.push({ name: serviceName, price: "" });
    }

    setShops(updatedShops);
  };

  const updateServicePrice = (shopIndex, serviceName, price) => {
    const updatedShops = [...shops];
    const shop = updatedShops[shopIndex];
    shop.serviceOffered = shop.serviceOffered.map(s =>
      s.name === serviceName ? { ...s, price } : s
    );
    setShops(updatedShops);
  };

  const updateShop = async (shopId, shopData) => {
    try {
      await axios.put(`http://localhost:5000/api/shops/${shopId}`, shopData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Shop updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      setMessage("❌ Failed to update shop.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Owner Dashboard</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {/* Tab Buttons */}
      <div className="mb-4">
        <button
          className={`btn me-2 ${view === "shops" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setView("shops")}
        >
          My Shops
        </button>
        <button
          className={`btn ${view === "bookings" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setView("bookings")}
        >
          Manage Bookings
        </button>
      </div>

      {/* ---------------- Shops Tab ---------------- */}
      {view === "shops" && (
        <>
          {shops.map((shop, idx) => (
            <div key={shop._id} className="card p-3 mb-4">
              <label>Shop Name:</label>
              <input
                className="form-control mb-2"
                value={shop.name}
                onChange={(e) => handleInputChange(idx, "name", e.target.value)}
              />
              <label>Location:</label>
              <input
                className="form-control mb-2"
                value={shop.location}
                onChange={(e) => handleInputChange(idx, "location", e.target.value)}
              />
              <h5>Services Offered:</h5>
              {SERVICE_OPTIONS.map(service => {
                const selected = shop.serviceOffered.find(s => s.name === service);
                return (
                  <div key={service} className="mb-2">
                    <label>
                      <input
                        type="checkbox"
                        className="me-2"
                        checked={!!selected}
                        onChange={() => toggleService(idx, service)}
                      />
                      {service}
                    </label>
                    {selected && (
                      <input
                        type="number"
                        className="form-control mt-1"
                        placeholder="Price"
                        value={selected.price}
                        onChange={(e) => updateServicePrice(idx, service, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
              <button
                className="btn btn-success mt-3"
                onClick={() =>
                  updateShop(shop._id, {
                    name: shop.name,
                    location: shop.location,
                    serviceOffered: shop.serviceOffered,
                  })
                }
              >
                Save Changes
              </button>
            </div>
          ))}
        </>
      )}

      {/* ---------------- Bookings Tab ---------------- */}
      {view === "bookings" && (
        <>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div key={booking._id} className="card p-3 mb-3">
                <p><strong>Shop:</strong> {booking.shopID?.name}</p>
                <p><strong>Service:</strong> {booking.service}</p>
                <p><strong>Date:</strong> {new Date(booking.dateTime).toLocaleString()}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                {booking.status !== "canceled" && (
                  <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(booking._id)}>
                    Cancel Booking
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No bookings found for your shops.</p>
          )}
        </>
      )}
    </div>
  );
}

export default OwnerDashboard;
