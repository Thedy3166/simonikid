# Seeds — Data Awal SIMONIK

Folder ini berisi dokumentasi tentang **seed** (data awal) untuk database SIMONIK.

## Apa Itu Seed?

Seed adalah data yang dimasukkan ke database saat pertama kali setup, supaya aplikasi bisa langsung dipakai tanpa perlu input manual.

## File Seed Aktual

File seed utama ada di **`migrations/002_seed.sql`**, bukan di folder ini. Folder `seeds/` hanya disediakan untuk dokumentasi.

## Isi Seed

1. **4 akun user** (password semua: `rahasia123`):
   - `user@simonik.test` — role: user
   - `jalan@simonik.test` — role: petugas, scope: jalan
   - `lampu@simonik.test` — role: petugas, scope: lampu
   - `drainase@simonik.test` — role: petugas, scope: drainase

2. **3 baris `petugas_scopes`** menghubungkan petugas dengan scope-nya.

## Cara Menjalankan Seed

### Lewat DBeaver

1. Buka file `migrations/002_seed.sql`
2. Pastikan tab SQL terikat ke database `simonik`
3. Tekan `Alt + X`

### Lewat psql

```bash
psql -U postgres -h localhost -d simonik -f migrations/002_seed.sql