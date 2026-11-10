// ============================================================
// SIMONIK - Konfigurasi Koneksi Database
// File: src/config/db.js
// Deskripsi: Connection pool ke PostgreSQL (lokal atau Supabase)
// ============================================================

const { Pool } = require('pg');

const url = process.env.DATABASE_URL || '';
const isLocal = /@(localhost|127\.0\.0\.1)(:|\/)/.test(url);

// Supabase mewajibkan SSL; database lokal tidak.
// Di Vercel (serverless) pool dibuat kecil karena koneksi dibagi
// lewat Supabase Transaction Pooler (port 6543).
const pool = new Pool({
  connectionString: url,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: process.env.VERCEL ? 3 : 10,
});

pool.on('error', (err) => {
  console.error('[DB] Error pada client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
