import React, { useState } from 'react';
import axios from 'axios';

function ReviewForm({ shopId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      return setMessage("You must be logged in to leave a review.");
    }

    const decoded = JSON.parse(atob(token.split(".")[1]));
    const userId = decoded.userId;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        { userId, shopId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
      setMessage(" Review submitted successfully!");
      setRating(0);
      setComment("");
    
     
      onReviewSubmitted?.(); 
    } catch (err) {
      console.error("Review submission failed:", err.response?.data || err.message);
      setMessage(" Failed to submit review.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="mb-2">
        <label className="form-label">Rating (1 to 5):</label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="form-control"
          required
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Comment (optional):</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="form-control"
          placeholder="Write your feedback here..."
        />
      </div>

      <button className="btn btn-primary">Submit Review</button>
      {message && <div className="mt-2 alert alert-info">{message}</div>}
    </form>
  );
}

export default ReviewForm;
