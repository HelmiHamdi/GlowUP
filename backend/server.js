import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connect } from "mongoose";

import authRoutes from "./routes/auth.js";
import candidaturesRouter from "./routes/candidatures.js";
import medecinsRouter from "./routes/medecins.js";
import produitsRouter from "./routes/produits.js";
import episodesRouter from "./routes/episodes.js";

dotenv.config();

// ── Fix __dirname ES Modules ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // → /backend

const app = express();
const PORT = process.env.PORT;

// ── Middleware ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: ["https://glowup-zohc.onrender.com", "http://localhost:3000","https://www.bambooglow.tn"],
  credentials: true,
}));

// ── Routes API ──
app.use("/api/auth",         authRoutes);
app.use("/api/candidatures", candidaturesRouter);
app.use("/api/medecins",     medecinsRouter);
app.use("/api/produits",     produitsRouter);
app.use("/api/episodes",     episodesRouter);

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "🎋 BambooGlow API is running" });
});

// ── Serve frontend ──
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur serveur interne",
  });
});

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