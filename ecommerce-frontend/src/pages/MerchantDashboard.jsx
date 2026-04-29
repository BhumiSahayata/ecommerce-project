import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";

const EMPTY_FORM = { 
  name: "", description: "", price: "", category: "", imageFile: null, rating: "", stockQuantity: ""
};

const STATUS_OPTIONS = ["PLACED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_STYLES = {
  PLACED: "bg-blue-100 text-blue-700",
  PACKED: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function MerchantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get("tab");
    const validTabs = ["dashboard", "add-product", "products", "orders", "feedback"];
    return validTabs.includes(tabFromUrl) ? tabFromUrl : "dashboard";
  });
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    averageRating: 0
  });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    navigate(`/merchant?tab=${tabId}`, { replace: true });
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products/my");
      setProducts(res.data);
      return res.data;
    } catch { toast.error("Failed to load products"); return []; }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/merchant");
      setOrders(res.data);
      return res.data;
    } catch { return []; }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get("/reviews/merchant");
      setReviews(res.data);
      return res.data;
    } catch { return []; }
  };

  const calculateStats = async () => {
    const productsData = await fetchProducts();
    const ordersData = await fetchOrders();
    const reviewsData = await fetchReviews();
    
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const pendingOrders = ordersData.filter(o => 
      o.items?.some(item => item.status !== "DELIVERED" && item.status !== "CANCELLED")
    ).length;
    const lowStock = productsData.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length;
    const avgRating = reviewsData.length > 0 
      ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1)
      : 0;
    
    setStats({
      totalOrders: ordersData.length,
      totalRevenue,
      totalProducts: productsData.length,
      lowStockProducts: lowStock,
      pendingOrders,
      averageRating: avgRating
    });
  };

  useEffect(() => {
    calculateStats();
  }, []);

  const fetchProductSuggestions = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setProductSuggestions([]);
      return;
    }
    try {
      const res = await API.get("/products/all");
      const suggestions = res.data
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5);
      setProductSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (err) { console.error("Error fetching suggestions:", err); }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) setForm({ ...form, imageFile: file });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price required");
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description || "");
      data.append("price", form.price);
      data.append("category", form.category || "");
      data.append("rating", form.rating || 0);
      data.append("stockQuantity", form.stockQuantity || 0);
      if (form.imageFile) data.append("image", form.imageFile);

      if (editId) {
        await API.put(`/products/${editId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Product updated!");
      } else {
        await API.post("/products/add", data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Product added!");
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      calculateStats();
      handleTabChange("products");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving product");
    } finally { setLoading(false); }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      rating: product.rating?.toString() || "",
      stockQuantity: product.stockQuantity?.toString() || "0",
      imageFile: null,
    });
    setEditId(product.id);
    setShowForm(true);
    handleTabChange("add-product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success("Product deleted");
      calculateStats();
    } catch { toast.error("Failed to delete"); }
  };

  const updateOrderItemStatus = async (orderItemId, status) => {
    try {
      await API.put(`/orders/item/${orderItemId}/status?status=${status}`);
      toast.success("Order status updated!");
      calculateStats();
    } catch { toast.error("Failed to update status"); }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", description: "Overview" },
    { id: "add-product", label: "Add Product", icon: "➕", description: "Add new product" },
    { id: "products", label: "Products", icon: "📦", description: "Manage products" },
    { id: "orders", label: "Orders", icon: "🛒", description: "Customer orders" },
    { id: "feedback", label: "Reviews", icon: "⭐", description: "Customer reviews" },
  ];

  return (
    <div className="flex flex-col md:flex-row bg-stone-50 min-h-screen">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-brand-500 text-white shadow-lg flex items-center justify-center"
      >
        <span className="text-xl">{mobileMenuOpen ? "✕" : "☰"}</span>
      </button>

      {/* Sidebar */}
      <aside className={`${mobileMenuOpen ? "fixed inset-0 z-40 w-64" : "hidden md:block"} md:relative md:w-60 bg-white border-r border-stone-200 h-full overflow-y-auto`}>
        <div className="p-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-bold text-stone-800 text-sm">ShopEase</h2>
              <p className="text-[10px] text-stone-400">Merchant Panel</p>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-stone-100 bg-stone-50/30">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 text-sm">{user?.name}</h3>
              <p className="text-[10px] text-stone-400 truncate max-w-[120px]">{user?.email}</p>
              <span className="inline-block text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full mt-0.5">Merchant</span>
            </div>
          </div>
        </div>

        <nav className="p-2 space-y-0.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                activeTab === item.id
                  ? "bg-brand-50 text-brand-600 border-l-3 border-brand-500"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-medium">{item.label}</p>
                <p className="text-[9px] text-stone-400">{item.description}</p>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-stone-100 mt-2">
          <div className="bg-stone-50 rounded-lg p-2">
            <p className="text-[9px] text-stone-500 mb-1">Quick Stats</p>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between"><span className="text-stone-600">Products</span><span className="font-semibold">{stats.totalProducts}</span></div>
              <div className="flex justify-between"><span className="text-stone-600">Orders</span><span className="font-semibold">{stats.totalOrders}</span></div>
              <div className="flex justify-between"><span className="text-stone-600">Revenue</span><span className="font-semibold text-green-600">₹{stats.totalRevenue.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 w-full">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div>
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-stone-900">Dashboard</h1>
              <p className="text-stone-500 text-sm">Welcome back, {user?.name}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div onClick={() => handleTabChange("products")} className="bg-white rounded-xl border p-3 cursor-pointer hover:shadow-md">
                <div className="flex justify-between items-center"><div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><span>📦</span></div><span className="text-xl font-bold">{stats.totalProducts}</span></div>
                <p className="text-xs mt-1">Products</p>
              </div>
              <div onClick={() => handleTabChange("orders")} className="bg-white rounded-xl border p-3 cursor-pointer hover:shadow-md">
                <div className="flex justify-between items-center"><div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"><span>🛒</span></div><span className="text-xl font-bold">{stats.totalOrders}</span></div>
                <p className="text-xs mt-1">Orders</p>
              </div>
              <div onClick={() => handleTabChange("orders")} className="bg-white rounded-xl border p-3 cursor-pointer hover:shadow-md">
                <div className="flex justify-between items-center"><div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><span>⏳</span></div><span className="text-xl font-bold text-amber-600">{stats.pendingOrders}</span></div>
                <p className="text-xs mt-1">Pending</p>
              </div>
              <div onClick={() => handleTabChange("products")} className="bg-white rounded-xl border p-3 cursor-pointer hover:shadow-md">
                <div className="flex justify-between items-center"><div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center"><span>⚠️</span></div><span className="text-xl font-bold text-red-600">{stats.lowStockProducts}</span></div>
                <p className="text-xs mt-1">Low Stock</p>
              </div>
              <div onClick={() => handleTabChange("feedback")} className="bg-white rounded-xl border p-3 cursor-pointer hover:shadow-md">
                <div className="flex justify-between items-center"><div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><span>⭐</span></div><span className="text-xl font-bold">{stats.averageRating}</span></div>
                <p className="text-xs mt-1">Rating</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border p-4"><h3 className="font-semibold mb-2">Revenue</h3><div className="text-3xl font-bold text-brand-600">₹{stats.totalRevenue.toLocaleString()}</div></div>
              <div className="bg-white rounded-xl border p-4"><h3 className="font-semibold mb-2">Quick Actions</h3><button onClick={() => handleTabChange("add-product")} className="w-full bg-brand-50 text-brand-600 p-2 rounded-lg text-sm">+ Add Product</button></div>
            </div>
          </div>
        )}

        {activeTab === "add-product" && (
  <div>
    <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">
      {editId ? "Edit Product" : "Add New Product"}
    </h1>
    <p className="text-stone-500 text-sm mb-5">
      {editId ? "Update your product details" : "Fill in the details to add a new product to your store"}
    </p>
    
    <div className="bg-white rounded-xl border border-stone-200 p-5 max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Product Name *</label>
          <input 
            type="text" 
            placeholder="e.g. Nike Air Max, iPhone 15 Pro, Cotton T-Shirt" 
            value={form.name} 
            onChange={(e) => setForm({...form, name: e.target.value})} 
            className="input-base w-full" 
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Price (₹) *</label>
            <input 
              type="number" 
              placeholder="e.g. 2999" 
              value={form.price} 
              onChange={(e) => setForm({...form, price: e.target.value})} 
              className="input-base w-full" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
            <input 
              type="text" 
              placeholder="e.g. Electronics, Fashion, Home" 
              value={form.category} 
              onChange={(e) => setForm({...form, category: e.target.value})} 
              className="input-base w-full" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Rating (0-5)</label>
            <input 
              type="number" 
              step="0.1" 
              placeholder="e.g. 4.5" 
              value={form.rating} 
              onChange={(e) => setForm({...form, rating: e.target.value})} 
              className="input-base w-full" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Stock Quantity</label>
            <input 
              type="number" 
              placeholder="e.g. 100" 
              value={form.stockQuantity} 
              onChange={(e) => setForm({...form, stockQuantity: e.target.value})} 
              className="input-base w-full" 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Product Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageSelect} 
            className="w-full text-sm text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" 
          />
          {form.imageFile && <p className="text-xs text-green-600 mt-1">✅ Selected: {form.imageFile.name}</p>}
          {editId && !form.imageFile && <p className="text-xs text-stone-400 mt-1">Current image will be kept if you don't upload a new one</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
          <textarea 
            rows="4" 
            placeholder="Describe your product... Features, benefits, specifications, etc." 
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})} 
            className="input-base w-full resize-none" 
          />
        </div>
        
        <div className="flex gap-3 pt-3">
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Saving..." : (editId ? "Update Product" : "Add Product")}
          </button>
          <button 
            onClick={() => {setForm(EMPTY_FORM); setEditId(null); setShowForm(false);}} 
            className="border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Products List */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-4"><h1 className="font-display text-2xl font-bold">Products ({products.length})</h1><button onClick={() => handleTabChange("add-product")} className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm">+ Add</button></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-xl border overflow-hidden">
                  <img src={getImageUrl(p.imageUrl) || "/placeholder.png"} alt={p.name} className="w-full h-32 object-cover" onError={(e) => e.target.src="/placeholder.png"} />
                  <div className="p-2"><p className="font-semibold text-sm truncate">{p.name}</p><p className="text-brand-600 font-bold">₹{p.price}</p><div className="flex gap-1 mt-1"><button onClick={() => handleEdit(p)} className="text-xs bg-stone-100 px-2 py-1 rounded">Edit</button><button onClick={() => handleDelete(p.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">Delete</button></div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div>
            <h1 className="font-display text-2xl font-bold mb-4">Orders ({orders.length})</h1>
            <div className="space-y-3">
              {orders.length === 0 ? <div className="text-center py-10 text-stone-400">No orders yet</div> : orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
                  <div className="p-3 bg-stone-50 border-b flex justify-between flex-wrap"><div><span className="font-bold">Order #{order.id}</span><p className="text-xs text-stone-400">{order.user?.name} • {new Date(order.orderDate).toLocaleDateString()}</p></div><div><span className="font-bold">₹{order.totalAmount}</span></div></div>
                  {order.shippingStreet && <div className="p-2 text-xs text-stone-500 border-b">📍 {order.shippingStreet}, {order.shippingCity}</div>}
                  <div className="p-3 space-y-2">
                    {(order.items || []).map(item => {
                      const product = products.find(p => p.id === item.productId);
                      return (<div key={item.id} className="flex justify-between items-center"><div className="flex items-center gap-2"><img src={getImageUrl(product?.imageUrl)} className="w-8 h-8 rounded object-cover" /><span className="text-sm">{product?.name || `Product #${item.productId}`}</span><span className="text-xs text-stone-400">x{item.quantity}</span></div><div className="flex items-center gap-2"><span className="text-sm font-semibold">₹{item.price * item.quantity}</span><select value={item.status} onChange={(e) => updateOrderItemStatus(item.id, e.target.value)} className="text-xs border rounded px-1 py-0.5"><option>PLACED</option><option>PACKED</option><option>SHIPPED</option><option>DELIVERED</option></select></div></div>);
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {activeTab === "feedback" && (
          <div>
            <h1 className="font-display text-2xl font-bold mb-4">Customer Reviews</h1>
            <div className="space-y-3">
              {reviews.length === 0 ? <div className="text-center py-10 text-stone-400">No reviews yet</div> : reviews.map(r => (
                <div key={r.id} className="bg-white rounded-xl border p-3"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center"><span>{r.userName?.charAt(0)}</span></div><div><p className="font-medium">{r.userName}</p><div className="flex items-center gap-1">{[...Array(5)].map((_,i) => <span key={i} className={i < r.rating ? "text-amber-400" : "text-stone-300"}>★</span>)}</div></div><div className="text-xs text-stone-400 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</div></div><p className="text-sm mt-2">{r.comment}</p></div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}