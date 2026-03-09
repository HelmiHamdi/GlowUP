import { Schema, model } from 'mongoose';

const produitSchema = new Schema({
  nom: { type: String, required: true, trim: true },
  marque: { type: String, required: true },
  categorie: {
    type: String,
    enum: ['visage', 'corps', 'maquillage', 'dentaire'],
    required: true,
  },
  prix: { type: Number, required: true },
  prixAncien: { type: Number, default: null },
  emoji: { type: String, default: '🧴' },
  bgColor: { type: String, default: 'linear-gradient(135deg,#e8f4e8,#d0e8d0)' },
  tag: {
    type: String,
    enum: ['bamboo', 'nouveau', 'promo', null],
    default: null,
  },
  stock: { type: Number, default: 100 },
  actif: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default model('Produit', produitSchema);
