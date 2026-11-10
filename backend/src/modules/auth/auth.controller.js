// ============================================================
// SIMONIK - Auth Controller
// File: src/modules/auth/auth.controller.js
// Deskripsi: Handler HTTP request untuk authentication
// ============================================================

const authService = require('./auth.service');

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi',
      });
    }

    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/auth/me
 */
async function me(req, res) {
  return res.status(200).json({
    success: true,
    data: { user: req.user },
  });
}

module.exports = { login, me };