// routes/candidatures.js — VERSION CORRIGÉE
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Candidature from '../models/Candidature.js';
import { protect, adminOnly } from '../middleware/auth.js';
import getUpload from '../middleware/upload.js';
import getCloudinary from '../config/cloudinary.js';

const router = Router();

const runUpload = (req, res) =>
  new Promise((resolve, reject) => {
    getUpload().single('photo')(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

const candidatureValidators = [
  body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire'),
  body('age').isInt({ min: 18, max: 75 }).withMessage('Âge invalide (18-75)'),
  body('email').isEmail().withMessage('Email invalide'),
  body('telephone').notEmpty().withMessage('Le téléphone est obligatoire'),
  body('ville')
    .isIn([
      'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
      'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Kairouan',
      'Kasserine', 'Sidi Bouzid', 'Sousse', 'Monastir', 'Mahdia', 'Sfax',
      'Gafsa', 'Tozeur', 'Kébili', 'Gabès', 'Médenine', 'Tataouine',
    ])
    .withMessage('Ville invalide'),
  body('motivation')
    .isLength({ min: 50 })
    .withMessage('Décrivez-vous en au moins 50 caractères'),
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/candidatures
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    await runUpload(req, res);
  } catch (uploadErr) {
    console.error('❌ Erreur upload:', uploadErr.message);
    if (uploadErr.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Fichier trop lourd (5 Mo max).' });
    }
    if (uploadErr.message?.includes('Format non accepté')) {
      return res.status(400).json({ success: false, message: uploadErr.message });
    }
    return res.status(500).json({ success: false, message: `Erreur upload : ${uploadErr.message}` });
  }

  await Promise.all(candidatureValidators.map((validator) => validator.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file?.filename) {
      await getCloudinary().uploader.destroy(req.file.filename).catch(() => {});
    }
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const existing = await Candidature.findOne({
      email: req.body.email,
      saison: req.body.saison || 3,
    });
    if (existing) {
      if (req.file?.filename) {
        await getCloudinary().uploader.destroy(req.file.filename).catch(() => {});
      }
      return res.status(409).json({
        success: false,
        message: 'Une candidature avec cet email existe déjà pour cette saison.',
      });
    }

    const photo = req.file
      ? { url: req.file.path, publicId: req.file.filename }
      : { url: null, publicId: null };

    const candidature = await Candidature.create({ ...req.body, photo });

    return res.status(201).json({
      success: true,
      message: '✨ Candidature reçue ! Nous vous contactons sous 48h.',
      data: { id: candidature._id },
    });
  } catch (err) {
    if (req.file?.filename) {
      await getCloudinary().uploader.destroy(req.file.filename).catch(() => {});
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/candidatures — Admin
// FIX : limit=0 → renvoie TOUT (pas de .limit(0) sur Mongoose = tout)
//       limit=N → pagination normale
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { statut, saison, page = 1 } = req.query;

    // limit=0 ou absent → on prend tout ; sinon on prend la valeur demandée
    const limitParam = req.query.limit !== undefined ? Number(req.query.limit) : 50;
    const showAll    = limitParam === 0;

    const filter = {};
    if (statut) filter.statut = statut;
    if (saison) filter.saison = Number(saison);

    const total = await Candidature.countDocuments(filter);

    let query = Candidature.find(filter).sort({ createdAt: -1 });

    if (!showAll) {
      const pageNum = Number(page);
      query = query.skip((pageNum - 1) * limitParam).limit(limitParam);
    }

    const candidatures = await query;

    res.json({
      success:    true,
      total,
      page:       showAll ? 1 : Number(page),
      pages:      showAll ? 1 : Math.ceil(total / limitParam),
      limit:      showAll ? total : limitParam,
      showAll,
      data:       candidatures,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/candidatures/:id/statut — Admin
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/statut', protect, adminOnly, async (req, res) => {
  try {
    const { statut } = req.body;
    const candidature = await Candidature.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true, runValidators: true }
    );
    if (!candidature)
      return res.status(404).json({ success: false, message: 'Candidature introuvable' });
    res.json({ success: true, data: candidature });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/candidatures/:id — Admin
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const candidature = await Candidature.findById(req.params.id);
    if (!candidature)
      return res.status(404).json({ success: false, message: 'Candidature introuvable' });

    if (candidature.photo?.publicId) {
      await getCloudinary().uploader.destroy(candidature.photo.publicId).catch(() => {});
    }

    await candidature.deleteOne();
    res.json({ success: true, message: 'Candidature supprimée.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;