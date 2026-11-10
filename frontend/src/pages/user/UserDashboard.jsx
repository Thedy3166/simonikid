// ============================================================
// SIMONIK - User Dashboard
// File: src/pages/user/UserDashboard.jsx
// ============================================================

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const MENU = [
    {
      title: 'Buat Laporan Baru',
      desc: 'Laporkan masalah infrastruktur di sekitar Anda',
      path: '/user/report-type',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b3d6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      title: 'Laporan Saya',
      desc: 'Lihat daftar dan status laporan Anda',
      path: '/user/my-reports',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b3d6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      title: 'Peta Laporan',
      desc: 'Lihat persebaran laporan di peta',
      path: '/user/map',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b3d6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
      ),
    },
    {
      title: 'Statistik',
      desc: 'Lihat ringkasan data dan grafik laporan',
      path: '/user/statistik',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b3d6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>Selamat datang, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            style={styles.logoutBtn}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
          >
            Keluar
          </button>
        </div>

        {/* Menu Cards */}
        <div style={styles.menuGrid}>
          {MENU.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={styles.menuCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0b3d6b';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e5e5';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={styles.iconWrapper}>{item.icon}</div>
              <h2 style={styles.menuTitle}>{item.title}</h2>
              <p style={styles.menuDesc}>{item.desc}</p>
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
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
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
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  menuCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'left',
    cursor: 'pointer',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    backgroundColor: '#f0f7ff',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  menuTitle: {
    margin: '0 0 8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  menuDesc: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
  },
};