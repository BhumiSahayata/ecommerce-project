import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import Reviews from "../components/Reviews";
import { BACKEND_URL } from "../constants";
import { getImageUrl } from "../utils/imageUtils";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Black");

  const sizes = ["XS", "S", "M", "L", "XL"];
  const colors = [
    { name: "Black", code: "#000000" },
    { name: "White", code: "#FFFFFF" },
    { name: "Red", code: "#FF0000" },
    { name: "Blue", code: "#0000FF" },
  ];

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      
     if (res.data.imageUrl) {
  res.data.imageUrl = getImageUrl(res.data.imageUrl);
}
      setProduct(res.data);
    } catch (err) {
      console.error("Error fetching product:", err);
      toast.error("Product not found");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error("Please login to add to cart");
      navigate("/login");
      return;
    }
    
    if (product.stockQuantity < quantity) {
      toast.error(`Only ${product.stockQuantity} items left in stock!`);
      return;
    }
    
    setAdding(true);
    try {
      await API.post(`/cart/add?productId=${product.id}&quantity=${quantity}`);
      toast.success(`${quantity} × ${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const buyNow = async () => {
    await addToCart();
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const imageUrl = product.imageUrl;
  const isLowStock = product.stockQuantity <= 5 && product.stockQuantity > 0;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
        <Link to="/" className="hover:text-brand-500">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-500">Products</Link>
        <span>/</span>
        <span className="text-stone-800">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="bg-stone-100 rounded-2xl overflow-hidden sticky top-24">
          {imageUrl ? (
            <img 
              src={product.imageUrl || `${BACKEND_URL}/placeholder.png`}
              alt={product.name} 
              className="w-full h-auto object-cover"
              onError={(e) => {

                e.target.src = "https://via.placeholder.com/500?text=No+Image";
              }}
            />
          ) : (
            <div className="aspect-square flex items-center justify-center">
              <svg className="w-32 h-32 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-brand-100 text-brand-700 px-3 py-1 rounded-full">
              {product.category || "General"}
            </span>
            {product.rating > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <span className="text-amber-500">⭐</span>
                <span>{product.rating.toFixed(1)}</span>
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900 mb-4">
            {product.name}
          </h1>

          <div className="mb-6">
            <span className="font-display text-3xl font-bold text-brand-600">
              ₹{product.price.toLocaleString()}
            </span>
          </div>

          <div className="mb-4">
            {isOutOfStock ? (
              <span className="text-red-600 text-sm font-medium">❌ Out of Stock</span>
            ) : isLowStock ? (
              <span className="text-orange-600 text-sm font-medium animate-pulse">
                ⚡ Only {product.stockQuantity} left in stock! Order soon.
              </span>
            ) : (
              <span className="text-green-600 text-sm font-medium">✅ In Stock</span>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-stone-800 mb-2">Description</h3>
            <p className="text-stone-600 leading-relaxed">
              {product.description || "This product is of premium quality. Made with care and attention to detail. Perfect for everyday use."}
            </p>
          </div>

          {product.category === "Fashion" && (
            <div className="mb-6">
              <h3 className="font-semibold text-stone-800 mb-3">Select Size</h3>
              <div className="flex gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                      selectedSize === size 
                        ? "border-brand-500 bg-brand-500 text-white" 
                        : "border-stone-200 hover:border-brand-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold text-stone-800 mb-3">Select Color</h3>
            <div className="flex gap-3">
              {colors.map(color => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color.name ? "ring-2 ring-brand-500 ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: color.code }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center border border-stone-200 rounded-full">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-l-full hover:bg-stone-100 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="w-10 h-10 rounded-r-full hover:bg-stone-100 flex items-center justify-center"
                disabled={quantity >= product.stockQuantity}
              >
                +
              </button>
            </div>
            
            <button
              onClick={addToCart}
              disabled={adding || isOutOfStock}
              className={`flex-1 py-3 rounded-full font-semibold transition-all ${
                isOutOfStock 
                  ? "bg-stone-300 cursor-not-allowed" 
                  : "bg-brand-500 hover:bg-brand-600 text-white"
              }`}
            >
              {adding ? "Adding..." : "Add to Cart 🛒"}
            </button>
            
            <button
              onClick={buyNow}
              disabled={isOutOfStock}
              className={`flex-1 py-3 rounded-full font-semibold transition-all border-2 ${
                isOutOfStock 
                  ? "border-stone-300 text-stone-300 cursor-not-allowed" 
                  : "border-brand-500 text-brand-600 hover:bg-brand-50"
              }`}
            >
              Buy Now
            </button>
          </div>

          <div className="border-t border-stone-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-green-600">🚚</span>
              <span className="text-stone-600">Free delivery on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-blue-600">🔄</span>
              <span className="text-stone-600">7 days easy returns</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-purple-600">💳</span>
              <span className="text-stone-600">Cash on Delivery available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Reviews productId={product.id} />
      </div>
    </div>
  );
}