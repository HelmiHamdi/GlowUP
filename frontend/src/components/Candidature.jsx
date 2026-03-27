// pages/Candidature.jsx
import { useState, useRef } from 'react';
import { candidatureAPI } from '../services/api';
import './Candidature.css';

const INITIAL = {
  prenom:     '',
  age:        '',
  email:      '',
  telephone:  '',
  ville:      'Tunis',
  motivation: '',
};

const VILLES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
  'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Kairouan',
  'Kasserine', 'Sidi Bouzid', 'Sousse', 'Monastir', 'Mahdia', 'Sfax',
  'Gafsa', 'Tozeur', 'Kébili', 'Gabès', 'Médenine', 'Tataouine',
];

export default function Candidature() {
  const [form,        setForm]        = useState(INITIAL);
  const [photoFile,   setPhotoFile]   = useState(null);   // Fichier brut File
  const [photoPreview, setPhotoPreview] = useState(null); // URL de prévisualisation
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Référence vers l'input file caché (pour le bouton personnalisé)
  const fileInputRef = useRef(null);

  // ── Handlers champs texte ─────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  // ── Handler sélection photo ───────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation côté client (taille et type)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        photo: 'Format non accepté. Utilisez JPG, PNG ou WEBP.',
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        photo: 'Fichier trop lourd (5 Mo maximum).',
      }));
      return;
    }

    setPhotoFile(file);
    setFieldErrors((prev) => ({ ...prev, photo: '' }));

    // Créer une URL de prévisualisation locale (révoquée à la soumission)
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  // ── Supprimer la photo sélectionnée ──────────────────────────────────────
  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Soumission du formulaire ──────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      await candidatureAPI.submit(form, photoFile, (percent) => {
        setUploadProgress(percent);
      });

      // Nettoyage après succès
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setSuccess(true);
      setForm(INITIAL);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      if (err.response?.data?.errors) {
        const fe = {};
        err.response.data.errors.forEach((e) => {
          fe[e.path] = e.msg;
        });
        setFieldErrors(fe);
      } else {
        setError(
          err.response?.data?.message || 'Une erreur est survenue. Réessayez.'
        );
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section className="candidature-section reveal" id="candidature">
      <div className="container">
        <div className="cand-grid">

          {/* ── Info gauche ─────────────────────────────────────────────── */}
          <div className="cand-info">
            <div className="s-label" style={{ color: 'var(--sage-l)' }}>
              Postuler
            </div>
            <div className="s-title" style={{ color: 'var(--white)' }}>
              Vous méritez
              <br />
              <em style={{ color: 'var(--sage-l)' }}>votre Glow.</em>
            </div>
            <div className="s-body">
              Remplissez le formulaire et notre équipe vous contactera sous 48h.
              Toutes les femmes peuvent postuler, quelle que soit leur histoire.
            </div>
            <div className="cand-steps">
              {[
                {
                  n: 1,
                  title: 'Vous postulez',
                  desc: 'Remplissez le formulaire en ligne en 3 minutes.',
                },
                {
                  n: 2,
                  title: 'On vous contacte',
                  desc: 'Notre équipe vous appelle pour un entretien bienveillant.',
                },
                {
                  n: 3,
                  title: 'Votre transformation commence',
                  desc: '4 épisodes. 4 experts. 1 révélation pour vous.',
                },
              ].map((s) => (
                <div className="cand-step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-text">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Formulaire droite ────────────────────────────────────────── */}
          <div className="cand-form">
            <div className="form-title">Formulaire de candidature</div>
            <div className="form-sub">Saison 3 · Candidatures ouvertes</div>

            {success ? (
              <div
                className="success-msg"
                style={{ fontSize: '0.95rem', padding: '1.5rem', textAlign: 'center' }}
              >
                🎋 ✨ Candidature envoyée !<br />
                <span
                  style={{
                    fontSize: '0.82rem',
                    opacity: 0.8,
                    display: 'block',
                    marginTop: '0.5rem',
                  }}
                >
                  Nous vous contacterons sous 48h. Préparez votre Glow !
                </span>
              </div>
            ) : (
              <>
                {error && <div className="error-msg">{error}</div>}

                {/* Prénom + Âge */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      name="prenom"
                      value={form.prenom}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                    />
                    {fieldErrors.prenom && (
                      <span className="field-err">{fieldErrors.prenom}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Âge</label>
                    <input
                      name="age"
                      type="number"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="Votre âge"
                    />
                    {fieldErrors.age && (
                      <span className="field-err">{fieldErrors.age}</span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                  />
                  {fieldErrors.email && (
                    <span className="field-err">{fieldErrors.email}</span>
                  )}
                </div>

                {/* Téléphone */}
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    placeholder="+216 XX XXX XXX"
                  />
                  {fieldErrors.telephone && (
                    <span className="field-err">{fieldErrors.telephone}</span>
                  )}
                </div>

                {/* Ville */}
                <div className="form-group">
                  <label>Ville</label>
                  <select name="ville" value={form.ville} onChange={handleChange}>
                    {VILLES.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                  {fieldErrors.ville && (
                    <span className="field-err">{fieldErrors.ville}</span>
                  )}
                </div>

                {/* ── PHOTO ─────────────────────────────────────────────── */}
                <div className="form-group">
                  <label>
                    Votre photo{' '}
                    <span style={{ opacity: 0.6, fontWeight: 400 }}>(optionnelle)</span>
                  </label>

                  {/* Input file caché — déclenché par le bouton ci-dessous */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />

                  {!photoPreview ? (
                    /* Zone de drop / bouton d'upload */
                    <div
                      className="photo-upload-zone"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          // Réutiliser le handler en simulant l'événement
                          handlePhotoChange({ target: { files: [file] } });
                        }
                      }}
                    >
                      <span className="photo-upload-icon">📸</span>
                      <span className="photo-upload-text">
                        Glissez une photo
                      </span>
                      <span className="photo-upload-hint">
                        JPG, PNG, WEBP · max 5 Mo
                      </span>
                    </div>
                  ) : (
                    /* Prévisualisation + bouton supprimer */
                    <div className="photo-preview-wrap">
                      <img
                        src={photoPreview}
                        alt="Aperçu"
                        className="photo-preview-img"
                      />
                      <button
                        type="button"
                        className="photo-remove-btn"
                        onClick={removePhoto}
                        title="Supprimer la photo"
                      >
                        ✕
                      </button>
                      <span className="photo-file-name">{photoFile?.name}</span>
                    </div>
                  )}

                  {fieldErrors.photo && (
                    <span className="field-err">{fieldErrors.photo}</span>
                  )}
                </div>
                {/* ── FIN PHOTO ─────────────────────────────────────────── */}

                {/* Motivation */}
                <div className="form-group">
                  <label>Pourquoi méritez-vous votre Glow ?</label>
                  <textarea
                    name="motivation"
                    value={form.motivation}
                    onChange={handleChange}
                    placeholder="Parlez-nous de vous, de votre histoire, de ce que vous souhaitez transformer..."
                  />
                  {fieldErrors.motivation && (
                    <span className="field-err">{fieldErrors.motivation}</span>
                  )}
                  <span className="char-count">{form.motivation.length}/1000</span>
                </div>

                {/* Barre de progression upload (visible uniquement pendant l'envoi) */}
                {loading && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="upload-progress-wrap">
                    <div
                      className="upload-progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <span className="upload-progress-label">
                      Upload {uploadProgress}%
                    </span>
                  </div>
                )}

                <button
                  className="form-submit"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? '⏳ Envoi en cours...' : '✨ Envoyer ma candidature'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}