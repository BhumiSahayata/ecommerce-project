import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(categoryFromUrl || "All");
  const [categories, setCategories] = useState(["All"]);
  const [sortBy, setSortBy] = useState("newest");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/products/all");
      setProducts(res.data);
      setCategories(["All", ...new Set(res.data.filter(p => p.category).map(p => p.category))]);
    } catch {} finally { setLoading(false); }
  }, []);

  const fetchWishlist = useCallback(async () => {
    if (!user || user.role !== "USER") return;
    try {
      const res = await API.get("/wishlist");
      setWishlistIds(res.data.map(i => i.productId));
    } catch {}
  }, [user]);

  useEffect(() => { fetchProducts(); fetchWishlist(); }, [fetchProducts, fetchWishlist]);

  const hasActiveFilters = search || category !== "All" || sortBy !== "newest";
  const clearAll = () => { setSearch(""); setCategory("All"); setSortBy("newest"); };

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      return (
        (p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) &&
        (category === "All" || p.category === category)
      );
    })
    .sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return b.id - a.id;
    });

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl font-black text-primary">Products</h1>
          <p className="text-secondary mt-1 text-sm">{products.length} items available</p>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 mb-6 shadow-card">
          <div className="flex flex-wrap items-center gap-3">

            {/* Search — fixed: no conflicting padding, icon properly absolute */}
            <div className="relative min-w-[200px] flex-1 max-w-sm">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: "2.25rem" }}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent py-2.5 pr-3 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute inset-y-0 right-2.5 flex items-center text-muted hover:text-primary transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>

            {/* Separator */}
            <div className="hidden sm:block h-8 w-px bg-[var(--border)]" />

            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap hidden md:block">Category</span>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="appearance-none bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent py-2.5 pl-3 pr-8 cursor-pointer transition-all min-w-[120px]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="hidden sm:block h-8 w-px bg-[var(--border)]" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap hidden md:block">Sort</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent py-2.5 pl-3 pr-8 cursor-pointer transition-all min-w-[150px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low → High</option>
                  <option value="price_high">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <>
                <div className="hidden sm:block h-8 w-px bg-[var(--border)]" />
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors whitespace-nowrap"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Active chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)]">
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-200 dark:border-brand-800/40">
                  "{search}"
                  <button onClick={() => setSearch("")} className="hover:opacity-70 transition-opacity">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </span>
              )}
              {category !== "All" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-xs font-semibold border border-violet-200 dark:border-violet-800/40">
                  {category}
                  <button onClick={() => setCategory("All")} className="hover:opacity-70"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                </span>
              )}
              {sortBy !== "newest" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold border border-green-200 dark:border-green-800/40">
                  {sortBy === "price_low" ? "Price ↑" : sortBy === "price_high" ? "Price ↓" : "Top Rated"}
                  <button onClick={() => setSortBy("newest")} className="hover:opacity-70"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Count */}
        {!loading && filtered.length > 0 && (
          <p className="text-sm text-muted mb-4">
            Showing <span className="font-semibold text-primary">{filtered.length}</span> of <span className="font-semibold text-primary">{products.length}</span> products
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-[var(--border)]">
                <div className="skeleton aspect-square" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                  <div className="skeleton h-7 rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <div className="w-20 h-20 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
              <svg className="w-9 h-9 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 className="font-display font-bold text-primary text-xl mb-1">No products found</h3>
            <p className="text-muted text-sm">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <button onClick={clearAll} className="mt-5 inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} wishlistIds={wishlistIds} onWishlistChange={fetchWishlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}