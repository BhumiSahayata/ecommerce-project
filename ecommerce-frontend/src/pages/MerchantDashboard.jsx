import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

// ✅ UPDATED: Added stockQuantity to EMPTY_FORM
const EMPTY_FORM = { 
  name: "", 
  description: "", 
  price: "", 
  category: "", 
  imageFile: null, 
  rating: "",
  stockQuantity: ""  // ✅ ADD THIS
};

const STATUS_OPTIONS = ["PLACED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_STYLES = {
  PLACED:    "bg-blue-100 text-blue-700",
  PACKED:    "bg-amber-100 text-amber-700",
  SHIPPED:   "bg-violet-100 text-violet-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function MerchantDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState({});
  
  // ✅ Product Suggestions State
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products/my");
      setProducts(res.data);
      const map = {};
      res.data.forEach(p => { map[p.id] = p; });
      setAllProducts(map);
    } catch { toast.error("Failed to load products"); }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/merchant");
      setOrders(res.data);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // ✅ Product Suggestions Function
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
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Image selected:", file.name, "Size:", file.size);
      setForm({ ...form, imageFile: file });
    }
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

      if (form.imageFile) {
        console.log("Uploading image:", form.imageFile.name);
        data.append("image", form.imageFile);
      } else {
        console.log("No image selected");
      }

      let response;
      if (editId) {
        response = await API.put(`/products/${editId}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Product updated!");
      } else {
        response = await API.post("/products/add", data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Product added!");
      }

      console.log("Product saved:", response.data);
      
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      fetchProducts();
      
    } catch (err) {
      console.error("Error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Error saving product";
      toast.error(errorMsg);
    }

    setLoading(false);
  };

  const handleEdit = (product) => {
  setForm({
    name: product.name || "",
    description: product.description || "",
    price: product.price?.toString() || "",
    category: product.category || "",
    rating: product.rating?.toString() || "",
    stockQuantity: product.stockQuantity?.toString() || "",
    imageFile: null,
  });
  setEditId(product.id);
  setShowForm(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleDelete = async (id) => {
  if (!window.confirm("Delete this product?")) return;
  try {
    await API.delete(`/products/${id}`);
    toast.success("Product deleted");
    fetchProducts();
  } catch { toast.error("Failed to delete"); }
};

  const updateOrderStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status?status=${status}`);
      toast.success("Order status updated!");
      fetchOrders();
    } catch { toast.error("Failed to update order status"); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-stone-900">Merchant Dashboard</h1>
          <p className="text-stone-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-center">
            <p className="font-display font-bold text-2xl text-stone-900">{products.length}</p>
            <p className="text-xs text-stone-400">Products</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-stone-200">
        {["products", "orders"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-4 text-sm font-semibold capitalize border-b-2 transition-colors -mb-px ${
              tab === t ? "border-brand-500 text-brand-600" : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <div>
          <div className="mb-6">
            <button
              onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM); setEditId(null); setProductSuggestions([]); setShowSuggestions(false); }}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
              </svg>
              {showForm ? "Cancel" : "Add New Product"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6 animate-slide-up">
              <h2 className="font-display font-bold text-stone-900 text-xl mb-5">
                {editId ? "Edit Product" : "Add New Product"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* ✅ Product Name with Suggestions */}
                <div className="sm:col-span-2 relative">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Nike Air Max"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      fetchProductSuggestions(e.target.value);
                    }}
                    onFocus={() => form.name && fetchProductSuggestions(form.name)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                  />
                  
                  {/* ✅ Suggestions Dropdown */}
                  {showSuggestions && productSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-stone-200 rounded-xl mt-1 shadow-lg max-h-60 overflow-auto">
                      <div className="px-3 py-2 text-xs text-stone-500 border-b border-stone-100 bg-stone-50">
                        💡 Similar products ({productSuggestions.length})
                      </div>
                      {productSuggestions.map(suggestion => (
                        <div
                          key={suggestion.id}
                          className="px-3 py-2 hover:bg-stone-50 cursor-pointer flex items-center justify-between transition-colors"
                          onClick={() => {
                            setForm({ 
                              ...form, 
                              name: suggestion.name,
                              category: suggestion.category || form.category,
                              price: suggestion.price?.toString() || form.price,
                              description: suggestion.description || form.description
                            });
                            setShowSuggestions(false);
                            toast.success(`Filled from: ${suggestion.name}`);
                          }}
                        >
                          <div>
                            <div className="text-sm font-medium text-stone-800">{suggestion.name}</div>
                            <div className="text-xs text-stone-400">{suggestion.category || "No category"}</div>
                          </div>
                          <div className="text-sm font-bold text-stone-700">₹{suggestion.price?.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 2999"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Shoes, Electronics"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Rating (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 4.5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                  />
                </div>
                
                {/* Stock Quantity Field */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Stock Quantity *</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={form.stockQuantity || ""}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full"
                  />
                  {form.imageFile && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Selected: {form.imageFile.name}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Product description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  {editId ? "Update Product" : "Add Product"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setEditId(null); setProductSuggestions([]); setShowSuggestions(false); }}
                  className="text-stone-500 hover:text-stone-700 font-medium px-4 py-2.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
              <p className="text-stone-500">No products yet. Add your first product!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-stone-200 hover:shadow-md transition-all group">
                  <div className="aspect-square bg-stone-100 overflow-hidden relative">
                    {product.imageUrl ? (
                      <img 
                        src={`http://localhost:8080${product.imageUrl}`} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.log("Image failed to load:", product.imageUrl);
                          e.target.style.display = 'none';
                          if (e.target.parentElement) {
                            const fallback = e.target.parentElement.querySelector('.fallback-image');
                            if (fallback) fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="fallback-image w-full h-full flex items-center justify-center" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                      <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                    {product.category && (
                      <span className="absolute top-2 left-2 bg-white/90 text-stone-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-stone-900 text-sm line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-xs text-stone-400 line-clamp-2 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display font-bold text-stone-900 text-lg">₹{product.price?.toLocaleString()}</span>
                      {product.rating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-500">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {product.rating}
                        </span>
                      )}
                    </div>
                    
                    {/* Stock Status Display */}
                    <div className="mb-3">
                      {product.stockQuantity > 0 ? (
                        <span className="text-xs text-green-600">
                          ✅ In Stock ({product.stockQuantity} left)
                        </span>
                      ) : (
                        <span className="text-xs text-red-500">
                          ❌ Out of Stock
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-2 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {/* ORDERS TAB */}
{tab === "orders" && (
  <div>
    {orders.length === 0 ? (
      <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-stone-500">No orders yet for your products.</p>
        <p className="text-stone-400 text-sm mt-1">
          {products.length === 0 
            ? "Start by adding products. Orders will appear here when customers purchase them."
            : "Orders will appear here once customers purchase your products."}
        </p>
        {products.length === 0 && (
          <button
            onClick={() => setTab("products")}
            className="mt-4 text-sm bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Add Your First Product
          </button>
        )}
      </div>
    ) : (
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50">
              <div>
                <span className="font-display font-bold text-stone-900">Order #{order.id}</span>
                <p className="text-stone-400 text-xs mt-0.5">
                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                </p>
                {/* Show customer name */}
                <p className="text-xs text-stone-500 mt-1">
                  Customer: {order.user?.name || "Guest"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-stone-900">₹{order.totalAmount?.toLocaleString()}</span>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400 ${STATUS_STYLES[order.status] || "bg-stone-100 text-stone-700"}`}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="px-5 py-3 space-y-2">
              {/* Show shipping address if available */}
              {order.shippingStreet && (
                <div className="mb-2 pb-2 border-b border-stone-100">
                  <p className="text-xs text-stone-500">
                    📍 Delivery: {order.shippingStreet}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                  </p>
                </div>
              )}
              {(order.items || []).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500">Product #{item.productId}</span>
                    <span className="text-stone-700 font-medium">Qty: {item.quantity}</span>
                  </div>
                  <span className="text-stone-500">₹{item.price?.toLocaleString()} each</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
    </div>
  );
}