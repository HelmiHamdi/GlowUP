// routes/candidatures.js
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Candidature from '../models/Candidature.js';
import { protect, adminOnly } from '../middleware/auth.js';
import getUpload from '../middleware/upload.js';
import getCloudinary from '../config/cloudinary.js';

const router = Router();

// Helper : Multer dans une Promise pour capturer ses erreurs
const runUpload = (req, res) =>
  new Promise((resolve, reject) => {
    getUpload().single('photo')(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

// Validateurs express-validator (utilisés APRÈS runUpload)
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
// ORDRE OBLIGATOIRE :
//   1. runUpload()           → Multer parse le multipart et remplit req.body
//   2. candidatureValidators → express-validator lit req.body (maintenant plein)
//   3. validationResult()    → on vérifie les erreurs
//   4. logique métier
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {

  // ── 1. Upload photo : Multer parse multipart/form-data → remplit req.body ──
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

  // ── 2. Valider req.body manuellement (après que Multer l'a rempli) ──────────
  // On exécute les validators express-validator à la main via .run(req)
  await Promise.all(candidatureValidators.map((validator) => validator.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    // Nettoyer l'image déjà uploadée si validation échoue
    if (req.file?.filename) {
      await getCloudinary().uploader.destroy(req.file.filename).catch(() => {});
    }
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  // ── 3. Logique métier ────────────────────────────────────────────────────
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
    console.error('❌ Erreur création candidature:', err.message);
    if (req.file?.filename) {
      await getCloudinary().uploader.destroy(req.file.filename).catch(() => {});
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/candidatures — Admin
// ─────────────────────────────────────────────────────────────────────────────
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

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), data: candidatures });
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
      req.params.id, { statut }, { new: true, runValidators: true }
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