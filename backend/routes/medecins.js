import { Router } from 'express';
import streamifier from 'streamifier';
import Medecin from '../models/Medecin.js';
import { protect, adminOnly } from '../middleware/auth.js';
import uploadMedecin from '../middleware/uploadMedecin.js';
import getCloudinary from '../config/cloudinary.js';

const router = Router();

/* ── Helper : upload buffer → Cloudinary ─────────────────────────────────── */
function uploadToCloudinary(buffer, folder = 'bambooglow/medecins') {
  return new Promise((resolve, reject) => {
    const cloudinary = getCloudinary();
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/* ── Helper : supprimer une image Cloudinary ─────────────────────────────── */
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
}

/* ── Helper : normaliser le body avant sauvegarde ────────────────────────── */
// Le formulaire envoie "gouvernorat" (ex: "Tunis") et "adresse" (ex: "La Marsa").
// Le schéma a besoin de "ville" ET "gouvernorat".
// On synchronise ville = gouvernorat pour la compatibilité totale.
function normalizeBody(body) {
  const normalized = { ...body };
  if (normalized.gouvernorat) {
    normalized.ville = normalized.gouvernorat;   // ville miroir du gouvernorat
  }
  return normalized;
}

/* ── GET /api/medecins ────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { categorie, ville, search } = req.query;
    const filter = { actif: true };

    if (categorie && categorie !== 'tous') filter.categorie = categorie;
    if (ville) filter.$or = [
      { ville:       new RegExp(ville, 'i') },
      { gouvernorat: new RegExp(ville, 'i') },
    ];
    if (search) {
      filter.$or = [
        { nom:         new RegExp(search, 'i') },
        { specialite:  new RegExp(search, 'i') },
        { ville:       new RegExp(search, 'i') },
        { gouvernorat: new RegExp(search, 'i') },
        { adresse:     new RegExp(search, 'i') },
      ];
    }

    const medecins = await Medecin.find(filter).sort({ rating: -1 });
    res.json({ success: true, count: medecins.length, data: medecins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/medecins/:id ───────────────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const medecin = await Medecin.findById(req.params.id);
    if (!medecin)
      return res.status(404).json({ success: false, message: 'Médecin introuvable' });
    res.json({ success: true, data: medecin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/medecins ──────────────────────────────────────────────────── */
router.post(
  '/',
  protect,
  adminOnly,
  uploadMedecin.single('photo'),
  async (req, res) => {
    try {
      const body = normalizeBody(req.body);

      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        body.photo = { url: result.secure_url, publicId: result.public_id };
      }

      const medecin = await Medecin.create(body);
      res.status(201).json({ success: true, data: medecin });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

/* ── PUT /api/medecins/:id ───────────────────────────────────────────────── */
router.put(
  '/:id',
  protect,
  adminOnly,
  uploadMedecin.single('photo'),
  async (req, res) => {
    try {
      const existing = await Medecin.findById(req.params.id);
      if (!existing)
        return res.status(404).json({ success: false, message: 'Médecin introuvable' });

      const body = normalizeBody(req.body);

      if (req.file) {
        await deleteFromCloudinary(existing.photo?.publicId);
        const result = await uploadToCloudinary(req.file.buffer);
        body.photo = { url: result.secure_url, publicId: result.public_id };
      }

      if (body.removePhoto === 'true') {
        await deleteFromCloudinary(existing.photo?.publicId);
        body.photo = { url: null, publicId: null };
        delete body.removePhoto;
      }

      const medecin = await Medecin.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
      });

      res.json({ success: true, data: medecin });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

/* ── DELETE /api/medecins/:id ────────────────────────────────────────────── */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Medecin.findByIdAndUpdate(req.params.id, { actif: false });
    res.json({ success: true, message: 'Médecin désactivé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;