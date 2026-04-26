import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function ProductCard({ product, wishlistIds = [], onWishlistChange }) {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);
  const isWishlisted = wishlistIds.includes(product?.id);
  const imageUrl = product.imageUrl ? `http://localhost:8080${product.imageUrl}` : null;
  const isLowStock = product.stockQuantity <= 5 && product.stockQuantity > 0;
  const isOutOfStock = product.stockQuantity === 0;

  const addToCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error("Please login to add to cart"); return; }
    if (isOutOfStock) { toast.error("This product is out of stock!"); return; }
    setAdding(true);
    try {
      await API.post(`/cart/add?productId=${product.id}`);
      toast.success(`Added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add to cart");
    } finally { setAdding(false); }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error("Please login to use wishlist"); return; }
    setWishlisting(true);
    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/remove?productId=${product.id}`);
        toast.success("Removed from wishlist");
      } else {
        await API.post(`/wishlist/add?productId=${product.id}`);
        toast.success("Saved to wishlist ♡");
      }
      onWishlistChange?.();
    } catch { toast.error("Failed to update wishlist"); }
    finally { setWishlisting(false); }
  };

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div
        className="rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-square" style={{ background: 'var(--bg-raised)' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name || "product"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex', color: 'var(--text-muted)' }}>
            <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Category badge */}
          {product.category && (
            <span
              className="absolute top-2.5 left-2.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)', color: 'var(--text-secondary)' }}
            >
              {product.category}
            </span>
          )}

          {/* Wishlist */}
          {user?.role === "USER" && (
            <button
              onClick={toggleWishlist}
              disabled={wishlisting}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center shadow transition-all z-10"
              style={{
                background: isWishlisted ? '#ef4444' : 'var(--bg-overlay)',
                backdropFilter: 'blur(8px)',
                color: isWishlisted ? '#fff' : 'var(--text-muted)',
              }}
            >
              <svg className="w-3.5 h-3.5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3
            className="font-display font-semibold text-sm leading-tight mb-1 line-clamp-2 transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{product.description}</p>
          )}

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? "text-amber-400" : ""}`}
                  style={{ color: s <= Math.round(product.rating) ? '#fbbf24' : 'var(--border-default)' }}
                  fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-[11px] ml-0.5" style={{ color: 'var(--text-muted)' }}>({product.rating.toFixed(1)})</span>
            </div>
          )}

          {!isOutOfStock && isLowStock && (
            <p className="text-xs font-medium mb-2 animate-pulse" style={{ color: '#f97316' }}>
              ⚡ Only {product.stockQuantity} left!
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              ₹{product?.price?.toLocaleString() || 0}
            </span>
            <button
              onClick={addToCart}
              disabled={adding || isOutOfStock}
              className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
              style={{
                background: isOutOfStock ? 'var(--text-muted)' : 'var(--brand)',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                boxShadow: isOutOfStock ? 'none' : '0 2px 8px var(--brand-glow)',
              }}
            >
              {adding ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
              {isOutOfStock ? "Sold out" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}