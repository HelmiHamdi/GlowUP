/**
 * Seed script — run with: node seed.js
 * Inserts sample data for médecins, produits, épisodes
 */
require('dotenv').config();
import { connect } from 'mongoose';
import { deleteMany, insertMany } from './models/Medecin';
import { deleteMany as _deleteMany, insertMany as _insertMany } from './models/Produit';
import { deleteMany as __deleteMany, insertMany as __insertMany } from './models/Episode';

const medecins = [
  {
    nom: 'Dr. Karim Mansouri',
    specialite: 'Dentisterie esthétique',
    categorie: 'dentiste',
    ville: 'Tunis',
    adresse: 'Les Berges du Lac',
    rating: 4.9,
    nbAvis: 128,
    avatar: '👨‍⚕️',
    avatarBg: 'linear-gradient(135deg,#e8f4e8,#d0e8d0)',
  },
  {
    nom: 'Dr. Sonia Belhadj',
    specialite: 'Médecine générale & nutrition',
    categorie: 'medecin',
    ville: 'Tunis',
    adresse: 'Manar',
    rating: 4.8,
    nbAvis: 94,
    avatar: '👩‍⚕️',
    avatarBg: 'linear-gradient(135deg,#f4f0e0,#e8dcc0)',
  },
  {
    nom: 'Leila Trabelsi',
    specialite: 'Institut de beauté & soins',
    categorie: 'esthetique',
    ville: 'Tunis',
    adresse: 'Ennasr',
    rating: 5.0,
    nbAvis: 67,
    avatar: '💆‍♀️',
    avatarBg: 'linear-gradient(135deg,#f4e8e0,#e8d0c0)',
  },
  {
    nom: 'Dr. Nadia Chamsi',
    specialite: 'Orthodontie & blanchiment',
    categorie: 'dentiste',
    ville: 'Sfax',
    adresse: 'Centre-ville',
    rating: 4.7,
    nbAvis: 52,
    avatar: '🦷',
    avatarBg: 'linear-gradient(135deg,#e8f4e8,#d0e8d0)',
  },
  {
    nom: 'Dr. Youssef Zouari',
    specialite: 'Dermatologie & bien-être',
    categorie: 'medecin',
    ville: 'Sousse',
    adresse: 'Khezama',
    rating: 4.9,
    nbAvis: 110,
    avatar: '🧬',
    avatarBg: 'linear-gradient(135deg,#f4f0e0,#e8dcc0)',
  },
  {
    nom: 'Amira Ben Salah',
    specialite: 'Coiffure & maquillage pro',
    categorie: 'esthetique',
    ville: 'Tunis',
    adresse: 'Menzah',
    rating: 4.8,
    nbAvis: 88,
    avatar: '💅',
    avatarBg: 'linear-gradient(135deg,#f4e8e0,#e8d0c0)',
  },
];

const produits = [
  { nom: 'Sérum Éclat Bamboo', marque: 'BambooGlow', categorie: 'visage', prix: 89, prixAncien: 120, emoji: '🧴', tag: 'bamboo', bgColor: 'linear-gradient(135deg,#e8f4e8,#d0e8d0)' },
  { nom: 'Fond de teint Glow Naturel', marque: 'BambooGlow', categorie: 'maquillage', prix: 65, emoji: '💄', tag: 'nouveau', bgColor: 'linear-gradient(135deg,#f4f0e0,#e8dcc0)' },
  { nom: 'Huile Bambou & Argan', marque: 'BambooGlow', categorie: 'corps', prix: 55, prixAncien: 79, emoji: '🌿', tag: 'promo', bgColor: 'linear-gradient(135deg,#f0e8f4,#d8c8e8)' },
  { nom: 'Kit Blanchiment Naturel', marque: 'BambooGlow', categorie: 'dentaire', prix: 45, emoji: '🪥', tag: 'bamboo', bgColor: 'linear-gradient(135deg,#f4e8e0,#e8d0c0)' },
];

const episodes = [
  {
    numero: 1, saison: 1,
    titre: '🦷 Le Sourire Bamboo — Elle n\'osait plus sourire depuis 3 ans',
    emoji: '🦷', duree: '22:14', vues: 12400,
    bgColor: 'linear-gradient(135deg,#0f1a0f,#1a2a1a)',
    labelColor: 'rgba(122,158,126,0.8)', labelTextColor: '#fff',
  },
  {
    numero: 2, saison: 1,
    titre: '🩺 Énergie du Dedans — Son corps lui envoyait des signaux',
    emoji: '🩺', duree: '19:38', vues: 8900,
    bgColor: 'linear-gradient(135deg,#1a150a,#2a2010)',
    labelColor: 'rgba(200,169,110,0.8)', labelTextColor: '#1a1a18',
  },
  {
    numero: 3, saison: 1,
    titre: '✨ La Peau qui Rayonne — La transformation qui a fait pleurer toute l\'équipe',
    emoji: '✨', duree: '24:52', vues: 21200,
    bgColor: 'linear-gradient(135deg,#1a0f0a,#2a1810)',
    labelColor: 'rgba(201,122,94,0.8)', labelTextColor: '#fff',
  },
];

async function seed() {
  await connect(process.env.MONGODB_URI);
  console.log('✅ Connecté à MongoDB');

  await deleteMany({});
  await _deleteMany({});
  await __deleteMany({});

  await insertMany(medecins);
  await _insertMany(produits);
  await __insertMany(episodes);

  console.log('🌱 Base de données initialisée avec succès !');
  console.log(`   → ${medecins.length} médecins`);
  console.log(`   → ${produits.length} produits`);
  console.log(`   → ${episodes.length} épisodes`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
