// pages/Admin.jsx
import { useState, useEffect } from 'react';
import { candidatureAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MedecinsAdmin   from '../components/MedecinsAdmin';
import ProduitsAdmin   from '../components/ProduitsAdmin';
import EpisodesAdmin   from '../components/EpisodesAdmin';
import './Admin.css';

const STATUTS = ['en_attente', 'contactee', 'selectionnee', 'refusee'];
const STATUT_LABELS = {
  en_attente:   { label: 'En attente',   color: '#c8a96e' },
  contactee:    { label: 'Contactée',    color: '#7a9e7e' },
  selectionnee: { label: 'Sélectionnée', color: '#4caf50' },
  refusee:      { label: 'Refusée',      color: '#c97a5e' },
};

// Composant avatar réutilisable
function CandidatureAvatar({ photo, prenom }) {
  const [imgError, setImgError] = useState(false);

  if (photo?.url && !imgError) {
    return (
      <img
        src={photo.url}
        alt={prenom}
        onError={() => setImgError(true)}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid rgba(200,169,110,0.5)',
          display: 'block',
        }}
      />
    );
  }

  // Fallback initiale si pas de photo
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'rgba(200,169,110,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
        color: '#c8a96e',
        fontWeight: 700,
        border: '2px solid rgba(200,169,110,0.3)',
        flexShrink: 0,
      }}
    >
      {prenom?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function Admin() {
  const { user, logout } = useAuth();
  const [activeTab,     setActiveTab]     = useState('candidatures');
  const [candidatures,  setCandidatures]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filterStatut,  setFilterStatut]  = useState('');
  const [total,         setTotal]         = useState(0);

  // ── Lightbox simple pour agrandir la photo ────────────────────────────────
  const [lightbox, setLightbox] = useState(null); // URL de la photo à agrandir

  const fetchCandidatures = async () => {
    setLoading(true);
    try {
      const res = await candidatureAPI.getAll({
        statut: filterStatut || undefined,
        limit: 50,
      });
      setCandidatures(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'candidatures') fetchCandidatures();
  }, [filterStatut, activeTab]);

  const updateStatut = async (id, statut) => {
    try {
      await candidatureAPI.updateStatut(id, statut);
      setCandidatures((prev) =>
        prev.map((c) => (c._id === id ? { ...c, statut } : c))
      );
    } catch {
      alert('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="admin-page">

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox}
            alt="Photo candidature"
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              borderRadius: 12,
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}
          />
        </div>
      )}

      {/* ── Barre de navigation ───────────────────────────────────────────── */}
      <div className="admin-nav">
        <div className="admin-logo">🎋 BambooGlow Admin</div>
        <div className="admin-nav-right">
          <span className="admin-user">{user?.email}</span>
          <button className="admin-logout" onClick={logout}>Déconnexion</button>
        </div>
      </div>

      {/* ── Onglets ───────────────────────────────────────────────────────── */}
      <div className="admin-tabs">
        {[
          { key: 'candidatures', icon: '📋', label: 'Candidatures' },
          { key: 'medecins',     icon: '🩺', label: 'Médecins'     },
          { key: 'produits',     icon: '🛍️', label: 'Produits'     },
          { key: 'episodes',     icon: '🎬', label: 'Épisodes'     },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            className={`admin-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="admin-content">

        {/* ── Tab Candidatures ─────────────────────────────────────────────── */}
        {activeTab === 'candidatures' && (
          <>
            <div className="admin-header">
              <h1>Candidatures <span>({total})</span></h1>
              <div className="admin-filters">
                <button
                  className={`filter-pill ${!filterStatut ? 'active' : ''}`}
                  onClick={() => setFilterStatut('')}
                >
                  Toutes
                </button>
                {STATUTS.map((s) => (
                  <button
                    key={s}
                    className={`filter-pill ${filterStatut === s ? 'active' : ''}`}
                    onClick={() => setFilterStatut(s)}
                  >
                    {STATUT_LABELS[s].label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="loading-spinner">🎋</div>
            ) : candidatures.length === 0 ? (
              <div className="admin-empty">Aucune candidature trouvée.</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {/* Nouvelle colonne Photo */}
                      <th>Photo</th>
                      <th>Prénom</th>
                      <th>Âge</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Ville</th>
                      <th>Motivation</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidatures.map((c) => (
                      <tr key={c._id}>

                        {/* ── Colonne Photo ── */}
                        <td>
                          <div
                            style={{ cursor: c.photo?.url ? 'zoom-in' : 'default' }}
                            onClick={() => c.photo?.url && setLightbox(c.photo.url)}
                            title={c.photo?.url ? 'Agrandir la photo' : 'Pas de photo'}
                          >
                            <CandidatureAvatar photo={c.photo} prenom={c.prenom} />
                          </div>
                        </td>

                        <td className="td-name">{c.prenom}</td>
                        <td>{c.age}</td>
                        <td className="td-email">{c.email}</td>
                        <td>{c.telephone}</td>
                        <td>{c.ville}</td>
                        <td className="td-motiv" title={c.motivation}>
                          {c.motivation.slice(0, 60)}
                          {c.motivation.length > 60 ? '…' : ''}
                        </td>
                        <td className="td-date">
                          {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td>
                          <select
                            className="statut-select"
                            value={c.statut}
                            style={{ borderColor: STATUT_LABELS[c.statut]?.color }}
                            onChange={(e) => updateStatut(c._id, e.target.value)}
                          >
                            {STATUTS.map((s) => (
                              <option key={s} value={s}>
                                {STATUT_LABELS[s].label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'medecins'  && <MedecinsAdmin />}
        {activeTab === 'produits'  && <ProduitsAdmin />}
        {activeTab === 'episodes'  && <EpisodesAdmin />}
      </div>
    </div>
  );
}