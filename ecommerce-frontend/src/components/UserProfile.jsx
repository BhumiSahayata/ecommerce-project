import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function UserProfile({ onClose }) {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

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
      await API.put("/auth/change-password", { currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      toast.success("Password changed!");
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-7 animate-fade-up"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isEditing && (
              <button onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
            )}
            <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              {isEditing ? "Edit Profile" : "My Profile"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

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
            {[
              { name: "name", label: "Full Name", type: "text" },
              { name: "email", label: "Email", type: "email" },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                <input type={f.type} name={f.name} value={formData[f.name]} onChange={handleChange} className="input-base" />
              </div>
            ))}

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
      </div>
    </div>
  );
}