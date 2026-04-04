import { Router } from "express";
import Episode from "../models/Episode.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { syncYoutubeViews } from "../services/youtubeSyncService.js";

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /api/episodes
// Public — liste des épisodes publiés (filtre optionnel par saison)
// ─────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
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

// ─────────────────────────────────────────────────────────────
// GET /api/episodes/admin/all
// Admin — liste TOUS les épisodes (publiés ou non)
// ─────────────────────────────────────────────────────────────
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { saison } = req.query;
    const filter = {};
    if (saison) filter.saison = Number(saison);

    const episodes = await Episode.find(filter).sort({ saison: 1, numero: 1 });
    res.json({ success: true, count: episodes.length, data: episodes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/episodes/sync-views
// Admin — déclenche manuellement la sync des vues YouTube
// ─────────────────────────────────────────────────────────────
router.get("/sync-views", protect, adminOnly, async (req, res) => {
  try {
    const updated = await syncYoutubeViews();
    res.json({
      success: true,
      message: `${updated} épisode(s) mis à jour avec les vues YouTube.`,
      updated,
    });
  } catch (err) {
    console.error("[sync-views] ❌", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/episodes
// Admin — créer un nouvel épisode
// ─────────────────────────────────────────────────────────────
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const episode = await Episode.create(req.body);
    res.status(201).json({ success: true, data: episode });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/episodes/:id
// Admin — modifier un épisode existant
// ─────────────────────────────────────────────────────────────
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const episode = await Episode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!episode)
      return res.status(404).json({ success: false, message: "Épisode introuvable" });

    res.json({ success: true, data: episode });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/episodes/:id
// Admin — supprimer définitivement un épisode
// ─────────────────────────────────────────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const episode = await Episode.findByIdAndDelete(req.params.id);
    if (!episode)
      return res.status(404).json({ success: false, message: "Épisode introuvable" });

    res.json({ success: true, message: "Épisode supprimé." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;