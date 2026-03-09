import { useState, useEffect } from 'react';
import { produitAPI } from '../services/api';

const CATEGORIES = ['visage', 'corps', 'maquillage', 'dentaire'];
const CAT_LABELS = {
  visage:     { label: '🧖 Visage',     color: '#7a9e7e' },
  corps:      { label: '🧴 Corps',      color: '#5e9ec9' },
  maquillage: { label: '💄 Maquillage', color: '#c95e9e' },
  dentaire:   { label: '🦷 Dentaire',   color: '#5e9ec9' },
};

const TAGS = [null, 'bamboo', 'nouveau', 'promo'];
const TAG_LABELS = {
  null:    { label: 'Aucun',       color: '#aaa' },
  bamboo:  { label: '🎋 BambooGlow', color: '#c8a96e' },
  nouveau: { label: '✨ Nouveau',   color: '#7a9e7e' },
  promo:   { label: '🔥 Promo',    color: '#c97a5e' },
};

const EMOJI_OPTIONS = ['🧴', '💆', '🧖', '💅', '🦷', '💄', '🌿', '✨', '🪷', '🫧', '🧼', '💊'];

const BG_OPTIONS = [
  'linear-gradient(135deg,#e8f4e8,#d0e8d0)',
  'linear-gradient(135deg,#f4e8f4,#e8d0f0)',
  'linear-gradient(135deg,#f4f0e8,#f0e0c8)',
  'linear-gradient(135deg,#e8f0f4,#d0e0f0)',
  'linear-gradient(135deg,#f4e8e8,#f0d0d0)',
  'linear-gradient(135deg,#f0f4e8,#e0f0c8)',
];

const EMPTY_FORM = {
  nom: '', marque: '', categorie: 'visage',
  prix: '', prixAncien: '',
  emoji: '🧴', bgColor: BG_OPTIONS[0],
  tag: null, stock: 100,
};

