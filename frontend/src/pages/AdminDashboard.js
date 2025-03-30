import React, { useEffect, useState } from "react";
import axios from "axios";

const SERVICE_OPTIONS = [
  "Oil Change", "Tire Replacement", "Engine Tune-Up", "Battery Replacement",
  "Brake Inspection", "Transmission Repair", "Wheel Alignment", "AC Repair",
  "Windshield Replacement", "Exhaust System Repair", "Suspension Check",
  "Radiator Flush", "Timing Belt Replacement", "Headlight/Taillight Replacement"
];

function AdminDashboard() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    services: [],
    image: "",
    ownerID: ""
  });
  const [users, setUsers] = useState([]); // List of potential owners
  const [shops, setShops] = useState([]); // Existing shops
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("create");

  // Fetch owners and shops on load
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.filter(u => u.role === "owner"));
    };

    const fetchShops = async () => {
      const res = await axios.get("http://localhost:5000/api/shops");
      setShops(res.data);
    };

    const fetchReviews = async () => {
      const res = await axios.get("http://localhost:5000/api/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    };

    fetchUsers();
    fetchShops();
    fetchReviews();
  }, []);

  const handleServiceChange = (service) => {
    const exists = formData.services.find(s => s.name === service);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(s => s.name !== service)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, { name: service, price: "" }]
      }));
    }
  };

  const handlePriceChange = (service, price) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => s.name === service ? { ...s, price } : s)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post("http://localhost:5000/api/shops", {
        name: formData.name,
        location: formData.location,
        serviceOffered: formData.services,
        ownerID: formData.ownerID,
        image: formData.image,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Shop created successfully!");
      setFormData({ name: '', location: '', services: [], image: '', ownerID: '' });
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to create shop.");
    }
  };

  const handleUpdateShopOwner = async (shopId, newOwnerId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`http://localhost:5000/api/shops/${shopId}`, {
        ownerID: newOwnerId,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShops(prev => prev.map(s => s._id === shopId ? { ...s, ownerID: newOwnerId } : s));
    } catch (err) {
      console.error("Error updating shop owner:", err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>

      {/* Dashboard Tabs */}
      <div className="btn-group mt-3">
        <button className="btn btn-outline-primary" onClick={() => setActiveTab("create")}>Create Shop</button>
        <button className="btn btn-outline-primary" onClick={() => setActiveTab("edit")}>View/Edit Shops</button>
        <button className="btn btn-outline-primary" onClick={() => setActiveTab("reviews")}>Customer Reviews</button>
      </div>

      {activeTab === "create" && (
        <div className="mt-4">
          <h4>Create New Shop</h4>
          {message && <div className="alert alert-info">{message}</div>}
          <form onSubmit={handleCreateShop}>
            <input name="name" className="form-control mb-2" placeholder="Shop Name" value={formData.name} onChange={handleInputChange} required />
            <input name="location" className="form-control mb-2" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
            <input name="image" className="form-control mb-2" placeholder="Image URL" value={formData.image} onChange={handleInputChange} />
            <select name="ownerID" className="form-select mb-3" value={formData.ownerID} onChange={handleInputChange} required>
              <option value="">-- Select Owner --</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.email}</option>
              ))}
            </select>

            <h5>Services Offered</h5>
            {SERVICE_OPTIONS.map(service => {
              const selected = formData.services.find(s => s.name === service);
              return (
                <div key={service} className="mb-2">
                  <label>
                    <input type="checkbox" checked={!!selected} onChange={() => handleServiceChange(service)} className="me-2" />
                    {service}
                  </label>
                  {selected && (
                    <input type="number" className="form-control mt-1" value={selected.price} onChange={(e) => handlePriceChange(service, e.target.value)} placeholder="Price" required />
                  )}
                </div>
              );
            })}
            <button className="btn btn-primary">Create Shop</button>
          </form>
        </div>
      )}

      {activeTab === "edit" && (
        <div className="mt-4">
          <h4>View & Edit Shops</h4>
          {shops.map((shop) => (
            <div key={shop._id} className="card mb-3 p-3">
              <h5>{shop.name}</h5>
              <p><strong>Location:</strong> {shop.location}</p>
              <p><strong>Owner:</strong>
                <select
                  value={shop.ownerID || ""}
                  onChange={(e) => handleUpdateShopOwner(shop._id, e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Select Owner --</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.email}</option>
                  ))}
                </select>
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="mt-4">
          <h4>All Customer Reviews</h4>
          {reviews.length === 0 ? <p>No reviews found.</p> : (
            reviews.map(review => (
              <div key={review._id} className="card p-3 mb-2">
                <p><strong>Shop:</strong> {review.shopID?.name}</p>
                <p><strong>User:</strong> {review.userID?.email}</p>
                <p><strong>Rating:</strong> {review.rating} ⭐</p>
                <p>{review.comment}</p>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteReview(review._id)}>Delete Review</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
