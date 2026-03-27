import { useState, useEffect } from "react";
import { medecinAPI } from "../services/api";
import "./Medecins.css";

const CATEGORIES = [
  { key: "tous",       label: "Tous"           },
  { key: "dentiste",   label: "🦷 Dentistes"   },
  { key: "medecin",    label: "🧖‍♀️ Artiste"    },
  { key: "esthetique", label: "✨ Esthétique"  },
];

const BADGE = {
  dentiste:   { cls: "badge-dentiste", label: "Dentiste"    },
  medecin:    { cls: "badge-medecin",  label: "Artiste"     },
  esthetique: { cls: "badge-esth",     label: "Esthétique"  },
};

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {"★".repeat(full)}
      {half ? "★" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

export default function Medecins() {
  const [medecins,  setMedecins]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [categorie, setCategorie] = useState("tous");
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    const params = {};
    if (categorie !== "tous") params.categorie = categorie;
    if (search.trim())        params.search    = search.trim();

    setLoading(true);
    medecinAPI
      .getAll(params)
      .then((res) => setMedecins(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categorie, search]);

  return (
    <section className="medecins-section reveal" id="medecins">
      <div className="container">
        <div className="s-label">Annuaire</div>
        <div className="s-title">Nos experts <em>partenaires</em></div>
        <div className="s-body">
          Tous les professionnels qui participent à BambooGlow sont sélectionnés
          pour leur expertise et leur bienveillance.
        </div>

        {/* ── Filtres ── */}
        <div className="med-search">
          <input
            className="search-input"
            type="text"
            placeholder="🔍  Rechercher un médecin, une spécialité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`filter-btn ${categorie === c.key ? "active" : ""}`}
              onClick={() => setCategorie(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ── Contenu ── */}
        {loading ? (
          <div className="loading-spinner">🎋</div>
        ) : medecins.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)", padding: "3rem" }}>
            Aucun résultat pour cette recherche.
          </div>
        ) : (
          <div className="med-grid">
            {medecins.map((m) => {
              const badge = BADGE[m.categorie] || BADGE.medecin;
              return (
                <div className="med-card" key={m._id}>

                  {/* Zone image */}
                  <div className="med-img-wrap">
                    {m.photo?.url ? (
                      <img
                        src={m.photo.url}
                        alt={m.nom}
                        className="med-img"
                      />
                    ) : (
                      <div
                        className="med-avatar-fallback"
                        style={{ background: m.avatarBg }}
                      >
                        {m.avatar}
                      </div>
                    )}
                    <span className={`med-badge ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="med-body">
                    <div className="med-name">{m.nom}</div>
                    <div className="med-spec">{m.specialite}</div>
                    <div className="med-addr">
                      📍 {m.gouvernorat || m.ville}, {m.adresse}
                    </div>
                    <div className="med-rating">
                      <Stars rating={m.rating} />
                      <span className="rating-num">
                        {m.rating} ({m.nbAvis} avis)
                      </span>
                    </div>
                  </div>

                  <button className="med-btn">Prendre RDV</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}