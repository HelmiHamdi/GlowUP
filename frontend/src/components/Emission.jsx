import './Emission.css';

const EPISODES = [
  { num: '01', icon: '🦷', titre: 'Le Sourire Bamboo', sub: 'Dentisterie & soin buccal' },
  { num: '02', icon: '🩺', titre: "L'Énergie du Dedans", sub: 'Médecine & bien-être global' },
  { num: '03', icon: '✨', titre: 'La Peau qui Rayonne', sub: 'Esthétique & beauté' },
  { num: '04', icon: '🛍️', titre: 'La Garde-Robe du Glow', sub: 'Shopping & style personnel' },
];

export default function Emission() {
  return (
    <section className="emission-section reveal" id="emission">
      <div className="container">
        <div className="emission-grid">
          <div>
            <div className="s-label">L'Émission</div>
            <div className="s-title">4 épisodes.<br /><em>1 révélation.</em></div>
            <div className="ep-cards">
              {EPISODES.map((ep) => (
                <div className="ep-card" key={ep.num}>
                  <div className="ep-icon">{ep.icon}</div>
                  <div className="ep-info">
                    <div className="ep-num">Épisode {ep.num}</div>
                    <div className="ep-title">{ep.titre}</div>
                    <div className="ep-sub">{ep.sub}</div>
                  </div>
                  <div className="ep-arrow">→</div>
                </div>
              ))}
              <div className="ep-card finale-card">
                <div className="ep-icon">🌟</div>
                <div className="ep-info">
                  <div className="ep-num">Révélation Finale</div>
                  <div className="ep-title">La Transformation Complète</div>
                  <div className="ep-sub">Le moment que tout le monde attend</div>
                </div>
                <div className="ep-arrow" style={{ color: 'var(--gold)' }}>→</div>
              </div>
            </div>
          </div>
          <div className="emission-info">
            <h3>Une émission qui redonne aux femmes leur éclat perdu</h3>
            <p>BambooGlow accompagne chaque candidate dans un parcours de transformation totale — de l'intérieur vers l'extérieur. Quatre experts. Quatre épisodes. Une seule révélation.</p>
            <p>Le bambou symbolise la résilience silencieuse. Il plie sans jamais rompre. <em>Comme nos candidates.</em></p>
            <div style={{ marginTop: '1.5rem' }}>
              {['🌿 Feel-good', '💛 Bienveillant', '✨ Authentique', '🎋 Transformateur'].map((b) => (
                <span className="emission-badge" key={b}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
