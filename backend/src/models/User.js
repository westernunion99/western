const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswerHash: { type: String, required: true },
  totpSecret: { type: String },
  webauthn: { type: Array, default: [] },
  biometricEnrolled: { type: Boolean, default: false },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
