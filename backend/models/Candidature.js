import { Schema, model } from 'mongoose';

const candidatureSchema = new Schema({
  prenom: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
  },
  age: {
    type: Number,
    required: [true, "L'âge est obligatoire"],
    min: [18, 'Vous devez avoir au moins 18 ans'],
    max: [75, 'Âge maximum : 75 ans'],
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est obligatoire'],
    trim: true,
  },
  ville: {
    type: String,
    required: [true, 'La ville est obligatoire'],
    enum: ['Tunis', 'Sfax', 'Sousse', 'Autre'],
  },
  motivation: {
    type: String,
    required: [true, 'La motivation est obligatoire'],
    minlength: [50, 'Décrivez-vous en au moins 50 caractères'],
    maxlength: [1000, '1000 caractères maximum'],
  },
  saison: {
    type: Number,
    default: 3,
  },
  statut: {
    type: String,
    enum: ['en_attente', 'contactee', 'selectionnee', 'refusee'],
    default: 'en_attente',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('Candidature', candidatureSchema);
