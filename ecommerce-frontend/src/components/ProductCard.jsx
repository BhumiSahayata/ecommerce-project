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
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error("Please login"); return; }
    if (isOutOfStock) { toast.error("Out of stock!"); return; }
    setAdding(true);
    try {
      await API.post(`/cart/add?productId=${product.id}`);
      toast.success("Added to cart!");
    } catch { toast.error("Failed"); }
    finally { setAdding(false); }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error("Please login"); return; }
    setWishlisting(true);
    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/remove?productId=${product.id}`);
        toast.success("Removed");
      } else {
        await API.post(`/wishlist/add?productId=${product.id}`);
        toast.success("Saved");
      }
      onWishlistChange?.();
    } catch { toast.error("Failed"); }
    finally { setWishlisting(false); }
  };

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="card flex flex-col h-full">
        <div className="relative aspect-square bg-surface overflow-hidden">
          {imageUrl ? (
            // Add lazy loading to images
<img 
  src={imageUrl} 
  alt={product.name} 
  loading="lazy"  // ✅ Add this
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
/>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
              </svg>
            </div>
          )}
          {product.category && (
            <span className="absolute top-1.5 left-1.5 text-[9px] font-medium bg-white/80 px-1.5 py-0.5 rounded-full">{product.category}</span>
          )}
          {user?.role === "USER" && (
            <button onClick={toggleWishlist} disabled={wishlisting} className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow ${isWishlisted ? "bg-red-500 text-white" : "bg-white text-muted"}`}>
              <svg className="w-3.5 h-3.5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-2 flex flex-col flex-1">
          <h3 className="font-semibold text-primary text-xs line-clamp-1">{product.name}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-sm">₹{product.price?.toLocaleString()}</span>
            <button onClick={addToCart} disabled={adding || isOutOfStock} className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${isOutOfStock ? "bg-stone-300" : "bg-brand-500 text-white"}`}>
              {adding ? "..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}