import { useState } from "react";
import { candidatureAPI } from "../services/api";
import "./Candidature.css";

const INITIAL = {
  prenom: "",
  age: "",
  email: "",
  telephone: "",
  ville: "Tunis",
  motivation: "",
};

export default function Candidature() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await candidatureAPI.submit(form);
      setSuccess(true);
      setForm(INITIAL);
    } catch (err) {
      if (err.response?.data?.errors) {
        const fe = {};
        err.response.data.errors.forEach((e) => {
          fe[e.path] = e.msg;
        });
        setFieldErrors(fe);
      } else {
        setError(
          err.response?.data?.message || "Une erreur est survenue. Réessayez.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="candidature-section reveal" id="candidature">
      <div className="container">
        <div className="cand-grid">
          {/* Info */}
          <div className="cand-info">
            <div className="s-label" style={{ color: "var(--sage-l)" }}>
              Postuler
            </div>
            <div className="s-title" style={{ color: "var(--white)" }}>
              Vous méritez
              <br />
              <em style={{ color: "var(--sage-l)" }}>votre Glow.</em>
            </div>
            <div className="s-body">
              Remplissez le formulaire et notre équipe vous contactera sous 48h.
              Toutes les femmes peuvent postuler, quelle que soit leur histoire.
            </div>
            <div className="cand-steps">
              {[
                {
                  n: 1,
                  title: "Vous postulez",
                  desc: "Remplissez le formulaire en ligne en 3 minutes.",
                },
                {
                  n: 2,
                  title: "On vous contacte",
                  desc: "Notre équipe vous appelle pour un entretien bienveillant.",
                },
                {
                  n: 3,
                  title: "Votre transformation commence",
                  desc: "4 épisodes. 4 experts. 1 révélation pour vous.",
                },
              ].map((s) => (
                <div className="cand-step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-text">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="cand-form">
            <div className="form-title">Formulaire de candidature</div>
            <div className="form-sub">Saison 3 · Candidatures ouvertes</div>

            {success ? (
              <div
                className="success-msg"
                style={{
                  fontSize: "0.95rem",
                  padding: "1.5rem",
                  textAlign: "center",
                }}
              >
                🎋 ✨ Candidature envoyée !<br />
                <span
                  style={{
                    fontSize: "0.82rem",
                    opacity: 0.8,
                    display: "block",
                    marginTop: "0.5rem",
                  }}
                >
                  Nous vous contacterons sous 48h. Préparez votre Glow !
                </span>
              </div>
            ) : (
              <>
                {error && <div className="error-msg">{error}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      name="prenom"
                      value={form.prenom}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                    />
                    {fieldErrors.prenom && (
                      <span className="field-err">{fieldErrors.prenom}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Âge</label>
                    <input
                      name="age"
                      type="number"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="Votre âge"
                    />
                    {fieldErrors.age && (
                      <span className="field-err">{fieldErrors.age}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                  />
                  {fieldErrors.email && (
                    <span className="field-err">{fieldErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    placeholder="+216 XX XXX XXX"
                  />
                  {fieldErrors.telephone && (
                    <span className="field-err">{fieldErrors.telephone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Ville</label>
                  <select
                    name="ville"
                    value={form.ville}
                    onChange={handleChange}
                  >
                    
                    <option>Tunis</option>
                    <option>Ariana</option>
                    <option>Ben Arous</option>
                    <option>Manouba</option>
                    <option>Nabeul</option>
                    <option>Zaghouan</option>
                    <option>Bizerte</option>
                    <option>Béja</option>
                    <option>Jendouba</option>
                    <option>Le Kef</option>
                    <option>Siliana</option>
                    <option>Kairouan</option>
                    <option>Kasserine</option>
                    <option>Sidi Bouzid</option>
                    <option>Sousse</option>
                    <option>Monastir</option>
                    <option>Mahdia</option>
                    <option>Sfax</option>
                    <option>Gafsa</option>
                    <option>Tozeur</option>
                    <option>Kébili</option>
                    <option>Gabès</option>
                    <option>Médenine</option>
                    <option>Tataouine</option>
                    
                  </select>
                  {fieldErrors.ville && (
                    <span className="field-err">{fieldErrors.ville}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Pourquoi méritez-vous votre Glow ?</label>
                  <textarea
                    name="motivation"
                    value={form.motivation}
                    onChange={handleChange}
                    placeholder="Parlez-nous de vous, de votre histoire, de ce que vous souhaitez transformer..."
                  />
                  {fieldErrors.motivation && (
                    <span className="field-err">{fieldErrors.motivation}</span>
                  )}
                  <span className="char-count">
                    {form.motivation.length}/1000
                  </span>
                </div>

                <button
                  className="form-submit"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? "⏳ Envoi en cours..."
                    : "✨ Envoyer ma candidature"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
