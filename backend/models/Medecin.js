import { Schema, model } from 'mongoose';

const medecinSchema = new Schema({
  nom: {
    type: String,
    required: true,
    trim: true,
  },
  specialite: {
    type: String,
    required: true,
  },
  categorie: {
    type: String,
    enum: ['dentiste', 'medecin', 'esthetique'],
    required: true,
  },
  ville: {
    type: String,
    required: true,
  },
  adresse: {
    type: String,
    required: true,
  },
  telephone: String,
  email: String,
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5,
  },
  nbAvis: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
    default: '👨‍⚕️',
  },
  avatarBg: {
    type: String,
    default: 'linear-gradient(135deg,#e8f4e8,#d0e8d0)',
  },
  actif: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for search
medecinSchema.index({ nom: 'text', specialite: 'text', ville: 'text' });

export default model('Medecin', medecinSchema);
