const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors()); // ✅ CORS enabled
app.use(express.json()); // ✅ JSON body parsing

// Serve frontend files (fixed the space in path)
app.use(express.static(path.join(__dirname, './frontend')));

// Example API route for login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'test' && password === '1234') {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// Run server
app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
