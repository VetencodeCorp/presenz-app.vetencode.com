import { Plus, X, FileText, ChevronRight, CheckCircle, Edit3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

export default function ReportScreen() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { todayReport, reports, loading, submitting, error, loadReports, saveReport, updateReport, clearError } = useReportStore();

  const isEdit = todayReport.submitted;
  const [photos, setPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Saat data hari ini terload, isi form dengan data existing (mode edit)
  useEffect(() => {
    if (todayReport.submitted) {
      setPhotos(todayReport.photos || []);
      setDescription(todayReport.description || '');
    } else {
      setPhotos([]);
      setDescription('');
    }
  }, [todayReport.submitted, todayReport.id]);

  const addPhotos = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, MAX_FOTO - photos.length);
    event.target.value = '';
    if (files.length === 0) return;
    setCompressing(true);
    try {
      const compressed = await compressImages(files, { maxWidth: 1280, maxHeight: 1280, quality: 0.75 });
      setPhotos((old) => [...old, ...compressed]);
    } catch (err) {
      setLocalError('Gagal memproses foto. Coba foto lain.');
    } finally {
      setCompressing(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos((old) => old.filter((_, i) => i !== index));
  };

  const photoSrc = (p) => {
    if (p instanceof File) return URL.createObjectURL(p);
    return p; // sudah url
  };

  const submit = async (event) => {
    event.preventDefault();
    setLocalError('');
    setSuccessMsg('');
    clearError();

    if (photos.length < MIN_FOTO) {
      setLocalError(`Minimal ${MIN_FOTO} foto wajib diunggah.`);
      return;
    }
    if (!description.trim()) {
      setLocalError('Deskripsi wajib diisi.');
      return;
    }

    const action = isEdit
      ? updateReport(todayReport.id, { photos, description: description.trim() })
      : saveReport({ photos, description: description.trim() });

    const result = await action;
    if (result.success) {
      setSuccessMsg(result.message || 'Laporan berhasil tersimpan.');
    }
  };

  const errorMsg = localError || error;
  const recentReports = reports.slice(0, 5);

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

      {isEdit && (
        <div className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold"
          style={{ background: COLORS.ochreBg, color: COLORS.ochre }}>
          <Edit3 size={14} /> Mode ubah — laporan hari ini sudah ada
        </div>
      )}

      <form onSubmit={submit}>
        <section>
          <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Foto Kegiatan ({photos.length}/{MAX_FOTO})
          </h2>
          <div className="mb-2 flex gap-2.5 flex-wrap">
            {photos.map((photo, index) => (
              <div key={index} className="relative h-20 w-20 overflow-hidden rounded-xl border" style={{ borderColor: COLORS.border }}>
                <img src={photoSrc(photo)} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
                >
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
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-dashed"
                style={{ borderColor: COLORS.border, color: COLORS.terracotta }}
              >
                <Plus size={24} />
                <span className="mt-1 text-[11px]" style={{ color: COLORS.inkSoft }}>Tambah</span>
              </button>
            )}
          </div>
          <input ref={inputRef} onChange={addPhotos} type="file" accept="image/*" multiple className="hidden" />
          <p className="text-[11.5px]" style={{ color: COLORS.inkSoft }}>
            Min {MIN_FOTO}, max {MAX_FOTO} foto. Ambil dari kamera atau galeri.
          </p>
        </section>

        <label className="mt-5 block">
          <span className="mb-2 block text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Deskripsi Kegiatan
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Apa saja yang dikerjakan hari ini?"
            maxLength={1000}
            className="h-28 w-full resize-none rounded-2xl border bg-white p-4 text-[14px]"
            style={{ borderColor: COLORS.border, color: COLORS.ink }}
          />
          <span className="mt-1 block text-right text-[10px]" style={{ color: COLORS.inkSoft }}>
            {description.length}/1000
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting || compressing}
          className="mt-3 h-13 w-full rounded-xl py-3.5 text-[14px] font-bold text-white disabled:opacity-60"
          style={{ background: COLORS.terracotta, boxShadow: "0 4px 14px rgba(59,62,148,0.3)" }}
        >
          {compressing ? 'Memproses foto...' : submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Kirim Laporan'}
        </button>
        <p className="mt-3 text-center text-[12px]" style={{ color: COLORS.inkSoft }}>
          Laporan hanya bisa diubah pada hari yang sama.
        </p>
      </form>

      {/* RIWAYAT */}
      <section className="mt-8 border-t pt-6" style={{ borderColor: COLORS.border }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Riwayat Terbaru
          </h2>
          {reports.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="flex items-center gap-1 text-[12px] font-bold"
              style={{ color: COLORS.terracotta }}
            >
              Lihat Semua <ChevronRight size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <p className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
            style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
            Memuat...
          </p>
        ) : recentReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-6 text-center"
            style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
            <FileText size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-[13px]">Belum ada laporan.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentReports.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(`/reports/${r.id}`)}
                className="flex items-center gap-3 rounded-2xl border bg-white p-3 text-left"
                style={{ borderColor: COLORS.border }}
              >
                {r.foto?.[0] ? (
                  <img src={r.foto[0]} alt="thumb" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: COLORS.paperDark }}>
                    <FileText size={18} color={COLORS.inkSoft} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold" style={{ color: COLORS.ink }}>{fmt(r.tanggal)}</p>
                  <p className="mt-0.5 text-[12px] leading-snug line-clamp-1" style={{ color: COLORS.inkSoft }}>
                    {r.deskripsi}
                  </p>
                </div>
                <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>
                  {r.foto_count || r.foto?.length || 0} foto
                </span>
                <ChevronRight size={16} color={COLORS.inkSoft} className="shrink-0" />
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
