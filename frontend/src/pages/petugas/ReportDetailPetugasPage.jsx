// ============================================================
// SIMONIK - Report Detail Petugas Page
// File: src/pages/petugas/ReportDetailPetugasPage.jsx
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
  DIAJUKAN: { label: 'Diajukan', color: '#f39c12', bg: '#fef3c7' },
  DIVERIFIKASI: { label: 'Diverifikasi', color: '#3498db', bg: '#dbeafe' },
  DIPROSES: { label: 'Diproses', color: '#9b59b6', bg: '#f3e8ff' },
  SELESAI: { label: 'Selesai', color: '#27ae60', bg: '#dcfce7' },
  DITOLAK: { label: 'Ditolak', color: '#c0392b', bg: '#fee2e2' },
};

const STATUS_ACTIONS = {
  DIAJUKAN: [
    {
      status: 'DIVERIFIKASI',
      label: 'Verifikasi Laporan',
      color: '#27ae60',
      notePlaceholder: 'Catatan verifikasi (opsional)',
      confirmText: 'Verifikasi laporan ini? Laporan akan diteruskan untuk ditangani.',
    },
    {
      status: 'DITOLAK',
      label: 'Tolak Laporan',
      color: '#c0392b',
      notePlaceholder: 'Alasan penolakan (wajib)',
      confirmText: 'Tolak laporan ini? Pastikan alasan penolakan diisi.',
      requireNote: true,
    },
  ],
  DIVERIFIKASI: [
    {
      status: 'DIPROSES',
      label: 'Mulai Proses',
      color: '#9b59b6',
      notePlaceholder: 'Catatan proses (opsional)',
      confirmText: 'Mulai proses penanganan laporan ini?',
    },
  ],
  DIPROSES: [
    {
      status: 'SELESAI',
      label: 'Tandai Selesai',
      color: '#27ae60',
      notePlaceholder: 'Catatan penyelesaian (opsional)',
      confirmText: 'Tandai laporan ini sebagai SELESAI? Aksi ini tidak dapat dibatalkan.',
    },
  ],
  SELESAI: [],
  DITOLAK: [],
};

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_BUKTI = 3;
const CAN_UPLOAD_BUKTI = ['DIPROSES', 'SELESAI'];

