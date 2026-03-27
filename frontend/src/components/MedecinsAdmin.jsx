import { useState, useEffect, useRef } from 'react';
import { medecinAPI } from '../services/api';

const GOUVERNORATS_DATA = {
  'Tunis':       ['Bab Bhar','Bab Souika','Carthage','El Kabaria','El Menzah','El Omrane','El Ouardia','Ezzouhour','Hrairia','Jebel Jelloud','La Goulette','La Marsa','Le Bardo','Le Kram','Médina','Séjoumi','Sidi Bou Saïd','Sidi El Béchir','Sidi Hassine','Sidi Hached','Sidi Mahrsi','Sidi Mansour','Sidi Othman','Sidi Thabet','Sijoumi','Tunis Ville','Tunis Médina'],
  'Ariana':      ['Ariana Ville','Ettadhamen','Kalâat el-Andalous','La Soukra','Mnihla','Raoued','Sidi Thabet','Borj Louzir','Chotrana','Ghazela','Ghazoua','Mourouj 2','Sidi Aïch','Sidi Rezig','Soukra 2','Ennaser','Ettahrir','Ettahrir 2','Ettahrir 3','Ettahrir 4','Ettahrir 5','Ettahrir 6','Ettahrir 7','Ettahrir 8','Ettahrir 9','Ettahrir 10'],
  'Ben Arous':   ['Ben Arous Ville','Bou Mhel el-Bassatine','El Mourouj','Ezzahra','Fouchana','Hammam-Lif','Hammam Chott','Mégrine','Mohamedia','Mornag','Nouvelle Medina','Radès','Rades 2','Rades 3','Rades 4','Rades 5','Rades 6','Rades 7','Rades 8','Rades 9','Rades 10','Rades 11','Rades 12','Rades 13','Rades 14'],
  'Manouba':     ['Borj el Amri','Djedeïda','Douar Hicher','El Battan','Manouba Ville','Mornaguia','Oued Ellil','Tébourba','Den Den','Douar Hicher 2','Douar Hicher 3','Douar Hicher 4','Douar Hicher 5','Douar Hicher 6','Douar Hicher 7','Douar Hicher 8','Douar Hicher 9','Douar Hicher 10','Douar Hicher 11','Douar Hicher 12','Douar Hicher 13','Douar Hicher 14'],
  'Nabeul':      ['Béni Khalled','Béni Khiar','Bou Argoub','Dar Chaâbane','Grombalia','Hammamet','Kélibia','Korba','Menzel Bouzelfa','Menzel Temime','Nabeul Ville','Soliman','Takelsa','Béni Khiar 2','Béni Khiar 3','Béni Khiar 4','Béni Khiar 5','Béni Khiar 6','Béni Khiar 7','Béni Khiar 8','Béni Khiar 9','Béni Khiar 10','Béni Khiar 11','Béni Khiar 12','Béni Khiar 13'],
  'Zaghouan':    ['Bir Mcherga','El Fahs','Nadhour','Saouaf','Zaghouan Ville','Zriba'],
  'Bizerte':     ['Bizerte Ville','El Alia','Ghar el-Melh','Mateur','Menzel Bourguiba','Menzel Jemil','Ras Jebel','Sejnane','Tinja','Utique','Bizerte 2','Bizerte 3','Bizerte 4','Bizerte 5','Bizerte 6','Bizerte 7','Bizerte 8','Bizerte 9','Bizerte 10','Bizerte 11','Bizerte 12','Bizerte 13'],
  'Béja':        ['Amdoun','Béja Ville','Goubellat','Mejez el-Bab','Nefza','Téboursouk','Testour','Thibar'],
  'Jendouba':    ['Aïn Draham','Bou Salem','Fernana','Ghardimaou','Jendouba Ville','Oued Meliz','Tabarka'],
  'Le Kef':      ['Dahmani','El Ksour','Jerissa','Kalâat Sinane','Le Kef Ville','Nebeur','Sakiet Sidi Youssef','Tajerouine'],
  'Siliana':     ['Bargou','Bourouis','El Aroussa','El Krib','Gaâfour','Kesra','Makthar','Rouhia','Siliana Ville'],
  'Kairouan':    ['Bou Hajla','Chebika','El Alâa','Haffouz','Kairouan Ville','Nasrallah','Oueslatia','Sbikha','Shebhba'],
  'Kasserine':   ['El Ayoun','Fériana','Foussana','Haïdra','Hidra','Jedelienne','Kasserine Ville','Majel Bel Abbès','Sbeitla','Thala'],
  'Sidi Bouzid': ['Ben Aoun','Bir El Hafey','Cebbala','Jilma','Meknassy','Menzel Bouzaïane','Mezzouna','Regueb','Sidi Bouzid Ville','Souk Jedid'],
  'Sousse':      ['Akouda','Bouficha','Enfidha','Hammam Sousse','Kalâa Kebira','Kalâa Seghira','Kondar','Msaken','Sidi Bou Ali','Sidi El Hani','Sousse Médina','Sousse Riadh'],
  'Monastir':    ['Bembla','Beni Hassen','Jemmal','Khniss','Ksar Hellal','Ksibet El Mediouni','Moknine','Monastir Ville','Ouerdanine','Sahline','Téboulba','Zeramdine'],
  'Mahdia':      ['Bou Merdes','Chebba','El Bradaa','El Jem','Essouassi','Ksour Essef','La Chebba','Mahdia Ville','Melloulèche','Ouled Chamekh','Salakta','Sidi Alouane'],
  'Sfax':        ['Agareb','Bir Ali Ben Khalifa','El Ain','El Amra','Ghraiba','Gremda','Jebeniana','Kerkennah','Mahres','Menzel Chaker','Sakiet Eddaïer','Sakiet Ezzit','Sfax Médina','Sfax Ville','Thyna'],
  'Gafsa':       ['Belkhir','El Guettar','El Ksar','Gafsa Ville','Mdhilla','Métlaoui','Moulares','Om El Araies','Redeyef','Sened'],
  'Tozeur':      ['Degache','Hazoua','Nefta','Tamerza','Tozeur Ville'],
  'Kébili':      ['Douz','El Faouar','Kébili Ville','Souk Lahad'],
  'Gabès':       ['El Hamma','El Metouia','Gabès Médina','Gabès Ville','Ghannouch','Mareth','Matmata','Menzel el-Habib','Nouvelle Matmata'],
  'Médenine':    ['Ben Gardane','Beni Khedache','Djerba-Ajim','Djerba-Midoun','Houmt Souk','Médenine Ville','Sidi Makhlouf','Zarzis'],
  'Tataouine':   ['Bir Lahmar','Ghomrassen','Remada','Smar','Tataouine Ville'],
};

