export default function Logo({ size = "md", showText = true }) {
  const sizes = {
    sm: { icon: 28, text: "text-lg" },
    md: { icon: 34, text: "text-xl" },
    lg: { icon: 44, text: "text-2xl" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon Mark */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>
        </defs>
        {/* Bag body */}
        <rect x="5" y="15" width="30" height="22" rx="5" fill="url(#logoGrad)"/>
        {/* Handle */}
        <path d="M14 15 C14 9 26 9 26 15" stroke="url(#logoGrad)" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
        {/* Shine */}
        <ellipse cx="13" cy="23" rx="4" ry="2.5" fill="white" fillOpacity="0.2" transform="rotate(-20 13 23)"/>
        {/* Spark / S mark */}
        <path d="M17.5 21.5 C17.5 20 20.5 20 20.5 21.5 C20.5 23 17.5 23 17.5 24.5 C17.5 26 20.5 26 20.5 24.5" 
          stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>

      {showText && (
        <span
          className={`font-display font-bold ${s.text} tracking-tight`}
          style={{ color: 'var(--text-primary)' }}
        >
          Shop<span style={{ color: 'var(--brand)' }}>Ease</span>
        </span>
      )}
    </div>
  );
}