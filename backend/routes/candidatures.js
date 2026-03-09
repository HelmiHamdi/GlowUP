import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Candidature from '../models/Candidature.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// POST /api/candidatures — Soumettre une candidature
router.post(
  '/',
  [
    body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire'),
    body('age').isInt({ min: 18, max: 75 }).withMessage('Âge invalide (18-75)'),
    body('email').isEmail().withMessage('Email invalide'),
    body('telephone').notEmpty().withMessage('Le téléphone est obligatoire'),
   body('ville').isIn([
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
  'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Kairouan',
  'Kasserine', 'Sidi Bouzid', 'Sousse', 'Monastir', 'Mahdia', 'Sfax',
  'Gafsa', 'Tozeur', 'Kébili', 'Gabès', 'Médenine', 'Tataouine'
]).withMessage('Ville invalide'),
    body('motivation').isLength({ min: 20 }).withMessage('Décrivez-vous en au moins 50 caractères'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      // Check duplicate email for same season
      const existing = await Candidature.findOne({
        email: req.body.email,
        saison: req.body.saison || 3,
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Une candidature avec cet email existe déjà pour cette saison.',
        });
      }

      const candidature = await Candidature.create(req.body);
      res.status(201).json({
        success: true,
        message: '✨ Candidature reçue ! Nous vous contactons sous 48h.',
        data: { id: candidature._id },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/candidatures — Admin: lister toutes les candidatures
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { statut, saison, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (statut) filter.statut = statut;
    if (saison) filter.saison = Number(saison);

    const total = await Candidature.countDocuments(filter);
    const candidatures = await Candidature.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: candidatures,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/candidatures/:id/statut — Admin: mettre à jour le statut
router.patch('/:id/statut', protect, adminOnly, async (req, res) => {
  try {
    const { statut } = req.body;
    const candidature = await Candidature.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true, runValidators: true }
    );
    if (!candidature) return res.status(404).json({ success: false, message: 'Candidature introuvable' });
    res.json({ success: true, data: candidature });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;