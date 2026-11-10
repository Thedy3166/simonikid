// ============================================================
// SIMONIK - Report Type Page
// File: src/pages/user/ReportTypePage.jsx
// ============================================================

import { useNavigate, Link } from 'react-router-dom';

const REPORT_TYPES = [
  {
    key: 'jalan',
    title: 'Jalan',
    description: 'Jalan berlubang, retak, atau mengalami kerusakan struktur.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0b3d6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16M4 2h16M9 22v-4M15 22v-4M9 6V2M15 6V2M9 14v-4M15 14v-4" />
      </svg>
    ),
  },
  {
    key: 'lampu',
    title: 'Lampu Penerangan Jalan',
    description: 'Lampu mati atau komponen penerangan mengalami kerusakan.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0b3d6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
      </svg>
    ),
  },
  {
    key: 'drainase',
    title: 'Drainase',
    description: 'Drainase tersumbat, rusak, atau mengalami masalah aliran air.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0b3d6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

export default function ReportTypePage() {
  const navigate = useNavigate();

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
          <h1 style={styles.title}>Pilih Jenis Infrastruktur</h1>
          <p style={styles.subtitle}>Pilih kategori masalah yang ingin Anda laporkan</p>
          
          <div style={styles.stepIndicator}>
            <div style={styles.stepDotActive} />
            <div style={styles.stepLine} />
            <div style={styles.stepDot} />
            <span style={styles.stepLabel}>Langkah 1 dari 2</span>
          </div>
        </div>

        <div style={styles.grid}>
          {REPORT_TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => navigate(`/user/create-report?scope=${type.key}`)}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0b3d6b';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e5e5';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={styles.iconWrapper}>{type.icon}</div>
              <h2 style={styles.cardTitle}>{type.title}</h2>
              <p style={styles.cardDesc}>{type.description}</p>
              <div style={styles.cardAction}>Pilih Kategori</div>
            </button>
          ))}
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
    marginBottom: '32px',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    margin: '0 0 20px',
    fontSize: '14px',
    color: '#6b7280',
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepDotActive: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#0b3d6b',
  },
  stepLine: {
    width: '24px',
    height: '2px',
    backgroundColor: '#e5e5e5',
  },
  stepDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#e5e5e5',
  },
  stepLabel: {
    marginLeft: '8px',
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'left',
    cursor: 'pointer',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'inherit',
  },
  iconWrapper: {
    marginBottom: '16px',
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  cardDesc: {
    margin: '0 0 24px',
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    flexGrow: 1,
  },
  cardAction: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0b3d6b',
  },
};