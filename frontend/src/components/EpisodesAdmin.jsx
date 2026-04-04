import { useState, useEffect } from 'react';
import { episodeAPI } from '../services/api';

const BG_OPTIONS = [
  'linear-gradient(135deg,#0f1a0f,#1a2a1a)',
  'linear-gradient(135deg,#1a1a0f,#2a2a1a)',
  'linear-gradient(135deg,#0f0f1a,#1a1a2a)',
  'linear-gradient(135deg,#1a0f0f,#2a1a1a)',
  'linear-gradient(135deg,#0f1a1a,#1a2a2a)',
  'linear-gradient(135deg,#1a0f1a,#2a1a2a)',
];

const LABEL_COLORS = [
  { bg: 'rgba(122,158,126,0.8)', text: '#fff', name: '🟢 Vert' },
  { bg: 'rgba(200,169,110,0.9)', text: '#fff', name: '🟡 Doré' },
  { bg: 'rgba(201,94,58,0.85)',  text: '#fff', name: '🟠 Terre' },
  { bg: 'rgba(94,158,201,0.85)', text: '#fff', name: '🔵 Bleu' },
  { bg: 'rgba(30,30,30,0.9)',    text: '#c8a96e', name: '⚫ Noir/Or' },
];

const EMOJI_OPTIONS = ['🎬', '🎥', '💄', '🧖', '🌿', '✨', '🎙️', '📹', '🎭', '💅'];

const EMPTY_FORM = {
  numero: '',
  saison: 1,
  titre: '',
  description: '',
  emoji: '🎬',
  duree: '00:00',
  vues: 0,
  youtubeId: '',
  bgColor: BG_OPTIONS[0],
  labelColor: LABEL_COLORS[0].bg,
  labelTextColor: LABEL_COLORS[0].text,
  publie: true,
};

function extractYoutubeId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  const longUrl = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longUrl) return longUrl[1];
  const shortUrl = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortUrl) return shortUrl[1];
  const embedUrl = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedUrl) return embedUrl[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return trimmed;
}

