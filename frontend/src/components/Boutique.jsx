import { useState, useEffect } from 'react';
import { produitAPI } from '../services/api';
import './Boutique.css';

const TAG_STYLES = {
  bamboo:  { cls: 'tag-bamboo',  label: 'BambooGlow' },
  nouveau: { cls: 'tag-nouveau', label: 'Nouveau' },
  promo:   { cls: 'tag-promo' }, // label calculé dynamiquement
};

export default function Boutique() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    produitAPI.getAll()
      .then((res) => setProduits(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (produit) => {
    setCart((prev) => [...prev, produit._id]);
    setTimeout(() => setCart((prev) => prev.filter((id) => id !== produit._id)), 1500);
  };

  // Calcule le % de réduction arrondi
  const getPromoLabel = (prix, prixAncien) => {
    if (!prixAncien || prixAncien <= prix) return 'Promo';
    const pct = Math.round(((prixAncien - prix) / prixAncien) * 100);
    return `-${pct}%`;
  };

  return (
    <section className="boutique-section reveal" id="boutique">
      <div className="container">
        <div className="boutique-banner">
          <div>
            <h3>🎋 La Boutique BambooGlow</h3>
            <p>Les produits cosmétiques sélectionnés par nos experts · Livraison Tunisie & Maghreb</p>
          </div>
          <button className="banner-btn">Voir tout le catalogue</button>
        </div>

        <div className="s-label">Boutique</div>
        <div className="s-title">Produits <em>recommandés</em></div>

        {loading ? (
          <div className="loading-spinner">🌿</div>
        ) : (
          <div className="prod-grid">
            {produits.map((p) => {
              const tag = p.tag ? TAG_STYLES[p.tag] : null;
              const inCart = cart.includes(p._id);

              // Label du tag : promo = pourcentage calculé, autres = label fixe
              const tagLabel = p.tag === 'promo'
                ? getPromoLabel(p.prix, p.prixAncien)
                : tag?.label;

              return (
                <div className="prod-card" key={p._id}>
                  <div className="prod-img" style={{ background: p.bgColor }}>
                    {p.emoji}
                    {tag && (
                      <span className={`prod-tag ${tag.cls}`}>{tagLabel}</span>
                    )}
                  </div>
                  <div className="prod-body">
                    <div className="prod-brand">{p.marque}</div>
                    <div className="prod-name">{p.nom}</div>
                    <div className="prod-price">
                      <span className="price-main">{p.prix} DT</span>
                      {p.prixAncien && <span className="price-old">{p.prixAncien} DT</span>}
                    </div>
                    <button
                      className={`prod-add ${inCart ? 'added' : ''}`}
                      onClick={() => addToCart(p)}
                      disabled={inCart}
                    >
                      {inCart ? '✓ Ajouté !' : '+ Ajouter'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}