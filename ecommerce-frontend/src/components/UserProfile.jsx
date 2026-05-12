import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function UserProfile({ onClose }) {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

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
    } catch (err) {
      console.error("Error fetching orders:", err);
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
        
        if (response.status === 200) {
            toast.success("Password changed successfully!");
            setFormData(prev => ({
    ...prev,
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
}));
        }
    } catch (err) {
        console.error("Password change error:", err);
        const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to change password";
        toast.error(errorMsg);
    } finally { 
        setLoading(false); 
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

  const cancelOrder = async (orderId) => {
  if (!window.confirm("Are you sure you want to cancel this order?")) return;
  try {
    await API.put(`/orders/${orderId}/cancel`);
    toast.success("Order cancelled successfully!");
    fetchOrders(); // Refresh orders list
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to cancel order");
  }
};

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl animate-fade-up overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header with gradient */}
        <div className="relative h-24 bg-gradient-to-r from-brand-500 to-purple-600">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Avatar */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-xl border-4 border-white"
              style={{ background: 'linear-gradient(135deg, var(--brand), #7c3aed)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 px-6 pb-6">
          {/* User Name */}
          <div className="text-center mb-6">
            <h2 className="font-display font-bold text-xl text-primary">{user?.name}</h2>
            <p className="text-sm text-muted">{user?.email}</p>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-2 ${
              user?.role === "MERCHANT" ? "bg-violet-100 text-violet-700" : "bg-brand-100 text-brand-700"
            }`}>
              {user?.role === "MERCHANT" ? "Merchant Account" : "Customer Account"}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-stone-200">
            <button
              onClick={() => { setActiveTab("profile"); setIsEditing(false); }}
              className={`pb-2 px-4 text-sm font-medium transition-colors -mb-px ${
                activeTab === "profile" 
                  ? "border-b-2 border-brand-500 text-brand-600" 
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => { setActiveTab("orders"); setIsEditing(false); }}
              className={`pb-2 px-4 text-sm font-medium transition-colors -mb-px ${
                activeTab === "orders" 
                  ? "border-b-2 border-brand-500 text-brand-600" 
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              My Orders ({orders.length})
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                      <p className="text-xs text-muted mb-1">Full Name</p>
                      <p className="font-medium text-primary">{user?.name}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                      <p className="text-xs text-muted mb-1">Email Address</p>
                      <p className="font-medium text-primary">{user?.email}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                      <p className="text-xs text-muted mb-1">Member Since</p>
                      <p className="font-medium text-primary">April 2026</p>
                    </div>
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                      <p className="text-xs text-muted mb-1">Account Status</p>
                      <p className="font-medium text-green-600">Active ✓</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="btn-brand w-full py-3 rounded-xl text-sm font-semibold">
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-base w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-base w-full" />
                  </div>

                  <div className="border-t border-stone-200 pt-4 mt-2">
                    <p className="text-sm font-medium text-stone-700 mb-3">Change Password</p>
                    <div className="space-y-3">
                      <input type="password" name="currentPassword" placeholder="Current Password" value={formData.currentPassword} onChange={handleChange} className="input-base w-full" />
                      <input type="password" name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleChange} className="input-base w-full" />
                      <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={formData.confirmPassword} onChange={handleChange} className="input-base w-full" />
                    </div>
                    {formData.currentPassword && (
                      <button onClick={changePassword} disabled={loading} className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium">
                        Update Password
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={updateProfile} disabled={loading} className="btn-brand flex-1 py-2.5 rounded-xl text-sm font-semibold">
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="border border-stone-300 text-stone-600 hover:bg-stone-50 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-muted mt-2">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted">No orders yet</p>
                  <button onClick={() => { onClose(); window.location.href = "/products"; }} className="text-xs text-brand-500 mt-2 hover:text-brand-600">
                    Start Shopping →
                  </button>
                </div>
              ) : (
                orders.slice().reverse().map((order, index) => (
                  <div key={order.id} className="rounded-xl border border-stone-100 p-4 hover:shadow-md transition-shadow" style={{ background: 'var(--bg-raised)' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-semibold text-primary">Order #{orders.length - index}</p>
                        <p className="text-xs text-muted">{formatDate(order.orderDate)}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status || "PLACED"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(order.items || []).slice(0, 2).map(item => (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span className="text-muted">Product #{item.productId}</span>
                          <span className="text-secondary">Qty: {item.quantity} × ₹{item.price}</span>
                        </div>
                      ))}
                      {(order.items || []).length > 2 && (
                        <p className="text-xs text-muted">+{order.items.length - 2} more items</p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between">
                      <span className="text-xs text-muted">Total Amount</span>
                      <span className="text-sm font-bold text-primary">₹{order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}