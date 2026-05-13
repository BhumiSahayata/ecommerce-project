
import API from "../api/axios";


class NotificationService {
  
  
  static async requestPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }
    
    if (Notification.permission === "granted") {
      console.log("Notification permission already granted");
      return true;
    }
    
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted");
        return true;
      }
    }
    return false;
  }
  
  
  static showNotification(title, body, icon = null) {
    if (Notification.permission === "granted") {
      const options = {
        body: body,
        icon: icon || "/favicon.ico",
        badge: "/favicon.ico",
        silent: false,
        vibrate: [200, 100, 200]
      };
      
      const notification = new Notification(title, options);
      
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
      };
      
      return notification;
    }
  }
  
  
  static notifyOrderPlaced(orderId, amount) {
    return this.showNotification(
      "🎉 Order Placed Successfully!",
      `Your order #${orderId} of ₹${amount} has been placed. You will be notified when it ships.`
    );
  }
  
 
  static notifyOrderStatusUpdate(orderId, status) {
    const messages = {
      "PLACED": "Your order has been placed and is being processed.",
      "PACKED": "Your order has been packed and is ready for shipping.",
      "SHIPPED": "Your order is on the way! Track your delivery.",
      "DELIVERED": "Your order has been delivered! Enjoy your purchase.",
      "CANCELLED": "Your order has been cancelled."
    };
    
    const statusIcons = {
      "PLACED": "📦",
      "PACKED": "📋",
      "SHIPPED": "🚚",
      "DELIVERED": "✅",
      "CANCELLED": "❌"
    };
    
    return this.showNotification(
      `${statusIcons[status]} Order #${orderId} Updated`,
      messages[status] || `Order status updated to ${status}`
    );
  }
  
 
  static notifyLowStock(productName, stockLeft) {
    return this.showNotification(
      "⚠️ Low Stock Alert",
      `${productName} has only ${stockLeft} items left in stock!`
    );
  }
  
  static notifyWelcome(userName) {
    return this.showNotification(
      "👋 Welcome to ShopEase!",
      `Hey ${userName}! Start shopping and get exclusive deals.`
    );
  }
}

export default NotificationService;