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
      } catch (err) {
        console.error("Error fetching shops:", err);
      }
    };

    fetchMyShops();
  }, []);

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

  return (
    <div className="container mt-4">
      <h2>My Shops</h2>
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
