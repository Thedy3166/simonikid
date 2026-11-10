// ============================================================
// SIMONIK - Report Detail Page (User)
// File: src/pages/user/ReportDetailPage.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/axios';
import { formatFullDate, formatRelativeTime } from '../../utils/formatDate';
import { fileUrl } from '../../utils/fileUrl';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SCOPE_LABEL = {
  jalan: 'Jalan',
  lampu: 'Lampu Penerangan Jalan',
  drainase: 'Drainase',
};

const STATUS_INFO = {
  DIAJUKAN: { label: 'Submitted', color: '#f39c12', bg: '#fef3c7' },
  DIVERIFIKASI: { label: 'Verified', color: '#3498db', bg: '#dbeafe' },
  DIPROSES: { label: 'In Progress', color: '#9b59b6', bg: '#f3e8ff' },
  SELESAI: { label: 'Completed', color: '#27ae60', bg: '#dcfce7' },
  DITOLAK: { label: 'Rejected', color: '#c0392b', bg: '#fee2e2' },
};


export default function ReportDetailPage() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const [reportRes, historyRes, attachRes] = await Promise.all([
        api.get(`/reports/${id}`),
        api.get(`/reports/${id}/history`),
        api.get(`/reports/${id}/attachments`),
      ]);
      setReport(reportRes.data.data.report);
      setHistory(historyRes.data.data.history);
      setAttachments(attachRes.data.data.attachments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report details.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={styles.statePage}>Loading report details...</div>;
  if (error || !report) return <div style={styles.statePage}>{error || 'Report not found.'}</div>;

  const statusInfo = STATUS_INFO[report.status] || { label: report.status, color: '#666', bg: '#f1f5f9' };
  const position = [Number(report.latitude), Number(report.longitude)];

  const fotoLaporan = attachments.filter((a) => a.type === 'laporan');
  const fotoBukti = attachments.filter((a) => a.type === 'bukti');

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/user/my-reports" style={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to My Reports
        </Link>

        {/* Header Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.scopeLabel}>{SCOPE_LABEL[report.scope] || report.scope}</span>
            <span style={{ ...styles.statusBadge, color: statusInfo.color, backgroundColor: statusInfo.bg }}>
              {statusInfo.label}
            </span>
          </div>
          <h1 style={styles.title}>{report.title}</h1>
          <p style={styles.meta}>Submitted {formatRelativeTime(report.created_at)}</p>
        </div>

        {/* Description Card */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Description</h2>
          <p style={styles.description}>{report.description}</p>
        </div>

        {/* Photos Card */}
        {(fotoLaporan.length > 0 || fotoBukti.length > 0) && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Attachments</h2>
            
            {fotoLaporan.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={styles.photoLabel}>User Photos ({fotoLaporan.length})</p>
                <div style={styles.photoGrid}>
                  {fotoLaporan.map((att) => (
                    <a key={att.id} href={fileUrl(att.file_url)} target="_blank" rel="noopener noreferrer" style={styles.photoItem}>
                      <img src={fileUrl(att.file_url)} alt="Report" style={styles.photoImg} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {fotoBukti.length > 0 && (
              <div>
                <p style={styles.photoLabel}>Completion Evidence ({fotoBukti.length})</p>
                <div style={styles.photoGrid}>
                  {fotoBukti.map((att) => (
                    <a key={att.id} href={fileUrl(att.file_url)} target="_blank" rel="noopener noreferrer" style={styles.photoItem}>
                      <img src={fileUrl(att.file_url)} alt="Evidence" style={styles.photoImg} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location Card */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Location</h2>
          <p style={styles.coordText}>{Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)}</p>
          <div style={styles.mapWrapper}>
            <MapContainer center={position} zoom={16} style={styles.map} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position} />
            </MapContainer>
          </div>
        </div>

        {/* Timeline Card */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Status History</h2>
          <div style={styles.timeline}>
            {history.map((item, index) => {
              const info = STATUS_INFO[item.status] || { label: item.status, color: '#666', bg: '#f1f5f9' };
              const isLast = index === history.length - 1;
              return (
                <div key={item.id} style={styles.timelineItem}>
                  <div style={styles.timelineLeft}>
                    <div style={{ ...styles.timelineDot, backgroundColor: info.color }} />
                    {!isLast && <div style={styles.timelineLine} />}
                  </div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineHeader}>
                      <span style={{ ...styles.timelineStatus, color: info.color, backgroundColor: info.bg }}>{info.label}</span>
                      <span style={styles.timelineTime}>{formatFullDate(item.changed_at)}</span>
                    </div>
                    {item.note && <p style={styles.timelineNote}>{item.note}</p>}
                    {item.changed_by_name && <p style={styles.timelineBy}>by {item.changed_by_name}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {report.status === 'SELESAI' && (
          <div style={styles.finalBox}>This report has been completed.</div>
        )}
        {report.status === 'DITOLAK' && (
          <div style={styles.finalBoxError}>This report has been rejected. Please contact the relevant department for more information.</div>
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
    maxWidth: '800px',
    margin: '0 auto',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#4b5563',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
  },
  cardHeader: {
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
    padding: '4px 10px',
    borderRadius: '9999px',
    fontWeight: '600',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    lineHeight: '1.3',
  },
  meta: {
    margin: '0 0 4px',
    fontSize: '13px',
    color: '#6b7280',
  },
  sectionTitle: {
    margin: '0 0 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#1f2937',
    lineHeight: '1.6',
  },
  photoLabel: {
    margin: '0 0 8px',
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '12px',
  },
  photoItem: {
    display: 'block',
    borderRadius: '6px',
    overflow: 'hidden',
    aspectRatio: '1',
    border: '1px solid #e5e5e5',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  coordText: {
    margin: '0 0 12px',
    fontSize: '14px',
    color: '#4b5563',
    fontFamily: 'monospace',
  },
  mapWrapper: {
    height: '250px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e5e5e5',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
  },
  timelineItem: {
    display: 'flex',
    gap: '16px',
    minHeight: '60px',
  },
  timelineLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '4px',
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  timelineLine: {
    width: '2px',
    flex: 1,
    backgroundColor: '#e5e5e5',
    margin: '4px 0',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: '20px',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  timelineStatus: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  timelineTime: {
    fontSize: '12px',
    color: '#6b7280',
  },
  timelineNote: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#374151',
  },
  timelineBy: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#9ca3af',
  },
  finalBox: {
    padding: '16px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
  },
  finalBoxError: {
    padding: '16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '14px',
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