// ============================================================
// SIMONIK - Create Report Page (Step 2)
// File: src/pages/user/CreateReportPage.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SCOPE_INFO = {
  jalan: { label: 'Jalan' },
  lampu: { label: 'Lampu Penerangan Jalan' },
  drainase: { label: 'Drainase' },
};

const VALID_SCOPES = ['jalan', 'lampu', 'drainase'];
const DEFAULT_CENTER = [-7.4234, 109.2345];
const DEFAULT_ZOOM = 15;
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_PHOTOS = 3;

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function CreateReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const scopeParam = searchParams.get('scope');
  const scopeInfo = SCOPE_INFO[scopeParam];

  useEffect(() => {
    if (!scopeParam || !VALID_SCOPES.includes(scopeParam)) {
      navigate('/user/report-type', { replace: true });
    }
  }, [scopeParam, navigate]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');

  useEffect(() => {
    if (scopeInfo) handleGetLocation();
  }, [scopeInfo]);

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGpsStatus('Browser tidak mendukung GPS.');
      return;
    }
    setGpsLoading(true);
    setGpsStatus('Mengambil lokasi...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setGpsStatus(`Lokasi ditemukan (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
        setGpsLoading(false);
      },
      (err) => {
        console.error(err);
        setGpsStatus('Gagal mengambil lokasi. Silakan klik peta untuk memilih manual.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (files.length > remaining) {
      setError(`Maksimal ${MAX_PHOTOS} foto. Anda hanya bisa menambah ${remaining} foto lagi.`);
      e.target.value = '';
      return;
    }

    const validFiles = [];
    for (const file of files) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError(`File "${file.name}" bukan gambar yang didukung.`);
        e.target.value = '';
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" melebihi batas 4MB.`);
        e.target.value = '';
        return;
      }
      validFiles.push(file);
    }

    setError('');
    setPhotos((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  }

  function handleRemovePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Judul laporan wajib diisi.');
      return;
    }
    if (!description.trim()) {
      setError('Deskripsi laporan wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const reportRes = await api.post('/reports', {
        scope: scopeParam,
        title,
        description,
        latitude: position[0],
        longitude: position[1],
      });

      const reportId = reportRes.data.data.report.id;

      for (const photo of photos) {
        const formData = new FormData();
        formData.append('file', photo);
        await api.post(`/reports/${reportId}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      alert('Laporan berhasil dikirim.');
      navigate('/user/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim laporan.');
    } finally {
      setLoading(false);
    }
  }

  if (!scopeInfo) return null;

  const remaining = MAX_PHOTOS - photos.length;
  const canAddMore = remaining > 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link 
          to="/user/report-type" 
          style={styles.backBtn}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Ganti Jenis Infrastruktur
        </Link>

        <div style={styles.header}>
          <h1 style={styles.title}>Buat Laporan Baru</h1>
          <p style={styles.subtitle}>Berikan informasi detail mengenai masalah infrastruktur</p>
          
          <div style={styles.stepIndicator}>
            <div style={styles.stepDotDone} />
            <div style={styles.stepLine} />
            <div style={styles.stepDotActive} />
            <span style={styles.stepLabel}>Langkah 2 dari 2</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.selectedTypeBox}>
            <span style={styles.selectedTypeLabel}>Kategori Terpilih:</span>
            <span style={styles.selectedTypeValue}>{scopeInfo.label}</span>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Judul Laporan</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Lubang parah di Jalan Sudirman"
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
            <label style={styles.label}>Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Berikan penjelasan detail mengenai kondisi kerusakan..."
              rows={4}
              style={styles.textarea}
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
            <label style={styles.label}>
              Bukti Foto <span style={styles.helperText}>(Maks 3 foto, pastikan pencahayaan jelas)</span>
            </label>

            {previews.length > 0 && (
              <div style={styles.photoGrid}>
                {previews.map((preview, index) => (
                  <div key={index} style={styles.photoItem}>
                    <img src={preview} alt={`Preview ${index + 1}`} style={styles.photoImg} />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      style={styles.removePhotoBtn}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {canAddMore ? (
              <div style={styles.uploadBox}>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  style={styles.fileInput}
                />
                <label htmlFor="photo-input" style={styles.uploadLabel}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p style={styles.uploadText}>Klik untuk memilih foto ({remaining} tersisa)</p>
                  <p style={styles.uploadHint}>JPEG, PNG, WEBP maksimal 4MB</p>
                </label>
              </div>
            ) : (
              <div style={styles.photoLimitBox}>
                Batas maksimal 3 foto tercapai. Hapus foto untuk menggantinya.
              </div>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Lokasi</label>
            <div style={styles.gpsRow}>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gpsLoading}
                style={styles.gpsButton}
              >
                {gpsLoading ? 'Mengambil...' : 'Gunakan Lokasi Saat Ini'}
              </button>
              <span style={styles.gpsStatus}>{gpsStatus}</span>
            </div>
            <div style={styles.mapWrapper}>
              <MapContainer center={position} zoom={DEFAULT_ZOOM} style={styles.map}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
                <MapController position={position} />
              </MapContainer>
            </div>
            <p style={styles.coordInfo}>
              Koordinat: {position[0].toFixed(5)}, {position[1].toFixed(5)}
              <br />
              <span style={styles.helperText}>Klik peta untuk menyesuaikan lokasi secara manual.</span>
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </form>
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
  header: {
    marginBottom: '24px',
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
  stepDotDone: {
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
  stepDotActive: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#0b3d6b',
  },
  stepLabel: {
    marginLeft: '8px',
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  selectedTypeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#f0f7ff',
    borderRadius: '6px',
    border: '1px solid #cce0f5',
  },
  selectedTypeLabel: {
    fontSize: '14px',
    color: '#4b5563',
    fontWeight: '500',
  },
  selectedTypeValue: {
    fontSize: '14px',
    color: '#0b3d6b',
    fontWeight: '600',
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
  helperText: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '400',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '10px',
    marginBottom: '10px',
  },
  photoItem: {
    position: 'relative',
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
  removePhotoBtn: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '24px',
    height: '24px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  uploadBox: {
    position: 'relative',
  },
  fileInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    opacity: 0,
    overflow: 'hidden',
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
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  },
  uploadText: {
    margin: '0 0 4px',
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500',
  },
  uploadHint: {
    margin: 0,
    fontSize: '12px',
    color: '#6b7280',
  },
  photoLimitBox: {
    padding: '12px 16px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
  },
  gpsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  gpsButton: {
    padding: '8px 16px',
    backgroundColor: '#0b3d6b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  gpsStatus: {
    fontSize: '13px',
    color: '#6b7280',
  },
  mapWrapper: {
    height: '300px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e5e5e5',
    zIndex: 0,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  coordInfo: {
    margin: '8px 0 0',
    fontSize: '13px',
    color: '#4b5563',
    fontFamily: 'monospace',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '13px',
  },
  submitBtn: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#0b3d6b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '8px',
  },
};