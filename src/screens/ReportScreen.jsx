import { Plus, X, FileText, ChevronRight, CheckCircle, Edit3, Clock, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScreenHeader from "../components/ScreenHeader";
import { COLORS } from "../constants/colors";
import { compressImages } from "../lib/compressImage";
import { todayLabel } from "../lib/date";
import { useReportStore } from "../store/useReportStore";

const MIN_FOTO = 1;
const MAX_FOTO = 5;

function fmt(s) {
  if (!s) return "-";
  const d = new Date(s + 'T00:00:00');
  const mons = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return d.getDate() + " " + mons[d.getMonth()] + " " + d.getFullYear();
}

function nowHHMM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

export default function ReportScreen() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const {
    reports, loading, submitting, error,
    loadReports, saveReport, updateReport, deleteReport, clearError,
  } = useReportStore();

  // Form state — kalau editingId null = mode "tambah", kalau ada = mode edit row tsb
  const [editingId, setEditingId] = useState(null);
  const [judul, setJudul] = useState('');
  const [waktu, setWaktu] = useState(nowHHMM());
  const [photos, setPhotos] = useState([]);
  const [description, setDescription] = useState('');

  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [compressing, setCompressing] = useState(false);

  useEffect(() => { loadReports(); }, [loadReports]);

  const today = new Date().toISOString().slice(0, 10);
  const todayReports = useMemo(() => reports.filter((r) => r.tanggal === today), [reports, today]);
  const historyReports = useMemo(() => reports.filter((r) => r.tanggal !== today).slice(0, 5), [reports, today]);

  const resetForm = () => {
    setEditingId(null);
    setJudul('');
    setWaktu(nowHHMM());
    setPhotos([]);
    setDescription('');
    setLocalError('');
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setJudul(r.judul || '');
    setWaktu(r.waktu || nowHHMM());
    setPhotos(r.foto || []);
    setDescription(r.deskripsi || '');
    setLocalError('');
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addPhotos = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, MAX_FOTO - photos.length);
    event.target.value = '';
    if (files.length === 0) return;
    setCompressing(true);
    try {
      const compressed = await compressImages(files, { maxWidth: 1280, maxHeight: 1280, quality: 0.75 });
      setPhotos((old) => [...old, ...compressed]);
    } catch {
      setLocalError('Gagal memproses foto. Coba foto lain.');
    } finally {
      setCompressing(false);
    }
  };

  const removePhoto = (index) => setPhotos((old) => old.filter((_, i) => i !== index));
  const photoSrc = (p) => (p instanceof File ? URL.createObjectURL(p) : p);

  const submit = async (event) => {
    event.preventDefault();
    setLocalError(''); setSuccessMsg(''); clearError();

    if (photos.length < MIN_FOTO) {
      setLocalError(`Minimal ${MIN_FOTO} foto wajib diunggah.`); return;
    }
    if (!description.trim()) {
      setLocalError('Deskripsi wajib diisi.'); return;
    }

    const payload = {
      judul: judul.trim() || null,
      waktu: waktu || null,
      description: description.trim(),
      photos,
    };

    const result = editingId
      ? await updateReport(editingId, payload)
      : await saveReport(payload);

    if (result.success) {
      setSuccessMsg(result.message || 'Laporan tersimpan.');
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus laporan ini? Tidak bisa dibatalkan.')) return;
    const result = await deleteReport(id);
    if (result.success) setSuccessMsg(result.message || 'Laporan dihapus.');
  };

  const errorMsg = localError || error;

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Laporan Kegiatan" subtitle={todayLabel()} backTo="/" />

      {errorMsg && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]"
          style={{ borderColor: COLORS.rust, background: COLORS.rustBg, color: COLORS.rust }}>
          <X size={18} className="mt-0.5 shrink-0" />
          <p className="font-semibold leading-snug">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-semibold"
          style={{ borderColor: COLORS.sage, background: COLORS.sageBg, color: COLORS.sage }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {editingId && (
        <div className="mb-4 flex items-center justify-between rounded-xl px-4 py-2.5 text-[12px] font-semibold"
          style={{ background: COLORS.ochreBg, color: COLORS.ochre }}>
          <span className="flex items-center gap-2"><Edit3 size={14} /> Mengubah laporan</span>
          <button type="button" onClick={resetForm} className="underline">Batal</button>
        </div>
      )}

      <form onSubmit={submit}>
        {/* Judul + waktu */}
        <div className="flex gap-2 mb-3">
          <label className="flex-1">
            <span className="mb-2 block text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Judul (opsional)</span>
            <input value={judul} onChange={(e) => setJudul(e.target.value)} maxLength={80}
              placeholder="cth: Rawat kuda pagi"
              className="h-11 w-full rounded-xl border bg-white px-3 text-[14px]"
              style={{ borderColor: COLORS.border, color: COLORS.ink }} />
          </label>
          <label className="w-[110px]">
            <span className="mb-2 block text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Waktu</span>
            <input type="time" value={waktu} onChange={(e) => setWaktu(e.target.value)}
              className="h-11 w-full rounded-xl border bg-white px-3 text-[14px]"
              style={{ borderColor: COLORS.border, color: COLORS.ink }} />
          </label>
        </div>

        {/* Foto */}
        <section>
          <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Foto Kegiatan ({photos.length}/{MAX_FOTO})
          </h2>
          <div className="mb-2 flex gap-2.5 flex-wrap">
            {photos.map((photo, index) => (
              <div key={index} className="relative h-20 w-20 overflow-hidden rounded-xl border" style={{ borderColor: COLORS.border }}>
                <img src={photoSrc(photo)} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => removePhoto(index)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
                  <X size={14} color={COLORS.rust} />
                </button>
              </div>
            ))}
            {compressing && (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border" style={{ borderColor: COLORS.border, background: COLORS.paperDark }}>
                <span className="text-[10px] font-bold animate-pulse" style={{ color: COLORS.inkSoft }}>Memproses...</span>
              </div>
            )}
            {photos.length < MAX_FOTO && !compressing && (
              <button type="button" onClick={() => inputRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-dashed"
                style={{ borderColor: COLORS.border, color: COLORS.terracotta }}>
                <Plus size={24} />
                <span className="mt-1 text-[11px]" style={{ color: COLORS.inkSoft }}>Tambah</span>
              </button>
            )}
          </div>
          <input ref={inputRef} onChange={addPhotos} type="file" accept="image/*" capture="environment" multiple className="hidden" />
          <p className="text-[11.5px]" style={{ color: COLORS.inkSoft }}>Min {MIN_FOTO}, max {MAX_FOTO} foto.</p>
        </section>

        {/* Deskripsi */}
        <label className="mt-4 block">
          <span className="mb-2 block text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Deskripsi Kegiatan</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Detail kegiatan yang dikerjakan..."
            maxLength={5000}
            className="h-28 w-full resize-none rounded-2xl border bg-white p-4 text-[14px]"
            style={{ borderColor: COLORS.border, color: COLORS.ink }} />
          <span className="mt-1 block text-right text-[10px]" style={{ color: COLORS.inkSoft }}>{description.length}/5000</span>
        </label>

        <button type="submit" disabled={submitting || compressing}
          className="mt-3 h-13 w-full rounded-xl py-3.5 text-[14px] font-bold text-white disabled:opacity-60"
          style={{ background: COLORS.terracotta, boxShadow: "0 4px 14px rgba(59,62,148,0.3)" }}>
          {compressing ? 'Memproses foto...' : submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Kirim Laporan'}
        </button>
        <p className="mt-3 text-center text-[12px]" style={{ color: COLORS.inkSoft }}>
          Bisa kirim beberapa laporan dalam 1 hari. Edit/hapus hanya pada hari yang sama.
        </p>
      </form>

      {/* Hari Ini */}
      {todayReports.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Hari Ini ({todayReports.length})
          </h2>
          <div className="flex flex-col gap-2.5">
            {todayReports.map((r) => (
              <ReportCard key={r.id} r={r} onEdit={() => startEdit(r)} onDelete={() => handleDelete(r.id)} onView={() => navigate(`/reports/${r.id}`)} editable />
            ))}
          </div>
        </section>
      )}

      {/* Riwayat sebelumnya */}
      <section className="mt-8 border-t pt-6" style={{ borderColor: COLORS.border }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Riwayat Sebelumnya</h2>
          {reports.length > 0 && (
            <button type="button" onClick={() => navigate('/reports')}
              className="flex items-center gap-1 text-[12px] font-bold"
              style={{ color: COLORS.terracotta }}>
              Lihat Semua <ChevronRight size={14} />
            </button>
          )}
        </div>
        {loading ? (
          <p className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
            style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>Memuat...</p>
        ) : historyReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-6 text-center"
            style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
            <FileText size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-[13px]">Belum ada riwayat.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {historyReports.map((r) => (
              <ReportCard key={r.id} r={r} onView={() => navigate(`/reports/${r.id}`)} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ReportCard({ r, onEdit, onDelete, onView, editable }) {
  return (
    <div className="rounded-2xl border bg-white p-3" style={{ borderColor: COLORS.border }}>
      <button type="button" onClick={onView} className="flex w-full items-start gap-3 text-left">
        {r.foto?.[0] ? (
          <img src={r.foto[0]} alt="thumb" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl" style={{ background: COLORS.paperDark }}>
            <FileText size={18} color={COLORS.inkSoft} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {r.waktu && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: COLORS.terracotta }}>
                <Clock size={11} /> {r.waktu}
              </span>
            )}
            <p className="text-[13px] font-bold truncate" style={{ color: COLORS.ink }}>
              {r.judul || fmt(r.tanggal)}
            </p>
          </div>
          <p className="mt-0.5 text-[12px] leading-snug line-clamp-2" style={{ color: COLORS.inkSoft }}>
            {r.deskripsi}
          </p>
          <span className="mt-1 inline-block text-[11px]" style={{ color: COLORS.inkSoft }}>
            {r.foto_count || r.foto?.length || 0} foto
          </span>
        </div>
        <ChevronRight size={16} color={COLORS.inkSoft} className="shrink-0 mt-1" />
      </button>
      {editable && (
        <div className="mt-2 flex gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
          <button type="button" onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-bold"
            style={{ background: COLORS.ochreBg, color: COLORS.ochre }}>
            <Edit3 size={12} /> Edit
          </button>
          <button type="button" onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-bold"
            style={{ background: COLORS.rustBg, color: COLORS.rust }}>
            <Trash2 size={12} /> Hapus
          </button>
        </div>
      )}
    </div>
  );
}
