// ============================================================
// SIMONIK - Auth Middleware
// File: src/middlewares/auth.js
// Deskripsi: Verifikasi JWT token di header Authorization
// ============================================================

const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi token JWT
 * Dipakai di endpoint yang butuh login
 */
function authMiddleware(req, res, next) {
  // 1. Ambil header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan',
    });
  }

  // 2. Ambil token (setelah "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Simpan user ke req.user
    req.user = decoded;

    // 5. Lanjut ke handler berikutnya
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau kadaluarsa',
    });
  }
}

module.exports = authMiddleware;