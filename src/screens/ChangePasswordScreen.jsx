import { CheckCircle, Eye, EyeOff, Lock, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useAuthStore } from '../store/useAuthStore'

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-13 w-full rounded-xl border bg-white px-4 pr-12 py-3 text-[14px]"
        style={{ borderColor: COLORS.border, color: COLORS.ink }}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        {show ? <EyeOff size={18} color={COLORS.inkSoft} /> : <Eye size={18} color={COLORS.inkSoft} />}
      </button>
    </div>
  )
}

export default function ChangePasswordScreen() {
  const navigate = useNavigate()
  const changePassword = useAuthStore((s) => s.changePassword)

  const [passwordLama, setPasswordLama] = useState('')
  const [passwordBaru, setPasswordBaru] = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!passwordLama || !passwordBaru || !konfirmasi) {
      setError('Semua kolom wajib diisi.')
      return
    }
    if (passwordBaru !== konfirmasi) {
      setError('Konfirmasi password tidak cocok.')
      return
    }
    if (passwordBaru === passwordLama) {
      setError('Password baru tidak boleh sama dengan password lama.')
      return
    }

    setSubmitting(true)
    const result = await changePassword({ passwordLama, passwordBaru, konfirmasi })
    setSubmitting(false)

    if (result.success) {
      setSuccess(result.message || 'Password berhasil diubah.')
      setPasswordLama('')
      setPasswordBaru('')
      setKonfirmasi('')
      setTimeout(() => navigate('/profile'), 1500)
    } else {
      setError(result.message)
    }
  }

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Ubah Kata Sandi" subtitle="Pastikan password baru mudah Anda ingat" backTo="/profile" />

      <div className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: COLORS.ochreBg, color: COLORS.inkSoft }}>
        <Lock size={16} className="mt-0.5 shrink-0" color={COLORS.ochre} />
        <p className="text-[12px] leading-snug">
          Setelah berhasil, Anda tetap login dengan sesi ini. Password baru dipakai saat login berikutnya.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]"
          style={{ borderColor: COLORS.rust, background: COLORS.rustBg, color: COLORS.rust }}>
          <X size={18} className="mt-0.5 shrink-0" />
          <p className="font-semibold leading-snug">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-semibold"
          style={{ borderColor: COLORS.sage, background: COLORS.sageBg, color: COLORS.sage }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label>
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Password Lama
          </span>
          <PasswordInput value={passwordLama} onChange={setPasswordLama} placeholder="Masukkan password lama" />
        </label>

        <label>
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Password Baru
          </span>
          <PasswordInput value={passwordBaru} onChange={setPasswordBaru} placeholder="Masukkan password baru" />
        </label>

        <label>
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Konfirmasi Password Baru
          </span>
          <PasswordInput value={konfirmasi} onChange={setKonfirmasi} placeholder="Ulangi password baru" />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 h-13 w-full rounded-xl py-3.5 text-[14px] font-bold text-white disabled:opacity-60"
          style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(201,99,66,0.3)' }}
        >
          {submitting ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </form>
    </main>
  )
}
