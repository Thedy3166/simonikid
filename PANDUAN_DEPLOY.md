# Panduan Deploy SIMONIK ke Supabase + Vercel

Panduan ini membuat aplikasi dapat dibuka melalui internet. Frontend dan backend
di-deploy sebagai dua project Vercel terpisah, sedangkan database dan foto
disimpan di Supabase.

## Gambaran arsitektur

- **Frontend**: React + Vite, project Vercel dengan root directory `frontend`.
- **Backend**: Express, project Vercel dengan root directory `backend`.
- **Database**: PostgreSQL + PostGIS di Supabase.
- **Foto laporan**: Supabase Storage, bucket `simonik-uploads`.

## 1. Siapkan repository GitHub

1. Pastikan project berisi folder `backend`, `frontend`, dan `supabase`.
2. Buat repository baru di GitHub. Jika mengikuti perintah di bawah, biarkan
   repository kosong (jangan tambahkan README atau `.gitignore` dari GitHub).
3. Buka PowerShell di folder utama project, lalu jalankan:

   ```powershell
   git init
   git add .
   git status --short
   ```

4. Periksa hasil `git status`: file `.env` dan kredensial tidak boleh ikut
   ter-stage. `.gitignore` project mengabaikan file `.env`; jangan menghapus
   aturan tersebut. Jika file rahasia pernah masuk ke commit atau repository,
   anggap nilainya bocor dan ganti/rotasi password database, key Supabase, serta
   `JWT_SECRET`.
5. Jika daftar file sudah aman, commit dan kirim ke GitHub (ganti URL dengan URL
   repository milik Anda):

   ```powershell
   git commit -m "Initial SIMONIK deployment"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
   git push -u origin main
   ```

   Alternatifnya, gunakan GitHub Desktop untuk membuat repository dan
   mem-push folder project.

## 2. Buat database dan storage Supabase

