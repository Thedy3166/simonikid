// ============================================================
// SIMONIK - Format Date Helper
// File: src/utils/formatDate.js
// Deskripsi: Format tanggal ke teks relatif ("2 menit lalu")
// ============================================================

/**
 * Format tanggal ke teks relatif
 * @param {string|Date} dateString - Tanggal dari backend
 * @returns {string} - Contoh: "2 menit lalu", "1 jam lalu"
 */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return 'Kemarin';
  if (diffDay < 7) return `${diffDay} hari lalu`;

  // Kalau lebih dari 7 hari, tampilkan tanggal
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format tanggal lengkap (untuk halaman detail)
 */
export function formatFullDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}