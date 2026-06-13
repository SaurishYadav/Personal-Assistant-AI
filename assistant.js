// assistant.js
// The brain of the entire assistant

const CLAUDE_API_KEY = 'your_claude_api_key_here';

let isListening = false;
let recognition = null;

// ─── Setup Voice Recognition ───────────────────────────────────────────────
function setupVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    document.getElementById('voiceBtn').style.opacity = '0.3';
    document.getElementById('voiceBtn').title = 'Voice not supported in this browser';
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById('userInput').value = transcript;
    document.getElementById('voiceStatus').textContent = '🎤 Heard: "' + transcript + '"';
    setTimeout(() => sendMessage(), 500);
  };

  recognition.onend = function() {
    stopListening();
  };

  recognition.onerror = function(e) {
    stopListening();
    document.getElementById('voiceStatus').textContent = 'Voice error. Try again.';
  };
}

// Toggle voice on/off
function toggleVoice() {
  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
}

function startListening() {
  if (!recognition) return;
  isListening = true;
  recognition.start();
  document.getElementById('voiceBtn').classList.add('listening');
  document.getElementById('voiceBtn').textContent = '🔴';
  document.getElementById('voiceStatus').textContent = '🎤 Listening... speak now';
}

function stopListening() {
  isListening = false;
  if (recognition) recognition.stop();
  document.getElementById('voiceBtn').classList.remove('listening');
  document.getElementById('voiceBtn').textContent = '🎤';
  document.getElementById('voiceStatus').textContent = '';
}

// ─── Handle Enter Key ──────────────────────────────────────────────────────
function handleKey(event) {
  if (event.key === 'Enter') sendMessage();
}

// Fill suggestion chip into input
function fillSuggestion(text) {
  document.getElementById('userInput').value = text;
  document.getElementById('userInput').focus();
}

// ─── Send Message ──────────────────────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text) return;

  // Clear input
  input.value = '';

  // Remove welcome message
  const welcome = document.querySelector('.welcome-msg');
  if (welcome) welcome.remove();

  // Show user message
  addMessage(text, 'user');

  // Show typing indicator
  const typingId = showTyping();

  try {
    // Send to Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are ARIA, a helpful personal assistant for an Indian user in Chennai.
You can perform these actions by responding with JSON:

1. ORDER FOOD on Swiggy:
{"action": "order_food", "item": "chicken biryani", "quantity": 1, "instructions": "less spicy"}

2. BOOK RIDE on Uber:
{"action": "book_ride", "from": "Home", "to": "Airport", "rideType": "Auto"}
rideType options: Auto, Mini, Sedan, SUV

3. SEND MESSAGE on WhatsApp:
{"action": "send_message", "contact": "Mum", "message": "I will be late today"}

Available contacts: Mum, Dad, Friend Rahul, Friend Priya, Office

Available menu items: Chicken Biryani, Mutton Biryani, Veg Biryani, Margherita Pizza, Pepperoni Pizza, BBQ Chicken Pizza, Veg Burger, Chicken Burger, Zinger Burger, Masala Dosa, Rava Dosa, Idli Sambar, Mango Lassi, Cold Coffee, Fresh Lime Soda

RULES:
- If the user wants to do one of the 3 actions above, respond ONLY with the JSON, nothing else.
- If the user is just chatting or asking a question, respond normally in plain text.
- Be friendly, helpful, and concise.
- Address the user warmly.
- If item not found, suggest the closest available item.`,
        messages: [{ role: 'user', content: text }]
      })
    });

    const data = await response.json();
    removeTyping(typingId);

    const aiText = data.content[0].text.trim();

    // Check if response is a JSON action
    if (aiText.startsWith('{')) {
      try {
        const action = JSON.parse(aiText);
        handleAction(action);
      } catch (e) {
        addMessage(aiText, 'ai');
      }
    } else {
      addMessage(aiText, 'ai');
    }

  } catch (error) {
    removeTyping(typingId);
    addMessage('Sorry, I had trouble connecting. Please check your API key and try again.', 'error');
    console.error('API Error:', error);
  }
}

// ─── Handle Actions ────────────────────────────────────────────────────────
function handleAction(action) {
  let result;

  if (action.action === 'order_food') {
    result = bridge.orderFood({
      itemName: action.item,
      quantity: action.quantity || 1,
      instructions: action.instructions || ''
    });
    if (result.success) {
      addActionCard('🍔 Swiggy Order', result.message, 'swiggy/index.html', 'View on Swiggy');
    } else {
      addMessage(result.message, 'error');
    }
  }

  else if (action.action === 'book_ride') {
    result = bridge.bookRide({
      from: action.from || 'Home',
      to: action.to,
      rideType: action.rideType || 'Auto'
    });
    if (result.success) {
      addActionCard('🚗 Uber Ride', result.message, 'uber/index.html', 'View on Uber');
    } else {
      addMessage(result.message, 'error');
    }
  }

  else if (action.action === 'send_message') {
    result = bridge.sendMessage({
      contactName: action.contact,
      messageText: action.message
    });
    if (result.success) {
      addActionCard('💬 WhatsApp', result.message, 'whatsapp/index.html', 'View on WhatsApp');
    } else {
      addMessage(result.message, 'error');
    }
  }
}

// ─── UI Helpers ────────────────────────────────────────────────────────────
function addMessage(text, type) {
  const container = document.getElementById('chatContainer');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const row = document.createElement('div');
  row.className = `message-row ${type === 'user' ? 'user' : 'ai'}`;

  row.innerHTML = `
    <div class="bubble ${type === 'error' ? 'error' : type === 'action' ? 'action' : type}">
      ${text}
    </div>
    <div class="msg-time">${time}</div>
  `;

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function addActionCard(title, body, link, linkText) {
  const container = document.getElementById('chatContainer');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const row = document.createElement('div');
  row.className = 'message-row ai';
  row.style.animation = 'msgIn 0.3s ease';

  row.innerHTML = `
    <div class="action-card">
      <div class="action-card-title">✅ ${title}</div>
      <div class="action-card-body">${body}</div>
      <a href="${link}" class="action-card-link">${linkText} →</a>
    </div>
    <div class="msg-time">${time}</div>
  `;

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chatContainer');
  const id = 'typing_' + Date.now();

  const row = document.createElement('div');
  row.className = 'message-row ai';
  row.id = id;
  row.innerHTML = `
    <div class="typing">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ─── Start ─────────────────────────────────────────────────────────────────
setupVoice();