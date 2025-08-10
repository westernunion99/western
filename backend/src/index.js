require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.ORIGIN || '*',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15*60*1000,
  max: 200
});
app.use(limiter);

connectDB(process.env.MONGODB_URI);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req,res) => res.json({ ok: true, ts: Date.now() }));

(async function createAdminIfMissing(){
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const adminPass = process.env.ADMIN_PASS;
    if(!adminEmail || !adminPass) return;
    const existing = await User.findOne({ email: adminEmail });
    if(!existing){
      const bcrypt = require('bcrypt');
      const passHash = await bcrypt.hash(adminPass, 12);
      const admin = new User({
        name: 'Administrator',
        email: adminEmail,
        passwordHash: passHash,
        securityQuestion: 'first_school',
        securityAnswerHash: passHash,
        role: 'admin',
        active: true
      });
      await admin.save();
      console.log('Default admin created:', adminEmail);
    }
  } catch(err){
    console.error('Admin creation error', err);
  }
})();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
