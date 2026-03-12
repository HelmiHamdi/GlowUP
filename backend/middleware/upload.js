// middleware/upload.js
// ─────────────────────────────────────────────────────────────────────────────
// On utilise une factory function pour créer le middleware Multer à la demande.
// Cela garantit que getCloudinary() (et donc cloudinary.config()) n'est appelé
// qu'au moment du premier upload, après que dotenv.config() a tourné.
// ─────────────────────────────────────────────────────────────────────────────

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import getCloudinary from '../config/cloudinary.js';

// ── Filtre MIME ──────────────────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non accepté. Utilisez JPG, PNG ou WEBP.'), false);
  }
};

// ── Lazy factory ─────────────────────────────────────────────────────────────
// On ne crée le storage/multer qu'au premier appel de la route,
// pas au chargement du module.
let _upload = null;

function getUpload() {
  if (!_upload) {
    const cloudinary = getCloudinary(); // process.env garanti chargé ici

    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'bambooglow/candidatures',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          {
            width: 800,
            height: 800,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },
    });

    _upload = multer({
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
    });
  }
  return _upload;
}

export default getUpload;