1. Buat project di [Supabase](https://supabase.com/). Simpan password database
   di password manager dan pilih region yang dekat dengan pengguna.
2. Buka **SQL Editor**, buat query baru, salin seluruh isi
   [`supabase/01_schema.sql`](./supabase/01_schema.sql), lalu jalankan sekali.
   Query ini membuat tabel, tipe data, PostGIS, aturan RLS, dan bucket foto.
   Gunakan project/database baru; jangan jalankan ulang schema yang sudah
   berhasil karena beberapa tipe dan tabel dibuat tanpa `IF NOT EXISTS`.
3. Untuk menyiapkan akun agar bisa login, buka query baru dan jalankan
   [`supabase/02_seed_demo.sql`](./supabase/02_seed_demo.sql) sekali. Akun demo
   yang dibuat:

   | Peran | Email | Password awal |
   |---|---|---|
   | User | `user@simonik.test` | `rahasia123` |
   | Petugas Jalan | `jalan@simonik.test` | `rahasia123` |
   | Petugas Lampu | `lampu@simonik.test` | `rahasia123` |
   | Petugas Drainase | `drainase@simonik.test` | `rahasia123` |

   Password tersebut hanya untuk demo. Sebelum membagikan aplikasi ke publik,
   ganti hash password setiap akun demo dengan hash bcrypt baru. Dari PowerShell
   di folder project, jalankan `npm ci --prefix backend`, lalu buat hash dengan
   perintah berikut dan ketik password baru saat diminta:

   ```powershell
   node -e "const readline=require('node:readline/promises');const {stdin:input,stdout:output}=require('node:process');const bcrypt=require('./backend/node_modules/bcryptjs');(async()=>{const rl=readline.createInterface({input,output});const password=await rl.question('Password baru: ');console.log(await bcrypt.hash(password,10));rl.close()})()"
   ```

   Di Supabase SQL Editor, simpan hash yang dihasilkan (bukan password
   aslinya), lalu ulangi untuk setiap email:

   ```sql
   UPDATE users
   SET password_hash = 'GANTI_DENGAN_HASH_BCRYPT'
   WHERE email = 'user@simonik.test';
   ```

   Jangan gunakan akun demo untuk data pribadi atau data sungguhan.
4. Buka **Connect** di Supabase dan salin URI **Transaction pooler**
   (biasanya port `6543`). URI ini akan menjadi `DATABASE_URL`. Ganti
   placeholder password dengan password database. Jika password berisi
   karakter khusus, URL-encode karakter tersebut.
5. Buka pengaturan **API** project dan catat:
   - **Project URL** untuk `SUPABASE_URL`.
   - **Secret/service role key** untuk `SUPABASE_SERVICE_ROLE_KEY`.

   Key tersebut hanya untuk backend. Jangan menaruhnya di frontend, variabel
   yang diawali `VITE_`, atau repository GitHub.

## 3. Deploy frontend pertama kali

Frontend dapat di-deploy lebih dulu untuk mendapatkan URL produksinya. API
belum berfungsi sampai backend selesai dan URL API diperbarui pada langkah 5.

1. Masuk ke [Vercel](https://vercel.com/), pilih **Add New > Project**, lalu
   import repository GitHub.
2. Atur:
   - **Project Name**: pilih nama yang mudah dikenali; URL produksinya akan
     berbentuk `https://nama-project.vercel.app`.
   - **Root Directory**: `frontend`.
   - **Framework Preset**: Vite (biarkan Vercel mendeteksi otomatis jika sudah
     terpilih).
3. Tambahkan environment variable:

   | Nama | Nilai sementara |
   |---|---|
   | `VITE_API_URL` | `https://example.invalid/api` |

4. Deploy dan catat URL **Production** frontend. Jangan gunakan URL Preview
   untuk konfigurasi produksi.

## 4. Deploy backend

1. Di Vercel pilih **Add New > Project** dan import repository GitHub yang sama
   sebagai project baru.
2. Atur:
   - **Project Name**: nama yang berbeda dari frontend.
   - **Root Directory**: `backend`.
   - **Framework Preset**: Express (pastikan Vercel mengenali aplikasi Express
     dari `src/server.js`).
   - Gunakan Node.js 22.12 atau lebih baru untuk kedua project. Backend
     menetapkan `engines.node` ke `>=20`; Vite 8 frontend memerlukan Node.js
     20.19+ atau 22.12+.
3. Tambahkan environment variable berikut. Atur untuk **Production** (dan
   Preview bila memang akan menguji deployment Preview):

   | Nama | Nilai |
   |---|---|
   | `DATABASE_URL` | URI Transaction pooler dari langkah 2 |
   | `JWT_SECRET` | String acak panjang yang hanya digunakan aplikasi ini |
   | `SUPABASE_URL` | Project URL Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | Secret/service role key Supabase |
   | `SUPABASE_BUCKET` | `simonik-uploads` |
   | `CORS_ORIGIN` | URL Production frontend, tanpa `/` di akhir |

   Buat nilai `JWT_SECRET` di PowerShell dengan:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Simpan semua nilai rahasia di Vercel **Environment Variables**, bukan di
   file project atau source code.
4. Deploy backend. Buka `https://nama-project-backend.vercel.app/`; respons
   JSON harus berisi `SIMONIK backend aktif!`. URL API backend adalah URL
   tersebut ditambah `/api`, misalnya
   `https://nama-project-backend.vercel.app/api`.

   Jika Vercel tidak mendeteksi Express secara otomatis, periksa bahwa
   **Root Directory** benar-benar `backend` dan konfigurasi project menunjuk
   ke framework Express. Aplikasi memang mengekspor Express app dari
   `src/server.js`; tidak perlu menjalankan server lokal dengan `app.listen`
   di Vercel.

## 5. Hubungkan frontend ke backend

1. Buka project frontend di Vercel, lalu **Settings > Environment Variables**.
2. Ubah `VITE_API_URL` menjadi URL API backend yang sebenarnya, termasuk `/api`
   dan tanpa `/` di akhir, contohnya
   `https://nama-project-backend.vercel.app/api`.
3. Simpan perubahan dan lakukan **Redeploy** deployment Production frontend
   agar nilai `VITE_API_URL` masuk ke hasil build.
4. Pastikan `CORS_ORIGIN` pada backend sama persis dengan URL Production
   frontend (tanpa `/` di akhir). Jika mengubahnya, redeploy backend.
   `CORS_ORIGIN` dapat berisi beberapa origin yang dipisahkan koma jika
   diperlukan, misalnya untuk domain kustom.

   Jangan biarkan `CORS_ORIGIN` kosong di production: kode backend akan
   mengizinkan semua origin browser jika variabel ini kosong.
   CORS hanya mengatur akses browser; CORS bukan pengganti autentikasi dan
   otorisasi API.

## 6. Uji aplikasi dari browser

1. Buka URL Production frontend melalui HTTPS.
2. Login dengan salah satu akun demo dari langkah 2.
3. Buat laporan, unggah foto, buka detail laporan dan pastikan foto tampil.
4. Keluar, lalu login sebagai petugas yang sesuai dan uji perubahan status.
5. Jika memakai GPS, izinkan akses lokasi di browser. Geolocation umumnya
   mensyaratkan HTTPS; URL Vercel sudah menggunakan HTTPS.
6. Sebelum membagikan URL secara luas, ganti password demo dan jangan masukkan
   data pribadi/rahasia ke aplikasi demo.

## 7. Deploy perubahan berikutnya

Setelah repository GitHub terhubung, perubahan yang di-push ke branch produksi
akan memicu deployment baru di Vercel. Jika mengubah kode frontend yang membaca
`VITE_API_URL`, lakukan redeploy frontend karena variabel `VITE_*` dibundel
saat proses build.

## 8. Batasan dan catatan operasional

- Batas satu file foto adalah **4 MB**. Batasi ukuran file sesuai pesan validasi
  aplikasi; permintaan upload juga memiliki overhead multipart.
- Foto baru disimpan di bucket Supabase. Foto lama dengan path `/uploads/...`
  dari server lokal tidak otomatis ikut ter-deploy.
- Bucket dibuat publik agar foto laporan dapat ditampilkan melalui URL. Jangan
  mengunggah foto sensitif atau informasi pribadi.
- Tabel Supabase menggunakan RLS tanpa policy untuk akses Data API. Backend
  memakai koneksi PostgreSQL langsung; aplikasi browser tidak memakai
  `service_role` key.
- Paket Supabase gratis dapat dijeda saat lama tidak aktif. Periksa status
  project di dashboard Supabase jika koneksi database atau upload tiba-tiba
  gagal.
- Untuk pengembangan lokal, salin `backend/.env.example` menjadi
  `backend/.env` dan `frontend/.env.example` menjadi `frontend/.env`, lalu isi
  nilainya. Jangan commit file `.env`.

## 9. Masalah umum

| Gejala | Yang perlu diperiksa |
|---|---|
| Error CORS di browser | `CORS_ORIGIN` harus sama persis dengan URL frontend Production, tanpa garis miring di akhir; setelah mengubahnya, redeploy backend. |
| Login atau request API gagal | Pastikan `VITE_API_URL` berisi URL backend ditambah `/api`; redeploy frontend setelah mengubahnya. Periksa juga Runtime Logs backend di Vercel. |
| Error database / 500 | Pastikan `DATABASE_URL` memakai Transaction pooler (port `6543`), password benar dan karakter khusus sudah di-URL-encode. Pastikan schema dan seed sudah dijalankan. |
| Upload foto gagal | Periksa `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, nama bucket `simonik-uploads`, dan Runtime Logs backend. |
| Foto tidak tampil | Pastikan bucket `simonik-uploads` tersedia dan disetel publik; URL foto lama `/uploads/...` lokal tidak tersedia di hosting. |
| Error 413 | File terlalu besar; batas project adalah 4 MB per foto. |
| Halaman selain beranda 404 saat refresh | Pastikan `frontend/vercel.json` ikut ter-deploy; file tersebut mengarahkan rute React ke `index.html`. |
| Deployment tidak memakai perubahan environment | Pastikan variabel diatur untuk environment yang benar, lalu jalankan redeploy project terkait. |
