import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else navigate(`/#${id}`);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Bamboo<span>Glow</span></Link>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => scrollTo('emission')}>L'Émission</button>
        <button onClick={() => scrollTo('candidature')}>Postuler</button>
       <button onClick={() => scrollTo('medecins')}>Médecins</button>
        {/* <button onClick={() => scrollTo('boutique')}>Boutique</button>*/} 
        <button onClick={() => scrollTo('episodes')}>Épisodes</button>
        <button
          className="nav-cta"
          onClick={() => scrollTo('candidature')}
        >
          Je Postule
        </button>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        <span /><span /><span />
      </button>
    </nav>
  );
}
