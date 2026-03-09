import './Hero.css';

export default function Hero() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="home">
      <div className="hero-bg" />
      <svg className="hero-bamboo-svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#7a9e7e" strokeWidth="5">
          <line x1="60" y1="0" x2="60" y2="900" /><line x1="100" y1="0" x2="100" y2="900" />
          <rect x="57" y="150" width="6" height="12" rx="3" fill="#7a9e7e" />
          <rect x="97" y="260" width="6" height="12" rx="3" fill="#7a9e7e" />
          <rect x="57" y="380" width="6" height="12" rx="3" fill="#7a9e7e" />
          <rect x="97" y="500" width="6" height="12" rx="3" fill="#7a9e7e" />
          <path d="M63 148 Q88 128 100 140" strokeWidth="2" />
          <path d="M63 378 Q42 358 28 372" strokeWidth="2" />
          <line x1="1100" y1="0" x2="1100" y2="900" /><line x1="1140" y1="0" x2="1140" y2="900" />
          <rect x="1097" y="180" width="6" height="12" rx="3" fill="#7a9e7e" />
          <rect x="1137" y="300" width="6" height="12" rx="3" fill="#7a9e7e" />
          <path d="M1103 178 Q1126 158 1140 170" strokeWidth="2" />
        </g>
      </svg>
      <div className="hero-content">
        <div className="hero-eyebrow">Émission YouTube · Transformation 360°</div>
        <div className="hero-title">Bamboo<span>Glow</span></div>
        <div className="hero-tagline">« Quand la vraie beauté reprend sa lumière. »</div>
        <div className="hero-sub">Dentiste · Médecin · Esthétique · Shopping · Révélation</div>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => scrollTo('candidature')}>✨ Je veux mon Glow</button>
          <button className="btn-outline" onClick={() => scrollTo('episodes')}>▶ Voir les épisodes</button>
        </div>
        <div className="hero-stats">
          <div className="stat-item"><div className="stat-num">2</div><div className="stat-label">Saisons filmées</div></div>
          <div className="stat-item"><div className="stat-num">10</div><div className="stat-label">Épisodes</div></div>
          <div className="stat-item"><div className="stat-num">360°</div><div className="stat-label">Transformation</div></div>
          <div className="stat-item"><div className="stat-num">∞</div><div className="stat-label">Candidatures ouvertes</div></div>
        </div>
      </div>
      <div className="scroll-hint"><div className="scroll-line" /></div>
    </section>
  );
}
