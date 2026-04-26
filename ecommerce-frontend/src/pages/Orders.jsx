import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import NotificationService from "../services/NotificationService";

const STATUS_META = {
  PLACED:    { label: "Order Placed",  icon: "📦", color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/25",   border: "border-blue-200 dark:border-blue-700/40",   dot: "bg-blue-500"   },
  PACKED:    { label: "Packed",        icon: "📋", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/25", border: "border-amber-200 dark:border-amber-700/40", dot: "bg-amber-500" },
  SHIPPED:   { label: "Shipped",       icon: "🚚", color: "text-violet-600 dark:text-violet-400",bg: "bg-violet-50 dark:bg-violet-900/25",border: "border-violet-200 dark:border-violet-700/40",dot: "bg-violet-500"},
  DELIVERED: { label: "Delivered",     icon: "✅", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/25", border: "border-green-200 dark:border-green-700/40", dot: "bg-green-500" },
  CANCELLED: { label: "Cancelled",     icon: "❌", color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-900/25",     border: "border-red-200 dark:border-red-700/40",     dot: "bg-red-500"   },
};

const STEPS = ["PLACED", "PACKED", "SHIPPED", "DELIVERED"];
const STEP_LABELS = { PLACED:"Placed", PACKED:"Packed", SHIPPED:"Shipped", DELIVERED:"Delivered" };
const STEP_ICONS = {
  PLACED:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  PACKED:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  SHIPPED:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM19.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>,
  DELIVERED: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>,
};

const fmt = (d) => {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }); }
  catch { return d; }
};

const fmtShort = (d) => {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }); }
  catch { return d; }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});
  const [cancelling, setCancelling] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const prevStatuses = useRef({});

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/orders");
        const allItems = res.data.flatMap(o => o.items || []);
        const ids = [...new Set(allItems.map(i => i.productId))];
        const existingIds = new Set();
        for (const pid of ids) {
          try {
            const p = await API.get(`/products/${pid}`);
            if (p.data?.id) {
              existingIds.add(pid);
              if (p.data.imageUrl && !p.data.imageUrl.startsWith("http"))
                p.data.fullImageUrl = `http://localhost:8080${p.data.imageUrl}`;
              setProducts(prev => ({ ...prev, [pid]: p.data }));
            }
          } catch {}
        }
        const filtered = res.data.filter(o => (o.items||[]).some(i => existingIds.has(i.productId)));
        setOrders(filtered);
        if (filtered.length > 0) setExpandedOrder(filtered[filtered.length - 1].id);
      } catch { toast.error("Failed to load orders"); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    orders.forEach(o => {
      const prev = prevStatuses.current[o.id];
      if (prev && prev !== o.status) NotificationService.notifyOrderStatusUpdate(o.id, o.status);
      prevStatuses.current[o.id] = o.status;
    });
  }, [orders]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(orderId);
    try {
      await API.put(`/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) { toast.error(err.response?.data?.error || "Failed to cancel"); }
    finally { setCancelling(null); }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="skeleton rounded-2xl h-32" />
      ))}
    </div>
  );

  const reversedOrders = [...orders].reverse();

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-black text-primary">My Orders</h1>
          <p className="text-secondary mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>

        {/* Empty */}
        {orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-5 border border-[var(--border)]">
              <svg className="w-11 h-11 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3 className="font-display font-bold text-primary text-2xl mb-2">No orders yet</h3>
            <p className="text-muted mb-6">Start shopping and your orders will appear here</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reversedOrders.map((order) => {
              const meta = STATUS_META[order.status] || STATUS_META.PLACED;
              const validItems = (order.items||[]).filter(i => products[i.productId]);
              if (!validItems.length) return null;
              const canCancel = order.status === "PLACED" || order.status === "PACKED";
              const isCancelled = order.status === "CANCELLED";
              const currentStepIdx = STEPS.indexOf(order.status);
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-card transition-all duration-200 hover:border-brand-300 dark:hover:border-brand-700"
                >
                  {/* ── Order Header (always visible, clickable) ── */}
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center justify-between px-5 py-4 gap-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${meta.bg} ${meta.color} ${meta.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} flex-shrink-0`}/>
                          {meta.icon} {meta.label}
                        </span>
                        <div>
                          <span className="font-display font-bold text-primary text-sm">Order #{order.id}</span>
                          <span className="text-muted text-xs ml-2">{fmtShort(order.orderDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-auto">
                        <div className="text-right">
                          <p className="font-display font-black text-primary text-lg leading-none">₹{order.totalAmount?.toLocaleString()}</p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Cash on Delivery</p>
                        </div>
                        <svg
                          className={`w-4 h-4 text-muted transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        >
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* ── Expanded Content ── */}
                  {isExpanded && (
                    <div className="border-t border-[var(--border-subtle)]">

                      {/* Shipping address */}
                      {order.shippingStreet && (
                        <div className="px-5 py-3 bg-[var(--surface)] flex items-start gap-2.5 border-b border-[var(--border-subtle)]">
                          <svg className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <div>
                            <p className="text-xs font-semibold text-secondary">Delivery Address</p>
                            <p className="text-xs text-muted mt-0.5">
                              {order.shippingStreet}, {order.shippingCity}, {order.shippingState} — {order.shippingPincode}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="px-5 py-4 space-y-3">
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Items in this order</p>
                        {validItems.map(item => {
                          const product = products[item.productId];
                          const img = product?.fullImageUrl || product?.imageUrl;
                          return (
                            <div key={item.id} className="flex items-center gap-3">
                              <Link to={`/product/${item.productId}`} className="w-14 h-14 flex-shrink-0 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] overflow-hidden block hover:opacity-80 transition-opacity">
                                {img ? (
                                  <img src={img} alt={product?.name} className="w-full h-full object-cover" onError={e => e.target.style.display="none"}/>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/></svg>
                                  </div>
                                )}
                              </Link>
                              <div className="flex-1 min-w-0">
                                <Link to={`/product/${item.productId}`}>
                                  <p className="text-sm font-semibold text-primary truncate hover:text-brand-500 transition-colors">{product?.name || `Product #${item.productId}`}</p>
                                </Link>
                                <p className="text-xs text-muted mt-0.5">Qty {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                              </div>
                              <p className="font-display font-bold text-primary text-sm flex-shrink-0">₹{(item.price * item.quantity)?.toLocaleString()}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* ── Order Progress Tracker ── */}
                      {!isCancelled ? (
                        <div className="px-5 py-5 bg-[var(--surface)] border-t border-[var(--border-subtle)]">
                          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Order Progress</p>
                          <div className="flex items-start">
                            {STEPS.map((step, i) => {
                              const done = i <= currentStepIdx;
                              const active = i === currentStepIdx;
                              return (
                                <div key={step} className="flex-1 flex flex-col items-center relative">
                                  {/* Connector line left */}
                                  {i > 0 && (
                                    <div className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 transition-all duration-500 ${
                                      i <= currentStepIdx ? "bg-green-400" : "bg-[var(--border)]"
                                    }`} style={{ left: "-50%" }} />
                                  )}

                                  {/* Step circle */}
                                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                    active
                                      ? "bg-brand-500 text-white shadow-lg ring-4 ring-brand-200 dark:ring-brand-800"
                                      : done
                                        ? "bg-green-500 text-white shadow-md"
                                        : "bg-[var(--border)] text-muted"
                                  }`}>
                                    {done && !active ? (
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                    ) : active ? (
                                      STEP_ICONS[step]
                                    ) : (
                                      <span className="text-xs font-bold">{i + 1}</span>
                                    )}
                                  </div>

                                  {/* Label */}
                                  <div className="mt-2 text-center px-1">
                                    <p className={`text-[10px] font-bold leading-tight ${
                                      active ? "text-brand-600 dark:text-brand-400"
                                        : done ? "text-green-600 dark:text-green-400"
                                        : "text-muted"
                                    }`}>
                                      {STEP_LABELS[step]}
                                    </p>
                                    {active && (
                                      <p className="text-[9px] text-muted mt-0.5">Current</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 py-4 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-800/30 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-red-700 dark:text-red-400">Order Cancelled</p>
                            <p className="text-xs text-red-500 dark:text-red-500/80 mt-0.5">This order has been cancelled. Refund (if applicable) will be processed shortly.</p>
                          </div>
                        </div>
                      )}

                      {/* Footer row: date + cancel button */}
                      <div className="px-5 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-2">
                        <p className="text-xs text-muted">
                          Ordered on <span className="font-medium text-secondary">{fmt(order.orderDate)}</span>
                        </p>
                        {canCancel && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancelling === order.id}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                          >
                            {cancelling === order.id ? (
                              <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"/>
                            ) : (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            )}
                            {cancelling === order.id ? "Cancelling…" : "Cancel Order"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}