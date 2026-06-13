// shared/store.js
// This is the shared memory for all apps
// Every app reads and writes here

const store = {
  // Orders placed on Swiggy
  orders: [],

  // Rides booked on Uber
  rides: [],

  // Messages sent on WhatsApp
  messages: [],

  // Contacts list for WhatsApp
  contacts: [
    { id: 1, name: "Mum", phone: "+91 98765 43210" },
    { id: 2, name: "Dad", phone: "+91 98765 43211" },
    { id: 3, name: "Friend Rahul", phone: "+91 98765 43212" },
    { id: 4, name: "Friend Priya", phone: "+91 98765 43213" },
    { id: 5, name: "Office", phone: "+91 98765 43214" }
  ],

  // Swiggy menu data
  menu: [
    // Biryani
    { id: 1, name: "Chicken Biryani", price: 280, category: "Biryani", restaurant: "Paradise", emoji: "🍗", time: "30 mins" },
    { id: 2, name: "Mutton Biryani", price: 350, category: "Biryani", restaurant: "Paradise", emoji: "🍖", time: "35 mins" },
    { id: 3, name: "Veg Biryani", price: 200, category: "Biryani", restaurant: "Paradise", emoji: "🥗", time: "25 mins" },

    // Pizza
    { id: 4, name: "Margherita Pizza", price: 250, category: "Pizza", restaurant: "Dominos", emoji: "🍕", time: "25 mins" },
    { id: 5, name: "Pepperoni Pizza", price: 320, category: "Pizza", restaurant: "Dominos", emoji: "🍕", time: "30 mins" },
    { id: 6, name: "BBQ Chicken Pizza", price: 350, category: "Pizza", restaurant: "Dominos", emoji: "🍕", time: "30 mins" },

    // Burger
    { id: 7, name: "Veg Burger", price: 120, category: "Burger", restaurant: "McDonalds", emoji: "🍔", time: "20 mins" },
    { id: 8, name: "Chicken Burger", price: 150, category: "Burger", restaurant: "McDonalds", emoji: "🍔", time: "20 mins" },
    { id: 9, name: "Zinger Burger", price: 180, category: "Burger", restaurant: "KFC", emoji: "🍔", time: "20 mins" },

    // Dosa
    { id: 10, name: "Masala Dosa", price: 80, category: "South Indian", restaurant: "Saravana Bhavan", emoji: "🫓", time: "15 mins" },
    { id: 11, name: "Rava Dosa", price: 90, category: "South Indian", restaurant: "Saravana Bhavan", emoji: "🫓", time: "15 mins" },
    { id: 12, name: "Idli Sambar", price: 60, category: "South Indian", restaurant: "Saravana Bhavan", emoji: "🍱", time: "10 mins" },

    // Drinks
    { id: 13, name: "Mango Lassi", price: 80, category: "Drinks", restaurant: "Paradise", emoji: "🥤", time: "10 mins" },
    { id: 14, name: "Cold Coffee", price: 100, category: "Drinks", restaurant: "CCD", emoji: "☕", time: "10 mins" },
    { id: 15, name: "Fresh Lime Soda", price: 60, category: "Drinks", restaurant: "Saravana Bhavan", emoji: "🍋", time: "5 mins" }
  ],

  // Uber locations
  locations: [
    "Home",
    "Office",
    "Airport",
    "Railway Station",
    "Bus Stand",
    "Hospital",
    "Mall",
    "Beach"
  ],

  // Helper: add a new order
  addOrder(order) {
    const newOrder = {
      id: Date.now(),
      ...order,
      status: "Confirmed",
      time: new Date().toLocaleTimeString()
    };
    this.orders.unshift(newOrder);
    this.save();
    return newOrder;
  },

  // Helper: add a new ride
  addRide(ride) {
    const newRide = {
      id: Date.now(),
      ...ride,
      status: "Booked",
      time: new Date().toLocaleTimeString()
    };
    this.rides.unshift(newRide);
    this.save();
    return newRide;
  },

  // Helper: add a new message
  addMessage(message) {
    const newMessage = {
      id: Date.now(),
      ...message,
      time: new Date().toLocaleTimeString(),
      status: "Sent"
    };
    this.messages.unshift(newMessage);
    this.save();
    return newMessage;
  },

  // Save to localStorage so data stays even after refresh
  save() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
    localStorage.setItem('rides', JSON.stringify(this.rides));
    localStorage.setItem('messages', JSON.stringify(this.messages));
  },

  // Load from localStorage when page opens
  load() {
    const orders = localStorage.getItem('orders');
    const rides = localStorage.getItem('rides');
    const messages = localStorage.getItem('messages');
    if (orders) this.orders = JSON.parse(orders);
    if (rides) this.rides = JSON.parse(rides);
    if (messages) this.messages = JSON.parse(messages);
  }
};

// Load saved data when this file loads
store.load();