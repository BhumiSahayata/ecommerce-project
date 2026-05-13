import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { getImageUrl } from "../utils/imageUtils";

/* ── Rotating promo banners ── */
const BANNERS = [
  { text: "🎉 FREE DELIVERY on all orders above ₹999 — today only!", grad: "from-violet-600 to-brand-600" },
  { text: "🌟 New here? Get ₹250 OFF your first order · Code: WELCOME250", grad: "from-fuchsia-600 to-violet-600" },
  { text: "🚚 Cash on Delivery available across 20,000+ pincodes in India", grad: "from-brand-600 to-blue-600" },
  { text: "⭐ Use code SHOPEASE10 for 10% off sitewide", grad: "from-blue-600 to-brand-500" },
];

/* ── Category data ── */
const CATS = [
  { name: "Electronics",   icon: "📱", light: "#eff6ff", dark: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.25)"  },
  { name: "Fashion",       icon: "👗", light: "#fdf2f8", dark: "rgba(236,72,153,0.15)",  border: "rgba(236,72,153,0.25)"  },
  { name: "Home & Living", icon: "🏡", light: "#f0fdf4", dark: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.25)"  },
  { name: "Beauty",        icon: "✨", light: "#faf5ff", dark: "rgba(192,68,232,0.15)",  border: "rgba(192,68,232,0.25)"  },
  { name: "Sports",        icon: "⚽", light: "#fff7ed", dark: "rgba(249,115,22,0.15)",  border: "rgba(249,115,22,0.25)"  },
  { name: "Stationery",    icon: "✏️", light: "#fffbeb", dark: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.25)"  },
];

/* ── Why-us reasons ── */
const WHY = [
  { icon: "🚚", head: "Free delivery, really.",     body: "No fine print. Orders above ₹999 ship free, everywhere in India." },
  { icon: "🔒", head: "Only genuine products.",      body: "Every seller is verified. Buy confidently — or we make it right." },
  { icon: "🔄", head: "7-day no-fuss returns.",     body: "Changed your mind? Just initiate a return. We'll handle the rest." },
];

/* ── Feature pills ── */
const FEATURES = [
  { icon: "🚚", title: "Free Delivery",   desc: "Orders ₹999+" },
  { icon: "🔒", title: "Secure Payment",  desc: "100% safe" },
  { icon: "🔄", title: "Easy Returns",    desc: "7-day policy" },
  { icon: "📦", title: "Fast Dispatch",   desc: "Within 24hrs" },
  { icon: "🎁", title: "Gift Wrapping",   desc: "On all orders" },
  { icon: "📞", title: "24/7 Support",    desc: "We're here" },
];

