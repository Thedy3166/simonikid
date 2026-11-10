# SIMONIK

**Sistem Informasi Monitoring dan Pengaduan Infrastruktur Kawasan**

Aplikasi berbasis web untuk menerima pengaduan masyarakat mengenai masalah infrastruktur publik berbasis lokasi, dengan fitur verifikasi, penanganan oleh petugas per-scope, dan monitoring status laporan.

> **📚 Proyek Capstone — Tugas Kuliah Kelompok, Semester 7**
> Proyek ini dikembangkan sebagai bagian dari **Capstone Project** pada Semester 7. Tujuan utamanya adalah merancang dan membangun **prototype sistem informasi berbasis Web GIS** yang menghubungkan masyarakat dengan pengelola infrastruktur publik dalam satu platform terintegrasi.

---

## 📋 Daftar Isi

- [Latar Belakang & Tujuan](#latar-belakang--tujuan)
- [Fitur Utama](#fitur-utama)
- [Arsitektur](#arsitektur)
- [Teknologi](#teknologi)
- [Cara Menjalankan](#cara-menjalankan)
- [Struktur Database](#struktur-database)
- [Akun Demo](#akun-demo)
- [API Endpoints](#api-endpoints)
- [Struktur Proyek](#struktur-proyek)
- [Skenario Demo](#skenario-demo)
- [Pengembangan Lanjutan](#pengembangan-lanjutan)

---

## Latar Belakang & Tujuan

### Latar Belakang

Infrastruktur publik seperti **jalan, lampu penerangan jalan, dan drainase** merupakan fasilitas vital yang sering mengalami kerusakan. Sayangnya, proses pelaporan masalah infrastruktur oleh masyarakat masih bersifat **manual dan tidak terstruktur** — misalnya melalui telepon, surat, atau media sosial. Hal ini menyebabkan:

- **Laporan tidak terpusat** — sulit dilacak dan didokumentasikan.
- **Lokasi kerusakan tidak akurat** — tidak ada koordinat GPS yang jelas.
- **Tidak ada tracking status** — masyarakat tidak tahu laporan mereka sudah ditangani atau belum.
- **Penanganan tidak efisien** — petugas kesulitan memprioritaskan laporan.

### Tujuan Utama

SIMONIK dikembangkan untuk menjawab masalah-masalah di atas, dengan tujuan:

1. **Memudahkan masyarakat** melaporkan masalah infrastruktur publik secara digital.
2. **Menyimpan lokasi pengaduan secara akurat** menggunakan GPS/browser geolocation + peta interaktif.
3. **Memverifikasi dan meneruskan laporan** secara otomatis ke petugas dengan scope yang sesuai (jalan/lampu/drainase).
4. **Membantu petugas** menangani laporan secara terstruktur — dari verifikasi hingga penyelesaian.
5. **Memberikan transparansi** kepada masyarakat melalui timeline status yang dapat dilacak.
6. **Menyediakan dashboard monitoring** dengan peta persebaran dan statistik laporan.

### Ruang Lingkup MVP

Untuk menjaga proyek tetap realistis sebagai **prototype akademik**, scope MVP dibatasi pada:

- **3 jenis infrastruktur**: Jalan, Lampu Penerangan Jalan, Drainase
- **2 role**: User (masyarakat) dan Petugas (per-scope)
- **Verifikasi otomatis** berdasarkan jenis infrastruktur
- **Data simulasi** (tidak terintegrasi dengan sistem pemerintah nyata)
- **Deployment lokal**; untuk akses online, ikuti [`PANDUAN_DEPLOY.md`](./PANDUAN_DEPLOY.md)

---

## Fitur Utama

### Role User (Masyarakat)

- Login dengan akun yang disediakan
- **Dashboard dengan 4 menu**: Buat Laporan, Laporan Saya, Peta Laporan, Statistik
- **Buat laporan 2 tahap**:
  - Tahap 1: Pilih jenis infrastruktur (Jalan / Lampu Penerangan / Drainase)
  - Tahap 2: Isi detail + upload foto (maksimal 3 foto)
- **GPS otomatis** dari browser + koreksi marker di peta
- **Tracking status** laporan dengan timeline
- **Lihat persebaran laporan** di peta interaktif dengan legend berwarna
- **Statistik** laporan pribadi (chart per status, per jenis, tren 7 hari)

### Role Petugas

- Login dengan **scope terbatas** (hanya lihat laporan sesuai jenis infrastruktur yang ditugaskan)
- **Dashboard dengan summary cards** (total + 5 status clickable filter)
- **Detail laporan** dengan timeline lengkap
- **Update status laporan**:
  - Verifikasi (DIAJUKAN → DIVERIFIKASI)
  - Tolak dengan alasan (DIAJUKAN → DITOLAK)
  - Mulai proses (DIVERIFIKASI → DIPROSES)
  - Selesaikan (DIPROSES → SELESAI)
- **Upload bukti penyelesaian** (foto kondisi setelah diperbaiki, maksimal 3)
- **Peta persebaran** laporan sesuai scope
- **Statistik** laporan scope

### Fitur Umum

- Autentikasi JWT dengan role-based access control
- Validasi transisi status (tidak bisa "loncat" status)
- Upload foto dengan validasi (JPG/PNG/WEBP, maks 5MB)
- Peta interaktif dengan Leaflet + OpenStreetMap
- Batasan maksimal 3 foto per jenis (laporan/bukti)
- Timeline riwayat status lengkap

---

## Arsitektur

```mermaid
flowchart LR
    A[Browser<br/>React SPA] <-->|REST API<br/>JWT Auth| B[Backend<br/>Express]
    B <-->|Query SQL| C[(PostgreSQL<br/>+ PostGIS)]
    A -.->|Leaflet + OSM| D[Peta Interaktif]
    A -.->|Chart.js| E[Grafik Statistik]
---

## Deploy Online

Lihat `PANDUAN_DEPLOY.md` untuk langkah deploy ke Supabase + Vercel.
