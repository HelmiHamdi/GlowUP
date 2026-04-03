// pages/Admin.jsx — VERSION CORRIGÉE
// Fix principal : plus de LIMIT fixe, pagination dynamique, option "Tout afficher"
import { useState, useEffect } from 'react';
import { candidatureAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MedecinsAdmin from '../components/MedecinsAdmin';
import ProduitsAdmin from '../components/ProduitsAdmin';
import EpisodesAdmin from '../components/EpisodesAdmin';
import './Admin.css';

const STATUTS = ['en_attente', 'contactee', 'selectionnee', 'refusee'];
const STATUT_LABELS = {
  en_attente:   { label: 'En attente',   color: '#c8a96e' },
  contactee:    { label: 'Contactée',    color: '#7a9e7e' },
  selectionnee: { label: 'Sélectionnée', color: '#4caf50' },
  refusee:      { label: 'Refusée',      color: '#c97a5e' },
};

// Options de nombre de lignes par page (0 = tout)
const PAGE_SIZE_OPTIONS = [20, 50, 100, 0];

function CandidatureAvatar({ photo, prenom }) {
  const [imgError, setImgError] = useState(false);

  if (photo?.url && !imgError) {
    return (
      <img
        src={photo.url}
        alt={prenom}
        onError={() => setImgError(true)}
        style={{
          width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
          border: '2px solid rgba(200,169,110,0.5)', display: 'block',
        }}
      />
    );
  }

  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: 'rgba(200,169,110,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1rem', color: '#c8a96e', fontWeight: 700,
      border: '2px solid rgba(200,169,110,0.3)', flexShrink: 0,
    }}>
      {prenom?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function Admin() {
  const { user, logout } = useAuth();
  const [activeTab,    setActiveTab]    = useState('candidatures');
  const [candidatures, setCandidatures] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatut, setFilterStatut] = useState('');
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [pageSize,     setPageSize]     = useState(50);   // 50 par défaut, 0 = tout
  const [lightbox,     setLightbox]     = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCandidatures = async (currentPage = 1, size = pageSize) => {
    setLoading(true);
    try {
      const res = await candidatureAPI.getAll({
        statut: filterStatut || undefined,
        limit:  size,           // 0 = tout afficher côté backend
        page:   size === 0 ? 1 : currentPage,
      });
      setCandidatures(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'candidatures') {
      setPage(1);
      fetchCandidatures(1, pageSize);
    }
  }, [filterStatut, activeTab]);

  // ── Changement de taille de page ───────────────────────────────────────────
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
    fetchCandidatures(1, newSize);
  };

  // ── Navigation page ────────────────────────────────────────────────────────
  const goToPage = (p) => {
    setPage(p);
    fetchCandidatures(p, pageSize);
    document.querySelector('.admin-table-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Mise à jour statut ─────────────────────────────────────────────────────
  const updateStatut = async (id, statut) => {
    try {
      await candidatureAPI.updateStatut(id, statut);
      setCandidatures((prev) => prev.map((c) => (c._id === id ? { ...c, statut } : c)));
    } catch {
      alert('Erreur lors de la mise à jour');
    }
  };

  // ── Numéros de page ────────────────────────────────────────────────────────
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)       return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  // ── Résumé d'affichage ─────────────────────────────────────────────────────
  const displayInfo = () => {
    if (pageSize === 0) return <>Toutes les <strong>{total}</strong> candidatures affichées</>;
    const from = (page - 1) * pageSize + 1;
    const to   = Math.min(page * pageSize, total);
    return (
      <>
        Affichage <strong>{from}</strong>–<strong>{to}</strong> sur <strong>{total}</strong> candidatures
        {totalPages > 1 && <span className="pagination-info-pages"> — page {page} / {totalPages}</span>}
      </>
    );
  };

  return (
    <div className="admin-page">

      {/* ── Lightbox ── */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'zoom-out',
        }}>
          <img src={lightbox} alt="Photo candidature" style={{
            maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12,
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          }} />
        </div>
      )}

      {/* ── Navbar ── */}
      <div className="admin-nav">
        <div className="admin-logo">🎋 BambooGlow Admin</div>
        <div className="admin-nav-right">
          <span className="admin-user">{user?.email}</span>
          <button className="admin-logout" onClick={logout}>Déconnexion</button>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="admin-tabs">
        {[
          { key: 'candidatures', icon: '📋', label: 'Candidatures' },
          { key: 'medecins',     icon: '🩺', label: 'Médecins'     },
          { key: 'produits',     icon: '🛍️', label: 'Produits'     },
          { key: 'episodes',     icon: '🎬', label: 'Épisodes'     },
        ].map(({ key, icon, label }) => (
          <button key={key} className={`admin-tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="admin-content">

        {/* ── Tab Candidatures ── */}
        {activeTab === 'candidatures' && (
          <>
            {/* Header + filtres statut + sélecteur taille de page */}
            <div className="admin-header">
              <h1>Candidatures <span>({total})</span></h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Filtres statut */}
                <div className="admin-filters">
                  <button className={`filter-pill ${!filterStatut ? 'active' : ''}`} onClick={() => setFilterStatut('')}>
                    Toutes
                  </button>
                  {STATUTS.map((s) => (
                    <button key={s} className={`filter-pill ${filterStatut === s ? 'active' : ''}`} onClick={() => setFilterStatut(s)}>
                      {STATUT_LABELS[s].label}
                    </button>
                  ))}
                </div>

                {/* Sélecteur lignes par page */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                  <span>Afficher :</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    style={{
                      border: '1.5px solid var(--border)', borderRadius: 7,
                      padding: '0.35rem 0.7rem', fontSize: '0.85rem',
                      fontWeight: 600, background: '#fafaf8', cursor: 'pointer',
                      outline: 'none', color: '#333',
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s === 0 ? 'Tout' : `${s} / page`}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-spinner">🎋</div>
            ) : candidatures.length === 0 ? (
              <div className="admin-empty">Aucune candidature trouvée.</div>
            ) : (
              <>
                {/* Résumé */}
                <div className="pagination-info">{displayInfo()}</div>

                {/* Tableau */}
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
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
                            {c.motivation?.slice(0, 60)}{c.motivation?.length > 60 ? '…' : ''}
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
                                <option key={s} value={s}>{STATUT_LABELS[s].label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination — masquée si "Tout afficher" ou une seule page */}
                {pageSize !== 0 && totalPages > 1 && (
                  <div className="pagination">
                    <button className="pagination-btn pagination-arrow" onClick={() => goToPage(1)}         disabled={page === 1}          title="Première page">«</button>
                    <button className="pagination-btn pagination-arrow" onClick={() => goToPage(page - 1)}  disabled={page === 1}          title="Page précédente">‹</button>
                    {getPageNumbers().map((p, i) =>
                      p === '...' ? (
                        <span key={`e-${i}`} className="pagination-ellipsis">…</span>
                      ) : (
                        <button key={p} className={`pagination-btn ${page === p ? 'active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
                      )
                    )}
                    <button className="pagination-btn pagination-arrow" onClick={() => goToPage(page + 1)}  disabled={page === totalPages} title="Page suivante">›</button>
                    <button className="pagination-btn pagination-arrow" onClick={() => goToPage(totalPages)} disabled={page === totalPages} title="Dernière page">»</button>
                  </div>
                )}
              </>
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