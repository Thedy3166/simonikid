// ============================================================
// SIMONIK - Reports Controller
// File: src/modules/reports/reports.controller.js
// Deskripsi: Handler HTTP request untuk pengaduan
// ============================================================

const reportsService = require('./reports.service');
const storage = require('../../config/storage');

const MAX_PHOTOS = 3;

/**
 * POST /api/reports
 * Body: { scope, title, description, latitude, longitude }
 */
async function createReport(req, res) {
  try {
    const { scope, title, description, latitude, longitude } = req.body;
    const user_id = req.user.id;

    if (!scope || !title || !description || latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: 'Jenis infrastruktur, judul, deskripsi, dan lokasi wajib diisi',
      });
    }

    const report = await reportsService.createReport({
      user_id,
      scope,
      title,
      description,
      latitude,
      longitude,
    });

    return res.status(201).json({
      success: true,
      message: 'Laporan berhasil dikirim',
      data: { report },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/reports
 */
async function getReports(req, res) {
  try {
    const reports = await reportsService.getReports(req.user);

    return res.status(200).json({
      success: true,
      data: { reports, total: reports.length },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/reports/:id
 */
async function getReportById(req, res) {
  try {
    const { id } = req.params;
    const report = await reportsService.getReportById(id, req.user);

    return res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/reports/:id/history
 */
async function getReportHistory(req, res) {
  try {
    const { id } = req.params;
    await reportsService.getReportById(id, req.user);
    const history = await reportsService.getReportHistory(id);

    return res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * PATCH /api/reports/:id/status
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status wajib diisi',
      });
    }

    if (req.user.role !== 'petugas') {
      return res.status(403).json({
        success: false,
        message: 'Hanya petugas yang dapat mengubah status laporan',
      });
    }

    const report = await reportsService.updateReportStatus(id, status, note, req.user);

    return res.status(200).json({
      success: true,
      message: `Status laporan berhasil diubah menjadi ${status}`,
      data: { report },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /api/reports/:id/attachments
 * Upload foto (maks 3 per tipe)
 */
async function uploadAttachment(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File wajib diunggah',
      });
    }

    // Validasi akses
    await reportsService.getReportById(id, req.user);

    // Tentukan tipe: petugas → bukti, user → laporan
    const type = req.user.role === 'petugas' ? 'bukti' : 'laporan';

    // Cek batas maksimal
    const currentCount = await reportsService.countAttachments(id, type);

    if (currentCount >= MAX_PHOTOS) {
      return res.status(400).json({
        success: false,
        message: `Batas maksimal ${MAX_PHOTOS} foto sudah tercapai. Tidak bisa upload lagi.`,
      });
    }

    // Unggah ke Supabase Storage setelah semua validasi lolos
    const fileUrl = await storage.uploadImage({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      reportId: id,
      originalname: req.file.originalname,
    });

    const attachment = await reportsService.addAttachment({
      report_id: id,
      file_url: fileUrl,
      type,
      uploaded_by: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: `File berhasil diunggah (${currentCount + 1}/${MAX_PHOTOS})`,
      data: { attachment },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/reports/:id/attachments
 */
async function getAttachments(req, res) {
  try {
    const { id } = req.params;
    await reportsService.getReportById(id, req.user);
    const attachments = await reportsService.getAttachments(id);

    return res.status(200).json({
      success: true,
      data: { attachments, total: attachments.length },
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createReport,
  getReports,
  getReportById,
  getReportHistory,
  updateStatus,
  uploadAttachment,
  getAttachments,
};