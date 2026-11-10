// ============================================================
// SIMONIK - Auth Routes
// File: src/modules/auth/auth.routes.js
// Deskripsi: Definisi endpoint URL untuk authentication
// ============================================================

const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth');

router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);

module.exports = router;