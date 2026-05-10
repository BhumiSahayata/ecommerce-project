import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import NotificationService from "../services/NotificationService";
import { BACKEND_URL } from "../constants";
import { getImageUrl } from "../utils/imageUtils";


const STATUS_STYLES = {
  PLACED:    { bg: "bg-blue-100", text: "text-blue-700", label: "Order Placed", icon: "📦" },
  PACKED:    { bg: "bg-amber-100", text: "text-amber-700", label: "Packed", icon: "📋" },
  SHIPPED:   { bg: "bg-violet-100", text: "text-violet-700", label: "Shipped", icon: "🚚" },
  DELIVERED: { bg: "bg-green-100", text: "text-green-700", label: "Delivered", icon: "✅" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled", icon: "❌" },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});
  const [cancelling, setCancelling] = useState(false);
  const previousStatuses = useRef({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      const allItems = res.data.flatMap(o => o.items || []);
      const uniqueProductIds = [...new Set(allItems.map(i => i.productId))];
      
      const productMap = {};
      for (const pid of uniqueProductIds) {
        try {
          const p = await API.get(`/products/${pid}`);
          if (p.data && p.data.id) {
            if (p.data.imageUrl && !p.data.imageUrl.startsWith('http')) {
  p.data.fullImageUrl = getImageUrl(p.data.imageUrl);
}
            productMap[pid] = p.data;
          }
        } catch (err) {
          console.log("Product not found:", pid);
        }
      }
      setProducts(productMap);
      setOrders(res.data);
      
      // Check for status changes
      res.data.forEach(order => {
        const prevStatus = previousStatuses.current[order.id];
        if (prevStatus && prevStatus !== order.status) {
          NotificationService.notifyOrderStatusUpdate(order.id, order.status);
        }
        previousStatuses.current[order.id] = order.status;
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await API.put(`/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully!");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-[var(--card)] rounded-2xl border border-[var(--border)]" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="w-24 h-24 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-12 h-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="font-display font-semibold text-primary text-xl">No orders yet</h3>
        <p className="text-muted mt-2">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-primary">My Orders</h1>
        <p className="text-muted mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-6">
        {[...orders].reverse().map((order) => {
          const canCancel = order.status === "PLACED" || order.status === "PACKED";
          const allDelivered = order.items?.every(item => 
            products[item.productId] && order.status === "DELIVERED"
          );
          
          return (
            <div key={order.id} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 bg-[var(--surface)] border-b border-[var(--border)] gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-bold text-primary">Order #{order.id}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]?.bg} ${STATUS_STYLES[order.status]?.text}`}>
                    {STATUS_STYLES[order.status]?.label || order.status}
                  </span>
                  {canCancel && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={cancelling}
                      className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-display font-bold text-primary text-lg">₹{order.totalAmount?.toLocaleString()}</p>
                  <p className="text-xs text-muted">COD • {formatDate(order.orderDate)}</p>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingStreet && (
                <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
                  <p className="text-xs text-muted flex items-center gap-1">
                    📍 Delivery: {order.shippingStreet}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                  </p>
                </div>
              )}

              {/* Order Items - Each with its own status */}
<div className="divide-y divide-[var(--border)]">
  {(order.items || []).map((item) => {
    const product = products[item.productId];
    const imageUrl = product?.fullImageUrl || product?.imageUrl;
    const itemStatus = item.status || "PLACED";
    
    return (
      <div key={item.id} className="p-4 flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-[var(--surface)] rounded-xl overflow-hidden flex-shrink-0">
          {imageUrl ? (
           <img
  src={getImageUrl(product.imageUrl)}
  alt={product.name}
  loading="lazy"
  className="w-full h-full object-cover"
/>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h3 className="font-semibold text-primary text-sm">{product?.name || `Product #${item.productId}`}</h3>
          <p className="text-xs text-muted mt-0.5">{product?.category || "General"}</p>
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Qty: {item.quantity}</span>
              <span className="text-xs text-muted">×</span>
              <span className="text-xs font-medium text-primary">₹{item.price?.toLocaleString()}</span>
            </div>
            {/* ✅ Each product shows its own status */}
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                itemStatus === "DELIVERED" ? "bg-green-100 text-green-700" :
                itemStatus === "SHIPPED" ? "bg-violet-100 text-violet-700" :
                itemStatus === "PACKED" ? "bg-amber-100 text-amber-700" :
                itemStatus === "CANCELLED" ? "bg-red-100 text-red-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {itemStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>

              {/* Progress Bar - Only show if not delivered */}
              {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                <div className="px-5 py-4 bg-[var(--surface)] border-t border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    {["PLACED", "PACKED", "SHIPPED", "DELIVERED"].map((s, i) => {
                      const statuses = ["PLACED", "PACKED", "SHIPPED", "DELIVERED"];
                      const currentIdx = statuses.indexOf(order.status);
                      const isCompleted = statuses.indexOf(s) <= currentIdx;
                      const labels = { PLACED: "Placed", PACKED: "Packed", SHIPPED: "Shipped", DELIVERED: "Delivered" };
                      
                      return (
                        <div key={s} className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500 text-white" : "bg-stone-300 text-stone-500"}`}>
                            {isCompleted ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="text-xs font-bold">{i + 1}</span>
                            )}
                          </div>
                          <span className={`text-[10px] mt-1 ${isCompleted ? "text-green-600" : "text-stone-400"}`}>{labels[s]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}