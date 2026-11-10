// ============================================================
// SIMONIK - Auth Service
// File: src/modules/auth/auth.service.js
// Deskripsi: Logika bisnis untuk authentication (login)
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');

/**
 * Login user berdasarkan email dan password
 */
async function login(email, password) {
  const result = await db.query(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Email atau password salah');
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error('Email atau password salah');
  }

  let scopes = [];
  if (user.role === 'petugas') {
    const scopeResult = await db.query(
      'SELECT scope FROM petugas_scopes WHERE user_id = $1',
      [user.id]
    );
    scopes = scopeResult.rows.map((row) => row.scope);
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      scopes: scopes,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      scopes: scopes,
    },
    token,
  };
}

module.exports = { login };