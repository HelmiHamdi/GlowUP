import Episode from "../models/Episode.js";

/**
 * Synchronise les vues YouTube pour tous les épisodes
 * qui ont un youtubeId défini.
 * Retourne le nombre d'épisodes mis à jour.
 */
export async function syncYoutubeViews() {
  const YT_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YT_API_KEY) {
    console.warn("[YouTube Sync] ⚠️  YOUTUBE_API_KEY manquante dans .env");
    return 0;
  }

  // 1. Récupérer tous les épisodes avec un youtubeId
  const episodes = await Episode.find({
    youtubeId: { $exists: true, $ne: "" },
  });

  if (!episodes.length) {
    console.log("[YouTube Sync] Aucun épisode avec youtubeId trouvé.");
    return 0;
  }

  // 2. YouTube Data API accepte max 50 IDs par requête
  //    → On découpe en batches de 50
  const BATCH_SIZE = 50;
  let totalUpdated = 0;

  for (let i = 0; i < episodes.length; i += BATCH_SIZE) {
    const batch = episodes.slice(i, i + BATCH_SIZE);
    const ids = batch.map((e) => e.youtubeId).join(",");

    const url =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=statistics&id=${ids}&key=${YT_API_KEY}`;

    const res = await fetch(url);

    if (!res.ok) {
      const errText = await res.text();
      console.error("[YouTube Sync] ❌ Erreur API YouTube:", errText);
      continue; // passe au batch suivant
    }

    const data = await res.json();

    if (!data.items || !data.items.length) {
      console.warn("[YouTube Sync] ⚠️  Aucune donnée retournée par YouTube pour ce batch.");
      continue;
    }

    // 3. Mettre à jour chaque épisode en DB
    for (const item of data.items) {
      const viewCount = parseInt(item.statistics?.viewCount) || 0;
      await Episode.findOneAndUpdate(
        { youtubeId: item.id },
        { vues: viewCount },
        { new: true }
      );
      totalUpdated++;
    }
  }

  console.log(`[YouTube Sync] ✅ ${totalUpdated} épisode(s) mis à jour.`);
  return totalUpdated;
}