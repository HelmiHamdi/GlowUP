import { useState, useEffect } from 'react';
import { episodeAPI } from '../services/api';
import './Episodes.css';

function formatVues(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K vues`;
  return `${n} vues`;
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  return `Il y a ${Math.floor(weeks / 4)} mois`;
}

/* ─── Extraire proprement l'ID YouTube peu importe le format ─ */
function extractYoutubeId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  // URL longue : https://www.youtube.com/watch?v=XXXXXXXXXXX
  const longUrl = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longUrl) return longUrl[1];
  // URL courte : https://youtu.be/XXXXXXXXXXX
  const shortUrl = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortUrl) return shortUrl[1];
  // URL embed : https://www.youtube.com/embed/XXXXXXXXXXX
  const embedUrl = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedUrl) return embedUrl[1];
  // ID brut (11 caractères)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return trimmed;
}

/* ─── Modale lecteur YouTube ─────────────────────────────── */
function VideoModal({ youtubeId, titre, onClose }) {
  const cleanId = extractYoutubeId(youtubeId);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="yt-modal-overlay" onClick={onClose}>
      <div className="yt-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="yt-modal-header">
          <span className="yt-modal-titre">{titre}</span>
          <button className="yt-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="yt-modal-iframe-wrap">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1&rel=0&modestbranding=1`}
            title={titre}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>
  );
}

export default function Episodes() {
  const [episodes,    setEpisodes]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    episodeAPI.getAll({ saison: 1 })
      .then((res) => setEpisodes(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openVideo = (ep) => {
    if (!ep.youtubeId) return;
    setActiveVideo({ youtubeId: ep.youtubeId, titre: ep.titre });
  };

  return (
    <>
      <section className="episodes-section reveal" id="episodes">
        <div className="container">
          <div className="s-label">YouTube</div>
          <div className="s-title" style={{ color: 'var(--white)' }}>
            Regarder les <em style={{ color: 'var(--sage-l)' }}>épisodes</em>
          </div>
          <div className="s-body">Saison 1 disponible · Saison 2 bientôt</div>

          {loading ? (
            <div className="loading-spinner" style={{ color: 'var(--sage-l)' }}>🎬</div>
          ) : (
            <div className="yt-grid">
              {episodes.map((ep) => (
                <div
                  className={`yt-card ${ep.youtubeId ? 'has-video' : 'no-video'}`}
                  key={ep._id}
                  onClick={() => openVideo(ep)}
                >
                  <div className="yt-thumb" style={!ep.youtubeId ? { background: ep.bgColor } : {}}>
                    {ep.youtubeId ? (
                      <>
                        <img
                          src={`https://img.youtube.com/vi/${extractYoutubeId(ep.youtubeId)}/hqdefault.jpg`}
                          alt={ep.titre}
                          className="yt-thumb-img"
                        />
                        <div className="yt-thumb-overlay" />
                      </>
                    ) : null}
                    <div className="yt-play">▶</div>
                    <span
                      className="yt-ep-label"
                      style={{ background: ep.labelColor, color: ep.labelTextColor }}
                    >
                      EP.{String(ep.numero).padStart(2, '0')}
                    </span>
                    <span className="yt-duration">{ep.duree}</span>
                  </div>
                  <div className="yt-body">
                    <div className="yt-title">{ep.titre}</div>
                    <div className="yt-meta">
                      <span className="yt-views">{formatVues(ep.vues)}</span>
                      <span className="yt-date">{timeAgo(ep.datePublication)}</span>
                    </div>
                    {!ep.youtubeId && (
                      <div className="yt-soon">🔜 Bientôt disponible</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {activeVideo && (
        <VideoModal
          youtubeId={activeVideo.youtubeId}
          titre={activeVideo.titre}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}