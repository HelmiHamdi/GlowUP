import { Router } from 'express';
const router = Router();
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const signToken = (id) =>
  sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register (première utilisation uniquement)
router.post('/register', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      return res.status(403).json({ success: false, message: 'Inscription désactivée' });
    }
    const user = await User.create(req.body);
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, role: user.role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const token = signToken(user._id);
    res.json({ success: true, token, role: user.role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, data: { id: req.user._id, email: req.user.email, role: req.user.role } });
});

export default router;