export default function ReportDetailPetugasPage() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState(null);
  const [uploadingBukti, setUploadingBukti] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

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
      setError(err.response?.data?.message || 'Gagal memuat detail laporan.');
    } finally {
      setLoading(false);
    }
  }

  function openModal(action) {
    setModal({ action, note: '', loading: false, error: '' });
  }

  function closeModal() {
    setModal(null);
  }

  async function handleConfirm() {
    if (!modal) return;
    if (modal.action.requireNote && !modal.note.trim()) {
      setModal({ ...modal, error: 'Catatan wajib diisi untuk aksi ini.' });
      return;
    }

    setModal({ ...modal, loading: true, error: '' });

    try {
      await api.patch(`/reports/${id}/status`, {
        status: modal.action.status,
        note: modal.note.trim() || null,
      });
      await fetchData();
      closeModal();
    } catch (err) {
      setModal({
        ...modal,
        loading: false,
        error: err.response?.data?.message || 'Gagal mengubah status.',
      });
    }
  }

  function handleBuktiChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Hanya file JPG, PNG, atau WEBP yang diizinkan.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Ukuran maksimal file adalah 4MB.');
      e.target.value = '';
      return;
    }

    setUploadError('');
    setUploadSuccess('');
    setBuktiFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setBuktiPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleRemoveBukti() {
    setBuktiFile(null);
    setBuktiPreview(null);
    const input = document.getElementById('bukti-input');
    if (input) input.value = '';
  }

  async function handleUploadBukti() {
    if (!buktiFile) return;

    setUploadingBukti(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', buktiFile);

      await api.post(`/reports/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadSuccess('Bukti berhasil diunggah.');
      handleRemoveBukti();
      await fetchData();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Gagal mengunggah bukti.');
    } finally {
      setUploadingBukti(false);
    }
  }

  if (loading) return <div style={styles.statePage}>Memuat detail laporan...</div>;
  if (error || !report) return <div style={styles.statePage}>{error || 'Laporan tidak ditemukan.'}</div>;

  const statusInfo = STATUS_INFO[report.status] || { label: report.status, color: '#666', bg: '#f1f5f9' };
  const position = [Number(report.latitude), Number(report.longitude)];
  const actions = STATUS_ACTIONS[report.status] || [];
  const canUploadBukti = CAN_UPLOAD_BUKTI.includes(report.status);

  const fotoLaporan = attachments.filter((a) => a.type === 'laporan');
  const fotoBukti = attachments.filter((a) => a.type === 'bukti');
  const buktiPenuh = fotoBukti.length >= MAX_BUKTI;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
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

        {/* Header Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.scopeLabel}>{SCOPE_LABEL[report.scope] || report.scope}</span>
            <span style={{ ...styles.statusBadge, color: statusInfo.color, backgroundColor: statusInfo.bg }}>
              {statusInfo.label}
            </span>
          </div>
          <h1 style={styles.title}>{report.title}</h1>
          <p style={styles.meta}>Dikirim {formatRelativeTime(report.created_at)}</p>
          {report.user_name && (
            <p style={styles.meta}>Pelapor: <strong>{report.user_name}</strong></p>
          )}
        </div>

        {/* Description Card */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Deskripsi</h2>
          <p style={styles.description}>{report.description}</p>
        </div>

        {/* Photos Card */}
        {(fotoLaporan.length > 0 || fotoBukti.length > 0) && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Lampiran Foto</h2>
            
            {fotoLaporan.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={styles.photoLabel}>Foto Laporan ({fotoLaporan.length})</p>
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
                <p style={styles.photoLabel}>Bukti Penyelesaian ({fotoBukti.length})</p>
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

        {/* Upload Evidence Card */}
        {canUploadBukti && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Unggah Bukti Penyelesaian ({fotoBukti.length}/{MAX_BUKTI})</h2>
            <p style={styles.helperText}>Maksimal 3 foto. Pastikan pencahayaan jelas.</p>
            
            {buktiPenuh ? (
              <div style={styles.limitBox}>Batas maksimal foto tercapai.</div>
            ) : (
              <div>
                {!buktiPreview ? (
                  <div style={styles.uploadArea}>
                    <input id="bukti-input" type="file" accept="image/*" onChange={handleBuktiChange} style={styles.fileInput} />
                    <label htmlFor="bukti-input" style={styles.uploadLabel}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p style={styles.uploadText}>Klik untuk memilih foto bukti</p>
                    </label>
                  </div>
                ) : (
                  <div>
                    <div style={styles.previewArea}>
                      <img src={buktiPreview} alt="Preview" style={styles.previewImg} />
                      <button type="button" onClick={handleRemoveBukti} style={styles.removeBtn}>Hapus</button>
                    </div>
                    <button type="button" onClick={handleUploadBukti} disabled={uploadingBukti} style={styles.primaryBtn}>
                      {uploadingBukti ? 'Mengunggah...' : 'Unggah Bukti'}
                    </button>
                  </div>
                )}
              </div>
            )}
            {uploadError && <div style={styles.errorBox}>{uploadError}</div>}
            {uploadSuccess && <div style={styles.successBox}>{uploadSuccess}</div>}
          </div>
        )}

        {/* Location Card */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Lokasi</h2>
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
          <h2 style={styles.sectionTitle}>Riwayat Status</h2>
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
                    {item.changed_by_name && <p style={styles.timelineBy}>oleh {item.changed_by_name}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions Card */}
        {actions.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Aksi Tersedia</h2>
            <div style={styles.actionsRow}>
              {actions.map((action) => (
                <button
                  key={action.status}
                  onClick={() => openModal(action)}
                  style={{ ...styles.actionButton, backgroundColor: action.color }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {report.status === 'SELESAI' && (
          <div style={styles.finalBox}>Laporan ini telah selesai ditangani.</div>
        )}
        {report.status === 'DITOLAK' && (
          <div style={styles.finalBoxError}>Laporan ini telah ditolak.</div>
        )}

        {/* Modal Confirmation */}
        {modal && (
          <div style={styles.modalOverlay} onClick={closeModal}>
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.modalTitle}>{modal.action.label}</h3>
              <p style={styles.modalConfirmText}>{modal.action.confirmText}</p>
              
              <div style={styles.field}>
                <label style={styles.label}>
                  Catatan {modal.action.requireNote && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <textarea
                  value={modal.note}
                  onChange={(e) => setModal({ ...modal, note: e.target.value, error: '' })}
                  placeholder={modal.action.notePlaceholder}
                  rows={3}
                  style={styles.textarea}
                />
              </div>

              {modal.error && <div style={styles.errorBox}>{modal.error}</div>}

              <div style={styles.modalActions}>
                <button onClick={closeModal} disabled={modal.loading} style={styles.cancelBtn}>
                  Batal
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={modal.loading} 
                  style={{ ...styles.primaryBtn, backgroundColor: modal.action.color }}
                >
                  {modal.loading ? 'Memproses...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
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
    maxWidth: '800px',
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
  helperText: {
    margin: '0 0 12px',
    fontSize: '13px',
    color: '#6b7280',
  },
  limitBox: {
    padding: '12px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center',
  },
  uploadArea: {
    position: 'relative',
  },
  fileInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    opacity: 0,
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#f8fafc',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  uploadText: {
    margin: 0,
    fontSize: '14px',
    color: '#4b5563',
    fontWeight: '500',
  },
  previewArea: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e5e5e5',
    marginBottom: '16px',
  },
  previewImg: {
    width: '100%',
    maxHeight: '250px',
    objectFit: 'cover',
    display: 'block',
  },
  removeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '6px 12px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  primaryBtn: {
    padding: '10px 16px',
    backgroundColor: '#0b3d6b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
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
  actionsRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: '10px 20px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
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
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  modalConfirmText: {
    margin: '0 0 20px',
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.5',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  errorBox: {
    padding: '10px 12px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  successBox: {
    padding: '10px 12px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    fontSize: '13px',
    marginTop: '12px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
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