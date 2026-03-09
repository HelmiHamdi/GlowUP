/*import express, { json, urlencoded } from 'express';
import { config } from 'dotenv';
import { connect } from 'mongoose';
import cors from 'cors';


import candidaturesRouter from './routes/candidatures.js';
import medecinsRouter from './routes/medecins.js';
import produitsRouter from './routes/produits.js';
import episodesRouter from './routes/episodes.js';
import authRouter from './routes/auth.js';

config();

const app = express();

// ── Middleware ──
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://bambooglow.tn'
    : 'http://localhost:3000',
  credentials: true,
}));
app.use(json());
app.use(urlencoded({ extended: true }));

// ── Routes ──
app.use('/api/candidatures', candidaturesRouter);
app.use('/api/medecins',     medecinsRouter);
app.use('/api/produits',     produitsRouter);
app.use('/api/episodes',     episodesRouter);
app.use('/api/auth',         authRouter);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '🎋 BambooGlow API is running' });
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
  });
});

// ── MongoDB connection ──
const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté avec succès');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

connectDB().then(() => {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur BambooGlow démarré sur le port ${PORT}`);
  });
});*/
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connect } from "mongoose";

import authRoutes from "./routes/auth.js";
import candidaturesRouter from "./routes/candidatures.js";
import medecinsRouter from "./routes/medecins.js";
import produitsRouter from "./routes/produits.js";
import episodesRouter from "./routes/episodes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

// ── Middleware ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());

app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? "https://bambooglow.tn"
    : "http://localhost:3000",
  credentials: true,
}));

// ── Routes ──
app.use("/api/auth",         authRoutes);
app.use("/api/candidatures", candidaturesRouter);
app.use("/api/medecins",     medecinsRouter);
app.use("/api/produits",     produitsRouter);
app.use("/api/episodes",     episodesRouter);

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "🎋 BambooGlow API is running" });
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur serveur interne",
  });
});

// ── Serve frontend in production ──
// ── Serve frontend in production ──
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));  // ✅ build

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));  // ✅ build
  });
}

// ── MongoDB + Start server ──
const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connecté avec succès");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

app.listen(PORT, () => {
  console.log("🚀 Serveur BambooGlow démarré sur le port: " + PORT);
  connectDB();
});