// URL foto: foto baru berupa URL penuh (Supabase Storage),
// data lama berupa path relatif (/uploads/...) dari backend lokal.
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '');

export function fileUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `${API_BASE}${url}`;
}
