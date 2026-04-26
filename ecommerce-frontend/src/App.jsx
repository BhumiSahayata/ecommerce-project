import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import MerchantDashboard from "./pages/MerchantDashboard";
import NotificationService from "./services/NotificationService";
import { useEffect } from "react";

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/products" replace />;
  return children;
}

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      setTimeout(() => NotificationService.requestPermission(), 2000);
    }
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        <span className="text-muted font-body text-sm">Loading ShopEase...</span>
      </div>
    </div>
  );

  // Only show footer on home page
  const showFooter = location.pathname === "/";

  return (
    <div className="min-h-screen bg-page font-body flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<ProtectedRoute role="USER"><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute role="USER"><Orders /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute role="USER"><Wishlist /></ProtectedRoute>} />
          <Route path="/merchant" element={<ProtectedRoute role="MERCHANT"><MerchantDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;