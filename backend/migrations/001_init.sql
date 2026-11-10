-- ============================================================
-- SIMONIK - Skema Database Awal
-- File: 001_init.sql
-- Deskripsi: Membuat tipe data, tabel, dan relasi awal
-- ============================================================

-- Aktifkan ekstensi PostGIS untuk data geografis (koordinat GPS)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- 1. TIPE DATA KHUSUS (ENUM)
-- ============================================================

-- Role pengguna: hanya ada 'user' dan 'petugas'
CREATE TYPE user_role AS ENUM ('user', 'petugas');

-- Scope petugas: sesuai jenis infrastruktur
CREATE TYPE scope_type AS ENUM ('jalan', 'lampu', 'drainase');

-- Status laporan pengaduan
CREATE TYPE report_status AS ENUM (
  'DIAJUKAN',       -- Baru dikirim user, belum diverifikasi
  'DIVERIFIKASI',   -- Sudah divalidasi petugas
  'DIPROSES',       -- Sedang ditangani petugas
  'SELESAI',        -- Sudah selesai
  'DITOLAK'         -- Ditolak petugas dengan alasan
);

-- ============================================================
-- 2. TABEL USERS
-- ============================================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 3. TABEL PETUGAS_SCOPES
-- Satu petugas bisa punya beberapa scope
-- ============================================================

CREATE TABLE petugas_scopes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  scope scope_type NOT NULL,
  UNIQUE(user_id, scope)
);

-- ============================================================
-- 4. TABEL INFRASTRUCTURE
-- Data infrastruktur simulasi (jalan, lampu, drainase)
-- ============================================================

CREATE TABLE infrastructure (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  type scope_type NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 5. TABEL REPORTS
-- Laporan pengaduan dari user
-- ============================================================

CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  scope scope_type NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  status report_status NOT NULL DEFAULT 'DIAJUKAN',
  location GEOGRAPHY(Point, 4326) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 6. TABEL REPORT_STATUS_HISTORY
-- Riwayat setiap perubahan status laporan
-- ============================================================

CREATE TABLE report_status_history (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES reports(id) ON DELETE CASCADE,
  status report_status NOT NULL,
  note TEXT,
  changed_by INT REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 7. TABEL REPORT_ASSIGNMENTS
-- Riwayat penugasan laporan ke petugas
-- ============================================================

CREATE TABLE report_assignments (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES reports(id) ON DELETE CASCADE,
  petugas_id INT REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 8. TABEL REPORT_ATTACHMENTS
-- Foto/bukti yang diupload user atau petugas
-- ============================================================

CREATE TABLE report_attachments (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES reports(id) ON DELETE CASCADE,
  file_url VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'foto',
  uploaded_by INT REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SELESAI
-- ============================================================