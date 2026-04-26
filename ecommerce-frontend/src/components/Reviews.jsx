import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Reviews({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/product/${productId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!newReview.comment.trim()) {
      toast.error("Please write a review");
      return;
    }
    
    if (!user) {
      toast.error("Please login to write a review");
      return;
    }
    
    setSubmitting(true);
    try {
      await API.post("/reviews", {
        productId: productId,
        rating: newReview.rating,
        comment: newReview.comment
      });
      toast.success("Review added successfully!");
      setNewReview({ rating: 5, comment: "" });
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      console.error("Error adding review:", err);
      toast.error(err.response?.data?.error || "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t border-stone-100">
        <div className="animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-stone-100 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-stone-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-stone-800 text-sm">
          Reviews ({reviews.length})
        </h4>
        {user?.role === "USER" && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-brand-500 hover:text-brand-600 font-medium"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Average Rating */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <span className="font-bold text-stone-800">{averageRating}</span>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <svg key={s} className={`w-3 h-3 ${s <= Math.round(averageRating) ? "text-amber-400" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-stone-400">({reviews.length} reviews)</span>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-4 p-3 bg-stone-50 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-stone-700">Rating:</span>
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setNewReview({ ...newReview, rating: s })}
                className="text-xl focus:outline-none"
              >
                {s <= newReview.rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            placeholder="Share your experience with this product..."
            rows="2"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={submitReview}
              disabled={submitting}
              className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border border-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="border-b border-stone-100 pb-2 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-brand-600 font-bold text-xs">
                      {review.userName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="font-medium text-stone-800 text-xs">{review.userName || "User"}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? "text-amber-400" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-stone-600 text-xs leading-relaxed">{review.comment}</p>
              <p className="text-stone-400 text-[10px] mt-1">{formatDate(review.createdAt)}</p>
            </div>
          ))}
          {reviews.length > 3 && (
            <button className="text-xs text-brand-500 hover:text-brand-600 font-medium mt-1">
              View all {reviews.length} reviews
            </button>
          )}
        </div>
      )}
    </div>
  );
}