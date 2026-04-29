import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { getImageUrl } from "../utils/imageUtils";

const banners = [
  { text: "🎉 FREE DELIVERY on orders above ₹999", color: "from-brand-600 to-violet-600" },
  { text: "🌟 New customers get ₹250 OFF • Code: WELCOME250", color: "from-violet-600 to-blue-600" },
  { text: "🚚 Cash on Delivery available across India", color: "from-fuchsia-600 to-brand-600" },
];

const features = [
  { icon: "🚚", title: "Free Delivery", desc: "Orders above ₹999", color: "bg-violet-50" },
  { icon: "🔒", title: "Secure", desc: "100% safe", color: "bg-green-50" },
  { icon: "🔄", title: "Easy Returns", desc: "7 days", color: "bg-amber-50" },
  { icon: "📦", title: "Fast Dispatch", desc: "24hrs", color: "bg-blue-50" },
  { icon: "🎁", title: "Gift Ready", desc: "Free wrapping", color: "bg-rose-50" },
  { icon: "📞", title: "24/7 Support", desc: "Always here", color: "bg-brand-50" },
];

const categories = [
  { name: "Electronics", icon: "📱", bg: "bg-blue-50" },
  { name: "Fashion", icon: "👗", bg: "bg-pink-50" },
  { name: "Home & Living", icon: "🏡", bg: "bg-emerald-50" },
  { name: "Beauty", icon: "✨", bg: "bg-purple-50" },
  { name: "Sports", icon: "⚽", bg: "bg-orange-50" },
  { name: "Books", icon: "📚", bg: "bg-indigo-50" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    API.get("/products/all")
      .then((res) => setProducts(res.data.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      setBannerIdx((i) => (i + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-page">
      {/* Promo Banner */}
      <div className={`bg-gradient-to-r ${banners[bannerIdx].color} py-2.5 text-white text-center text-xs md:text-sm font-medium`}>
        {banners[bannerIdx].text}
      </div>

      {/* Hero Section */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center md:text-left">
              <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-3 md:mb-4">
                Shop <span className="text-brand-500">Smarter.</span> Live Better.
              </h1>
              <p className="text-secondary text-sm md:text-base mb-4 md:mb-5 max-w-lg mx-auto md:mx-0">
                Discover thousands of products from verified sellers. Free delivery & secure payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/products" className="btn-brand px-5 md:px-6 py-2.5 text-sm md:text-base">Shop Now 🛍️</Link>
                <Link to="/register" className="btn-outline px-5 md:px-6 py-2.5 text-sm md:text-base">Become a Seller 🏪</Link>
              </div>
              <div className="mt-4 md:mt-5 flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
                {["✅ Verified", "🔒 Secure", "🔄 Returns", "🚚 Fast"].map(b => (
                  <span key={b} className="text-[11px] md:text-xs text-secondary">{b}</span>
                ))}
              </div>
            </div>

            {/* Right Stats */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {[
                { value: "10K+", label: "Customers", icon: "😊" },
                { value: "500+", label: "Sellers", icon: "🏪" },
                { value: "4.8★", label: "Rating", icon: "⭐" },
                { value: "24hr", label: "Delivery", icon: "🚀" },
              ].map((s) => (
                <div key={s.label} className="card p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl mb-0.5">{s.icon}</div>
                  <div className="font-display font-bold text-primary text-sm md:text-base">{s.value}</div>
                  <div className="text-[9px] md:text-[10px] text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-6 md:py-8 bg-surface">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {features.map((f) => (
              <div key={f.title} className={`${f.color} rounded-xl p-2 md:p-3 text-center`}>
                <div className="text-lg md:text-xl mb-0.5">{f.icon}</div>
                <div className="text-[9px] md:text-[10px] font-semibold">{f.title}</div>
                <div className="text-[8px] md:text-[9px] text-muted">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-10">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5 md:mb-6">
            <span className="badge badge-brand text-[10px] md:text-xs">Categories</span>
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-black text-primary mt-1">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {categories.map((cat) => (
              <Link key={cat.name} to={`/products?category=${cat.name}`} className={`${cat.bg} rounded-xl p-2 md:p-3 text-center hover:scale-105 transition-transform`}>
                <div className="text-xl md:text-2xl">{cat.icon}</div>
                <div className="text-[9px] md:text-[10px] font-medium mt-0.5">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-10 bg-surface">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <div>
              <span className="badge badge-brand text-[10px] md:text-xs">Handpicked</span>
              <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-black text-primary mt-1">Featured Products</h2>
            </div>
            <Link to="/products" className="text-xs md:text-sm text-brand-600 hover:text-brand-700">View all →</Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {[1,2,3,4].map(i => <div key={i} className="card h-40 md:h-48 animate-pulse bg-stone-200"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="card group">
                  <div className="aspect-square bg-surface overflow-hidden">
                    {/* ✅ FIXED: Using getImageUrl here */}
                    <img 
                      src={getImageUrl(product.imageUrl) || "/placeholder.png"} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <div className="p-2 md:p-3">
                    <h3 className="text-xs md:text-sm font-semibold truncate">{product.name}</h3>
                    <p className="font-bold text-sm md:text-base mt-0.5 md:mt-1">₹{product.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}