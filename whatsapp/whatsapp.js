// whatsapp/whatsapp.js

let activeChatContact = null;
let chatHistory = {};

// Show tab
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  document.getElementById(tab + 'Tab').classList.remove('hidden');
  event.target.classList.add('active');
}

// Render chats list
function renderChats() {
  const list = document.getElementById('chatsList');

  if (store.messages.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">💬</div>
        <div class="empty-text">No messages yet</div>
        <div class="empty-sub">Ask your AI Assistant to send a message!</div>
      </div>`;
    return;
  }

  // Group messages by contact
  const grouped = {};
  store.messages.forEach(msg => {
    if (!grouped[msg.to]) grouped[msg.to] = [];
    grouped[msg.to].push(msg);
  });

  list.innerHTML = Object.keys(grouped).map(contactName => {
    const msgs = grouped[contactName];
    const latest = msgs[0];
    const initial = contactName.charAt(0).toUpperCase();
    return `
      <div class="chat-item" onclick="openChat('${contactName}')">
        <div class="chat-item-avatar">${initial}</div>
        <div class="chat-item-info">
          <div class="chat-item-top">
            <div class="chat-item-name">${contactName}</div>
            <div class="chat-item-time">${latest.time}</div>
          </div>
          <div class="chat-item-msg">
            <span class="sent-tick">✓✓</span>${latest.text}
          </div>
        </div>
      </div>`;
  }).join('');
}

// Render contacts list
function renderContacts() {
  const list = document.getElementById('contactsList');
  const select = document.getElementById('contactSelect');

  list.innerHTML = store.contacts.map(contact => `
    <div class="contact-item">
      <div class="contact-avatar">${contact.name.charAt(0)}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-phone">${contact.phone}</div>
      </div>
      <button class="contact-msg-btn" onclick="quickMessage('${contact.name}')">
        Message
      </button>
    </div>
  `).join('');

  // Fill select dropdown
  select.innerHTML = '<option value="">Select contact...</option>' +
    store.contacts.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

// Open chat window
function openChat(contactName) {
  activeChatContact = contactName;
  document.getElementById('chatName').textContent = contactName;
  document.getElementById('chatAvatar').textContent = contactName.charAt(0);
  document.getElementById('chatWindow').style.display = 'flex';
  renderChatMessages(contactName);
}

// Close chat window
function closeChatWindow() {
  document.getElementById('chatWindow').style.display = 'none';
  activeChatContact = null;
}

// Render messages inside chat window
function renderChatMessages(contactName) {
  const container = document.getElementById('chatMessages');
  const msgs = store.messages.filter(m => m.to === contactName).reverse();

  if (msgs.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#999;padding:20px">No messages yet</div>';
    return;
  }

  container.innerHTML = msgs.map(msg => `
    <div class="message-bubble sent">
      ${msg.text}
      <div class="message-time">✓✓ ${msg.time}</div>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

// Send message from chat input bar
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !activeChatContact) return;

  const result = bridge.sendMessage({
    contactName: activeChatContact,
    messageText: text
  });

  if (result.success) {
    input.value = '';
    renderChatMessages(activeChatContact);
    renderChats();
  }
}

// Send message from send tab
function sendMessageNow() {
  const contactName = document.getElementById('contactSelect').value;
  const messageText = document.getElementById('messageInput').value.trim();

  if (!contactName) {
    alert('Please select a contact!');
    return;
  }
  if (!messageText) {
    alert('Please type a message!');
    return;
  }

  const result = bridge.sendMessage({ contactName, messageText });

  if (result.success) {
    document.getElementById('popupMsg').textContent = result.message;
    document.getElementById('popup').classList.add('show');
    document.getElementById('messageInput').value = '';
    renderChats();
  }
}

// Quick message from contacts tab
function quickMessage(contactName) {
  document.getElementById('contactSelect').value = contactName;
  showTab('send');
  document.querySelectorAll('.tab').forEach((t, i) => {
    if (i === 2) t.classList.add('active');
    else t.classList.remove('active');
  });
}

// Close popup
function closePopup() {
  document.getElementById('popup').classList.remove('show');
}

// Enter key to send in chat
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && activeChatContact) {
    sendChatMessage();
  }
});

// Auto refresh when AI sends message from assistant page
window.addEventListener('storage', function(e) {
  if (e.key === 'whatsapp_refresh') {
    store.load();
    renderChats();
    const latest = store.messages[0];
    if (latest) {
      document.getElementById('popupMsg').textContent =
        `AI Assistant sent a message to ${latest.to}: "${latest.text}"`;
      document.getElementById('popup').classList.add('show');
    }
  }
});

// Start
renderChats();
renderContacts();