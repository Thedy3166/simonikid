// ============================================================
// SIMONIK - Login Page
// File: src/pages/auth/LoginPage.jsx
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoSimonik from '../../assets/logo-simonik.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function validateForm() {
    if (!email.trim()) {
      setError('Email wajib diisi.');
      return false;
    }
    if (!email.includes('@')) {
      setError('Format email tidak valid.');
      return false;
    }
    if (!password.trim()) {
      setError('Password wajib diisi.');
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'petugas') {
        navigate('/petugas/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal masuk. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Header dengan Logo */}
        <div style={styles.header}>
          <img src={logoSimonik} alt="SIMONIK Logo" style={styles.logoImage} />
          <p style={styles.subtitle}>
            Sistem Informasi Monitoring dan Pengaduan<br/>Infrastruktur Kawasan
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@simonik.test"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#0b3d6b';
                e.target.style.boxShadow = '0 0 0 3px rgba(11, 61, 107, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#0b3d6b';
                e.target.style.boxShadow = '0 0 0 3px rgba(11, 61, 107, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div style={styles.divider}></div>

        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>Akun Demo</p>
          <div style={styles.demoList}>
            <div style={styles.demoItem}><span style={styles.demoRole}>User</span> user@simonik.test / rahasia123</div>
            <div style={styles.demoItem}><span style={styles.demoRole}>Petugas</span> jalan@simonik.test / rahasia123</div>
            <div style={styles.demoItem}><span style={styles.demoRole}>Petugas</span> lampu@simonik.test / rahasia123</div>
            <div style={styles.demoItem}><span style={styles.demoRole}>Petugas</span> drainase@simonik.test / rahasia123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fa',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '420px',
    padding: '40px 36px',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoImage: {
    height: '130px', // Ukuran diperbesar dari 80px
    objectFit: 'contain',
    marginBottom: '0px', // Jarak dihilangkan karena gambar AI biasanya sudah ada padding bawah
    marginTop: '-10px', // Sedikit ditarik ke atas agar tidak terlalu jauh dari atas card
  },
  subtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: '13.5px',
    fontWeight: '500',
    lineHeight: '1.6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '12px 14px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    fontFamily: 'inherit',
  },
  button: {
    marginTop: '4px',
    padding: '12px',
    backgroundColor: '#0b3d6b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e5e5',
    margin: '28px 0',
  },
  demoBox: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
  },
  demoTitle: {
    margin: '0 0 14px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  demoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '12.5px',
    color: '#64748b',
  },
  demoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  demoRole: {
    backgroundColor: '#e2e8f0',
    color: '#334155',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700',
    minWidth: '55px',
    textAlign: 'center',
  }
};