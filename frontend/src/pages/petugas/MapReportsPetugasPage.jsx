// ============================================================
// SIMONIK - Map Reports Petugas Page
// File: src/pages/petugas/MapReportsPetugasPage.jsx
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SCOPE_LABEL = {
  jalan: 'Jalan',
  lampu: 'Lampu Penerangan',
  drainase: 'Drainase',
};

const STATUS_INFO = {
  DIAJUKAN: { label: 'Diajukan', color: '#f39c12' },
  DIVERIFIKASI: { label: 'Diverifikasi', color: '#3498db' },
  DIPROSES: { label: 'Diproses', color: '#9b59b6' },
  SELESAI: { label: 'Selesai', color: '#27ae60' },
  DITOLAK: { label: 'Ditolak', color: '#c0392b' },
};

const DEFAULT_CENTER = [-6.6829, 106.9253];
const DEFAULT_ZOOM = 12;

function createColoredIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width: 20px; height: 20px; background: ${color}; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [positions, map]);
  return null;
}

function MapRefSetter({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

export default function MapReportsPetugasPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);

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
      setError(err.response?.data?.message || 'Gagal memuat data peta.');
    } finally {
      setLoading(false);
    }
  }

  function handleLegendClick(status) {
    const filtered = reports.filter((r) => r.status === status);
    if (filtered.length === 0 || !mapRef.current) return;

    const positions = filtered.map((r) => [Number(r.latitude), Number(r.longitude)]);

    if (positions.length === 1) {
      mapRef.current.flyTo(positions[0], 17, { duration: 1 });
    } else {
      const bounds = L.latLngBounds(positions);
      mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 17, duration: 1 });
    }
  }

  const positions = reports.map((r) => [Number(r.latitude), Number(r.longitude)]);
  const center = positions.length > 0 ? positions[0] : DEFAULT_CENTER;

  const statusCounts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div style={styles.statePage}>Memuat data peta...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <div>
            <Link 
              to="/petugas/dashboard" 
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
            <h1 style={styles.title}>Peta Persebaran Laporan (Scope)</h1>
            <p style={styles.subtitle}>{reports.length} laporan dalam area tugas Anda</p>
          </div>
          <button onClick={fetchReports} style={styles.refreshBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {reports.length === 0 ? (
          <div style={styles.emptyBox}>Belum ada laporan di area tugas Anda.</div>
        ) : (
          <>
            {/* Legend */}
            <div style={styles.legendBox}>
              {Object.entries(STATUS_INFO).map(([key, info]) => {
                const count = statusCounts[key] || 0;
                const disabled = count === 0;
                return (
                  <button
                    key={key}
                    onClick={() => !disabled && handleLegendClick(key)}
                    disabled={disabled}
                    style={{
                      ...styles.legendItem,
                      opacity: disabled ? 0.5 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <span style={{ ...styles.legendDot, backgroundColor: info.color }} />
                    {info.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Map */}
            <div style={styles.mapWrapper}>
              <MapContainer center={center} zoom={DEFAULT_ZOOM} style={styles.map} scrollWheelZoom={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapRefSetter mapRef={mapRef} />
                <FitBounds positions={positions} />

                {reports.map((report) => {
                  const statusInfo = STATUS_INFO[report.status] || { label: report.status, color: '#666' };
                  return (
                    <Marker
                      key={report.id}
                      position={[Number(report.latitude), Number(report.longitude)]}
                      icon={createColoredIcon(statusInfo.color)}
                    >
                      <Popup>
                        <div style={styles.popupContent}>
                          <div style={styles.popupHeader}>
                            <span style={styles.popupScope}>{SCOPE_LABEL[report.scope]}</span>
                            <span style={{ color: statusInfo.color, fontWeight: '600', fontSize: '11px' }}>{statusInfo.label}</span>
                          </div>
                          <h4 style={styles.popupTitle}>{report.title}</h4>
                          <p style={styles.popupDesc}>
                            {report.description.length > 60 ? report.description.substring(0, 60) + '...' : report.description}
                          </p>
                          <button onClick={() => navigate(`/petugas/report/${report.id}`)} style={styles.popupBtn}>
                            Lihat Detail
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
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
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
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
    marginBottom: '16px',
    transition: 'background-color 0.2s',
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
  legendBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e5e5',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.2s',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  mapWrapper: {
    height: '600px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e5e5e5',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  popupContent: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    minWidth: '180px',
  },
  popupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  popupScope: {
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  popupTitle: {
    margin: '0 0 4px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  popupDesc: {
    margin: '0 0 12px',
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.4',
  },
  popupBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#0b3d6b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  errorBox: {
    padding: '20px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  emptyBox: {
    padding: '60px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    color: '#6b7280',
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