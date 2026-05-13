import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageUtils";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/wishlist");
      setWishlist(res.data);
      
      const productMap = {};
      for (const item of res.data) {
        try {
          const p = await API.get(`/products/${item.productId}`);
          if (p.data) {
            
            if (p.data.imageUrl) {
              p.data.fullImageUrl = getImageUrl(p.data.imageUrl);
            } else {
              p.data.fullImageUrl = p.data.imageUrl;
            }
            productMap[item.productId] = p.data;
          }
        } catch (err) {
          console.error("Error fetching product:", item.productId);
        }
      }
      setProducts(productMap);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchWishlist(); 
  }, [fetchWishlist]);

  const remove = async (productId) => {
    try {
      await API.delete(`/wishlist/remove?productId=${productId}`);
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  const addToCart = async (productId) => {
    try {
      await API.post(`/cart/add?productId=${productId}`);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100">
              <div className="aspect-square bg-stone-200 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-stone-200 rounded" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-stone-900">Wishlist</h1>
        <p className="text-stone-500 mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-12 h-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-stone-700 text-xl">Your wishlist is empty</h3>
          <p className="text-stone-400 mt-2 mb-6">Save products you love for later</p>
          <button onClick={() => navigate("/products")} className="bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => {
            const product = products[item.productId];
            if (!product) return null;
            const imageUrl = product.fullImageUrl || product.imageUrl;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-brand-200 hover:shadow-md transition-all group flex flex-col">
                <Link to={`/product/${item.productId}`} className="block relative aspect-square bg-stone-100 overflow-hidden">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.parentElement) {
                          const fallback = e.target.parentElement.querySelector('.fallback-wishlist');
                          if (fallback) fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className="fallback-wishlist w-full h-full flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex' }}>
                    <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      remove(item.productId);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow text-red-400 hover:text-red-600 transition-colors z-10"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </Link>
                
                <Link to={`/product/${item.productId}`} className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-stone-900 text-sm line-clamp-2 mb-1 hover:text-brand-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                {product.category && <p className="text-xs text-stone-400 mb-2 px-4">{product.category}</p>}
                <div className="p-4 pt-0 mt-auto flex items-center justify-between">
                  <span className="font-display font-bold text-stone-900">₹{product.price?.toLocaleString()}</span>
                  <button
                    onClick={() => addToCart(item.productId)}
                    className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg hover:bg-brand-600 transition-colors font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}