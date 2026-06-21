import { Plus, X, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScreenHeader from "../components/ScreenHeader";
import { COLORS } from "../constants/colors";
import { todayLabel } from "../lib/date";
import { useReportStore } from "../store/useReportStore";

export default function ReportScreen() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { todayReport, saveReport, reports } = useReportStore();

  // Form state
  const [photos, setPhotos] = useState(todayReport.photos);
  const [description, setDescription] = useState(todayReport.description);

  const addPhotos = (event) => {
    const files = Array.from(event.target.files || []).slice(0, 3 - photos.length);
    setPhotos((old) => [...old, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const submit = (event) => {
    event.preventDefault();
    saveReport({ photos, description });
    navigate("/", { replace: true });
  };

  const fmt = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    const mons = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return d.getDate() + " " + mons[d.getMonth()] + " " + d.getFullYear();
  };

  return (
    <main className="screen-no-nav flex flex-col">
      <ScreenHeader title="Laporan Kegiatan" subtitle={todayLabel()} backTo="/" />

      <form onSubmit={submit} className="flex-1 overflow-y-auto px-5">
        {/* Form section */}
        <section>
          <h2 className="mb-4 text-[13px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Foto Kegiatan ({photos.length}/3)
          </h2>
          <div className="mb-4 flex gap-3 overflow-x-auto">
            {photos.map((photo, index) => (
              <div key={photo} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: COLORS.border }}>
                <img src={photo} alt={`Kegiatan ${index + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setPhotos(photos.filter((item) => item !== photo))}
                  className="absolute right-1 top-1 rounded-full bg-white p-1">
                  <X size={16} color={COLORS.rust} />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <button type="button" onClick={() => inputRef.current?.click()}
                className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed"
                style={{ borderColor: COLORS.border, color: COLORS.terracotta }}>
                <Plus size={28} />
                <span className="mt-2 text-sm" style={{ color: COLORS.inkSoft }}>Tambah</span>
              </button>
            )}
          </div>
          <input ref={inputRef} onChange={addPhotos} type="file" accept="image/*" multiple className="hidden" />
          <p className="text-[13px]" style={{ color: COLORS.inkSoft }}>Ambil dari kamera atau pilih dari galeri.</p>
        </section>

        <label className="mt-6 block">
          <span className="mb-4 block text-[13px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Deskripsi Kegiatan</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)}
            placeholder="Apa saja yang dikerjakan hari ini?"
            className="h-28 w-full resize-none rounded-2xl border bg-white p-5 text-[13px]"
            style={{ borderColor: COLORS.border, color: COLORS.ink }} />
        </label>

        <button className="mt-5 h-12 w-full rounded-xl text-[13px] font-bold text-white"
          style={{ background: COLORS.terracotta, boxShadow: "0 4px 14px rgba(201,99,66,0.3)" }}>
          Kirim Laporan
        </button>
        <p className="mt-3 text-center text-[13px]" style={{ color: COLORS.inkSoft }}>Bisa diubah sampai tengah malam hari ini.</p>
      </form>

      {/* Riwayat Laporan */}
      <section className="px-5 pb-8 pt-6 border-t" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Riwayat Laporan</h2>
          <FileText size={20} color={COLORS.inkSoft} />
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed" style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-[13px]">Belum ada laporan yang dikirim.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r, i) => (
              <div key={i} className="rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center justify-between mb-2">
                  <b className="text-[13px]" style={{ color: COLORS.ink }}>{fmt(r.tanggal) || "Hari ini"}</b>
                  <span className="rounded-xl px-3 py-1 text-[12px] font-bold"
                    style={{ background: COLORS.sageBg, color: COLORS.sage }}>Terkirim</span>
                </div>
                <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: COLORS.inkSoft }}>
                  {r.description || "Tidak ada deskripsi"}
                </p>
                {r.photos?.length > 0 && (
                  <p className="mt-1 text-[13px]" style={{ color: COLORS.inkSoft || "#A39C8E" }}>
                    {r.photos.length} foto
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}