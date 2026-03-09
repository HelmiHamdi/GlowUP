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

export default function Admin() {
  const { user, logout } = useAuth();
  const [activeTab,    setActiveTab]    = useState('candidatures');
  const [candidatures, setCandidatures] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatut, setFilterStatut] = useState('');
  const [total,        setTotal]        = useState(0);

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
      {/* Barre de navigation */}
      <div className="admin-nav">
        <div className="admin-logo">🎋 BambooGlow Admin</div>
        <div className="admin-nav-right">
          <span className="admin-user">{user?.email}</span>
          <button className="admin-logout" onClick={logout}>Déconnexion</button>
        </div>
      </div>

      {/* Onglets */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'candidatures' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidatures')}
        >
          📋 Candidatures
        </button>
        <button
          className={`admin-tab ${activeTab === 'medecins' ? 'active' : ''}`}
          onClick={() => setActiveTab('medecins')}
        >
          🩺 Médecins
        </button>
        <button
          className={`admin-tab ${activeTab === 'produits' ? 'active' : ''}`}
          onClick={() => setActiveTab('produits')}
        >
          🛍️ Produits
        </button>
        <button
          className={`admin-tab ${activeTab === 'episodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('episodes')}
        >
          🎬 Épisodes
        </button>
      </div>

      <div className="admin-content">
        {/* Tab Candidatures */}
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
                      <th>Prénom</th><th>Âge</th><th>Email</th>
                      <th>Téléphone</th><th>Ville</th><th>Motivation</th>
                      <th>Date</th><th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidatures.map((c) => (
                      <tr key={c._id}>
                        <td className="td-name">{c.prenom}</td>
                        <td>{c.age}</td>
                        <td className="td-email">{c.email}</td>
                        <td>{c.telephone}</td>
                        <td>{c.ville}</td>
                        <td className="td-motiv" title={c.motivation}>
                          {c.motivation.slice(0, 60)}{c.motivation.length > 60 ? '…' : ''}
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
            )}
          </>
        )}

        {/* Tab Médecins */}
        {activeTab === 'medecins' && <MedecinsAdmin />}

        {/* Tab Produits */}
        {activeTab === 'produits' && <ProduitsAdmin />}

        {/* Tab Épisodes */}
        {activeTab === 'episodes' && <EpisodesAdmin />}
      </div>
    </div>
  );
}