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
  const [message, setMessage] = useState("");
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchMyShops = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const ownerID = decoded.userId;

        const res = await axios.get("http://localhost:5000/api/shops", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter shops that belong to the logged-in owner
        const myShops = res.data.filter(shop => shop.ownerID === ownerID);
        setShops(myShops);

        console.log("Shops:", myShops); // Debugging log
      } catch (err) {
        console.error("Error fetching shops:", err);
      }
    };

    fetchMyShops();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (shops.length === 0) return; // Ensure shops are loaded first

        const token = localStorage.getItem("token");
        const resBookings = await axios.get("http://localhost:5000/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("All bookings:", resBookings.data); // Debugging log

        // Convert shop IDs to string for comparison
        const shopIds = shops.map(shop => shop._id.toString());
        console.log("Owner's shop IDs:", shopIds); // Debugging log

        const ownerBookings = resBookings.data.filter(b => {
          console.log("Booking Shop ID:", b.shopID, "Type:", typeof b.shopID);
          console.log("Shop ID Array:", shopIds, "Type of first ID:", typeof shopIds[0]);
          return shopIds.includes(String(b.shopID._id)) // Convert shopID to string

        });

        console.log("Filtered bookings:", ownerBookings); // Debugging log
        setBookings(ownerBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, [shops]); // Runs whenever `shops` updates

  // Handle inline form edits
  const handleInputChange = (shopIndex, field, value) => {
    const updatedShops = [...shops];
    updatedShops[shopIndex][field] = value;
    setShops(updatedShops);
  };

  // Handle checkbox toggle
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

  // Handle price update
  const updateServicePrice = (shopIndex, serviceName, price) => {
    const updatedShops = [...shops];
    const shop = updatedShops[shopIndex];
    shop.serviceOffered = shop.serviceOffered.map(s =>
      s.name === serviceName ? { ...s, price } : s
    );
    setShops(updatedShops);
  };

  // Submit shop updates
  const updateShop = async (shopId, shopData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/shops/${shopId}`, shopData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(" Shop updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      setMessage(" Failed to update shop.");
    }
  };

  // Count how many times each service was booked
  const serviceBookingCounts = bookings.reduce((acc, booking) => {
    acc[booking.service] = (acc[booking.service] || 0) + 1;
    return acc;
  }, {});

  const [selectedBooking, setSelectedBooking] = useState(null);
  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
  };


  return (
    <div className="container mt-4">
      <h2>My Shops</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <div className="d-flex justify-content-between">
        {/* Shops Section */}
        <div className="shops-section" style={{ flex: 1, marginRight: '20px' }}>
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
        </div>

        {/* Bookings Section */}
        <div className="bookings-section" style={{ flex: 1 }}>
          {/* Bookings Overview (Moved Below Booking Details) */}
          <h3>Bookings Overview</h3>
          {bookings.length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            <ul className="list-group">
              {Object.entries(serviceBookingCounts).map(([service, count]) => (
                <li key={service} className="list-group-item d-flex justify-content-between">
                  <span>{service}</span>
                  <span className="badge bg-primary">{count} bookings</span>
                </li>
              ))}
            </ul>
          )}

          {/* List all bookings */}
          {bookings.length > 0 && (
            <ul className="list-group mt-4">
              <h3>Booking Details</h3>
              {bookings.map((booking) => (
                <li
                  key={booking._id}
                  className="list-group-item d-flex justify-content-between"
                  onClick={() => handleBookingClick(booking)} // Click to see details
                  style={{ cursor: "pointer" }}
                >
                  <span>{booking.service}</span>
                  <span className="badge bg-primary">{booking.dateTime}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Display booking details if a booking is selected */}
          {selectedBooking && (
            <div className="booking-details mt-4">
              <h5>Booking Details</h5>
              <p><strong>Service:</strong> {selectedBooking.service}</p>
              <p><strong>Date and Time:</strong> {new Date(selectedBooking.dateTime).toLocaleString()}</p>
              <p><strong>Customer Name:</strong> {selectedBooking.userID.firstName} {selectedBooking.userID.lastName}</p>
              <p><strong>Customer email:</strong> {selectedBooking.userID.email}</p>


              <button onClick={() => setSelectedBooking(null)} className="btn btn-secondary mt-2">
                Close Details
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
