import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function BookingPage() {
  const { shopId } = useParams(); // ⬅️ Get shop ID from URL
  const [shop, setShop] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ⬇️ Fetch the shop's details on page load
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/shops/${shopId}`);
        setShop(res.data);
      } catch (err) {
        console.error("Error fetching shop:", err);
        setMessage("❌ Failed to load shop.");
      }
    };

    fetchShop();
  }, [shopId]);

  // ⬇️ Booking submission handler
  const handleBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("❌ Please login to book.");
      return;
    }

    const decoded = JSON.parse(atob(token.split('.')[1]));
    const customerId = decoded.userId;

    const combinedDateTime = new Date(`${date}T${time}`);

    const payload = {
      userID: customerId,             
      shopID: shopId,                
      service: selectedService,
      dateTime: combinedDateTime,     
    };

    try {
      await axios.post("http://localhost:5000/api/bookings", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("✅ Booking successful!");
      setTimeout(() => navigate("/dashboard/customer"), 1500);
    } catch (err) {
      console.error("Booking error:", err);
      setMessage("❌ Booking failed.");
    }
  };

  if (!shop) return <p>Loading shop details...</p>;

  return (
    <div className="container mt-5">
      <h2>Book Appointment - {shop.name}</h2>
      <p><strong>Location:</strong> {shop.location}</p>

      {/* Optional image */}
      {shop.image && (
        <img
          src={shop.image}
          alt={shop.name}
          style={{ width: "300px", height: "180px", objectFit: "cover" }}
          className="my-3"
        />
      )}

      <form onSubmit={handleBooking}>
        {/* Select Service */}
        <div className="mb-3">
          <label>Select Service</label>
          <select
            className="form-control"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
          >
            <option value="">-- Select a service --</option>
            {shop.serviceOffered.map((service, idx) => (
              <option key={idx} value={service.name}>
                {service.name} - ${service.price}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="mb-3">
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Time */}
        <div className="mb-3">
          <label>Time</label>
          <input
            type="time"
            className="form-control"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button className="btn btn-success">Confirm Booking</button>
      </form>

      {/* Feedback message */}
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}

export default BookingPage;
