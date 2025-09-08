const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// In-memory storage for SMS messages
let smsMessages = [];

// SMS Sending endpoint (simulated)
app.post('/api/sms/send', (req, res) => {
  const { to, message, from = 'SMS-SERVICE' } = req.body;
  
  console.log(`📱 SMS Sent to ${to}: ${message}`);
  
  // Store the message
  const smsData = {
    id: Date.now(),
    to,
    from,
    message,
    timestamp: new Date().toISOString(),
    delivered: true
  };
  
  smsMessages.unshift(smsData);
  
  // Keep only last 100 messages
  if (smsMessages.length > 100) {
    smsMessages = smsMessages.slice(0, 100);
  }
  
  res.json({ 
    success: true, 
    messageId: smsData.id,
    message: 'SMS sent successfully' 
  });
});

// Get SMS messages
app.get('/api/sms/messages', (req, res) => {
  res.json({
    total: smsMessages.length,
    messages: smsMessages
  });
});

// Clear SMS messages
app.delete('/api/sms/messages', (req, res) => {
  smsMessages = [];
  console.log('🗑️ All SMS messages cleared');
  res.json({ success: true, message: 'All messages cleared' });
});

// Web UI with Mailpit-inspired design
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <title>SMS Simulator - GPS Attendance</title>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #333;
    }
    
    .header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 1rem 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #4f46e5;
    }
    
    .logo i {
      background: linear-gradient(135deg, #667eea, #764ba2);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      font-size: 2rem;
    }
    
    .header-stats {
      display: flex;
      gap: 2rem;
      align-items: center;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(103, 126, 234, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 25px;
      color: #4f46e5;
      font-weight: 500;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      height: calc(100vh - 200px);
    }
    
    .messages-panel {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .panel-header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .panel-title {
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .panel-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-primary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      backdrop-filter: blur(10px);
    }
    
    .btn-primary:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
    
    .btn-danger {
      background: #ef4444;
      color: white;
    }
    
    .btn-danger:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }
    
    .messages-list {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
    
    .message-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 1rem;
      padding: 1.25rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .message-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }
    
    .message-phones {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }
    
    .phone-from {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }
    
    .phone-to {
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }
    
    .message-time {
      color: #64748b;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .message-content {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
      font-size: 0.875rem;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .message-status {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #10b981;
      font-size: 0.75rem;
      font-weight: 500;
      margin-top: 0.5rem;
    }
    
    .sidebar-panel {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }
    
    .test-section {
      padding: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }
    
    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }
    
    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(103, 126, 234, 0.1);
    }
    
    .form-textarea {
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
    }
    
    .btn-test {
      width: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 0.5rem;
    }
    
    .btn-test:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(103, 126, 234, 0.3);
    }
    
    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #64748b;
    }
    
    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #cbd5e1;
    }
    
    .empty-state h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #374151;
    }
    
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: #64748b;
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e5e7eb;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .notification {
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: #10b981;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }
    
    .notification.show {
      transform: translateX(0);
    }
    
    @media (max-width: 768px) {
      .main-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }
      
      .header-stats {
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <div class='header'>
    <div class='header-content'>
      <div class='logo'>
        <i class="fas fa-mobile-alt"></i>
        SMS Simulator
      </div>
      <div class='header-stats'>
        <div class='stat-item'>
          <i class="fas fa-envelope"></i>
          <span id='messageCount'>0</span> messages
        </div>
        <div class='stat-item'>
          <i class="fas fa-clock"></i>
          <span id='lastUpdate'>Never</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class='container'>
    <div class='main-grid'>
      <div class='messages-panel'>
        <div class='panel-header'>
          <div class='panel-title'>
            <i class="fas fa-comments"></i>
            SMS Messages
          </div>
          <div class='panel-actions'>
            <button class='btn btn-primary' onclick='loadMessages()'>
              <i class="fas fa-sync-alt"></i>
              Refresh
            </button>
            <button class='btn btn-danger' onclick='clearMessages()'>
              <i class="fas fa-trash"></i>
              Clear All
            </button>
          </div>
        </div>
        <div class='messages-list' id='messages'>
          <div class='loading'>
            <div class='spinner'></div>
            Loading messages...
          </div>
        </div>
      </div>
      
      <div class='sidebar-panel'>
        <div class='panel-header'>
          <div class='panel-title'>
            <i class="fas fa-paper-plane"></i>
            Test SMS
          </div>
        </div>
        <div class='test-section'>
          <div class='form-group'>
            <label class='form-label' for='testPhone'>
              <i class="fas fa-phone"></i>
              Phone Number
            </label>
            <input type='tel' id='testPhone' class='form-input' placeholder='+1234567890' value='+1234567890'>
          </div>
          
          <div class='form-group'>
            <label class='form-label' for='testMessage'>
              <i class="fas fa-comment"></i>
              Message Content
            </label>
            <textarea id='testMessage' class='form-input form-textarea' placeholder='Enter your SMS message here...' rows='4'>Your verification code is: 123456</textarea>
          </div>
          
          <button class='btn-test' onclick='sendTestSMS()'>
            <i class="fas fa-paper-plane"></i>
            Send Test SMS
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    let isLoading = false;
    
    function showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.style.background = type === 'success' ? '#10b981' : '#ef4444';
      notification.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check' : 'exclamation-triangle') + '"></i> ' + message;
      document.body.appendChild(notification);
      
      setTimeout(() => notification.classList.add('show'), 100);
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 3000);
    }
    
    function formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        month: 'short',
        day: 'numeric'
      });
    }
    
    function loadMessages() {
      if (isLoading) return;
      isLoading = true;
      
      fetch('/api/sms/messages')
        .then(r => r.json())
        .then(data => {
          document.getElementById('messageCount').textContent = data.total;
          document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
          
          const container = document.getElementById('messages');
          
          if (data.messages.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><h3>No SMS messages yet</h3><p>SMS messages will appear here when they are sent</p></div>';
            return;
          }
          
          container.innerHTML = data.messages.map(msg => 
            '<div class="message-item">' +
              '<div class="message-header">' +
                '<div class="message-phones">' +
                  '<span class="phone-from">' + msg.from + '</span>' +
                  '<i class="fas fa-arrow-right" style="color: #64748b;"></i>' +
                  '<span class="phone-to">' + msg.to + '</span>' +
                '</div>' +
                '<div class="message-time">' +
                  '<i class="fas fa-clock"></i>' +
                  formatTime(msg.timestamp) +
                '</div>' +
              '</div>' +
              '<div class="message-content">' + msg.message + '</div>' +
              '<div class="message-status">' +
                '<i class="fas fa-check-circle"></i>' +
                'Delivered' +
              '</div>' +
            '</div>'
          ).join('');
        })
        .catch(err => {
          console.error('Failed to load messages:', err);
          showNotification('Failed to load messages', 'error');
        })
        .finally(() => {
          isLoading = false;
        });
    }
    
    function sendTestSMS() {
      const phone = document.getElementById('testPhone').value.trim();
      const message = document.getElementById('testMessage').value.trim();
      
      if (!phone || !message) {
        showNotification('Please enter both phone number and message', 'error');
        return;
      }
      
      if (!phone.match(/^\\+?[1-9]\\d{1,14}$/)) {
        showNotification('Please enter a valid phone number', 'error');
        return;
      }
      
      fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message: message })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showNotification('SMS sent successfully!');
          loadMessages();
          document.getElementById('testMessage').value = 'Your verification code is: ' + Math.floor(100000 + Math.random() * 900000);
        }
      })
      .catch(err => {
        console.error('Failed to send SMS:', err);
        showNotification('Failed to send SMS', 'error');
      });
    }
    
    function clearMessages() {
      if (!confirm('Are you sure you want to clear all SMS messages?')) return;
      
      fetch('/api/sms/messages', { method: 'DELETE' })
        .then(() => {
          showNotification('All messages cleared');
          loadMessages();
        })
        .catch(err => {
          console.error('Failed to clear messages:', err);
          showNotification('Failed to clear messages', 'error');
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'r':
            e.preventDefault();
            loadMessages();
            break;
          case 'Enter':
            if (e.target.id === 'testMessage' || e.target.id === 'testPhone') {
              e.preventDefault();
              sendTestSMS();
            }
            break;
        }
      }
    });
    
    // Initialize
    loadMessages();
    setInterval(loadMessages, 5000); // Auto refresh every 5 seconds
  </script>
</body>
</html>
  `);
});

app.listen(3010, '0.0.0.0', () => {
  console.log('🚀 SMS Simulator running on http://localhost:3010');
  console.log('📱 Send SMS via POST to http://localhost:3010/api/sms/send');
  console.log('🌐 Web UI available at http://localhost:3010');
});
