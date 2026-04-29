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

  // Fetch orders
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
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally { setLoading(false); }
  };

  const changePassword = async () => {
    if (!formData.currentPassword) { toast.error("Current password required"); return; }
    if (formData.newPassword !== formData.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (formData.newPassword.length < 6) { toast.error("Minimum 6 characters"); return; }
    setLoading(true);
    try {
      await API.put("/auth/change-password", { 
        currentPassword: formData.currentPassword, 
        newPassword: formData.newPassword 
      });
      toast.success("Password changed!");
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally { setLoading(false); }
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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl p-6 animate-fade-up"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {isEditing && (
              <button onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
            )}
            <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              My Account
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-stone-200">
          <button
            onClick={() => { setActiveTab("profile"); setIsEditing(false); }}
            className={`pb-2 px-3 text-sm font-medium transition-colors -mb-px ${
              activeTab === "profile" 
                ? "border-b-2 border-brand-500 text-brand-600" 
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => { setActiveTab("orders"); setIsEditing(false); }}
            className={`pb-2 px-3 text-sm font-medium transition-colors -mb-px ${
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
          <>
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white font-display"
                style={{ background: 'linear-gradient(135deg, var(--brand), #7c3aed)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-3">
                {[
                  { label: "Full Name", value: user?.name },
                  { label: "Email", value: user?.email },
                  { label: "Account Type", value: user?.role },
                ].map(f => (
                  <div key={f.label} className="p-3.5 rounded-xl" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                  </div>
                ))}
                <button onClick={() => setIsEditing(true)} className="btn-brand w-full py-2.5 rounded-xl text-sm font-semibold mt-2">
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-base" />
                </div>

                <div className="border-t pt-4 mt-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Change Password (optional)</p>
                  {["currentPassword", "newPassword", "confirmPassword"].map(f => (
                    <input key={f} type="password" name={f}
                      placeholder={f === "currentPassword" ? "Current password" : f === "newPassword" ? "New password" : "Confirm new password"}
                      value={formData[f]} onChange={handleChange} className="input-base mb-2" />
                  ))}
                  {formData.currentPassword && (
                    <button onClick={changePassword} disabled={loading}
                      className="btn-ghost w-full py-2 rounded-xl text-sm font-medium mt-1">
                      Update Password
                    </button>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={updateProfile} disabled={loading} className="btn-brand flex-1 py-2.5 rounded-xl text-sm font-semibold">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm font-semibold">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="max-h-96 overflow-y-auto">
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
                <button onClick={() => { onClose(); window.location.href = "/products"; }} className="text-xs text-brand-500 mt-2">
                  Start Shopping →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice().reverse().map(order => (
                  <div key={order.id} className="rounded-xl border border-stone-100 p-3" style={{ background: 'var(--bg-raised)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-semibold text-primary">Order #{order.id}</p>
                        <p className="text-[10px] text-muted">{formatDate(order.orderDate)}</p>
                      </div>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status || "PLACED"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {(order.items || []).slice(0, 2).map(item => (
                        <div key={item.id} className="flex justify-between text-[10px]">
                          <span className="text-muted">Product #{item.productId}</span>
                          <span className="text-secondary">Qty: {item.quantity} × ₹{item.price}</span>
                        </div>
                      ))}
                      {(order.items || []).length > 2 && (
                        <p className="text-[9px] text-muted">+{order.items.length - 2} more items</p>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-stone-100 flex justify-between">
                      <span className="text-[10px] text-muted">Total</span>
                      <span className="text-xs font-bold text-primary">₹{order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}