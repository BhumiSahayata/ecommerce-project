import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import AddressAutocomplete from "../components/AddressAutocomplete";
import NotificationService from "../services/NotificationService";
import { BACKEND_URL } from "../constants";
import { getImageUrl } from "../utils/imageUtils";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India"
  });
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await API.get("/cart");
      setCart(res.data);
      
      if (res.data?.items?.length > 0) {
        const productMap = {};
        for (const item of res.data.items) {
          try {
            const pRes = await API.get(`/products/${item.productId}`);
            if (pRes.data) {
              // Fix image URL using getImageUrl
              if (pRes.data.imageUrl) {
                pRes.data.fullImageUrl = getImageUrl(pRes.data.imageUrl);
              } else {
                pRes.data.fullImageUrl = pRes.data.imageUrl;
              }
              productMap[item.productId] = pRes.data;
            }
          } catch (err) {
            console.error("Error fetching product:", item.productId, err);
          }
        }
        setProducts(productMap);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCart(); 
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }
    
    try {
      const product = products[productId];
      if (product && product.stockQuantity < newQuantity) {
        toast.error(`Only ${product.stockQuantity} items available in stock!`);
        return;
      }
      
      const cartRes = await API.get("/cart");
      const currentCart = cartRes.data;
      const currentItem = currentCart.items.find(item => item.productId === productId);
      
      if (currentItem) {
        const difference = newQuantity - currentItem.quantity;
        if (difference > 0) {
          await API.post(`/cart/add?productId=${productId}&quantity=${difference}`);
        } else if (difference < 0) {
          await API.delete(`/cart/remove?productId=${productId}`);
          if (newQuantity > 0) {
            await API.post(`/cart/add?productId=${productId}&quantity=${newQuantity}`);
          }
        }
        toast.success("Cart updated!");
        fetchCart();
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error(err.response?.data?.error || "Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      await API.delete(`/cart/remove?productId=${productId}`);
      toast.success("Removed from cart");
      fetchCart();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode) {
      toast.error("Please fill all address fields");
      return;
    }
    
    setPlacing(true);
    try {
      const response = await API.post("/orders/place", address);
      toast.success("Order placed successfully! 🎉");
      
      NotificationService.notifyOrderPlaced(response.data.id, response.data.totalAmount);
      
      setShowAddressModal(false);
      setTimeout(() => {
        navigate("/orders");
      }, 1500);
    } catch (err) {
      console.error("Order error:", err);
      toast.error(err.response?.data?.error || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => {
    const price = products[item.productId]?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 flex gap-4 border border-stone-100">
              <div className="w-20 h-20 bg-stone-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-stone-200 rounded w-1/2" />
                <div className="h-3 bg-stone-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-4xl font-bold text-stone-900 mb-8">Your Cart</h1>
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-12 h-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-stone-700 text-xl">Your cart is empty</h3>
          <p className="text-stone-400 mt-2 mb-6">Add some products to get started</p>
          <button onClick={() => navigate("/products")} className="bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-4xl font-bold text-stone-900 mb-8">Your Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = products[item.productId];
            const imageUrl = product?.fullImageUrl || product?.imageUrl;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-stone-100 p-4 flex gap-4 hover:border-stone-200 transition-colors">
                {/* Product Image - Clickable */}
                <Link to={`/product/${item.productId}`} className="block w-20 h-20 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={product?.name || "Product"} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Product Details - Clickable */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.productId}`}>
                    <h3 className="font-semibold text-stone-900 text-sm truncate hover:text-brand-600 transition-colors">
                      {product?.name || `Product #${item.productId}`}
                    </h3>
                  </Link>
                  <p className="text-stone-400 text-xs mt-0.5">{product?.category || "General"}</p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Qty:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="bg-stone-100 px-3 py-0.5 rounded-lg text-sm font-semibold text-stone-700 min-w-[45px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="font-display font-bold text-stone-900">
                      ₹{((product?.price || 0) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  
                  {product?.stockQuantity !== undefined && product.stockQuantity > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      {product.stockQuantity} left in stock
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="self-start p-1.5 text-stone-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-24">
            <h2 className="font-display font-bold text-stone-900 text-lg mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Payment</span>
                <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">Cash on Delivery</span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 mb-5">
              <div className="flex justify-between font-display font-bold text-stone-900 text-xl">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setShowAddressModal(true)}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="font-display font-bold text-stone-900 text-xl mb-4">Shipping Address</h2>
            
            <AddressAutocomplete address={address} setAddress={setAddress} />

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {placing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Place Order"
                )}
              </button>
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 border border-stone-200 text-stone-600 font-semibold py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}