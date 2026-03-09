import { Router } from 'express';
import Produit from '../models/Produit.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// GET /api/produits
router.get('/', async (req, res) => {
  try {
    const { categorie } = req.query;
    const filter = { actif: true };
    if (categorie) filter.categorie = categorie;

    const produits = await Produit.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: produits.length, data: produits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/produits — Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const produit = await Produit.create(req.body);
    res.status(201).json({ success: true, data: produit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/produits/:id — Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const produit = await Produit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!produit) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, data: produit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/produits/:id — Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Produit.findByIdAndUpdate(req.params.id, { actif: false });
    res.json({ success: true, message: 'Produit désactivé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;