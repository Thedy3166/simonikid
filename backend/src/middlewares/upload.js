// ============================================================
// SIMONIK - Upload Middleware
// File: src/middlewares/upload.js
// Deskripsi: Multer memakai memory storage (file diteruskan ke
//            Supabase Storage, bukan disimpan di disk server)
// ============================================================

const multer = require('multer');

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file JPG, PNG, atau WEBP yang diizinkan'), false);
  }
};

// Batas 4MB: Vercel Functions membatasi body request sekitar 4,5MB
const limits = { fileSize: 4 * 1024 * 1024 };

module.exports = multer({ storage: multer.memoryStorage(), fileFilter, limits });