const GOUVERNORATS = Object.keys(GOUVERNORATS_DATA).sort((a, b) => a.localeCompare(b, 'fr'));
const CATEGORIES   = ['dentiste', 'medecin', 'esthetique'];
const CAT_LABELS   = {
  dentiste:   { label: '🦷 Dentiste',   color: '#5e9ec9' },
  medecin:    { label: '🩺 Médecin',    color: '#7a9e7e' },
  esthetique: { label: '✨ Esthétique', color: '#c9a05e' },
};
const AVATAR_OPTIONS = ['👨‍⚕️','👩‍⚕️','🦷','🧖‍♀️','🧑‍⚕️','💆‍♀️','🩺','💅','🧬'];

const EMPTY_FORM = {
  nom: '', specialite: '', categorie: 'medecin',
  gouvernorat: '', adresse: '', telephone: '', email: '',
  rating: 5.0, nbAvis: 0,
  avatar: '👨‍⚕️', avatarBg: 'linear-gradient(135deg,#e8f4e8,#d0e8d0)',
};

/* ─── Modale générique ─────────────────────────────────────────────────────── */
function Modal({ open, onClose, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="mg-overlay" onClick={onClose}>
      <div className="mg-modal" onClick={(e) => e.stopPropagation()}>
        <button className="mg-modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

/* ─── Modale confirmation ──────────────────────────────────────────────────── */
function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="mg-overlay" onClick={onCancel}>
      <div className="mg-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="mg-confirm-icon">⚠️</div>
        <p>{message}</p>
        <div className="mg-confirm-actions">
          <button className="mg-btn-cancel" onClick={onCancel}>Annuler</button>
          <button className="mg-btn-danger" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Composant principal ──────────────────────────────────────────────────── */
export default function MedecinsAdmin() {
  const [medecins,     setMedecins]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterCat,    setFilterCat]    = useState('');
  const [search,       setSearch]       = useState('');

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [formError,    setFormError]    = useState('');

  // ── Photo state ────────────────────────────────────────────────────────────
  const [photoFile,    setPhotoFile]    = useState(null);   // File sélectionné
  const [photoPreview, setPhotoPreview] = useState(null);   // URL preview locale
  const [removePhoto,  setRemovePhoto]  = useState(false);  // Supprimer la photo existante
  const photoInputRef = useRef(null);
  // ──────────────────────────────────────────────────────────────────────────

  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const delegations = form.gouvernorat ? GOUVERNORATS_DATA[form.gouvernorat] || [] : [];

  /* Chargement */
  const fetchMedecins = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCat)     params.categorie = filterCat;
      if (search.trim()) params.search    = search.trim();
      const res = await medecinAPI.getAll(params);
      setMedecins(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedecins(); }, [filterCat, search]);

  /* Reset photo state */
  const resetPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(false);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  /* Ouvrir création */
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    resetPhoto();
    setModalOpen(true);
  };

  /* Ouvrir modification */
  const openEdit = (m) => {
    setEditTarget(m);
    setForm({
      nom:         m.nom,
      specialite:  m.specialite,
      categorie:   m.categorie,
      gouvernorat: m.gouvernorat || m.ville || '',
      adresse:     m.adresse,
      telephone:   m.telephone || '',
      email:       m.email     || '',
      rating:      m.rating,
      nbAvis:      m.nbAvis,
      avatar:      m.avatar,
      avatarBg:    m.avatarBg,
    });
    setFormError('');
    resetPhoto();
    // Afficher la photo existante en preview
    setPhotoPreview(m.photo?.url || null);
    setModalOpen(true);
  };

  /* Sélection d'un fichier photo */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setRemovePhoto(false);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* Supprimer la photo */
  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  /* Changement de gouvernorat */
  const handleGouvernoratChange = (val) => {
    setForm((f) => ({ ...f, gouvernorat: val, adresse: '' }));
  };

  /* Sauvegarder */
  const handleSave = async () => {
  if (!form.nom.trim() || !form.specialite.trim() || !form.gouvernorat || !form.adresse.trim()) {
    setFormError('Veuillez remplir tous les champs obligatoires (*).');
    return;
  }
  setSaving(true);
  setFormError('');

  // gouvernorat = le gouvernorat (→ ville dans le schéma)
  // adresse     = la délégation/quartier (→ adresse dans le schéma)
  const payload = {
    ...form,
    ville: form.gouvernorat,  // ✅ ville = gouvernorat (champ required du schéma)
    // adresse = form.adresse déjà présent dans ...form
  };

  try {
    if (editTarget) {
      const res = await medecinAPI.update(editTarget._id, payload, photoFile, removePhoto);
      setMedecins((prev) => prev.map((m) => m._id === editTarget._id ? res.data.data : m));
    } else {
      const res = await medecinAPI.create(payload, photoFile);
      setMedecins((prev) => [res.data.data, ...prev]);
    }
    setModalOpen(false);
  } catch (err) {
    setFormError(err?.response?.data?.message || 'Erreur lors de la sauvegarde.');
  } finally {
    setSaving(false);
  }
};

  /* Suppression */
  const askDelete    = (m) => { setDeleteTarget(m); setConfirmOpen(true); };
  const handleDelete = async () => {
    try {
      await medecinAPI.delete(deleteTarget._id);
      setMedecins((prev) => prev.filter((m) => m._id !== deleteTarget._id));
    } catch {
      alert('Erreur lors de la suppression.');
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  /* ─── Rendu ────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        .mg-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem}
        .mg-title{font-size:1.4rem;font-weight:700;color:#2d2d2d}
        .mg-title span{color:#aaa;font-size:1rem;font-weight:400;margin-left:.4rem}
        .mg-add-btn{background:linear-gradient(135deg,#c8a96e,#a88040);color:#fff;border:none;padding:.7rem 1.4rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.95rem;transition:opacity .2s}
        .mg-add-btn:hover{opacity:.85}

        .mg-filters{display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1.25rem;align-items:center}
        .mg-search{flex:1;min-width:220px;padding:.6rem 1rem;border:1.5px solid #e0d8c8;border-radius:8px;font-size:.95rem;background:#fafaf8;outline:none}
        .mg-search:focus{border-color:#c8a96e}
        .mg-pill{background:#f5f0e8;border:none;padding:.5rem 1.1rem;border-radius:20px;cursor:pointer;font-size:.85rem;color:#555;transition:all .2s}
        .mg-pill.active,.mg-pill:hover{background:#c8a96e;color:#fff}

        .mg-table-wrap{overflow-x:auto;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,.07)}
        .mg-table{width:100%;border-collapse:collapse;background:#fff;font-size:.9rem}
        .mg-table thead{background:#faf7f2}
        .mg-table th{padding:.9rem 1rem;text-align:left;color:#888;font-weight:600;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
        .mg-table td{padding:.85rem 1rem;border-top:1px solid #f0ece3;vertical-align:middle}
        .mg-table tr:hover td{background:#fdf9f2}

        .mg-avatar-cell{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;overflow:hidden;flex-shrink:0}
        .mg-avatar-cell img{width:100%;height:100%;object-fit:cover;border-radius:10px}

        .mg-td-name{font-weight:600;color:#333}
        .mg-td-spec{color:#888;font-size:.82rem;margin-top:.15rem}
        .mg-cat-badge{display:inline-block;padding:.25rem .75rem;border-radius:20px;font-size:.75rem;font-weight:600}
        .mg-stars{color:#c8a96e;letter-spacing:1px;font-size:.9rem}
        .mg-rating-num{font-size:.78rem;color:#aaa;margin-left:.3rem}
        .mg-actions{display:flex;gap:.5rem}
        .mg-btn-edit{background:#e8f0ff;color:#3a6fd8;border:none;padding:.4rem .9rem;border-radius:7px;cursor:pointer;font-size:.82rem;font-weight:600;transition:background .2s;white-space:nowrap}
        .mg-btn-edit:hover{background:#d0e0ff}
        .mg-btn-del{background:#ffe8e3;color:#c95e3a;border:none;padding:.4rem .9rem;border-radius:7px;cursor:pointer;font-size:.82rem;font-weight:600;transition:background .2s;white-space:nowrap}
        .mg-btn-del:hover{background:#ffd0c5}

        .mg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem}
        .mg-modal{background:#fff;border-radius:16px;padding:2rem;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 8px 48px rgba(0,0,0,.2);animation:mgIn .22s ease}
        @keyframes mgIn{from{opacity:0;transform:translateY(-16px) scale(.97)}to{opacity:1;transform:none}}
        .mg-modal-close{position:absolute;top:1rem;right:1rem;background:#f5f0e8;border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:.9rem;color:#666;display:flex;align-items:center;justify-content:center;transition:background .15s}
        .mg-modal-close:hover{background:#e8dfc8}
        .mg-modal h2{font-size:1.2rem;font-weight:700;color:#2d2d2d;margin-bottom:1.5rem}

        .mg-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.9rem}
        .mg-form-full{grid-column:1/-1}
        .mg-label{display:block;font-size:.78rem;font-weight:600;color:#666;margin-bottom:.35rem;text-transform:uppercase;letter-spacing:.04em}
        .mg-req{color:#c8a96e}
        .mg-input,.mg-select{width:100%;padding:.6rem .9rem;border:1.5px solid #e0d8c8;border-radius:8px;font-size:.9rem;background:#fafaf8;outline:none;box-sizing:border-box;color:#333;font-family:inherit}
        .mg-input:focus,.mg-select:focus{border-color:#c8a96e;background:#fff}
        .mg-select:disabled{opacity:.45;cursor:not-allowed;background:#f0ede6}
        .mg-location-hint{font-size:.76rem;color:#aaa;margin-top:.3rem;font-style:italic}

        /* ── Photo uploader ── */
        .mg-photo-zone{border:2px dashed #e0d8c8;border-radius:12px;padding:1.25rem;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;background:#fafaf8;position:relative}
        .mg-photo-zone:hover{border-color:#c8a96e;background:#fdf7ef}
        .mg-photo-preview{width:100%;max-height:180px;object-fit:cover;border-radius:8px;display:block;margin-bottom:.75rem}
        .mg-photo-placeholder{color:#bbb;font-size:2.5rem;margin-bottom:.5rem}
        .mg-photo-hint{font-size:.78rem;color:#aaa}
        .mg-photo-actions{display:flex;gap:.5rem;justify-content:center;margin-top:.75rem;flex-wrap:wrap}
        .mg-photo-btn{background:#f5f0e8;color:#555;border:none;padding:.4rem .9rem;border-radius:7px;cursor:pointer;font-size:.8rem;font-weight:600;transition:background .15s}
        .mg-photo-btn:hover{background:#e8dfc8}
        .mg-photo-btn-del{background:#ffe8e3;color:#c95e3a}
        .mg-photo-btn-del:hover{background:#ffd0c5}
        /* ──────────────────── */

        .mg-avatar-picker{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.4rem}
        .mg-avatar-opt{width:42px;height:42px;border-radius:8px;border:2px solid transparent;background:#f5f0e8;cursor:pointer;font-size:1.3rem;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .mg-avatar-opt:hover{background:#ede5d0}
        .mg-avatar-opt.selected{border-color:#c8a96e;background:#fdf5e4}

        .mg-form-error{background:#fff0ed;border:1.5px solid #f5c5b5;color:#c95e3a;padding:.7rem 1rem;border-radius:8px;font-size:.88rem;margin-top:1rem}
        .mg-form-actions{display:flex;justify-content:flex-end;gap:.75rem;margin-top:1.5rem;padding-top:1rem;border-top:1px solid #f0ece3}
        .mg-btn-cancel{background:#f5f0e8;color:#555;border:none;padding:.65rem 1.3rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;transition:background .15s}
        .mg-btn-cancel:hover{background:#e8dfc8}
        .mg-btn-save{background:linear-gradient(135deg,#c8a96e,#a88040);color:#fff;border:none;padding:.65rem 1.5rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;transition:opacity .2s}
        .mg-btn-save:hover{opacity:.88}
        .mg-btn-save:disabled{opacity:.55;cursor:not-allowed}

        .mg-confirm{background:#fff;border-radius:14px;padding:2rem 1.75rem;width:100%;max-width:380px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.2);animation:mgIn .22s ease}
        .mg-confirm-icon{font-size:2.5rem;margin-bottom:.75rem}
        .mg-confirm p{color:#444;margin-bottom:1.5rem;font-size:.95rem;line-height:1.55}
        .mg-confirm-actions{display:flex;gap:.75rem;justify-content:center}
        .mg-btn-danger{background:#c95e3a;color:#fff;border:none;padding:.65rem 1.4rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;transition:background .15s}
        .mg-btn-danger:hover{background:#b04e2a}

        .mg-empty{text-align:center;color:#aaa;padding:3rem;font-size:1rem}
        .mg-spinner{text-align:center;padding:3rem;font-size:2rem}

        @media(max-width:600px){.mg-form-grid{grid-template-columns:1fr}.mg-form-full{grid-column:1}}
      `}</style>

      {/* En-tête */}
      <div className="mg-top">
        <div className="mg-title">
          Médecins partenaires <span>({medecins.length})</span>
        </div>
        <button className="mg-add-btn" onClick={openCreate}>＋ Ajouter un médecin</button>
      </div>

      {/* Filtres */}
      <div className="mg-filters">
        <input className="mg-search" type="text"
          placeholder="🔍  Rechercher nom, spécialité, ville…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className={`mg-pill ${!filterCat ? 'active' : ''}`} onClick={() => setFilterCat('')}>Tous</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`mg-pill ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>
            {CAT_LABELS[c].label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="mg-spinner">🎋</div>
      ) : medecins.length === 0 ? (
        <div className="mg-empty">Aucun médecin trouvé.</div>
      ) : (
        <div className="mg-table-wrap">
          <table className="mg-table">
            <thead>
              <tr>
                <th></th>
                <th>Nom / Spécialité</th>
                <th>Catégorie</th>
                <th>Gouvernorat / Délégation</th>
                <th>Note</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medecins.map((m) => {
                const cat = CAT_LABELS[m.categorie] || CAT_LABELS.medecin;
                return (
                  <tr key={m._id}>
                    <td>
                      <div className="mg-avatar-cell" style={{ background: m.photo?.url ? 'transparent' : m.avatarBg }}>
                        {m.photo?.url
                          ? <img src={m.photo.url} alt={m.nom} />
                          : m.avatar}
                      </div>
                    </td>
                    <td>
                      <div className="mg-td-name">{m.nom}</div>
                      <div className="mg-td-spec">{m.specialite}</div>
                    </td>
                    <td>
                      <span className="mg-cat-badge" style={{ background: cat.color + '22', color: cat.color }}>
                        {cat.label}
                      </span>
                    </td>
                    <td>
                      <div>🏛️ {m.gouvernorat || m.ville}</div>
                      {m.adresse && <div style={{ fontSize: '.8rem', color: '#aaa', marginTop: '.1rem' }}>📍 {m.adresse}</div>}
                    </td>
                    <td>
                      <span className="mg-stars">{'★'.repeat(Math.round(m.rating))}</span>
                      <span className="mg-rating-num">{m.rating} ({m.nbAvis} avis)</span>
                    </td>
                    <td style={{ fontSize: '.82rem', color: '#666', lineHeight: 1.7 }}>
                      {m.email     && <div>✉️ {m.email}</div>}
                      {m.telephone && <div>📞 {m.telephone}</div>}
                    </td>
                    <td>
                      <div className="mg-actions">
                        <button className="mg-btn-edit" onClick={() => openEdit(m)}>✏️ Modifier</button>
                        <button className="mg-btn-del"  onClick={() => askDelete(m)}>🗑️ Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ajout / Modification */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2>{editTarget ? '✏️ Modifier le médecin' : '➕ Ajouter un médecin'}</h2>
        <div className="mg-form-grid">

          {/* Nom */}
          <div className="mg-form-full">
            <label className="mg-label">Nom complet <span className="mg-req">*</span></label>
            <input className="mg-input" value={form.nom}
              onChange={(e) => setField('nom', e.target.value)}
              placeholder="Dr. Ahmed Ben Ali" />
          </div>

          {/* Spécialité */}
          <div>
            <label className="mg-label">Spécialité <span className="mg-req">*</span></label>
            <input className="mg-input" value={form.specialite}
              onChange={(e) => setField('specialite', e.target.value)}
              placeholder="Chirurgien dentiste" />
          </div>

          {/* Catégorie */}
          <div>
            <label className="mg-label">Catégorie <span className="mg-req">*</span></label>
            <select className="mg-select" value={form.categorie}
              onChange={(e) => setField('categorie', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CAT_LABELS[c].label}</option>
              ))}
            </select>
          </div>

          {/* Gouvernorat */}
          <div>
            <label className="mg-label">Gouvernorat <span className="mg-req">*</span></label>
            <select className="mg-select" value={form.gouvernorat}
              onChange={(e) => handleGouvernoratChange(e.target.value)}>
              <option value="" disabled>— Choisir un gouvernorat —</option>
              {GOUVERNORATS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Délégation */}
          <div className="mg-form-full">
            <label className="mg-label">Délégation / Quartier <span className="mg-req">*</span></label>
            <select className="mg-select" value={form.adresse}
              onChange={(e) => setField('adresse', e.target.value)}
              disabled={!form.gouvernorat}>
              <option value="" disabled>
                {form.gouvernorat ? '— Choisir une délégation —' : "← Sélectionnez d'abord un gouvernorat"}
              </option>
              {delegations.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {form.gouvernorat && !form.adresse && (
              <p className="mg-location-hint">Sélectionnez la délégation correspondante.</p>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="mg-label">Téléphone</label>
            <input className="mg-input" value={form.telephone}
              onChange={(e) => setField('telephone', e.target.value)}
              placeholder="(+216) 71 000 000" />
          </div>

          {/* Email */}
          <div>
            <label className="mg-label">Email</label>
            <input className="mg-input" type="email" value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="cabinet@exemple.tn" />
          </div>

          {/* Note */}
          <div>
            <label className="mg-label">Note (0 – 5)</label>
            <input className="mg-input" type="number" min="0" max="5" step="0.1"
              value={form.rating}
              onChange={(e) => setField('rating', parseFloat(e.target.value) || 0)} />
          </div>

          {/* Nb avis */}
          <div>
            <label className="mg-label">Nombre d'avis</label>
            <input className="mg-input" type="number" min="0"
              value={form.nbAvis}
              onChange={(e) => setField('nbAvis', parseInt(e.target.value) || 0)} />
          </div>

          {/* ── Photo ─────────────────────────────────────────────────────── */}
          <div className="mg-form-full">
            <label className="mg-label">Photo du médecin</label>

            {/* Zone de prévisualisation / drop zone */}
            <div className="mg-photo-zone" onClick={() => photoInputRef.current?.click()}>
              {photoPreview && !removePhoto ? (
                <img className="mg-photo-preview" src={photoPreview} alt="Aperçu" />
              ) : (
                <>
                  <div className="mg-photo-placeholder">📷</div>
                  <div className="mg-photo-hint">Cliquez pour choisir une image (JPG, PNG — max 5 Mo)</div>
                </>
              )}
            </div>

            {/* Boutons sous la zone */}
            <div className="mg-photo-actions">
              <button type="button" className="mg-photo-btn"
                onClick={() => photoInputRef.current?.click()}>
                {photoPreview && !removePhoto ? '🔄 Changer la photo' : '📂 Choisir une photo'}
              </button>
              {photoPreview && !removePhoto && (
                <button type="button" className="mg-photo-btn mg-photo-btn-del"
                  onClick={handleRemovePhoto}>
                  🗑️ Supprimer la photo
                </button>
              )}
            </div>

            {/* Input caché */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </div>
          {/* ─────────────────────────────────────────────────────────────── */}

          {/* Avatar (fallback si pas de photo) */}
          <div className="mg-form-full">
            <label className="mg-label">Avatar <span style={{color:'#bbb',fontWeight:400,fontSize:'.72rem'}}>— affiché si aucune photo</span></label>
            <div className="mg-avatar-picker">
              {AVATAR_OPTIONS.map((a) => (
                <button key={a} type="button"
                  className={`mg-avatar-opt ${form.avatar === a ? 'selected' : ''}`}
                  onClick={() => setField('avatar', a)}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {formError && <div className="mg-form-error">{formError}</div>}

        <div className="mg-form-actions">
          <button className="mg-btn-cancel" onClick={() => setModalOpen(false)}>Annuler</button>
          <button className="mg-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : editTarget ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </Modal>

      {/* Confirmation suppression */}
      <ConfirmModal
        open={confirmOpen}
        message={`Désactiver le profil de "${deleteTarget?.nom}" ? Il n'apparaîtra plus dans l'annuaire.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
      />
    </>
  );
}