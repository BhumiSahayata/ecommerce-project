import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageUtils";

export default function ProductCard({ product, wishlistIds = [], onWishlistChange }) {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);
  const isWishlisted = wishlistIds.includes(product?.id);
  const imageUrl = getImageUrl(product.imageUrl);
  const isOutOfStock = product.stockQuantity === 0;

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Please login to add to cart"); return; }
    if (isOutOfStock) { toast.error("Out of stock!"); return; }
    setAdding(true);
    try {
      await API.post(`/cart/add?productId=${product.id}`);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add to cart");
    } finally { setAdding(false); }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Please login to use wishlist"); return; }
    if (!user || user.role !== "USER") return;
    setWishlisting(true);
    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/remove?productId=${product.id}`);
        toast.success("Removed from wishlist");
      } else {
        await API.post(`/wishlist/add?productId=${product.id}`);
        toast.success("Added to wishlist ♡");
      }
      onWishlistChange?.();
    } catch {
      toast.error("Failed to update wishlist");
    } finally { setWishlisting(false); }
  };

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        {/* Image */}
        <div className="relative overflow-hidden bg-stone-100 aspect-square">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name || "product"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                console.log("Image failed to load:", imageUrl);
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          
          <div className="w-full h-full flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex' }}>
            <svg className="w-16 h-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Wishlist button */}
          {user?.role === "USER" && (
            <button
              onClick={toggleWishlist}
              disabled={wishlisting}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${
                isWishlisted
                  ? "bg-red-500 text-white scale-110"
                  : "bg-white text-stone-400 hover:text-red-500 hover:scale-110"
              }`}
            >
              <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {/* Category badge */}
          {product.category && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-stone-600 text-xs font-medium px-2 py-1 rounded-full">
              {product.category}
            </span>
          )}
          
          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-display font-semibold text-stone-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-stone-400 text-xs mb-2 line-clamp-2">{product.description}</p>
          )}

          {/* Rating Stars */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? "text-amber-400" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-stone-400 ml-1">({product.rating.toFixed(1)})</span>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="font-display font-bold text-xl text-stone-900">₹{product?.price?.toLocaleString() || 0}</span>
            
            <button
              onClick={addToCart}
              disabled={adding || isOutOfStock}
              className={`flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                isOutOfStock ? "bg-stone-400 cursor-not-allowed" : "bg-brand-500 hover:bg-brand-600"
              }`}
            >
              {adding ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              )}
              {isOutOfStock ? "Out of Stock" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}