// shared/bridge.js
// This is the brain connector
// AI tells bridge what to do, bridge tells the right app

const bridge = {

  // Called when AI wants to order food
  orderFood(details) {
    const { itemName, quantity = 1, instructions = "" } = details;

    // Find the item in menu
    const menuItem = store.menu.find(item =>
      item.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!menuItem) {
      return {
        success: false,
        message: `Sorry, I could not find ${itemName} on the menu.`
      };
    }

    // Place the order
    const order = store.addOrder({
      item: menuItem.name,
      restaurant: menuItem.restaurant,
      price: menuItem.price * quantity,
      quantity: quantity,
      instructions: instructions,
      emoji: menuItem.emoji
    });

    // Tell Swiggy page to refresh if it's open
    localStorage.setItem('swiggy_refresh', Date.now());

    return {
      success: true,
      message: `Order placed! ${quantity}x ${menuItem.name} from ${menuItem.restaurant} for ₹${menuItem.price * quantity}. Estimated time: ${menuItem.time}.`,
      order: order
    };
  },

  // Called when AI wants to book a ride
  bookRide(details) {
    const { from = "Home", to, rideType = "Auto" } = details;

    if (!to) {
      return {
        success: false,
        message: "Please tell me where you want to go."
      };
    }

    // Calculate fake price
    const prices = { Auto: 80, Mini: 120, Sedan: 180, SUV: 250 };
    const price = prices[rideType] || 100;

    const ride = store.addRide({
      from: from,
      to: to,
      rideType: rideType,
      price: price,
      driver: "Ravi Kumar",
      vehicle: "TN 01 AB 1234",
      rating: "4.8"
    });

    // Tell Uber page to refresh if it's open
    localStorage.setItem('uber_refresh', Date.now());

    return {
      success: true,
      message: `Ride booked! ${rideType} from ${from} to ${to}. Driver: Ravi Kumar is on the way. Fare: ₹${price}.`,
      ride: ride
    };
  },

  // Called when AI wants to send a message
  sendMessage(details) {
    const { contactName, messageText } = details;

    // Find contact
    const contact = store.contacts.find(c =>
      c.name.toLowerCase().includes(contactName.toLowerCase())
    );

    if (!contact) {
      return {
        success: false,
        message: `Contact "${contactName}" not found in WhatsApp.`
      };
    }

    const message = store.addMessage({
      to: contact.name,
      phone: contact.phone,
      text: messageText
    });

    // Tell WhatsApp page to refresh if it's open
    localStorage.setItem('whatsapp_refresh', Date.now());

    return {
      success: true,
      message: `Message sent to ${contact.name}: "${messageText}"`,
      message_data: message
    };
  },

  // Search menu items
  searchMenu(query) {
    const results = store.menu.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.restaurant.toLowerCase().includes(query.toLowerCase())
    );
    return results;
  }
};