function Modal({ open, onClose, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="ea-overlay" onClick={onClose}>
      <div className="ea-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ea-modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="ea-overlay" onClick={onCancel}>
      <div className="ea-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="ea-confirm-icon">⚠️</div>
        <p>{message}</p>
        <div className="ea-confirm-actions">
          <button className="ea-btn-cancel" onClick={onCancel}>Annuler</button>
          <button className="ea-btn-danger" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

export default function EpisodesAdmin() {
  const [episodes,     setEpisodes]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterSaison, setFilterSaison] = useState('');

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [formError,    setFormError]    = useState('');

  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [syncing,  setSyncing]  = useState(false);
  const [syncMsg,  setSyncMsg]  = useState('');

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterSaison) params.saison = filterSaison;
      const res = await episodeAPI.getAll(params);
      setEpisodes(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEpisodes(); }, [filterSaison]);

  const handleSyncVues = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await episodeAPI.syncViews();
      await fetchEpisodes();
      setSyncMsg('✅ ' + res.data.message);
      setTimeout(() => setSyncMsg(''), 4000);
    } catch (err) {
      setSyncMsg('❌ Erreur : ' + (err?.response?.data?.message || err.message));
      setTimeout(() => setSyncMsg(''), 5000);
    } finally {
      setSyncing(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (ep) => {
    setEditTarget(ep);
    setForm({
      numero:         ep.numero,
      saison:         ep.saison,
      titre:          ep.titre,
      description:    ep.description || '',
      emoji:          ep.emoji,
      duree:          ep.duree,
      vues:           ep.vues,
      youtubeId:      ep.youtubeId || '',
      bgColor:        ep.bgColor,
      labelColor:     ep.labelColor,
      labelTextColor: ep.labelTextColor,
      publie:         ep.publie,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.titre.trim() || !form.numero) {
      setFormError('Le numéro et le titre sont obligatoires (*).');
      return;
    }
    setSaving(true);
    setFormError('');
    const cleanYoutubeId = extractYoutubeId(form.youtubeId);
    const payload = {
      ...form,
      numero:    parseInt(form.numero) || 1,
      saison:    parseInt(form.saison) || 1,
      vues:      parseInt(form.vues)   || 0,
      youtubeId: cleanYoutubeId,
    };
    try {
      if (editTarget) {
        const res = await episodeAPI.update(editTarget._id, payload);
        setEpisodes((prev) => prev.map((ep) => ep._id === editTarget._id ? res.data.data : ep));
      } else {
        const res = await episodeAPI.create(payload);
        setEpisodes((prev) => [...prev, res.data.data].sort((a, b) => a.saison - b.saison || a.numero - b.numero));
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublie = async (ep) => {
    try {
      const res = await episodeAPI.update(ep._id, { ...ep, publie: !ep.publie });
      setEpisodes((prev) => prev.map((e) => e._id === ep._id ? res.data.data : e));
    } catch {
      alert('Erreur lors de la mise à jour.');
    }
  };

  const askDelete    = (ep) => { setDeleteTarget(ep); setConfirmOpen(true); };
  const handleDelete = async () => {
    try {
      await episodeAPI.update(deleteTarget._id, { ...deleteTarget, publie: false });
      setEpisodes((prev) => prev.filter((e) => e._id !== deleteTarget._id));
    } catch {
      alert('Erreur lors de la suppression.');
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const saisons = [...new Set(episodes.map((e) => e.saison))].sort();

  return (
    <>
      <style>{`
        .ea-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem}
        .ea-title{font-size:1.4rem;font-weight:700;color:#2d2d2d}
        .ea-title span{color:#aaa;font-size:1rem;font-weight:400;margin-left:.4rem}

        .ea-top-actions{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center}
        .ea-sync-btn{background:linear-gradient(135deg,#4a9e7e,#2a7e5e);color:#fff;border:none;padding:.7rem 1.4rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.95rem;transition:opacity .2s}
        .ea-sync-btn:hover{opacity:.85}
        .ea-sync-btn:disabled{opacity:.55;cursor:not-allowed}
        .ea-sync-msg{font-size:.82rem;padding:.45rem .85rem;border-radius:8px;background:#f0faf5;color:#2a7e5e;border:1px solid #b0ddc8}
        .ea-sync-msg.err{background:#fff0ed;color:#c95e3a;border-color:#f5c5b5}

        .ea-add-btn{background:linear-gradient(135deg,#c8a96e,#a88040);color:#fff;border:none;padding:.7rem 1.4rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.95rem;transition:opacity .2s}
        .ea-add-btn:hover{opacity:.85}

        .ea-filters{display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1.25rem;align-items:center}
        .ea-pill{background:#f5f0e8;border:none;padding:.5rem 1.1rem;border-radius:20px;cursor:pointer;font-size:.85rem;color:#555;transition:all .2s}
        .ea-pill.active,.ea-pill:hover{background:#c8a96e;color:#fff}

        .ea-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.1rem}
        .ea-card{background:#1a1f1a;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.18);transition:transform .2s,box-shadow .2s;border:1px solid rgba(255,255,255,.06)}
        .ea-card:hover{transform:translateY(-3px);box-shadow:0 6px 28px rgba(0,0,0,.25)}
        .ea-card-thumb{height:110px;display:flex;align-items:center;justify-content:center;position:relative}
        .ea-play{width:40px;height:40px;background:rgba(255,255,255,.9);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.9rem;padding-left:3px}
        .ea-ep-badge{position:absolute;top:.5rem;left:.5rem;font-size:.58rem;font-weight:700;letter-spacing:.1em;padding:.2rem .5rem;border-radius:3px;text-transform:uppercase}
        .ea-duration{position:absolute;bottom:.5rem;right:.5rem;background:rgba(0,0,0,.75);color:#fff;font-size:.62rem;font-weight:600;padding:.15rem .4rem;border-radius:2px}
        .ea-card-body{padding:.85rem 1rem 1rem}
        .ea-card-title{font-weight:600;color:#fff;font-size:.88rem;line-height:1.3;margin-bottom:.35rem}
        .ea-card-desc{font-size:.76rem;color:rgba(255,255,255,.4);line-height:1.4;margin-bottom:.5rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .ea-card-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem}
        .ea-vues{font-size:.72rem;color:rgba(255,255,255,.3)}
        .ea-publie-toggle{display:flex;align-items:center;gap:.4rem;cursor:pointer}
        .ea-toggle-track{width:32px;height:18px;border-radius:9px;background:#444;position:relative;transition:background .2s}
        .ea-toggle-track.on{background:#7a9e7e}
        .ea-toggle-knob{width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:left .2s}
        .ea-toggle-track.on .ea-toggle-knob{left:16px}
        .ea-toggle-label{font-size:.7rem;color:rgba(255,255,255,.4)}
        .ea-card-actions{display:flex;gap:.4rem}
        .ea-btn-edit{flex:1;background:rgba(58,111,216,.2);color:#7aabf0;border:none;padding:.4rem .6rem;border-radius:7px;cursor:pointer;font-size:.78rem;font-weight:600;transition:background .2s}
        .ea-btn-edit:hover{background:rgba(58,111,216,.35)}
        .ea-btn-del{flex:1;background:rgba(201,94,58,.2);color:#f07a5e;border:none;padding:.4rem .6rem;border-radius:7px;cursor:pointer;font-size:.78rem;font-weight:600;transition:background .2s}
        .ea-btn-del:hover{background:rgba(201,94,58,.35)}
        .ea-yt-link{display:block;font-size:.7rem;color:#c8a96e;margin-top:.3rem;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ea-yt-link:hover{text-decoration:underline}
        .ea-yt-id{display:inline-block;font-size:.68rem;font-family:monospace;background:rgba(200,169,110,.15);color:#c8a96e;padding:.15rem .45rem;border-radius:4px;margin-top:.3rem;letter-spacing:.03em}

        .ea-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem}
        .ea-modal{background:#fff;border-radius:16px;padding:2rem;width:100%;max-width:600px;max-height:92vh;overflow-y:auto;position:relative;box-shadow:0 8px 48px rgba(0,0,0,.25);animation:eaIn .22s ease}
        @keyframes eaIn{from{opacity:0;transform:translateY(-16px) scale(.97)}to{opacity:1;transform:none}}
        .ea-modal-close{position:absolute;top:1rem;right:1rem;background:#f5f0e8;border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:.9rem;color:#666;display:flex;align-items:center;justify-content:center;transition:background .15s}
        .ea-modal-close:hover{background:#e8dfc8}
        .ea-modal h2{font-size:1.2rem;font-weight:700;color:#2d2d2d;margin-bottom:1.5rem}

        .ea-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.9rem}
        .ea-form-full{grid-column:1/-1}
        .ea-label{display:block;font-size:.78rem;font-weight:600;color:#666;margin-bottom:.35rem;text-transform:uppercase;letter-spacing:.04em}
        .ea-req{color:#c8a96e}
        .ea-input,.ea-select,.ea-textarea{width:100%;padding:.6rem .9rem;border:1.5px solid #e0d8c8;border-radius:8px;font-size:.9rem;background:#fafaf8;outline:none;box-sizing:border-box;color:#333;font-family:inherit}
        .ea-input:focus,.ea-select:focus,.ea-textarea:focus{border-color:#c8a96e;background:#fff}
        .ea-textarea{resize:vertical;min-height:72px}
        .ea-input-hint{font-size:.72rem;color:#aaa;margin-top:.25rem}
        .ea-input-hint strong{color:#c8a96e}
        .ea-yt-preview{margin-top:.4rem;font-size:.78rem;color:#7a9e7e;min-height:1.2em}
        .ea-yt-preview span{font-family:monospace;background:#f0faf0;padding:.1rem .4rem;border-radius:4px}

        .ea-emoji-picker{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.35rem}
        .ea-emoji-opt{width:38px;height:38px;border-radius:8px;border:2px solid transparent;background:#f5f0e8;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .ea-emoji-opt:hover{background:#ede5d0}
        .ea-emoji-opt.selected{border-color:#c8a96e;background:#fdf5e4}

        .ea-bg-picker{display:flex;gap:.45rem;flex-wrap:wrap;margin-top:.35rem}
        .ea-bg-opt{width:36px;height:36px;border-radius:8px;border:2px solid transparent;cursor:pointer;transition:all .15s}
        .ea-bg-opt:hover{transform:scale(1.1)}
        .ea-bg-opt.selected{border-color:#c8a96e;box-shadow:0 0 0 3px rgba(200,169,110,.3)}

        .ea-label-picker{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.35rem}
        .ea-label-opt{padding:.3rem .8rem;border-radius:20px;border:2px solid transparent;cursor:pointer;font-size:.75rem;font-weight:600;transition:all .15s}
        .ea-label-opt.selected{border-color:#c8a96e;box-shadow:0 0 0 3px rgba(200,169,110,.25)}

        .ea-preview{background:#111;border-radius:10px;padding:0;overflow:hidden;margin-top:.5rem}
        .ea-preview-thumb{height:80px;display:flex;align-items:center;justify-content:center;position:relative}
        .ea-preview-play{width:34px;height:34px;background:rgba(255,255,255,.9);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;padding-left:2px}
        .ea-preview-badge{position:absolute;top:.4rem;left:.4rem;font-size:.55rem;font-weight:700;letter-spacing:.1em;padding:.15rem .45rem;border-radius:3px;text-transform:uppercase}
        .ea-preview-dur{position:absolute;bottom:.4rem;right:.4rem;background:rgba(0,0,0,.75);color:#fff;font-size:.6rem;padding:.12rem .35rem;border-radius:2px}
        .ea-preview-body{padding:.6rem .8rem .7rem}
        .ea-preview-title{font-size:.82rem;font-weight:600;color:#fff;line-height:1.3}

        .ea-checkbox-row{display:flex;align-items:center;gap:.6rem;margin-top:.4rem}
        .ea-checkbox-row input{width:16px;height:16px;accent-color:#c8a96e;cursor:pointer}
        .ea-checkbox-row label{font-size:.88rem;color:#555;cursor:pointer}

        .ea-form-error{background:#fff0ed;border:1.5px solid #f5c5b5;color:#c95e3a;padding:.7rem 1rem;border-radius:8px;font-size:.88rem;margin-top:1rem}
        .ea-form-actions{display:flex;justify-content:flex-end;gap:.75rem;margin-top:1.5rem;padding-top:1rem;border-top:1px solid #f0ece3}
        .ea-btn-cancel{background:#f5f0e8;color:#555;border:none;padding:.65rem 1.3rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;transition:background .15s}
        .ea-btn-cancel:hover{background:#e8dfc8}
        .ea-btn-save{background:linear-gradient(135deg,#c8a96e,#a88040);color:#fff;border:none;padding:.65rem 1.5rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;transition:opacity .2s}
        .ea-btn-save:hover{opacity:.88}
        .ea-btn-save:disabled{opacity:.55;cursor:not-allowed}

        .ea-confirm{background:#fff;border-radius:14px;padding:2rem 1.75rem;width:100%;max-width:380px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.2);animation:eaIn .22s ease}
        .ea-confirm-icon{font-size:2.5rem;margin-bottom:.75rem}
        .ea-confirm p{color:#444;margin-bottom:1.5rem;font-size:.95rem;line-height:1.55}
        .ea-confirm-actions{display:flex;gap:.75rem;justify-content:center}
        .ea-btn-danger{background:#c95e3a;color:#fff;border:none;padding:.65rem 1.4rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;transition:background .15s}
        .ea-btn-danger:hover{background:#b04e2a}

        .ea-empty{text-align:center;color:#aaa;padding:3rem;font-size:1rem}
        .ea-spinner{text-align:center;padding:3rem;font-size:2rem}

        @media(max-width:600px){
          .ea-form-grid{grid-template-columns:1fr}
          .ea-form-full{grid-column:1}
          .ea-top-actions{width:100%}
          .ea-sync-btn,.ea-add-btn{flex:1;text-align:center}
        }
      `}</style>

      {/* ── En-tête ── */}
      <div className="ea-top">
        <div className="ea-title">
          Épisodes <span>({episodes.length})</span>
        </div>
        <div className="ea-top-actions">
          {syncMsg && (
            <span className={'ea-sync-msg' + (syncMsg.startsWith('❌') ? ' err' : '')}>
              {syncMsg}
            </span>
          )}
          <button
            className="ea-sync-btn"
            onClick={handleSyncVues}
            disabled={syncing}
          >
            {syncing ? '⏳ Sync en cours…' : '🔄 Sync vues YouTube'}
          </button>
          <button className="ea-add-btn" onClick={openCreate}>
            ＋ Ajouter un épisode
          </button>
        </div>
      </div>

      {/* ── Filtres saison ── */}
      <div className="ea-filters">
        <button className={`ea-pill ${!filterSaison ? 'active' : ''}`} onClick={() => setFilterSaison('')}>
          Toutes saisons
        </button>
        {saisons.map((s) => (
          <button key={s} className={`ea-pill ${filterSaison == s ? 'active' : ''}`} onClick={() => setFilterSaison(s)}>
            Saison {s}
          </button>
        ))}
      </div>

      {/* ── Grille épisodes ── */}
      {loading ? (
        <div className="ea-spinner">🎬</div>
      ) : episodes.length === 0 ? (
        <div className="ea-empty">Aucun épisode trouvé.</div>
      ) : (
        <div className="ea-grid">
          {episodes.map((ep) => (
            <div className="ea-card" key={ep._id}>
              <div className="ea-card-thumb" style={{ background: ep.bgColor }}>
                <div className="ea-play">▶</div>
                <span className="ea-ep-badge" style={{ background: ep.labelColor, color: ep.labelTextColor }}>
                  S{ep.saison} · EP.{String(ep.numero).padStart(2, '0')}
                </span>
                <span className="ea-duration">{ep.duree}</span>
              </div>
              <div className="ea-card-body">
                <div className="ea-card-title">{ep.titre}</div>
                {ep.description && <div className="ea-card-desc">{ep.description}</div>}

                {/* ✅ CORRIGÉ : balise <a> complète */}
                {ep.youtubeId && (
                  <div>
                    <span className="ea-yt-id">▶ {ep.youtubeId}</span>
                    <a
                      className="ea-yt-link"
                      href={`https://youtube.com/watch?v=${ep.youtubeId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ouvrir sur YouTube ↗
                    </a>
                  </div>
                )}

                <div className="ea-card-meta">
                  <span className="ea-vues">👁 {ep.vues.toLocaleString()} vues</span>
                  <div className="ea-publie-toggle" onClick={() => togglePublie(ep)}>
                    <div className={`ea-toggle-track ${ep.publie ? 'on' : ''}`}>
                      <div className="ea-toggle-knob" />
                    </div>
                    <span className="ea-toggle-label">{ep.publie ? 'Publié' : 'Masqué'}</span>
                  </div>
                </div>
                <div className="ea-card-actions">
                  <button className="ea-btn-edit" onClick={() => openEdit(ep)}>✏️ Modifier</button>
                  <button className="ea-btn-del"  onClick={() => askDelete(ep)}>🗑️ Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Ajout / Modification ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2>{editTarget ? "✏️ Modifier l'épisode" : '➕ Ajouter un épisode'}</h2>
        <div className="ea-form-grid">

          <div>
            <label className="ea-label">N° épisode <span className="ea-req">*</span></label>
            <input className="ea-input" type="number" min="1"
              value={form.numero}
              onChange={(e) => setField('numero', e.target.value)}
              placeholder="1" />
          </div>

          <div>
            <label className="ea-label">Saison <span className="ea-req">*</span></label>
            <input className="ea-input" type="number" min="1"
              value={form.saison}
              onChange={(e) => setField('saison', e.target.value)}
              placeholder="1" />
          </div>

          <div className="ea-form-full">
            <label className="ea-label">Titre <span className="ea-req">*</span></label>
            <input className="ea-input" value={form.titre}
              onChange={(e) => setField('titre', e.target.value)}
              placeholder="La transformation de Yasmine" />
          </div>

          <div className="ea-form-full">
            <label className="ea-label">Description</label>
            <textarea className="ea-textarea" value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Courte description de l'épisode…" />
          </div>

          <div className="ea-form-full">
            <label className="ea-label">YouTube ID ou URL</label>
            <input className="ea-input" value={form.youtubeId}
              onChange={(e) => setField('youtubeId', e.target.value)}
              placeholder="dQw4w9WgXcQ  ou  https://youtube.com/watch?v=dQw4w9WgXcQ" />
            <div className="ea-input-hint">
              Collez l'URL complète <strong>ou</strong> juste l'ID (11 caractères après <strong>?v=</strong>)
            </div>
            {form.youtubeId && (
              <div className="ea-yt-preview">
                ✅ ID détecté : <span>{extractYoutubeId(form.youtubeId)}</span>
              </div>
            )}
          </div>

          <div>
            <label className="ea-label">Durée</label>
            <input className="ea-input" value={form.duree}
              onChange={(e) => setField('duree', e.target.value)}
              placeholder="24:35" />
          </div>

          <div>
            <label className="ea-label">Vues</label>
            <input className="ea-input" type="number" min="0"
              value={form.vues}
              onChange={(e) => setField('vues', e.target.value)}
              placeholder="0" />
          </div>

          <div className="ea-form-full">
            <label className="ea-label">Icône</label>
            <div className="ea-emoji-picker">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} type="button"
                  className={`ea-emoji-opt ${form.emoji === e ? 'selected' : ''}`}
                  onClick={() => setField('emoji', e)}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="ea-form-full">
            <label className="ea-label">Fond de la vignette</label>
            <div className="ea-bg-picker">
              {BG_OPTIONS.map((bg) => (
                <div key={bg}
                  className={`ea-bg-opt ${form.bgColor === bg ? 'selected' : ''}`}
                  style={{ background: bg }}
                  onClick={() => setField('bgColor', bg)}
                />
              ))}
            </div>
          </div>

          <div className="ea-form-full">
            <label className="ea-label">Couleur du badge EP.</label>
            <div className="ea-label-picker">
              {LABEL_COLORS.map((lc) => (
                <div key={lc.bg}
                  className={`ea-label-opt ${form.labelColor === lc.bg ? 'selected' : ''}`}
                  style={{ background: lc.bg, color: lc.text }}
                  onClick={() => { setField('labelColor', lc.bg); setField('labelTextColor', lc.text); }}>
                  {lc.name}
                </div>
              ))}
            </div>
          </div>

          <div className="ea-form-full">
            <div className="ea-checkbox-row">
              <input type="checkbox" id="publie-check" checked={form.publie}
                onChange={(e) => setField('publie', e.target.checked)} />
              <label htmlFor="publie-check">Épisode publié (visible sur le site)</label>
            </div>
          </div>

          <div className="ea-form-full">
            <label className="ea-label">Aperçu</label>
            <div className="ea-preview">
              <div className="ea-preview-thumb" style={{ background: form.bgColor }}>
                <div className="ea-preview-play">▶</div>
                <span className="ea-preview-badge"
                  style={{ background: form.labelColor, color: form.labelTextColor }}>
                  S{form.saison} · EP.{String(form.numero || '?').padStart(2, '0')}
                </span>
                <span className="ea-preview-dur">{form.duree || '00:00'}</span>
              </div>
              <div className="ea-preview-body">
                <div className="ea-preview-title">{form.titre || "Titre de l'épisode…"}</div>
              </div>
            </div>
          </div>

        </div>

        {formError && <div className="ea-form-error">{formError}</div>}

        <div className="ea-form-actions">
          <button className="ea-btn-cancel" onClick={() => setModalOpen(false)}>Annuler</button>
          <button className="ea-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : editTarget ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        message={`Masquer l'épisode "${deleteTarget?.titre}" ? Il n'apparaîtra plus sur le site.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
      />
    </>
  );
}