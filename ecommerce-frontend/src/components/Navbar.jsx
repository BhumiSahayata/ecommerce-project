import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect, useRef } from "react";
import UserProfile from "./UserProfile";
import NotificationService from "../services/NotificationService";

// ShopEase Logo SVG
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(192,68,232,0.5)] transition-all duration-300">
          {/* S bag icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 6h18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-400 border-2 border-[var(--bg)]" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display font-800 text-xl tracking-tight text-primary" style={{ fontWeight: 800 }}>ShopEase</span>
        <span className="text-[9px] font-mono tracking-widest uppercase text-muted" style={{ letterSpacing: '0.15em' }}>Premium Store</span>
      </div>
    </Link>
  );
}

// Theme Toggle
function ThemeToggle() {
  const { toggle, isDark } = useTheme();
  return (
    <button
      onClick={toggle}
      className="relative w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 group"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-4.5 h-4.5 text-brand-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        <svg className="w-4.5 h-4.5 text-brand-600" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, icon }) => (
    <Link
      to={to}
      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
          : "text-secondary hover:text-primary hover:bg-[var(--surface)]"
      }`}
    >
      {icon && <span className="text-base leading-none">{icon}</span>}
      {children}
      {isActive(to) && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-brand-500" />
      )}
    </Link>
  );

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-[var(--border)] shadow-sm"
          : "bg-[var(--bg)] border-b border-[var(--border-subtle)]"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo />

            {/* Desktop Nav */}
            {/* In the desktop nav section, modify: */}
<div className="hidden md:flex items-center gap-1">
  {/* Home is visible to everyone */}
  {user?.role !== "MERCHANT" && (
  <NavLink to="/">Home</NavLink>
)}
  
  {/* Products and customer links - ONLY for non-merchants */}
  {user?.role !== "MERCHANT" && (
    <>
      <NavLink to="/products">Products</NavLink>
      {user?.role === "USER" && (
        <>
          <NavLink to="/cart" icon="🛒">Cart</NavLink>
          <NavLink to="/wishlist" icon="♡">Wishlist</NavLink>
          <NavLink to="/orders">Orders</NavLink>
        </>
      )}
    </>
  )}
  
  {/* Merchant Dashboard - ONLY for merchants */}
  {user?.role === "MERCHANT" && (
    <NavLink to="/merchant">Dashboard</NavLink>
  )}
</div>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />

              {user && (
                <button
                  onClick={() => NotificationService.requestPermission()}
                  className="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-secondary hover:text-brand-500 hover:border-brand-400 transition-all"
                  title="Enable notifications"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                </button>
              )}

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-brand-400 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                      <span className="text-white text-xs font-display font-bold">{user.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-primary max-w-[100px] truncate">{user.name}</span>
                    <span className={`text-[10px] font-display font-bold px-1.5 py-0.5 rounded-md ${
                      user.role === "MERCHANT"
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                        : "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    }`}>
                      {user.role}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-52 bg-card border border-[var(--border)] rounded-2xl shadow-hover py-1.5 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                        <p className="text-xs text-muted">Signed in as</p>
                        <p className="text-sm font-medium text-primary truncate">{user.email}</p>
                      </div>
                      <button
  onClick={() => {
    setShowDropdown(false);
    navigate("/profile");
  }}
  className="w-full text-left px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-[var(--surface)] flex items-center gap-3 transition-colors"
>
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
  </svg>
  My Profile
</button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors rounded-b-2xl"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn-brand px-5 py-2 text-sm">
                    <span>Get Started</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-secondary"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-[var(--border-subtle)] py-3 space-y-1 animate-fade-in">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Products" },
                ...(user?.role === "USER" ? [
                  { to: "/cart", label: "🛒 Cart" },
                  { to: "/wishlist", label: "♡ Wishlist" },
                  { to: "/orders", label: "Orders" },
                ] : []),
                ...(user?.role === "MERCHANT" ? [{ to: "/merchant", label: "Dashboard" }] : []),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(to)
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                      : "text-secondary hover:text-primary hover:bg-[var(--surface)]"
                  }`}
                >
                  {label}
                </Link>
              ))}

              {user ? (
                <div className="pt-2 mt-2 border-t border-[var(--border-subtle)] space-y-1">
                  <div className="px-3 py-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{user.name}</p>
                      <p className="text-xs text-muted">{user.role}</p>
                    </div>
                  </div>
                  <button
  onClick={() => {
    setMenuOpen(false);
    navigate("/profile");
  }}
  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-secondary hover:text-primary hover:bg-[var(--surface)] transition-colors"
>
  My Profile
</button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-2 mt-2 border-t border-[var(--border-subtle)] flex gap-2">
                  <Link to="/login" className="flex-1 text-center py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-secondary">Login</Link>
                  <Link to="/register" className="flex-1 text-center py-2.5 rounded-xl btn-brand text-sm">
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </>
  );
}