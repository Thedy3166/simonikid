// ============================================================
// SIMONIK - Report Card Component
// File: src/components/ReportCard.jsx
// ============================================================

import { formatRelativeTime } from '../utils/formatDate';

const SCOPE_LABEL = {
  jalan: 'Jalan',
  lampu: 'Lampu Penerangan',
  drainase: 'Drainase',
};

const STATUS_STYLE = {
  DIAJUKAN: { label: 'Diajukan', bg: '#fef3c7', color: '#92400e' },
  DIVERIFIKASI: { label: 'Diverifikasi', bg: '#dbeafe', color: '#1e40af' },
  DIPROSES: { label: 'Diproses', bg: '#f3e8ff', color: '#6b21a8' },
  SELESAI: { label: 'Selesai', bg: '#dcfce7', color: '#166534' },
  DITOLAK: { label: 'Ditolak', bg: '#fee2e2', color: '#991b1b' },
};

export default function ReportCard({ report, onClick }) {
  const scopeLabel = SCOPE_LABEL[report.scope] || report.scope;
  const statusInfo = STATUS_STYLE[report.status] || { label: report.status, bg: '#f1f5f9', color: '#475569' };

  return (
    <div
      style={styles.card}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e5e5';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
      }}
    >
      <div style={styles.header}>
        <span style={styles.scopeLabel}>{scopeLabel}</span>
        <span style={{ ...styles.statusBadge, backgroundColor: statusInfo.bg, color: statusInfo.color }}>
          {statusInfo.label}
        </span>
      </div>

      <h3 style={styles.title}>{report.title}</h3>
      <p style={styles.description}>{report.description}</p>

      <div style={styles.footer}>
        <span style={styles.meta}>{formatRelativeTime(report.created_at)}</span>
        {report.latitude != null && (
          <span style={styles.metaCoords}>
            {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '12px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  scopeLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statusBadge: {
    fontSize: '12px',
    padding: '2px 10px',
    borderRadius: '9999px',
    fontWeight: '500',
  },
  title: {
    margin: '0 0 6px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    lineHeight: '1.4',
  },
  description: {
    margin: '0 0 16px',
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
    marginTop: 'auto',
  },
  meta: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  metaCoords: {
    fontSize: '12px',
    color: '#9ca3af',
    fontFamily: 'monospace',
  }
};