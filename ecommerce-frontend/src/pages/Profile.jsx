import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageUtils";

export default function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
        const res = await API.get("/orders");
        setOrders(res.data);
        
        // Fetch product details for order items
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
    } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to load orders");
    } finally {
        setOrdersLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const updateProfile = async () => {
    if (!formData.name) { toast.error("Name is required"); return; }
    setLoading(true);
    try {
      await API.put("/auth/profile", { name: formData.name, email: formData.email });
      login({ ...user, name: formData.name, email: formData.email }, localStorage.getItem("token"));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally { setLoading(false); }
  };

  const changePassword = async () => {
    if (!formData.currentPassword) { 
        toast.error("Current password required"); 
        return; 
    }
    if (formData.newPassword !== formData.confirmPassword) { 
        toast.error("Passwords don't match"); 
        return; 
    }
    if (!formData.newPassword || formData.newPassword.length < 6) { 
        toast.error("Password must be at least 6 characters"); 
        return; 
    }
    setLoading(true);
    try {
        const response = await API.put("/auth/change-password", { 
            currentPassword: formData.currentPassword, 
            newPassword: formData.newPassword 
        });
        
        console.log("Change password response:", response);
        
        if (response.status === 200) {
            toast.success("Password changed successfully!");
            setFormData({ 
                ...formData, 
                currentPassword: "", 
                newPassword: "", 
                confirmPassword: "" 
            });
        }
    } catch (err) {
        console.error("Password change error:", err);
        console.error("Error response:", err.response);
        const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to change password";
        toast.error(errorMsg);
    } finally { 
        setLoading(false); 
    }
};

  // ✅ Cancel Order Function - Refreshes orders after cancellation
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const response = await API.put(`/orders/${orderId}/cancel`);
      if (response.status === 200 || response.status === 201) {
        toast.success("Order cancelled successfully!");
        await fetchOrders(); // ✅ Refresh orders after cancellation
      }
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error(err.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "DELIVERED": return "bg-green-100 text-green-700";
      case "SHIPPED": return "bg-violet-100 text-violet-700";
      case "PACKED": return "bg-amber-100 text-amber-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-900">My Account</h1>
          <p className="text-stone-500 mt-1">Manage your profile and order history</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm sticky top-24">
              <div className="p-6 text-center border-b border-stone-100">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-stone-800">{user?.name}</h3>
                <p className="text-xs text-stone-400 mt-0.5">{user?.email}</p>
                <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full mt-2 ${
                  user?.role === "MERCHANT" ? "bg-violet-100 text-violet-700" : "bg-brand-100 text-brand-700"
                }`}>
                  {user?.role === "MERCHANT" ? "Merchant" : "Customer"}
                </span>
              </div>
              <div className="p-3">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                    activeTab === "profile"
                      ? "bg-brand-50 text-brand-600"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                    activeTab === "orders"
                      ? "bg-brand-50 text-brand-600"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Orders
                  {orders.length > 0 && (
                    <span className="ml-auto text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-r from-brand-50/30 to-transparent">
                  <h2 className="font-display text-xl font-semibold text-stone-800">
                    {isEditing ? "Edit Profile" : "Profile Information"}
                  </h2>
                  <p className="text-sm text-stone-500 mt-0.5">
                    {isEditing ? "Update your personal details" : "View and manage your account details"}
                  </p>
                </div>

                <div className="p-6">
                  {!isEditing ? (
                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                          <p className="text-xs text-stone-500 mb-1">Full Name</p>
                          <p className="font-medium text-stone-800">{user?.name}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                          <p className="text-xs text-stone-500 mb-1">Email Address</p>
                          <p className="font-medium text-stone-800">{user?.email}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                          <p className="text-xs text-stone-500 mb-1">Account Type</p>
                          <p className="font-medium text-stone-800 capitalize">{user?.role}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                          <p className="text-xs text-stone-500 mb-1">Member Since</p>
                          <p className="font-medium text-stone-800">April 2026</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                      >
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="input-base w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="input-base w-full"
                        />
                      </div>

                      <div className="border-t border-stone-200 pt-5 mt-3">
                        <p className="text-sm font-medium text-stone-700 mb-4">Change Password (Optional)</p>
                        <div className="space-y-3">
                          <input
                            type="password"
                            name="currentPassword"
                            placeholder="Current Password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="input-base w-full"
                          />
                          <input
                            type="password"
                            name="newPassword"
                            placeholder="New Password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="input-base w-full"
                          />
                          <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input-base w-full"
                          />
                        </div>
                        {formData.currentPassword && (
                          <button
                            onClick={changePassword}
                            disabled={loading}
                            className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
                          >
                            Update Password
                          </button>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={updateProfile}
                          disabled={loading}
                          className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="border border-stone-300 text-stone-600 hover:bg-stone-50 px-6 py-2.5 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab - Fixed with Cancel Button and Status Updates */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-r from-brand-50/30 to-transparent">
                  <h2 className="font-display text-xl font-semibold text-stone-800">My Orders</h2>
                  <p className="text-sm text-stone-500 mt-0.5">Track and manage your orders</p>
                </div>

                <div className="p-6">
                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm text-stone-500 mt-3">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-stone-500">No orders yet</p>
                      <button
                        onClick={() => navigate("/products")}
                        className="mt-4 text-sm bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...orders].reverse().map((order, index) => {
                        // ✅ User can cancel only if status is PLACED or PACKED
                        const canCancel = order.status === "PLACED" || order.status === "PACKED";
                        
                        return (
                          <div key={order.id} className="rounded-xl border border-stone-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex flex-wrap justify-between items-center gap-3">
                              <div>
                                <p className="text-sm font-semibold text-stone-800">Order #{orders.length - index}</p>
                                <p className="text-xs text-stone-400">{formatDate(order.orderDate)}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status || "PLACED"}
                                </span>
                                {/* ✅ Cancel Button - Only for PLACED or PACKED orders */}
                                {canCancel && (
                                  <button
                                    onClick={() => cancelOrder(order.id)}
                                    disabled={cancelling}
                                    className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                                  >
                                    {cancelling ? "Cancelling..." : "Cancel"}
                                  </button>
                                )}
                                <span className="text-sm font-bold text-stone-800">₹{order.totalAmount?.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Shipping Address */}
                            {order.shippingStreet && (
                              <div className="px-4 py-2 text-xs text-stone-500 border-b border-stone-100 bg-stone-50/30">
                                📍 Delivery: {order.shippingStreet}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                              </div>
                            )}

                            {/* Order Items */}
                            <div className="divide-y divide-stone-100">
                              {(order.items || []).map(item => {
                                const product = products[item.productId];
                                const imageUrl = product?.fullImageUrl || product?.imageUrl;
                                const itemStatus = item.status || "PLACED";
                                
                                return (
                                  <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
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
                                      <p className="text-sm font-medium text-stone-800">{product?.name || `Product #${item.productId}`}</p>
                                      <p className="text-xs text-stone-400">Qty: {item.quantity} × ₹{item.price}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-stone-700">₹{item.price * item.quantity}</p>
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${
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
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}