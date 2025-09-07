const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const messages = [];

// Send SMS endpoint
app.post('/api/sms/send', (req, res) => {
  const { to, message, from } = req.body;
  const sms = {
    id: Date.now(),
    to: to,
    from: from || 'GPS-ATTENDANCE',
    message: message,
    timestamp: new Date().toISOString(),
    status: 'delivered'
  };
  messages.unshift(sms);
  console.log('📱 SMS sent:', sms);
  res.json({ success: true, messageId: sms.id, status: 'sent' });
});

// Get all messages
app.get('/api/sms/messages', (req, res) => {
  res.json({ messages, total: messages.length });
});

// Get messages for specific phone number
app.get('/api/sms/messages/:phoneNumber', (req, res) => {
  const phone = req.params.phoneNumber;
  const userMessages = messages.filter(msg => msg.to === phone);
  res.json({ messages: userMessages, total: userMessages.length });
});

// Clear all messages
app.delete('/api/sms/messages', (req, res) => {
  messages.length = 0;
  res.json({ success: true, message: 'All messages cleared' });
});

// Web UI
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>SMS Simulator - GPS Attendance</title>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; text-align: center; }
    .stats { background: #007bff; color: white; padding: 10px; border-radius: 4px; margin-bottom: 20px; text-align: center; }
    .message { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 4px; background: #f9f9f9; }
    .message-header { font-weight: bold; color: #007bff; margin-bottom: 8px; }
    .message-content { background: white; padding: 10px; border-radius: 4px; border-left: 4px solid #007bff; }
    .timestamp { color: #666; font-size: 0.9em; }
    .phone { color: #28a745; font-weight: bold; }
    .clear-btn { background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    .refresh-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-left: 10px; }
    .test-section { background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 4px; border: 1px solid #dee2e6; }
    .test-form input, .test-form textarea { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; }
    .test-form button { background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <div class='container'>
    <h1>📱 SMS Simulator</h1>
    <div class='stats'>
      <span id='messageCount'>0</span> messages captured
    </div>
    
    <div class='test-section'>
      <h3>Test SMS Sending</h3>
      <div class='test-form'>
        <input type='tel' id='testPhone' placeholder='Phone number (e.g., +1234567890)' value='+1234567890'>
        <textarea id='testMessage' placeholder='SMS message' rows='3'>Your verification code is: 123456</textarea>
        <button onclick='sendTestSMS()'>📱 Send Test SMS</button>
      </div>
    </div>
    
    <div style='margin-bottom: 20px; text-align: center;'>
      <button class='refresh-btn' onclick='loadMessages()'>🔄 Refresh</button>
      <button class='clear-btn' onclick='clearMessages()'>🗑️ Clear All</button>
    </div>
    <div id='messages'></div>
  </div>
  
  <script>
    function loadMessages() {
      fetch('/api/sms/messages')
        .then(r => r.json())
        .then(data => {
          document.getElementById('messageCount').textContent = data.total;
          const container = document.getElementById('messages');
          if (data.messages.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No SMS messages captured yet</p>';
            return;
          }
          container.innerHTML = data.messages.map(msg => \`
            <div class='message'>
              <div class='message-header'>
                From: <span class='phone'>\${msg.from}</span> → To: <span class='phone'>\${msg.to}</span>
                <span class='timestamp' style='float: right;'>\${new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <div class='message-content'>\${msg.message}</div>
            </div>
          \`).join('');
        });
    }
    
    function sendTestSMS() {
      const phone = document.getElementById('testPhone').value;
      const message = document.getElementById('testMessage').value;
      
      if (!phone || !message) {
        alert('Please enter both phone number and message');
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
          loadMessages();
          document.getElementById('testMessage').value = '';
        }
      });
    }
    
    function clearMessages() {
      if (confirm('Clear all SMS messages?')) {
        fetch('/api/sms/messages', { method: 'DELETE' })
          .then(() => loadMessages());
      }
    }
    
    loadMessages();
    setInterval(loadMessages, 3000); // Auto refresh every 3 seconds
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
