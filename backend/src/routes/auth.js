const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { generateTOTPSecret, verifyTOTP } = require('../utils/totp');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = 12;

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, securityQuestion, securityAnswer } = req.body;
    if(!name || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if(existing) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase(), SALT_ROUNDS);

    const totp = await generateTOTPSecret({ name, email });

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      securityQuestion,
      securityAnswerHash,
      totpSecret: totp.base32
    });
    await user.save();

    return res.json({
      message: 'Registered',
      qrDataUrl: totp.qrDataUrl
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login (password)
router.post('/login', async (req,res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if(!user) return res.status(400).json({ error: 'Invalid credentials' });
    if(!user.active) return res.status(403).json({ error: 'Account deactivated' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const tempToken = jwt.sign(
      { id: user._id.toString(), email: user.email, step: 'password' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );
    return res.json({ message: 'Password accepted', tempToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Verify challenge
router.post('/verify-challenge', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({ error: 'Missing auth header' });
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    if(!payload || payload.step !== 'password') return res.status(401).json({ error: 'Invalid flow' });

    const user = await User.findById(payload.id);
    if(!user) return res.status(400).json({ error: 'User not found' });

    const answer = req.body.answer || '';
    const ok = await bcrypt.compare(answer.toLowerCase(), user.securityAnswerHash);
    if(!ok) return res.status(400).json({ error: 'Incorrect answer' });

    const nextToken = jwt.sign({ id: user._id.toString(), email: user.email, step: 'challenge' }, JWT_SECRET, { expiresIn: '10m' });
    return res.json({ message: 'Challenge passed', tempToken: nextToken });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Verify TOTP
router.post('/verify-totp', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({ error: 'Missing auth header' });
    const temp = header.split(' ')[1];
    const payload = jwt.verify(temp, JWT_SECRET);
    if(!payload || payload.step !== 'challenge') return res.status(401).json({ error: 'Invalid flow' });

    const user = await User.findById(payload.id);
    if(!user) return res.status(400).json({ error: 'User not found' });

    const token = (req.body.token || '').trim();
    const ok = verifyTOTP(token, user.totpSecret);
    if(!ok) return res.status(400).json({ error: 'Invalid TOTP code' });

    const finalToken = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({ message: 'Authenticated', token: finalToken });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Me
router.get('/me', async (req,res) => {
  try {
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({ error: 'Missing auth header' });
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash -securityAnswerHash -totpSecret -webauthn');
    res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