/* ── CSS var getter (avoids inline duplication) ── */
const cv = (v) => `var(${v})`;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerFade, setBannerFade] = useState(true);
 
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

  useEffect(() => {
    API.get("/products/all")
      .then((r) => setProducts(r.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));

    const t = setInterval(() => {
      setBannerFade(false);
      setTimeout(() => { setBannerIdx((i) => (i + 1) % BANNERS.length); setBannerFade(true); }, 320);
    }, 4200);

    
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => { clearInterval(t); obs.disconnect(); };
  }, []);

  /* ── Shared heading style ── */
  const H2 = ({ children, className = "" }) => (
    <h2
      className={className}
      style={{ fontFamily: "'Times New Roman', Georgia, serif", color: cv("--text-primary"), fontWeight: 700, lineHeight: 1.15 }}
    >
      {children}
    </h2>
  );

  /* ── Section label (small uppercase tag above headings) ── */
  const Label = ({ children }) => (
    <p
      style={{ fontFamily: "'DM Sans', sans-serif", color: cv("--brand"), fontWeight: 700, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}
    >
      {children}
    </p>
  );

  return (
    <div style={{ background: cv("--bg") }}>

      {/* ══════════════════════════════════════════
          PROMO TICKER
      ══════════════════════════════════════════ */}
      <div
        className={`bg-gradient-to-r ${BANNERS[bannerIdx].grad} py-2.5 overflow-hidden`}
        style={{ transition: "opacity 0.3s", opacity: bannerFade ? 1 : 0 }}
      >
        <p style={{ color: "#fff", textAlign: "center", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }}>
          {BANNERS[bannerIdx].text}
        </p>
      </div>

      {/* ══════════════════════════════════════════
          HERO — editorial, asymmetric
      ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: cv("--bg"), paddingTop: "clamp(3rem, 8vw, 6rem)", paddingBottom: "clamp(3rem, 8vw, 6rem)" }}
      >
        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute"
          style={{ width: 600, height: 600, top: -120, right: -180, borderRadius: "50%", filter: "blur(40px)", background: "radial-gradient(circle, rgba(192,68,232,0.13) 0%, transparent 70%)", zIndex: 0 }}
        />
        <div
          className="pointer-events-none absolute"
          style={{ width: 420, height: 420, bottom: 0, left: -80, borderRadius: "50%", filter: "blur(30px)", background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)", zIndex: 0 }}
        />

        <div className="container relative" style={{ zIndex: 1 }}>
          <div className="grid gap-10 items-center" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,420px),1fr))" }}>

            {/* LEFT: Copy */}
            <div>
              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full"
                style={{ border: "1px solid rgba(192,68,232,0.3)", background: "rgba(192,68,232,0.08)" }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: cv("--brand"), display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: cv("--brand"), fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.04em" }}>
                  India's growing marketplace
                </span>
              </div>

              {/* Headline — big, Times New Roman */}
              <h1
                style={{
                  fontFamily: "'Times New Roman', Georgia, serif",
                  fontSize: "clamp(2.4rem, 6vw, 4rem)",
                  fontWeight: 700,
                  color: cv("--text-primary"),
                  lineHeight: 1.08,
                  marginBottom: "1.25rem",
                  letterSpacing: "-0.01em",
                }}
              >
                Find what you{" "}
                <em
                  className="not-italic"
                  style={{ background: "linear-gradient(135deg,#c044e8,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                >
                  love.
                </em>
                <br />
                Buy it.
              </h1>

              {/* Sub-copy — casual human tone */}
              <p
                style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)", lineHeight: 1.7, color: cv("--text-secondary"), maxWidth: 460, marginBottom: "2rem", fontFamily: "'DM Sans', sans-serif" }}
              >
                Thousands of products from verified sellers delivered to your door.
                No hidden charges, no drama — just honest prices.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Link to="/products" className="btn-brand" style={{ paddingLeft: "1.75rem", paddingRight: "1.75rem", fontSize: "0.95rem" }}>
                  Shop Now
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/register" className="btn-outline" style={{ paddingLeft: "1.75rem", paddingRight: "1.75rem", fontSize: "0.95rem" }}>
                  Sell on ShopEase →
                </Link>
              </div>

              {/* Social proof row */}
              <div className="flex flex-wrap gap-6">
                {[{ v: "10K+", l: "happy customers" }, { v: "500+", l: "verified sellers" }, { v: "4.8 ★", l: "avg rating" }].map(({ v, l }) => (
                  <div key={l}>
                    <p style={{ fontFamily: "'Times New Roman', serif", fontSize: "1.6rem", fontWeight: 700, color: cv("--text-primary"), lineHeight: 1 }}>{v}</p>
                    <p style={{ fontSize: 11, color: cv("--text-muted"), fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Floating category cards — visible md+ */}
            <div className="hidden md:grid grid-cols-2 gap-4" style={{ alignSelf: "center" }}>
              {CATS.slice(0, 4).map((cat, i) => (
                <Link
                  key={cat.name}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group rounded-2xl flex flex-col items-center justify-center gap-2 py-7 px-4 border transition-all duration-200"
                  style={{
                    background: isDark ? cat.dark : cat.light,
                    borderColor: isDark ? cat.border : "rgba(0,0,0,0.06)",
                    animationDelay: `${i * 0.2}s`,
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{cat.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: cv("--text-primary"), fontFamily: "'DM Sans', sans-serif" }}>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BRAND MARQUEE
      ══════════════════════════════════════════ */}
      <div
        className="overflow-hidden py-3.5 border-y"
        style={{ background: cv("--surface"), borderColor: cv("--border") }}
      >
        <div className="marquee-track select-none">
          {[...Array(2)].map((_, ri) => (
            <div key={ri} className="inline-flex items-center">
              {["Samsung","Apple","Nike","Adidas","Sony","OnePlus","boAt","Puma","Philips","Prestige","Lakme","Mamaearth","Noise","Realme"].map((b) => (
                <span
                  key={b + ri}
                  style={{ marginLeft: 40, marginRight: 40, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: cv("--text-muted"), fontFamily: "'DM Sans', sans-serif", opacity: 0.7 }}
                >
                  {b}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          WHY US — 3 honest reasons
      ══════════════════════════════════════════ */}
      <section style={{ background: cv("--bg"), padding: "clamp(2.5rem, 5vw, 4rem) 0" }}>
        <div className="container">
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,260px),1fr))" }}>
            {WHY.map(({ icon, head, body }) => (
              <div
                key={head}
                className="rounded-2xl p-6 border"
                style={{ background: cv("--card"), borderColor: cv("--border"), boxShadow: cv("--shadow-card") }}
              >
                <span style={{ fontSize: "2rem", display: "block", marginBottom: 14 }}>{icon}</span>
                <h3 style={{ fontFamily: "'Times New Roman', serif", fontSize: 17, fontWeight: 700, color: cv("--text-primary"), marginBottom: 8 }}>
                  {head}
                </h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: cv("--text-secondary"), lineHeight: 1.7 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES STRIP
      ══════════════════════════════════════════ */}
      <section style={{ background: cv("--surface"), padding: "1.75rem 0", borderTop: `1px solid ${cv("--border")}`, borderBottom: `1px solid ${cv("--border")}` }}>
        <div className="container">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center text-center p-3 rounded-xl border"
                style={{ background: cv("--card"), borderColor: cv("--border") }}
              >
                <span style={{ fontSize: "1.4rem", marginBottom: 4 }}>{f.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: cv("--text-primary"), fontFamily: "'DM Sans', sans-serif" }}>{f.title}</span>
                <span style={{ fontSize: 10, color: cv("--text-muted"), fontFamily: "'DM Sans', sans-serif" }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ALL CATEGORIES
      ══════════════════════════════════════════ */}
      <section style={{ background: cv("--bg"), padding: "clamp(2.5rem, 5vw, 4rem) 0" }}>
        <div className="container">
          <div className="mb-8">
            <Label>Browse</Label>
            <H2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)" }}>Shop by category</H2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CATS.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center py-5 px-3 rounded-2xl border transition-all duration-200"
                style={{
                  background: isDark ? cat.dark : cat.light,
                  borderColor: isDark ? cat.border : "rgba(0,0,0,0.05)",
                  textDecoration: "none",
                }}
              >
                <span className="group-hover:scale-110 transition-transform duration-200" style={{ fontSize: "1.8rem", display: "block", marginBottom: 6 }}>{cat.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: cv("--text-primary"), fontFamily: "'DM Sans', sans-serif", textAlign: "center", lineHeight: 1.3 }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════ */}
      <section style={{ background: cv("--surface"), padding: "clamp(2.5rem, 5vw, 4rem) 0" }}>
        <div className="container">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <Label>Handpicked</Label>
              <H2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)" }}>Featured products</H2>
            </div>
            <Link
              to="/products"
              style={{ fontSize: 14, fontWeight: 600, color: cv("--brand"), fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${cv("--border")}` }}>
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                    <div className="skeleton h-5 rounded w-1/3 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group rounded-2xl overflow-hidden transition-all duration-220 hover:-translate-y-1"
                  style={{ background: cv("--card"), border: `1px solid ${cv("--border")}`, boxShadow: cv("--shadow-card"), textDecoration: "none" }}
                >
                  <div className="aspect-square overflow-hidden" style={{ background: cv("--surface") }}>
                    <img
  src={getImageUrl(product.imageUrl)}
  alt={product.name}
  loading="lazy"
  className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: cv("--text-muted"), fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>
                      {product.category}
                    </p>
                    <h3
                      className="line-clamp-2"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: cv("--text-primary"), lineHeight: 1.4, marginBottom: 6 }}
                    >
                      {product.name}
                    </h3>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-0.5 mb-2">
                        {[1,2,3,4,5].map((s) => (
                          <svg key={s} className="w-2.5 h-2.5" fill={s <= Math.round(product.rating) ? "#f59e0b" : "var(--border)"} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span style={{ fontSize: 10, color: cv("--text-muted"), marginLeft: 2 }}>({product.rating.toFixed(1)})</span>
                      </div>
                    )}
                    <p style={{ fontFamily: "'Times New Roman', serif", fontSize: 17, fontWeight: 700, color: cv("--text-primary") }}>
                      ₹{product.price?.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BIG CTA BANNER
      ══════════════════════════════════════════ */}
      <section style={{ background: cv("--bg"), padding: "clamp(2.5rem, 5vw, 4rem) 0" }}>
        <div className="container">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(135deg,#7c3aed 0%,#c044e8 55%,#7c3aed 100%)", padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.5rem, 5vw, 4rem)" }}
          >
            {/* grid pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 600 300">
              <defs><pattern id="cta-g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.7"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#cta-g)" />
            </svg>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-7">
              <div>
                <h2 style={{ fontFamily: "'Times New Roman', serif", color: "#fff", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                  Start your shopping journey today.
                </h2>
                <p style={{ color: "rgba(255,255,255,0.82)", fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.65, maxWidth: 440 }}>
                  Join 10,000+ customers who trust ShopEase for genuine products and honest pricing. Your first order gets ₹250 off.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  to="/register"
                  style={{ background: "#fff", color: "#7c3aed", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, padding: "0.875rem 1.75rem", borderRadius: "0.75rem", textDecoration: "none", display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}
                >
                  Create free account
                </Link>
                <Link
                  to="/products"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, padding: "0.875rem 1.75rem", borderRadius: "0.75rem", textDecoration: "none", display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}
                >
                  Browse products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          NEW ARRIVALS (products 4–8)
      ══════════════════════════════════════════ */}
      {products.length > 4 && (
        <section style={{ background: cv("--surface"), padding: "clamp(2.5rem, 5vw, 4rem) 0" }}>
          <div className="container">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <Label>New arrivals</Label>
                <H2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)" }}>Just in</H2>
              </div>
              <Link to="/products" style={{ fontSize: 14, fontWeight: 600, color: cv("--brand"), fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}>
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {products.slice(4, 8).map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group rounded-2xl overflow-hidden transition-all duration-220 hover:-translate-y-1"
                  style={{ background: cv("--card"), border: `1px solid ${cv("--border")}`, boxShadow: cv("--shadow-card"), textDecoration: "none" }}
                >
                  <div className="aspect-square overflow-hidden" style={{ background: cv("--surface") }}>
                    <img
                      src={getImageUrl(product.imageUrl) || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover  transition-transform duration-400"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: cv("--text-muted"), fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>
                      {product.category}
                    </p>
                    <h3 className="line-clamp-2 mb-2" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: cv("--text-primary"), lineHeight: 1.4 }}>
                      {product.name}
                    </h3>
                    <p style={{ fontFamily: "'Times New Roman', serif", fontSize: 17, fontWeight: 700, color: cv("--text-primary") }}>
                      ₹{product.price?.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}