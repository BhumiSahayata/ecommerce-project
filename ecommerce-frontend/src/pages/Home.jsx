import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const banners = [
  { text: "🎉 FREE DELIVERY on all orders above ₹999 — Limited time offer!", color: "from-brand-600 to-violet-600" },
  { text: "🌟 New customers get flat ₹250 OFF on orders above ₹1499 · Use: WELCOME250", color: "from-violet-600 to-blue-600" },
  { text: "🚚 Cash on Delivery available across 20,000+ pincodes in India", color: "from-fuchsia-600 to-brand-600" },
  { text: "⭐ 10% OFF on your first order — Code: SHOPEASE10", color: "from-blue-600 to-brand-500" },
];

const features = [
  { icon: "🚚", title: "Free Delivery", desc: "Orders above ₹999", color: "bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/30" },
  { icon: "🔒", title: "Secure Payments", desc: "100% safe checkout", color: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30" },
  { icon: "🔄", title: "Easy Returns", desc: "7 days return policy", color: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30" },
  { icon: "📦", title: "Fast Dispatch", desc: "Ships within 24hrs", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30" },
  { icon: "🎁", title: "Gift Wrapping", desc: "Available on all orders", color: "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30" },
  { icon: "📞", title: "24/7 Support", desc: "Always here for you", color: "bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-800/30" },
];

const categories = [
  { name: "Electronics", icon: "📱", gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-blue-100 dark:border-blue-800/30" },
  { name: "Fashion", icon: "👗", gradient: "from-pink-500 to-rose-500", bg: "bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40 border-pink-100 dark:border-pink-800/30" },
  { name: "Home & Living", icon: "🏡", gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-100 dark:border-emerald-800/30" },
  { name: "Beauty", icon: "✨", gradient: "from-purple-500 to-brand-500", bg: "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 border-purple-100 dark:border-purple-800/30" },
  { name: "Sports", icon: "⚽", gradient: "from-orange-500 to-amber-500", bg: "bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 border-orange-100 dark:border-orange-800/30" },
  { name: "Books", icon: "📚", gradient: "from-indigo-500 to-violet-500", bg: "bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-indigo-100 dark:border-indigo-800/30" },
];

const stats = [
  { value: "10K+", label: "Happy Customers", icon: "😊" },
  { value: "500+", label: "Verified Sellers", icon: "🏪" },
  { value: "4.8★", label: "Average Rating", icon: "⭐" },
  { value: "24hr", label: "Fast Delivery", icon: "🚀" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [fadeBanner, setFadeBanner] = useState(true);

  useEffect(() => {
    API.get("/products/all")
      .then((res) => setProducts(res.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      setFadeBanner(false);
      setTimeout(() => {
        setBannerIdx((i) => (i + 1) % banners.length);
        setFadeBanner(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-page">
      {/* ─── Promo Banner ──────────────────────────────── */}
      <div className={`bg-gradient-to-r ${banners[bannerIdx].color} py-2.5 text-white text-center text-sm font-medium tracking-wide transition-opacity duration-300 ${fadeBanner ? "opacity-100" : "opacity-0"}`}>
        {banners[bannerIdx].text}
      </div>

      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--bg)] py-16 lg:py-24">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="glow-orb w-[600px] h-[600px] -top-40 -right-40 bg-brand-500/10 dark:bg-brand-500/15" />
          <div className="glow-orb w-[400px] h-[400px] bottom-0 -left-20 bg-violet-500/8 dark:bg-violet-500/12" />
          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025] dark:opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-brand-200 dark:border-brand-800/50 bg-brand-50 dark:bg-brand-900/20">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-brand-500 opacity-75"/>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"/>
                </span>
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300">India's #1 Online Marketplace</span>
              </div>

              <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-black text-primary leading-[1.05] mb-6">
                Shop{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">Smarter.</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6C50 2 150 2 198 6" stroke="url(#u1)" strokeWidth="3" strokeLinecap="round"/>
                    <defs><linearGradient id="u1" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#c044e8"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
                  </svg>
                </span>
                {" "}Live{" "}
                <span className="text-primary">Better.</span>
              </h1>

              <p className="text-lg text-secondary mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Discover thousands of products from verified sellers. Free delivery, secure payments, and genuine products — always.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="btn-brand px-8 py-3.5 text-base inline-flex items-center justify-center gap-2 rounded-2xl"
                >
                  <span>Shop Now</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link
                  to="/register"
                  className="btn-outline px-8 py-3.5 text-base inline-flex items-center justify-center gap-2 rounded-2xl"
                >
                  Become a Seller 🏪
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start">
                {["✅ Verified Sellers", "🔒 Secure Payments", "🔄 Easy Returns", "🚚 Fast Delivery"].map(b => (
                  <span key={b} className="text-sm text-secondary font-medium">{b}</span>
                ))}
              </div>
            </div>

            {/* Right Stats Grid */}
            <div className="relative">
              <div className="glow-orb w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500/15 dark:bg-brand-500/20" style={{ filter: 'blur(60px)' }} />
              <div className="relative grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className="card p-6 text-center"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="text-3xl mb-2 animate-float" style={{ animationDelay: `${i * 1.5}s` }}>{s.icon}</div>
                    <div className="font-display text-2xl font-black text-primary mb-0.5">{s.value}</div>
                    <div className="text-xs text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Marquee Brands ────────────────────────────── */}
      <div className="bg-[var(--surface)] border-y border-[var(--border)] py-4 overflow-hidden">
        <div className="marquee-track">
          {[...Array(2)].map((_, ri) => (
            <div key={ri} className="flex items-center">
              {["Samsung", "Apple", "Nike", "Adidas", "Sony", "OnePlus", "Boat", "Puma", "Philips", "Prestige", "Lakme", "Mamaearth"].map((b) => (
                <span key={b + ri} className="mx-8 text-sm font-display font-bold text-muted tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity cursor-default">
                  {b}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Features Strip ────────────────────────────── */}
      <section className="py-12 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {features.map((f) => (
              <div key={f.title} className={`flex flex-col items-center text-center p-4 rounded-2xl border ${f.color} transition-all hover:-translate-y-0.5`}>
                <span className="text-2xl mb-2">{f.icon}</span>
                <span className="text-xs font-display font-bold text-primary mb-0.5">{f.title}</span>
                <span className="text-[11px] text-muted">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ────────────────────────────────── */}
      <section className="py-16 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="badge badge-brand mb-3">Categories</span>
            <h2 className="font-display text-3xl lg:text-4xl font-black text-primary mt-2">
              Shop by <span className="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">Category</span>
            </h2>
            <p className="text-secondary mt-2 max-w-lg mx-auto">Find exactly what you're looking for across our wide range of curated collections.</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`group flex flex-col items-center p-5 rounded-2xl border ${cat.bg} transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
              >
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                <span className="text-xs font-display font-bold text-primary text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ──────────────────────────── */}
      <section className="py-16 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="badge badge-brand mb-3">Handpicked</span>
              <h2 className="font-display text-3xl lg:text-4xl font-black text-primary">Featured Products</h2>
              <p className="text-secondary mt-1.5">Trending picks just for you</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-display font-bold text-brand-600 dark:text-brand-400 hover:gap-3 transition-all"
            >
              View all products
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-[var(--border)]">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                    <div className="skeleton h-6 rounded w-1/3 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="card group overflow-hidden flex flex-col"
                >
                  <div className="aspect-square bg-[var(--surface)] overflow-hidden relative">
                    <img
                      src={product.imageUrl ? `http://localhost:8080${product.imageUrl}` : "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = ""; e.target.style.display = "none"; }}
                    />
                    {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                        Only {product.stockQuantity} left
                      </span>
                    )}
                    {product.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] text-muted uppercase tracking-wide mb-1">{product.category || "General"}</span>
                    <h3 className="text-sm font-semibold text-primary line-clamp-2 mb-auto group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {product.name}
                    </h3>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? "text-amber-400" : "text-[var(--border)]"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                        <span className="text-[10px] text-muted">({product.rating.toFixed(1)})</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-display font-bold text-lg text-primary">₹{product.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Why ShopEase Banner ────────────────────────── */}
      <section className="py-16 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-10 lg:p-16 text-white">
            {/* Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
            <div className="glow-orb w-64 h-64 -top-10 -right-10 bg-brand-400/30" />

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left max-w-xl">
                <span className="inline-block text-brand-200 text-sm font-bold uppercase tracking-widest mb-3">Why Choose Us</span>
                <h2 className="font-display text-3xl lg:text-4xl font-black mb-4">
                  The Smartest Way<br />to Shop in India
                </h2>
                <p className="text-white/80 text-base leading-relaxed">
                  Join over 10,000 happy customers who trust ShopEase for genuine products, lightning-fast delivery, and unbeatable prices every single day.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 min-w-[280px]">
                {[
                  { v: "10K+", l: "Orders Delivered" },
                  { v: "500+", l: "Verified Sellers" },
                  { v: "₹0", l: "Hidden Charges" },
                  { v: "24/7", l: "Customer Support" },
                ].map(({ v, l }) => (
                  <div key={l} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                    <div className="font-display text-2xl font-black">{v}</div>
                    <div className="text-xs text-white/70 mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── More Products ──────────────────────────────── */}
      {products.length > 4 && (
        <section className="py-16 bg-[var(--bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <span className="badge badge-brand mb-3">New Arrivals</span>
                <h2 className="font-display text-3xl font-black text-primary">Just In</h2>
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 text-sm font-display font-bold text-brand-600 dark:text-brand-400 hover:gap-3 transition-all">
                See all <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(4, 8).map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="card group overflow-hidden">
                  <div className="aspect-square bg-[var(--surface)] overflow-hidden">
                    <img
                      src={product.imageUrl ? `http://localhost:8080${product.imageUrl}` : "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] text-muted uppercase tracking-wide">{product.category}</span>
                    <h3 className="text-sm font-semibold text-primary line-clamp-2 mt-0.5 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{product.name}</h3>
                    <span className="font-display font-bold text-lg text-primary">₹{product.price?.toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ───────────────────────────────────────── */}
      <section className="py-16 bg-[var(--surface)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-4xl mb-4 block">🛍️</span>
          <h2 className="font-display text-3xl font-black text-primary mb-3">Ready to start shopping?</h2>
          <p className="text-secondary mb-8">Create a free account and get ₹250 off on your first order.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-brand px-8 py-3.5 text-base inline-flex items-center justify-center gap-2 rounded-2xl">
              <span>Create Free Account</span>
            </Link>
            <Link to="/products" className="btn-outline px-8 py-3.5 text-base inline-flex items-center justify-center gap-2 rounded-2xl">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}