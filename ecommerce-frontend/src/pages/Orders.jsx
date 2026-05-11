import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
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
            if (p.data.imageUrl) {
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
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // ✅ User can cancel order only if status is PLACED or PACKED (before shipped)
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const response = await API.put(`/orders/${orderId}/cancel`);
      if (response.status === 200 || response.status === 201) {
        toast.success("Order cancelled successfully!");
        fetchOrders(); // Refresh orders list
      }
    } catch (err) {
      console.error("Cancel error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to cancel order";
      toast.error(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  // ✅ FIXED: Update order status - this will refresh the orders list
const updateOrderStatus = async (orderId, newStatus) => {
  setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
  try {
    const response = await API.put(`/orders/${orderId}/status`, null, {
      params: { status: newStatus }
    });
    
    if (response.status === 200 || response.status === 201) {
      toast.success(`Order status updated to ${newStatus}!`);
      
      // ✅ CRITICAL: Refresh orders to update the badge
      const updatedOrders = await fetchOrders();
      
      // ✅ Also refresh stats
      await calculateStats();
      
      // ✅ Force a re-render by updating state
      setOrders([...updatedOrders]);
    }
  } catch (err) {
    console.error("Error updating status:", err);
    toast.error(err.response?.data?.error || "Failed to update status");
  } finally {
    setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
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
            <div key={i} className="h-40 bg-white rounded-2xl border border-stone-100" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-12 h-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="font-display font-semibold text-stone-700 text-xl">No orders yet</h3>
        <p className="text-stone-400 mt-2">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-900">My Orders</h1>
        <p className="text-stone-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-6">
        {[...orders].reverse().map((order) => {
          // ✅ User can cancel only if status is PLACED or PACKED (before shipped)
          const canCancel = order.status === "PLACED" || order.status === "PACKED";
          
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
              {/* Order Header - WITH CANCEL BUTTON FOR USERS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 bg-stone-50 border-b border-stone-100 gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-bold text-stone-900 text-sm">Order #{order.id}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                    order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                    order.status === "SHIPPED" ? "bg-violet-100 text-violet-700" :
                    order.status === "PACKED" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {order.status === "CANCELLED" ? "Cancelled" :
                     order.status === "DELIVERED" ? "Delivered" :
                     order.status === "SHIPPED" ? "Shipped" :
                     order.status === "PACKED" ? "Packed" : "Order Placed"}
                  </span>
                  {/* ✅ Cancel Button - Only for PLACED or PACKED orders */}
                  {canCancel && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={cancelling}
                      className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {cancelling ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-display font-bold text-stone-900 text-lg">₹{order.totalAmount?.toLocaleString()}</p>
                  <p className="text-xs text-amber-600">Cash on Delivery • {formatDate(order.orderDate)}</p>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingStreet && (
                <div className="px-5 py-2 bg-stone-50/30 border-b border-stone-100">
                  <p className="text-xs text-stone-500 break-words">
                    📍 Delivery: {order.shippingStreet}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div className="divide-y divide-stone-100">
                {(order.items || []).map((item) => {
                  const product = products[item.productId];
                  const imageUrl = product?.fullImageUrl || product?.imageUrl;
                  const itemStatus = item.status || "PLACED";
                  
                  return (
                    <div key={item.id} className="p-4 flex gap-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <img src={imageUrl} alt={product?.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-stone-800 text-sm">{product?.name || `Product #${item.productId}`}</h3>
                        <p className="text-xs text-stone-400 mt-0.5">{product?.category || "General"}</p>
                        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-500">Qty: {item.quantity}</span>
                            <span className="text-xs text-stone-500">×</span>
                            <span className="text-xs font-medium text-stone-700">₹{item.price?.toLocaleString()}</span>
                          </div>
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
                      <div className="text-right">
                        <p className="text-sm font-semibold text-stone-700">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}