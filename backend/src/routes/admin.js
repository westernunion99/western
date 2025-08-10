const express = require('express');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/users', requireAuth, requireAdmin, async (req,res) => {
  const users = await User.find().select('-passwordHash -securityAnswerHash -totpSecret -webauthn');
  res.json({ users });
});

router.patch('/users/:id', requireAuth, requireAdmin, async (req,res) => {
  const id = req.params.id;
  const { active } = req.body;
  const u = await User.findByIdAndUpdate(id, { active }, { new: true }).select('-passwordHash -securityAnswerHash -totpSecret');
  res.json({ user: u });
});

router.delete('/users/:id', requireAuth, requireAdmin, async (req,res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
