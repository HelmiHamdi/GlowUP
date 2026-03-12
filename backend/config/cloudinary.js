// config/cloudinary.js
// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT : avec les ES Modules (import/export), tous les imports sont
// hoistés et exécutés AVANT le code du fichier appelant.
// Résultat : cloudinary.config() tournait avant que dotenv.config() soit
// appelé dans server.js → process.env.CLOUDINARY_API_KEY = undefined.
//
// Solution : on exporte une fonction getCloudinary() qui configure le SDK
// au PREMIER APPEL (lazy init), à ce moment-là process.env est garanti
// chargé car dotenv.config() a déjà tourné dans server.js.
// ─────────────────────────────────────────────────────────────────────────────

import { v2 as cloudinary } from 'cloudinary';

let initialized = false;

function getCloudinary() {
  if (!initialized) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure:     true,
    });
    initialized = true;
  }
  return cloudinary;
}

export default getCloudinary;