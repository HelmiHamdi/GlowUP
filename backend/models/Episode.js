import { Schema, model } from 'mongoose';

const episodeSchema = new Schema({
  numero: { type: Number, required: true },
  saison: { type: Number, required: true, default: 1 },
  titre: { type: String, required: true },
  description: { type: String },
  emoji: { type: String, default: '🎬' },
  duree: { type: String, default: '00:00' },
  vues: { type: Number, default: 0 },
  youtubeId: { type: String },
  bgColor: { type: String, default: 'linear-gradient(135deg,#0f1a0f,#1a2a1a)' },
  labelColor: { type: String, default: 'rgba(122,158,126,0.8)' },
  labelTextColor: { type: String, default: '#fff' },
  publie: { type: Boolean, default: true },
  datePublication: { type: Date, default: Date.now },
});

export default model('Episode', episodeSchema);
