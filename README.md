# 🎋 BambooGlow — MERN Stack

Émission YouTube de transformation 360° : Dentiste · Médecin · Esthétique · Shopping.

## 📁 Structure du projet

```
bambooglow/
├── backend/                  # Node.js + Express + MongoDB
│   ├── models/               # Schemas Mongoose
│   │   ├── Candidature.js
│   │   ├── Medecin.js
│   │   ├── Produit.js
│   │   ├── Episode.js
│   │   └── User.js
│   ├── routes/               # API REST
│   │   ├── candidatures.js
│   │   ├── medecins.js
│   │   ├── produits.js
│   │   ├── episodes.js
│   │   └── auth.js
│   ├── middleware/
│   │   └── auth.js           # JWT protect + adminOnly
│   ├── server.js             # Point d'entrée
│   ├── seed.js               # Données de démonstration
│   └── .env.example
│
└── frontend/                 # React 18
    └── src/
        ├── components/       # Hero, Navbar, Emission, Candidature,
        │                     # Medecins, Boutique, Episodes, Footer
        ├── pages/            # Home, Login, Admin
        ├── context/          # AuthContext (JWT)
        └── services/         # api.js (axios + toutes les routes)
```

## 🚀 Installation

### 1. Cloner & installer les dépendances

```bash
npm run install:all
```

### 2. Configurer l'environnement backend

```bash
cp backend/.env.example backend/.env
# Éditez backend/.env avec vos vraies valeurs :
# - MONGODB_URI  → votre URI MongoDB Atlas
# - JWT_SECRET   → une chaîne secrète longue
```

### 3. Initialiser la base de données

```bash
npm run seed
```

### 4. Créer le premier compte admin

```bash
# Une seule fois — crée le compte admin initial
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bambooglow.tn","password":"VotreMotDePasse123"}'
```

### 5. Lancer le projet (backend + frontend)

```bash
npm run dev
```

- 🌐 Site public   : http://localhost:3000
- 🔧 API backend   : http://localhost:5050/api
- 🔐 Admin panel   : http://localhost:3000/admin

---

## 📡 API Endpoints

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/candidatures` | — | Soumettre une candidature |
| `GET` | `/api/candidatures` | Admin | Lister les candidatures |
| `PATCH` | `/api/candidatures/:id/statut` | Admin | Changer le statut |
| `GET` | `/api/medecins` | — | Lister médecins (filtres: categorie, search) |
| `POST` | `/api/medecins` | Admin | Ajouter un médecin |
| `PUT` | `/api/medecins/:id` | Admin | Modifier un médecin |
| `DELETE` | `/api/medecins/:id` | Admin | Désactiver un médecin |
| `GET` | `/api/produits` | — | Lister les produits |
| `POST/PUT/DELETE` | `/api/produits` | Admin | CRUD produits |
| `GET` | `/api/episodes` | — | Lister les épisodes |
| `POST/PUT` | `/api/episodes` | Admin | Ajouter/modifier un épisode |
| `POST` | `/api/auth/login` | — | Connexion admin |
| `GET` | `/api/auth/me` | Admin | Profil connecté |
| `GET` | `/api/health` | — | Santé de l'API |

---

## 🛠️ Résolution du problème MongoDB

Si vous avez l'erreur `querySrv ENOTFOUND` :

1. **Vérifiez votre URI** dans `.env` — pas d'espaces, pas de `<password>` littéral
2. **Vérifiez votre IP** dans MongoDB Atlas → Network Access → Add IP
3. **Vérifiez que le cluster n'est pas en pause** dans Atlas
4. **Testez DNS** : `nslookup _mongodb._tcp.bambou2025.3db6qan.mongodb.net`
5. Essayez en désactivant votre VPN si vous en avez un

---

## 🌿 Variables d'environnement

```env
PORT=5050
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bambooglow
JWT_SECRET=votre_secret_tres_long_et_aleatoire
JWT_EXPIRE=7d
NODE_ENV=development
```
