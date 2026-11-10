// ============================================================
// SIMONIK - Reports Service
// File: src/modules/reports/reports.service.js
// Deskripsi: Logika bisnis untuk pengaduan infrastruktur
// ============================================================

const db = require('../../config/db');

/**
 * Buat laporan baru
 */
async function createReport({ user_id, scope, title, description, latitude, longitude }) {
  const validScopes = ['jalan', 'lampu', 'drainase'];
  if (!validScopes.includes(scope)) {
    throw new Error('Jenis infrastruktur tidak valid');
  }

  const query = `
    INSERT INTO reports (user_id, scope, title, description, status, location, created_at, updated_at)
    VALUES ($1, $2, $3, $4, 'DIAJUKAN', ST_GeogFromText($5), NOW(), NOW())
    RETURNING id, user_id, scope, title, description, status,
              ST_Y(location::geometry) AS latitude,
              ST_X(location::geometry) AS longitude,
              created_at, updated_at
  `;

  const pointWKT = `SRID=4326;POINT(${longitude} ${latitude})`;
  const values = [user_id, scope, title, description, pointWKT];

  const result = await db.query(query, values);
  const report = result.rows[0];

  await db.query(
    `INSERT INTO report_status_history (report_id, status, note, changed_by, changed_at)
     VALUES ($1, 'DIAJUKAN', 'Laporan dibuat oleh user', $2, NOW())`,
    [report.id, user_id]
  );

  return report;
}

/**
 * Ambil daftar laporan sesuai role
 */
async function getReports(user) {
  let query;
  let values;

  if (user.role === 'petugas') {
    query = `
      SELECT r.id, r.user_id, r.scope, r.title, r.description, r.status,
             ST_Y(r.location::geometry) AS latitude,
             ST_X(r.location::geometry) AS longitude,
             r.created_at, r.updated_at,
             u.name AS user_name, u.email AS user_email
      FROM reports r
      JOIN users u ON u.id = r.user_id
      WHERE r.scope = ANY($1::scope_type[])
      ORDER BY r.created_at DESC
    `;
    values = [user.scopes];
  } else {
    query = `
      SELECT r.id, r.user_id, r.scope, r.title, r.description, r.status,
             ST_Y(r.location::geometry) AS latitude,
             ST_X(r.location::geometry) AS longitude,
             r.created_at, r.updated_at
      FROM reports r
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    values = [user.id];
  }

  const result = await db.query(query, values);
  return result.rows;
}

/**
 * Ambil detail laporan berdasarkan ID
 */
async function getReportById(id, user) {
  const query = `
    SELECT r.id, r.user_id, r.scope, r.title, r.description, r.status,
           ST_Y(r.location::geometry) AS latitude,
           ST_X(r.location::geometry) AS longitude,
           r.created_at, r.updated_at,
           u.name AS user_name, u.email AS user_email
    FROM reports r
    JOIN users u ON u.id = r.user_id
    WHERE r.id = $1
  `;

  const result = await db.query(query, [id]);

  if (result.rows.length === 0) {
    throw new Error('Laporan tidak ditemukan');
  }

  const report = result.rows[0];

  if (user.role === 'user' && report.user_id !== user.id) {
    throw new Error('Anda tidak berhak mengakses laporan ini');
  }

  if (user.role === 'petugas' && !user.scopes.includes(report.scope)) {
    throw new Error('Laporan ini di luar scope Anda');
  }

  return report;
}

/**
 * Ambil riwayat status laporan
 */
async function getReportHistory(reportId) {
  const query = `
    SELECT 
      rsh.id, rsh.status, rsh.note, rsh.changed_at,
      u.name AS changed_by_name,
      u.role AS changed_by_role
    FROM report_status_history rsh
    LEFT JOIN users u ON u.id = rsh.changed_by
    WHERE rsh.report_id = $1
    ORDER BY rsh.changed_at ASC
  `;

  const result = await db.query(query, [reportId]);
  return result.rows;
}

/**
 * Cek validitas transisi status
 */
function isValidTransition(fromStatus, toStatus) {
  const transitions = {
    DIAJUKAN: ['DIVERIFIKASI', 'DITOLAK'],
    DIVERIFIKASI: ['DIPROSES'],
    DIPROSES: ['SELESAI'],
    SELESAI: [],
    DITOLAK: [],
  };

  return transitions[fromStatus]?.includes(toStatus) || false;
}

/**
 * Update status laporan
 */
async function updateReportStatus(reportId, newStatus, note, user) {
  const report = await getReportById(reportId, user);

  if (!isValidTransition(report.status, newStatus)) {
    throw new Error(`Status tidak valid: ${report.status} → ${newStatus}`);
  }

  await db.query(
    `UPDATE reports SET status = $1, updated_at = NOW() WHERE id = $2`,
    [newStatus, reportId]
  );

  await db.query(
    `INSERT INTO report_status_history (report_id, status, note, changed_by, changed_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [reportId, newStatus, note || null, user.id]
  );

  return await getReportById(reportId, user);
}

/**
 * Simpan metadata attachment
 */
async function addAttachment({ report_id, file_url, type, uploaded_by }) {
  const query = `
    INSERT INTO report_attachments (report_id, file_url, type, uploaded_by, uploaded_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id, report_id, file_url, type, uploaded_by, uploaded_at
  `;

  const result = await db.query(query, [report_id, file_url, type, uploaded_by]);
  return result.rows[0];
}

/**
 * Ambil semua attachment untuk laporan
 */
async function getAttachments(reportId) {
  const query = `
    SELECT 
      ra.id, ra.report_id, ra.file_url, ra.type, ra.uploaded_at,
      u.name AS uploaded_by_name,
      u.role AS uploaded_by_role
    FROM report_attachments ra
    LEFT JOIN users u ON u.id = ra.uploaded_by
    WHERE ra.report_id = $1
    ORDER BY ra.uploaded_at ASC
  `;

  const result = await db.query(query, [reportId]);
  return result.rows;
}

/**
 * Hitung jumlah attachment untuk laporan berdasarkan tipe
 */
async function countAttachments(reportId, type) {
  const query = `
    SELECT COUNT(*)::int AS total
    FROM report_attachments
    WHERE report_id = $1 AND type = $2
  `;
  const result = await db.query(query, [reportId, type]);
  return result.rows[0].total;
}

module.exports = {
  createReport,
  getReports,
  getReportById,
  getReportHistory,
  updateReportStatus,
  isValidTransition,
  addAttachment,
  getAttachments,
  countAttachments,
};