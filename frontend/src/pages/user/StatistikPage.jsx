// ============================================================
// SIMONIK - Statistik Page (User)
// File: src/pages/user/StatistikPage.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import api from '../../api/axios';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const STATUS_INFO = {
  DIAJUKAN: { label: 'Diajukan', color: '#f39c12' },
  DIVERIFIKASI: { label: 'Diverifikasi', color: '#3498db' },
  DIPROSES: { label: 'Diproses', color: '#9b59b6' },
  SELESAI: { label: 'Selesai', color: '#27ae60' },
  DITOLAK: { label: 'Ditolak', color: '#c0392b' },
};

const SCOPE_INFO = {
  jalan: { label: 'Jalan', color: '#0b3d6b' },
  lampu: { label: 'Lampu Penerangan', color: '#f39c12' },
  drainase: { label: 'Drainase', color: '#27ae60' },
};

export default function StatistikPage() {
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
      setError(err.response?.data?.message || 'Gagal memuat data statistik.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={styles.statePage}>Memuat statistik...</div>;
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <Link to="/user/dashboard" style={styles.backBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Dashboard
          </Link>
          <div style={styles.errorBox}>
            <p>{error}</p>
            <button onClick={fetchReports} style={styles.retryBtn}>Coba Lagi</button>
          </div>
        </div>
      </div>
    );
  }

  // Hitung data
  const statusCounts = {};
  Object.keys(STATUS_INFO).forEach((key) => {
    statusCounts[key] = reports.filter((r) => r.status === key).length;
  });

  const scopeCounts = {};
  Object.keys(SCOPE_INFO).forEach((key) => {
    scopeCounts[key] = reports.filter((r) => r.scope === key).length;
  });

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = reports.filter((r) => {
      const reportDate = new Date(r.created_at).toISOString().split('T')[0];
      return reportDate === dateStr;
    }).length;
    last7Days.push({
      label: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      count,
    });
  }

  // Konfigurasi Chart
  const statusChartData = {
    labels: Object.values(STATUS_INFO).map((s) => s.label),
    datasets: [
      {
        data: Object.keys(STATUS_INFO).map((key) => statusCounts[key]),
        backgroundColor: Object.values(STATUS_INFO).map((s) => s.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const scopeChartData = {
    labels: Object.values(SCOPE_INFO).map((s) => s.label),
    datasets: [
      {
        label: 'Jumlah Laporan',
        data: Object.keys(SCOPE_INFO).map((key) => scopeCounts[key]),
        backgroundColor: Object.values(SCOPE_INFO).map((s) => s.color),
        borderRadius: 4,
      },
    ],
  };

  const trendChartData = {
    labels: last7Days.map((d) => d.label),
    datasets: [
      {
        label: 'Laporan Masuk',
        data: last7Days.map((d) => d.count),
        borderColor: '#0b3d6b',
        backgroundColor: 'rgba(11, 61, 107, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#0b3d6b',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'system-ui', size: 12 },
          padding: 16,
          usePointStyle: true,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'system-ui' } }, grid: { color: '#f1f5f9' } },
      x: { ticks: { font: { family: 'system-ui' } }, grid: { display: false } },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'system-ui' } }, grid: { color: '#f1f5f9' } },
      x: { ticks: { font: { family: 'system-ui' } }, grid: { display: false } },
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        {/* Header */}
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
            <h1 style={styles.title}>Statistik Laporan</h1>
            <p style={styles.subtitle}>Ringkasan data laporan yang telah Anda buat</p>
          </div>
          <button onClick={fetchReports} style={styles.refreshBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>

        {reports.length === 0 ? (
          <div style={styles.emptyBox}>Belum ada data laporan untuk ditampilkan statistiknya.</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Total Laporan</div>
                <div style={styles.summaryValue}>{reports.length}</div>
              </div>
              {Object.entries(STATUS_INFO).map(([key, info]) => (
                <div key={key} style={styles.summaryCard}>
                  <div style={{ ...styles.summaryLabel, color: info.color }}>
                    {info.label}
                  </div>
                  <div style={{ ...styles.summaryValue, color: info.color }}>
                    {statusCounts[key]}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart 1: Status (Doughnut) */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Laporan per Status</h2>
              <div style={styles.chartWrapper}>
                <Doughnut data={statusChartData} options={chartOptions} />
              </div>
            </div>

            {/* Chart 2: Scope (Bar) */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Laporan per Jenis Infrastruktur</h2>
              <div style={styles.chartWrapper}>
                <Bar data={scopeChartData} options={barOptions} />
              </div>
            </div>

            {/* Chart 3: Trend 7 Hari (Line) */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Tren 7 Hari Terakhir</h2>
              <div style={styles.chartWrapper}>
                <Line data={trendChartData} options={lineOptions} />
              </div>
            </div>
          </>
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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
  },
  summaryLabel: {
    fontSize: '11px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  summaryValue: {
    fontSize: '24px',
    color: '#0b3d6b',
    fontWeight: '700',
    lineHeight: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    margin: '0 0 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chartWrapper: {
    position: 'relative',
    height: '280px',
  },
  emptyBox: {
    padding: '60px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    color: '#6b7280',
  },
  errorBox: {
    padding: '20px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderRadius: '8px',
    textAlign: 'center',
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
  statePage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#6b7280',
  }
};