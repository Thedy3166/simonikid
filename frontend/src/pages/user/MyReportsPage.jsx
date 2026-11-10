// ============================================================
// SIMONIK - My Reports Page
// File: src/pages/user/MyReportsPage.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import ReportCard from '../../components/ReportCard';

export default function MyReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link 
          to="/user/dashboard" 
          style={styles.backBtn}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Kembali ke Dashboard
        </Link>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Laporan Saya</h1>
            <p style={styles.subtitle}>Kelola dan pantau laporan yang telah Anda kirim</p>
          </div>
          <button onClick={fetchReports} style={styles.refreshBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>

        {loading && (
          <div style={styles.stateBox}>
            <p>Memuat laporan...</p>
          </div>
        )}

        {error && !loading && (
          <div style={styles.errorBox}>
            <p>{error}</p>
            <button onClick={fetchReports} style={styles.retryBtn}>Coba Lagi</button>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div style={styles.emptyBox}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h3 style={styles.emptyTitle}>Belum Ada Laporan</h3>
            <p style={styles.emptyText}>Anda belum pernah mengirimkan laporan.</p>
            <button onClick={() => navigate('/user/report-type')} style={styles.primaryBtn}>
              Buat Laporan Baru
            </button>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div style={styles.list}>
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => navigate(`/user/report/${report.id}`)}
              />
            ))}
          </div>
        )}
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
    maxWidth: '900px',
    margin: '0 auto',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#4b5563',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
    transition: 'background-color 0.2s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  refreshBtn: {
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
  stateBox: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#6b7280',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
  },
  errorBox: {
    padding: '24px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#b91c1c',
  },
  retryBtn: {
    marginTop: '12px',
    padding: '8px 16px',
    backgroundColor: '#b91c1c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  emptyBox: {
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px dashed #d1d5db',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  emptyText: {
    margin: '0 0 24px',
    fontSize: '14px',
    color: '#6b7280',
  },
  primaryBtn: {
    padding: '10px 20px',
    backgroundColor: '#0b3d6b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }
};