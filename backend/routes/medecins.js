import { Router } from 'express';
import Medecin from '../models/Medecin.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// GET /api/medecins — Lister les médecins (avec filtres)
router.get('/', async (req, res) => {
  try {
    const { categorie, ville, search } = req.query;
    const filter = { actif: true };

    if (categorie && categorie !== 'tous') filter.categorie = categorie;
    if (ville) filter.ville = new RegExp(ville, 'i');
    if (search) {
      filter.$or = [
        { nom: new RegExp(search, 'i') },
        { specialite: new RegExp(search, 'i') },
        { ville: new RegExp(search, 'i') },
      ];
    }

    const medecins = await Medecin.find(filter).sort({ rating: -1 });
    res.json({ success: true, count: medecins.length, data: medecins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/medecins/:id
router.get('/:id', async (req, res) => {
  try {
    const medecin = await Medecin.findById(req.params.id);
    if (!medecin) return res.status(404).json({ success: false, message: 'Médecin introuvable' });
    res.json({ success: true, data: medecin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/medecins — Admin: ajouter un médecin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const medecin = await Medecin.create(req.body);
    res.status(201).json({ success: true, data: medecin });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/medecins/:id — Admin: modifier
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const medecin = await Medecin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!medecin) return res.status(404).json({ success: false, message: 'Médecin introuvable' });
    res.json({ success: true, data: medecin });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/medecins/:id — Admin: désactiver
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Medecin.findByIdAndUpdate(req.params.id, { actif: false });
    res.json({ success: true, message: 'Médecin désactivé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;