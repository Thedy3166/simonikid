// ============================================================
// SIMONIK - Reports Routes
// File: src/modules/reports/reports.routes.js
// ============================================================

const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const authMiddleware = require('../../middlewares/auth');
const upload = require('../../middlewares/upload');

router.use(authMiddleware);

// List & Create
router.post('/', reportsController.createReport);
router.get('/', reportsController.getReports);

// Attachments (upload foto)
router.post(
  '/:id/attachments',
  upload.single('file'),
  reportsController.uploadAttachment
);
router.get('/:id/attachments', reportsController.getAttachments);

// Detail & History
router.get('/:id/history', reportsController.getReportHistory);
router.get('/:id', reportsController.getReportById);

// Update Status (petugas)
router.patch('/:id/status', reportsController.updateStatus);

module.exports = router;