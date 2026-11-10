// ============================================================
// SIMONIK - Supabase Storage
// File: src/config/storage.js
// Deskripsi: Upload foto ke bucket Supabase (pengganti folder uploads)
// ============================================================

const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.SUPABASE_BUCKET || 'simonik-uploads';
let client;

function getClient() {
  if (!client) {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Konfigurasi Supabase Storage belum diatur di environment');
    }
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

/**
 * Unggah satu gambar dan kembalikan URL publiknya.
 */
async function uploadImage({ buffer, mimetype, reportId, originalname }) {
  const ext = path.extname(originalname || '').toLowerCase() || '.jpg';
  const objectPath = `reports/${reportId}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const { error } = await getClient()
    .storage.from(BUCKET)
    .upload(objectPath, buffer, { contentType: mimetype, upsert: false });
  if (error) throw new Error(`Gagal mengunggah file: ${error.message}`);

  const { data } = getClient().storage.from(BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

module.exports = { uploadImage };
