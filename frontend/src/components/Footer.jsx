import './Footer.css';

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid container">
        <div className="footer-brand">
          <div className="brand-name">Bamboo<span>Glow</span></div>
          <p>L'émission YouTube qui redonne aux femmes leur éclat perdu. Transformation 360° — de l'intérieur vers l'extérieur.</p>
          <div className="social-links">
            {['▶', '📸', '🎵', '👥'].map((s, i) => (
              <div className="social-btn" key={i}>{s}</div>
            ))}
          </div>
        </div>
        <div className="footer-col">
          <h4>L'Émission</h4>
          <a href="#episodes">Les épisodes</a>
          <a href="#emission">Saison 1</a>
          <a href="#emission">Saison 2</a>
          <a href="#candidature">Postuler</a>
        </div>
        <div className="footer-col">
          <h4>Annuaire</h4>
          <a href="#medecins">Dentistes</a>
          <a href="#medecins">Médecins</a>
          <a href="#medecins">Esthétique</a>
          <a href="#medecins">Rejoindre l'annuaire</a>
        </div>
        <div className="footer-col">
          <h4>Boutique</h4>
          <a href="#boutique">Soins visage</a>
          <a href="#boutique">Maquillage</a>
          <a href="#boutique">Soins corps</a>
          <a href="#boutique">Dentaire</a>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>© 2025 BambooGlow · Tous droits réservés</p>
        <p>Tunis, Tunisie · contact@bambooglow.tn</p>
      </div>
    </footer>
  );
}