/* ─── Modale générique ─────────────────────────────────────── */
function Modal({ open, onClose, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="pa-overlay" onClick={onClose}>
      <div className="pa-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pa-modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

/* ─── Modale confirmation ──────────────────────────────────── */
function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="pa-overlay" onClick={onCancel}>
      <div className="pa-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="pa-confirm-icon">⚠️</div>
        <p>{message}</p>
        <div className="pa-confirm-actions">
          <button className="pa-btn-cancel" onClick={onCancel}>Annuler</button>
          <button className="pa-btn-danger" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Composant principal ──────────────────────────────────── */
export default function ProduitsAdmin() {
  const [produits,     setProduits]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterCat,    setFilterCat]    = useState('');

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [formError,    setFormError]    = useState('');

  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* Chargement */
  const fetchProduits = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCat) params.categorie = filterCat;
      const res = await produitAPI.getAll(params);
     setProduits(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduits(); }, [filterCat]);

  /* Ouvrir création */
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  /* Ouvrir modification */
  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      nom:        p.nom,
      marque:     p.marque,
      categorie:  p.categorie,
      prix:       p.prix,
      prixAncien: p.prixAncien || '',
      emoji:      p.emoji,
      bgColor:    p.bgColor,
      tag:        p.tag || null,
      stock:      p.stock,
    });
    setFormError('');
    setModalOpen(true);
  };

  /* Sauvegarder */
  const handleSave = async () => {
    if (!form.nom.trim() || !form.marque.trim() || !form.prix) {
      setFormError('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }
    if (isNaN(parseFloat(form.prix)) || parseFloat(form.prix) <= 0) {
      setFormError('Le prix doit être un nombre positif.');
      return;
    }
    setSaving(true);
    setFormError('');
    const payload = {
      ...form,
      prix:       parseFloat(form.prix),
      prixAncien: form.prixAncien ? parseFloat(form.prixAncien) : null,
      stock:      parseInt(form.stock) || 0,
    };
    try {
      if (editTarget) {
        const res = await produitAPI.update(editTarget._id, payload);
        setProduits((prev) => prev.map((p) => p._id === editTarget._id ? res.data.data : p));
      } else {
        const res = await produitAPI.create(payload);
        setProduits((prev) => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  /* Suppression */
  const askDelete = (p) => { setDeleteTarget(p); setConfirmOpen(true); };
  const handleDelete = async () => {
    try {
      await produitAPI.delete(deleteTarget._id);
      setProduits((prev) => prev.filter((p) => p._id !== deleteTarget._id));
    } catch {
      alert('Erreur lors de la suppression.');
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  /* Aperçu de la carte produit */
  const tagInfo = form.tag ? TAG_LABELS[form.tag] : null;

  /* ─── Rendu ──────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        .pa-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem}
        .pa-title{font-size:1.4rem;font-weight:700;color:#2d2d2d}
        .pa-title span{color:#aaa;font-size:1rem;font-weight:400;margin-left:.4rem}
        .pa-add-btn{background:linear-gradient(135deg,#c8a96e,#a88040);color:#fff;border:none;padding:.7rem 1.4rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.95rem;transition:opacity .2s}
        .pa-add-btn:hover{opacity:.85}

        .pa-filters{display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1.25rem;align-items:center}
        .pa-pill{background:#f5f0e8;border:none;padding:.5rem 1.1rem;border-radius:20px;cursor:pointer;font-size:.85rem;color:#555;transition:all .2s}
        .pa-pill.active,.pa-pill:hover{background:#c8a96e;color:#fff}

        .pa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.1rem}
        .pa-card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07);transition:transform .2s,box-shadow .2s}
        .pa-card:hover{transform:translateY(-3px);box-shadow:0 6px 24px rgba(0,0,0,.1)}
        .pa-card-img{height:120px;display:flex;align-items:center;justify-content:center;font-size:2.8rem;position:relative}
        .pa-card-tag{position:absolute;top:.5rem;left:.5rem;font-size:.6rem;font-weight:700;letter-spacing:.1em;padding:.2rem .5rem;border-radius:3px;text-transform:uppercase;background:#1a1a1a;color:#c8a96e}
        .pa-card-body{padding:.85rem 1rem 1rem}
        .pa-card-brand{font-size:.62rem;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.15rem}
        .pa-card-name{font-weight:600;color:#2d2d2d;font-size:.88rem;line-height:1.3;margin-bottom:.4rem}
        .pa-card-prices{display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem}
        .pa-price-main{font-weight:700;font-size:.95rem;color:#2d2d2d}
        .pa-price-old{font-size:.75rem;color:#bbb;text-decoration:line-through}
        .pa-card-meta{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.6rem}
        .pa-cat-badge{display:inline-block;padding:.18rem .6rem;border-radius:20px;font-size:.68rem;font-weight:600}
        .pa-stock{font-size:.72rem;color:#aaa}
        .pa-card-actions{display:flex;gap:.4rem}
        .pa-btn-edit{flex:1;background:#e8f0ff;color:#3a6fd8;border:none;padding:.4rem .6rem;border-radius:7px;cursor:pointer;font-size:.78rem;font-weight:600;transition:background .2s}
        .pa-btn-edit:hover{background:#d0e0ff}
        .pa-btn-del{flex:1;background:#ffe8e3;color:#c95e3a;border:none;padding:.4rem .6rem;border-radius:7px;cursor:pointer;font-size:.78rem;font-weight:600;transition:background .2s}
        .pa-btn-del:hover{background:#ffd0c5}

        .pa-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem}
        .pa-modal{background:#fff;border-radius:16px;padding:2rem;width:100%;max-width:600px;max-height:92vh;overflow-y:auto;position:relative;box-shadow:0 8px 48px rgba(0,0,0,.2);animation:paIn .22s ease}
        @keyframes paIn{from{opacity:0;transform:translateY(-16px) scale(.97)}to{opacity:1;transform:none}}
        .pa-modal-close{position:absolute;top:1rem;right:1rem;background:#f5f0e8;border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:.9rem;color:#666;display:flex;align-items:center;justify-content:center;transition:background .15s}
        .pa-modal-close:hover{background:#e8dfc8}
        .pa-modal h2{font-size:1.2rem;font-weight:700;color:#2d2d2d;margin-bottom:1.5rem}

        .pa-modal-inner{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .pa-form-full{grid-column:1/-1}
        .pa-label{display:block;font-size:.78rem;font-weight:600;color:#666;margin-bottom:.35rem;text-transform:uppercase;letter-spacing:.04em}
        .pa-req{color:#c8a96e}
        .pa-input,.pa-select{width:100%;padding:.6rem .9rem;border:1.5px solid #e0d8c8;border-radius:8px;font-size:.9rem;background:#fafaf8;outline:none;box-sizing:border-box;color:#333;font-family:inherit}
        .pa-input:focus,.pa-select:focus{border-color:#c8a96e;background:#fff}

        .pa-emoji-picker{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.35rem}
        .pa-emoji-opt{width:38px;height:38px;border-radius:8px;border:2px solid transparent;background:#f5f0e8;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .pa-emoji-opt:hover{background:#ede5d0}
        .pa-emoji-opt.selected{border-color:#c8a96e;background:#fdf5e4}

        .pa-bg-picker{display:flex;gap:.45rem;flex-wrap:wrap;margin-top:.35rem}
        .pa-bg-opt{width:36px;height:36px;border-radius:8px;border:2px solid transparent;cursor:pointer;transition:all .15s}
        .pa-bg-opt:hover{transform:scale(1.1)}
        .pa-bg-opt.selected{border-color:#c8a96e;box-shadow:0 0 0 3px rgba(200,169,110,.3)}

        .pa-preview-wrap{background:#f5f0e8;border-radius:10px;padding:1rem;display:flex;align-items:center;gap:1rem;margin-top:.5rem}
        .pa-preview-img{width:64px;height:64px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;position:relative}
        .pa-preview-tag{position:absolute;top:-.2rem;left:-.2rem;font-size:.5rem;font-weight:700;padding:.15rem .35rem;border-radius:3px;background:#1a1a1a;color:#c8a96e;text-transform:uppercase;white-space:nowrap}
        .pa-preview-info .pv-brand{font-size:.62rem;color:#aaa;text-transform:uppercase;letter-spacing:.1em;font-weight:600}
        .pa-preview-info .pv-name{font-weight:600;color:#2d2d2d;font-size:.85rem}
        .pa-preview-info .pv-price{font-weight:700;font-size:.9rem;color:#2d2d2d}

        .pa-form-error{background:#fff0ed;border:1.5px solid #f5c5b5;color:#c95e3a;padding:.7rem 1rem;border-radius:8px;font-size:.88rem;margin-top:1rem}
        .pa-form-actions{display:flex;justify-content:flex-end;gap:.75rem;margin-top:1.5rem;padding-top:1rem;border-top:1px solid #f0ece3}
        .pa-btn-cancel{background:#f5f0e8;color:#555;border:none;padding:.65rem 1.3rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;transition:background .15s}
        .pa-btn-cancel:hover{background:#e8dfc8}
        .pa-btn-save{background:linear-gradient(135deg,#c8a96e,#a88040);color:#fff;border:none;padding:.65rem 1.5rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;transition:opacity .2s}
        .pa-btn-save:hover{opacity:.88}
        .pa-btn-save:disabled{opacity:.55;cursor:not-allowed}

        .pa-confirm{background:#fff;border-radius:14px;padding:2rem 1.75rem;width:100%;max-width:380px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.2);animation:paIn .22s ease}
        .pa-confirm-icon{font-size:2.5rem;margin-bottom:.75rem}
        .pa-confirm p{color:#444;margin-bottom:1.5rem;font-size:.95rem;line-height:1.55}
        .pa-confirm-actions{display:flex;gap:.75rem;justify-content:center}
        .pa-btn-danger{background:#c95e3a;color:#fff;border:none;padding:.65rem 1.4rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;transition:background .15s}
        .pa-btn-danger:hover{background:#b04e2a}

        .pa-empty{text-align:center;color:#aaa;padding:3rem;font-size:1rem}
        .pa-spinner{text-align:center;padding:3rem;font-size:2rem}

        @media(max-width:600px){.pa-modal-inner{grid-template-columns:1fr}.pa-form-full{grid-column:1}}
      `}</style>

      {/* En-tête */}
      <div className="pa-top">
        <div className="pa-title">
          Produits boutique <span>({produits.length})</span>
        </div>
        <button className="pa-add-btn" onClick={openCreate}>＋ Ajouter un produit</button>
      </div>

      {/* Filtres catégorie */}
      <div className="pa-filters">
        <button className={`pa-pill ${!filterCat ? 'active' : ''}`} onClick={() => setFilterCat('')}>Tous</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`pa-pill ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>
            {CAT_LABELS[c].label}
          </button>
        ))}
      </div>

      {/* Grille produits */}
      {loading ? (
        <div className="pa-spinner">🌿</div>
      ) : produits.length === 0 ? (
        <div className="pa-empty">Aucun produit trouvé.</div>
      ) : (
        <div className="pa-grid">
          {produits.map((p) => {
            const cat = CAT_LABELS[p.categorie] || CAT_LABELS.visage;
            return (
              <div className="pa-card" key={p._id}>
                <div className="pa-card-img" style={{ background: p.bgColor }}>
                  {p.emoji}
                  {p.tag && (
                    <span className="pa-card-tag">{TAG_LABELS[p.tag]?.label}</span>
                  )}
                </div>
                <div className="pa-card-body">
                  <div className="pa-card-brand">{p.marque}</div>
                  <div className="pa-card-name">{p.nom}</div>
                  <div className="pa-card-prices">
                    <span className="pa-price-main">{p.prix} DT</span>
                    {p.prixAncien && <span className="pa-price-old">{p.prixAncien} DT</span>}
                  </div>
                  <div className="pa-card-meta">
                    <span className="pa-cat-badge" style={{ background: cat.color + '22', color: cat.color }}>
                      {cat.label}
                    </span>
                    <span className="pa-stock">📦 {p.stock}</span>
                  </div>
                  <div className="pa-card-actions">
                    <button className="pa-btn-edit" onClick={() => openEdit(p)}>✏️ Modifier</button>
                    <button className="pa-btn-del"  onClick={() => askDelete(p)}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Ajout / Modification */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2>{editTarget ? '✏️ Modifier le produit' : '➕ Ajouter un produit'}</h2>

        <div className="pa-modal-inner">

          {/* Nom */}
          <div className="pa-form-full">
            <label className="pa-label">Nom du produit <span className="pa-req">*</span></label>
            <input className="pa-input" value={form.nom}
              onChange={(e) => setField('nom', e.target.value)}
              placeholder="Sérum Éclat Bamboo" />
          </div>

          {/* Marque */}
          <div>
            <label className="pa-label">Marque <span className="pa-req">*</span></label>
            <input className="pa-input" value={form.marque}
              onChange={(e) => setField('marque', e.target.value)}
              placeholder="BambooGlow" />
          </div>

          {/* Catégorie */}
          <div>
            <label className="pa-label">Catégorie <span className="pa-req">*</span></label>
            <select className="pa-select" value={form.categorie}
              onChange={(e) => setField('categorie', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CAT_LABELS[c].label}</option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div>
            <label className="pa-label">Prix (DT) <span className="pa-req">*</span></label>
            <input className="pa-input" type="number" min="0" step="0.01"
              value={form.prix}
              onChange={(e) => setField('prix', e.target.value)}
              placeholder="49.90" />
          </div>

          {/* Prix ancien */}
          <div>
            <label className="pa-label">Prix barré (DT)</label>
            <input className="pa-input" type="number" min="0" step="0.01"
              value={form.prixAncien}
              onChange={(e) => setField('prixAncien', e.target.value)}
              placeholder="69.90" />
          </div>

          {/* Stock */}
          <div>
            <label className="pa-label">Stock</label>
            <input className="pa-input" type="number" min="0"
              value={form.stock}
              onChange={(e) => setField('stock', e.target.value)}
              placeholder="100" />
          </div>

          {/* Tag */}
          <div>
            <label className="pa-label">Tag</label>
            <select className="pa-select" value={form.tag ?? ''}
              onChange={(e) => setField('tag', e.target.value === '' ? null : e.target.value)}>
              <option value="">Aucun</option>
              {['bamboo', 'nouveau', 'promo'].map((t) => (
                <option key={t} value={t}>{TAG_LABELS[t].label}</option>
              ))}
            </select>
          </div>

          {/* Emoji */}
          <div className="pa-form-full">
            <label className="pa-label">Icône produit</label>
            <div className="pa-emoji-picker">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} type="button"
                  className={`pa-emoji-opt ${form.emoji === e ? 'selected' : ''}`}
                  onClick={() => setField('emoji', e)}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Couleur de fond */}
          <div className="pa-form-full">
            <label className="pa-label">Couleur de fond</label>
            <div className="pa-bg-picker">
              {BG_OPTIONS.map((bg) => (
                <div key={bg}
                  className={`pa-bg-opt ${form.bgColor === bg ? 'selected' : ''}`}
                  style={{ background: bg }}
                  onClick={() => setField('bgColor', bg)}
                />
              ))}
            </div>
          </div>

          {/* Aperçu */}
          <div className="pa-form-full">
            <label className="pa-label">Aperçu</label>
            <div className="pa-preview-wrap">
              <div className="pa-preview-img" style={{ background: form.bgColor }}>
                {form.emoji}
                {tagInfo && <span className="pa-preview-tag">{tagInfo.label}</span>}
              </div>
              <div className="pa-preview-info">
                <div className="pv-brand">{form.marque || 'Marque'}</div>
                <div className="pv-name">{form.nom || 'Nom du produit'}</div>
                <div className="pv-price">
                  {form.prix ? `${form.prix} DT` : '—'}
                  {form.prixAncien && (
                    <span style={{ marginLeft: '.5rem', fontSize: '.75rem', color: '#bbb', textDecoration: 'line-through' }}>
                      {form.prixAncien} DT
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {formError && <div className="pa-form-error">{formError}</div>}

        <div className="pa-form-actions">
          <button className="pa-btn-cancel" onClick={() => setModalOpen(false)}>Annuler</button>
          <button className="pa-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : editTarget ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </Modal>

      {/* Confirmation suppression */}
      <ConfirmModal
        open={confirmOpen}
        message={`Désactiver le produit "${deleteTarget?.nom}" ? Il n'apparaîtra plus dans la boutique.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
      />
    </>
  );
}