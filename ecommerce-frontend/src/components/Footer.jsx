import { Link } from "react-router-dom";

const socialLinks = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.68 4.54-4.68 1.31 0 2.68.23 2.68.23v2.97h-1.51c-1.49 0-1.95.92-1.95 1.87v2.24h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

const footerLinks = {
  Shop: [
    { label: "All Products", to: "/products" },
    { label: "Electronics", to: "/products?category=Electronics" },
    { label: "Fashion", to: "/products?category=Fashion" },
    { label: "Home & Living", to: "/products?category=Home%20%26%20Living" },
    { label: "Beauty", to: "/products?category=Beauty" },
  ],
  Account: [
    { label: "Login", to: "/login" },
    { label: "Register", to: "/register" },
    { label: "My Orders", to: "/orders" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Cart", to: "/cart" },
  ],
  Sellers: [
    { label: "Become a Merchant", to: "/register" },
    { label: "Seller Dashboard", to: "/merchant" },
    { label: "Seller Guidelines", to: "#" },
    { label: "Pricing & Fees", to: "#" },
  ],
  Help: [
    { label: "FAQs", to: "#" },
    { label: "Shipping Policy", to: "#" },
    { label: "Return Policy", to: "#" },
    { label: "Privacy Policy", to: "#" },
    { label: "Terms of Service", to: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6h18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <span className="font-display font-black text-xl text-primary block leading-none">ShopEase</span>
                <span className="text-[9px] tracking-widest uppercase text-muted">Premium Store</span>
              </div>
            </Link>

            <p className="text-sm text-secondary leading-relaxed mb-6 max-w-xs">
              India's fastest growing marketplace. Shop from thousands of verified sellers with guaranteed authenticity and express delivery.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  title={s.name}
                  className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-secondary hover:text-brand-500 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* App Badges */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl cursor-pointer hover:border-brand-400 transition-colors">
                <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <p className="text-[9px] text-muted leading-none">Download on</p>
                  <p className="text-xs font-semibold text-primary">App Store</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl cursor-pointer hover:border-brand-400 transition-colors">
                <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.26.15.56.2.87.13l12.19-7.04-2.63-2.63-10.43 9.54zm-1.34-19.7A1.5 1.5 0 001.5 5.23v13.54c0 .52.27.98.71 1.24l.07.04 7.58-7.58v-.18L1.84 4.06zm18.1 7.58l-2.43-1.41-2.92 2.93 2.92 2.92 2.45-1.42c.7-.4.7-1.62-.02-2.02zM4.05.38L16.24 7.4l-2.63 2.63L3.18.49C3.44.35 3.78.27 4.05.38z"/></svg>
                <div>
                  <p className="text-[9px] text-muted leading-none">Get it on</p>
                  <p className="text-xs font-semibold text-primary">Google Play</p>
                </div>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-700 text-sm text-primary mb-4 tracking-wide" style={{ fontWeight: 700 }}>{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-secondary hover:text-brand-500 transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="font-display font-bold text-primary mb-1">Subscribe to our newsletter</h4>
              <p className="text-sm text-secondary">Get exclusive deals, new arrivals and sale alerts.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="input-base md:w-64"
              />
              <button className="btn-brand px-5 py-2.5 text-sm whitespace-nowrap">
                <span>Subscribe</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} ShopEase. All rights reserved. Made with ♥ in India.
          </p>
          <div className="flex items-center gap-4">
            {/* Payment icons */}
            <div className="flex items-center gap-2">
              {["Visa", "MC", "UPI", "COD"].map((p) => (
                <span key={p} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-[var(--border)] text-muted">{p}</span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Secure payments
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}