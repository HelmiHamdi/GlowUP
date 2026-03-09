import { Router } from 'express';
import Episode from '../models/Episode.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// GET /api/episodes
router.get('/', async (req, res) => {
  try {
    const { saison } = req.query;
    const filter = { publie: true };
    if (saison) filter.saison = Number(saison);

    const episodes = await Episode.find(filter).sort({ saison: 1, numero: 1 });
    res.json({ success: true, count: episodes.length, data: episodes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/episodes — Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const episode = await Episode.create(req.body);
    res.status(201).json({ success: true, data: episode });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/episodes/:id — Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const episode = await Episode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!episode) return res.status(404).json({ success: false, message: 'Épisode introuvable' });
    res.json({ success: true, data: episode });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;