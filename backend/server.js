const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files (fixing your path issue)
app.use(express.static(path.join(__dirname, 'frontend')));

// Example API route for login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'test' && password === '1234') {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// Use Render's PORT or default to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
