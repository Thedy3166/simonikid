// ============================================================
// SIMONIK - Main Server
// File: src/server.js
// Deskripsi: Entry point backend (lokal: app.listen, Vercel: export app)
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const app = express();

// CORS: isi CORS_ORIGIN dengan URL frontend (pisahkan koma jika lebih dari satu)
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SIMONIK backend aktif!',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} tidak ditemukan`,
  });
});

// Error handler global (termasuk error upload dari Multer)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const tooLarge = err.code === 'LIMIT_FILE_SIZE';
  res.status(tooLarge ? 413 : err.status || 400).json({
    success: false,
    message: tooLarge ? 'Ukuran file melebihi batas 4MB' : err.message || 'Terjadi kesalahan',
  });
});

// Di Vercel, app diekspor sebagai Function; secara lokal jalankan listener.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`[SERVER] Berjalan di http://localhost:${PORT}`));
}

module.exports = app;
