// ============================================================
// SIMONIK - Petugas Dashboard
// File: src/pages/petugas/PetugasDashboard.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import ReportCard from '../../components/ReportCard';

const SCOPE_LABEL = {
  jalan: 'Jalan',
  lampu: 'Lampu Penerangan',
  drainase: 'Drainase',
};

const STATUS_STYLE = {
  ALL: { label: 'Total Laporan', color: '#0b3d6b' },
  DIAJUKAN: { label: 'Diajukan', color: '#f39c12' },
  DIVERIFIKASI: { label: 'Diverifikasi', color: '#3498db' },
  DIPROSES: { label: 'Diproses', color: '#9b59b6' },
  SELESAI: { label: 'Selesai', color: '#27ae60' },
  DITOLAK: { label: 'Ditolak', color: '#c0392b' },
};

export default function PetugasDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports');
      setReports(response.data.data.reports);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan.');
    } finally {
      setLoading(false);
    }
  }

  const filteredReports = activeFilter === 'ALL' 
    ? reports 
    : reports.filter((r) => r.status === activeFilter);

  const countByStatus = (status) => {
    if (status === 'ALL') return reports.length;
    return reports.filter((r) => r.status === status).length;
  };

  const handleSummaryClick = (status) => {
    setActiveFilter(status === activeFilter && status !== 'ALL' ? 'ALL' : status);
    setTimeout(() => {
      const el = document.getElementById('reports-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const userScopes = user?.scopes || [];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard Petugas</h1>
            <p style={styles.subtitle}>Kelola laporan yang masuk sesuai area tugas Anda</p>
            <div style={styles.badgeRow}>
              {userScopes.map((scope) => (
                <span key={scope} style={styles.scopeBadge}>
                  {SCOPE_LABEL[scope] || scope}
                </span>
              ))}
            </div>
          </div>
          
          <div style={styles.headerActions}>
            <button onClick={() => navigate('/petugas/map')} style={styles.actionBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
              Peta Laporan
            </button>
            <button onClick={() => navigate('/petugas/statistik')} style={styles.actionBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Statistik
            </button>
            <button onClick={logout} style={styles.logoutBtn}>
              Keluar
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={styles.summaryGrid}>
          {Object.entries(STATUS_STYLE).map(([key, info]) => {
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => handleSummaryClick(key)}
                style={{
                  ...styles.summaryCard,
                  borderColor: isActive ? info.color : '#e5e5e5',
                  backgroundColor: isActive ? `${info.color}0a` : '#ffffff',
                }}
              >
                <div style={{ ...styles.summaryLabel, color: info.color }}>
                  {info.label}
                </div>
                <div style={{ ...styles.summaryValue, color: info.color }}>
                  {countByStatus(key)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter Info */}
        {activeFilter !== 'ALL' && (
          <div style={styles.filterInfo}>
            <span>Menampilkan laporan dengan status: <strong>{STATUS_STYLE[activeFilter]?.label}</strong></span>
            <button onClick={() => setActiveFilter('ALL')} style={styles.clearFilterBtn}>
              Hapus Filter
            </button>
          </div>
        )}

        {/* Reports List */}
        <div id="reports-section" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              {activeFilter === 'ALL' ? 'Semua Laporan' : STATUS_STYLE[activeFilter]?.label}
              <span style={styles.countBadge}>{filteredReports.length}</span>
            </h2>
            <button onClick={fetchReports} style={styles.refreshBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          </div>

          {loading && <div style={styles.stateBox}>Memuat laporan...</div>}
          {error && <div style={styles.errorBox}>{error}</div>}
          
          {!loading && !error && filteredReports.length === 0 && (
            <div style={styles.emptyBox}>
              <p style={styles.emptyTitle}>Laporan Tidak Ditemukan</p>
              <p style={styles.emptyText}>
                {activeFilter === 'ALL' 
                  ? 'Saat ini belum ada laporan yang masuk ke area tugas Anda.' 
                  : 'Tidak ada laporan dengan status yang dipilih.'}
              </p>
            </div>
          )}

          {!loading && !error && filteredReports.length > 0 && (
            <div style={styles.list}>
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => navigate(`/petugas/report/${report.id}`)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '40px 20px',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    margin: '0 0 12px',
    fontSize: '14px',
    color: '#6b7280',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
  },
  scopeBadge: {
    padding: '4px 10px',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    color: '#4b5563',
    border: '1px solid #e5e5e5',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  summaryCard: {
    padding: '16px',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  summaryLabel: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
  },
  filterInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f0f7ff',
    border: '1px solid #cce0f5',
    borderRadius: '6px',
    marginBottom: '24px',
    fontSize: '14px',
    color: '#0b3d6b',
  },
  clearFilterBtn: {
    background: 'transparent',
    border: 'none',
    color: '#0b3d6b',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  section: {
    marginTop: '12px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  countBadge: {
    padding: '2px 8px',
    backgroundColor: '#e2e8f0',
    color: '#475569',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  stateBox: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
  },
  errorBox: {
    padding: '20px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    textAlign: 'center',
  },
  emptyBox: {
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px dashed #d1d5db',
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }
};