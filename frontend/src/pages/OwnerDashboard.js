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
  const [bookings, setBookings] = useState([]);

  const token = localStorage.getItem("token");
  const decoded = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const ownerID = decoded.userId;

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
      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shopIds = shops.map(shop => shop._id);
      const myBookings = res.data.filter(booking =>
        shopIds.includes(booking.shopID._id)
      );
      setBookings(myBookings);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  useEffect(() => {
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

  useEffect(() => {
    if (view === "bookings" && shops.length > 0) {
      fetchBookings();
    }
  }, [view, shops]);

  // Handle inline shop updates
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
      setMessage(" Shop updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      setMessage(" Failed to update shop.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Owner Dashboard</h2>
      {message && <div className="alert alert-info">{message}</div>}

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
  );
}

export default OwnerDashboard;
