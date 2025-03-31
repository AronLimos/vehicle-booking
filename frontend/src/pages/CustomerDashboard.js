import React, { useEffect, useState } from "react";
import axios from "axios";

function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const userId = decoded.userId;

    // 🔹 Fetch bookings made by the customer
    const fetchBookings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userBookings = res.data.filter((b) => b.userID._id === userId);
        setBookings(userBookings);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      }
    };

    // 🔹 Fetch only this customer's own reviews
    const fetchReviews = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reviews/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    };

    fetchBookings();
    fetchReviews();
  }, []);

  // 🔹 Cancel a booking
  const cancelBooking = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "canceled" } : b))
      );
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    }
  };

  // 🔹 Delete a review written by this user
  const deleteReview = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Customer Dashboard</h2>

      {/* Bookings */}
      <h4 className="mt-4">My Bookings</h4>
      {bookings.map((b) => (
        <div key={b._id} className="card p-3 mb-3">
          <p>
            <strong>Shop:</strong> {b.shopID?.name}
          </p>
          <p>
            <strong>Service:</strong> {b.service}
          </p>
          <p>
            <strong>Date:</strong> {new Date(b.dateTime).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong> {b.status}
          </p>
          {b.status !== "canceled" && (
            <button
              className="btn btn-danger"
              style={{ width: "auto", maxWidth: "200px", padding: "4px 8px" }}
              onClick={() => cancelBooking(b._id)}
            >
              Cancel Booking
            </button>
          )}
        </div>
      ))}

      {/* Reviews */}
      <h4 className="mt-5">My Reviews</h4>
      {reviews.length === 0 ? (
        <p>You haven't submitted any reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="card p-3 mb-3">
            <p>
              <strong>Shop:</strong> {review.shopID?.name}
            </p>
            <p>
              <strong>Rating:</strong> {review.rating} ⭐
            </p>
            <p>{review.comment}</p>
            <button
              className="btn btn-sm btn-danger"
              style={{ width: "auto", maxWidth: "100px", padding: "4px 8px" }}
              onClick={() => deleteReview(review._id)}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default CustomerDashboard;
