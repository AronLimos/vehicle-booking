import React, { useEffect, useState } from "react";
import axios from "axios";

// List of possible services
const SERVICE_OPTIONS = [
  "Oil Change", "Tire Replacement", "Engine Tune-Up", "Battery Replacement",
  "Brake Inspection", "Transmission Repair", "Wheel Alignment", "AC Repair",
  "Windshield Replacement", "Exhaust System Repair", "Suspension Check",
  "Radiator Flush", "Timing Belt Replacement", "Headlight/Taillight Replacement"
];

function OwnerDashboard() {
  const [shops, setShops] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState("shops"); // 'shops' or 'bookings'
  const [message, setMessage] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const token = localStorage.getItem("token");
  const decoded = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const ownerID = decoded.userId;

  // Fetch shops owned by the current user
  const fetchMyShops = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/shops", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter shops that belong to the logged-in owner
      const myShops = res.data.filter(shop => shop.ownerID === ownerID);
      setShops(myShops);
    } catch (err) {
      console.error("Error fetching shops:", err);
    }
  };

  // Fetch bookings for the owner's shops
  const fetchBookings = async () => {
    try {
      if (shops.length === 0) return; // Ensure shops are loaded first

      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Convert shop IDs to string for comparison
      const shopIds = shops.map(shop => shop._id.toString());

      // Filter bookings that belong to the owner's shops
      const ownerBookings = res.data.filter(booking =>
        shopIds.includes(String(booking.shopID._id))
      );

      setBookings(ownerBookings);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  // Initial fetch of shops
  useEffect(() => {
    fetchMyShops();
  }, []);

  // Fetch bookings only when viewing "bookings" tab and shops are loaded
  useEffect(() => {
    if (view === "bookings" && shops.length > 0) {
      fetchBookings();
    }
  }, [view, shops]);

  // Handle inline form edits
  const handleInputChange = (shopIndex, field, value) => {
    const updatedShops = [...shops];
    updatedShops[shopIndex][field] = value;
    setShops(updatedShops);
  };

  // Add or remove a service from the list
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

  // Update the price for a selected service
  const updateServicePrice = (shopIndex, serviceName, price) => {
    const updatedShops = [...shops];
    const shop = updatedShops[shopIndex];
    shop.serviceOffered = shop.serviceOffered.map(s =>
      s.name === serviceName ? { ...s, price } : s
    );
    setShops(updatedShops);
  };

  // Save updated shop info to the backend
  const updateShop = async (shopId, shopData) => {
    try {
      await axios.put(`http://localhost:5000/api/shops/${shopId}`, shopData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Shop updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      setMessage("Failed to update shop.");
    }
  };

  // Cancel a booking and update its status locally
  const cancelBooking = async (bookingId) => {
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status: "canceled" } : b)
      );
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  // Count how many times each service was booked
  const serviceBookingCounts = bookings.reduce((acc, booking) => {
    acc[booking.service] = (acc[booking.service] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <h2>Owner Dashboard</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {/* Tab Controls */}
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

      {/* === SHOP MANAGEMENT === */}
      {view === "shops" && (
        <>
          {shops.map((shop, idx) => (
            <div key={shop._id} className="card p-3 mb-4">
              <label>Name:</label>
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
                className="btn btn-primary mt-3"
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

      {/* === BOOKING MANAGEMENT === */}
      {view === "bookings" && (
        <>
          <h3>Shop Bookings</h3>

          {/* Summary of services booked */}
          <ul className="list-group mb-4">
            {Object.entries(serviceBookingCounts).map(([service, count]) => (
              <li key={service} className="list-group-item d-flex justify-content-between">
                <span>{service}</span>
                <span className="badge bg-primary">{count} bookings</span>
              </li>
            ))}
          </ul>

          {/* List of individual bookings */}
          {bookings.map((booking) => (
            <div key={booking._id} className="card mb-3 p-3">
              <p><strong>Shop:</strong> {booking.shopID.name}</p>
              <p><strong>Service:</strong> {booking.service}</p>
              <p><strong>Date:</strong> {new Date(booking.dateTime).toLocaleString()}</p>
              <p><strong>Status:</strong> {booking.status}</p>
              <p><strong>Customer:</strong> {booking.userID.firstName} {booking.userID.lastName} ({booking.userID.email})</p>

              {booking.status !== "canceled" && (
                <button
                  className="btn btn-danger"
                  onClick={() => cancelBooking(booking._id)}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default OwnerDashboard;
