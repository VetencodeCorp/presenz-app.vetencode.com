import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { useAuthStore } from '../store/useAuthStore'

export default function LoginScreen() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (login(employeeId, password)) navigate('/', { replace: true })
    else setError('ID karyawan atau kata sandi belum sesuai. Coba TK-014 / 123456.')
  }

  return (
    <main className="screen-no-nav flex flex-col justify-center">
      <div className="mb-8">
        <div className="mb-10 flex h-[52px] w-[62px] items-center justify-center rounded-2xl text-[26px] font-bold text-white shadow-lg -rotate-2 fraunces" style={{ background: COLORS.terracotta, boxShadow: '0 8px 20px rgba(201,99,66,0.3)' }}>T</div>
        <h1 className="fraunces text-[30px] font-bold leading-tight tracking-[-0.03em]" style={{ color: COLORS.ink }}>Catatan Tugas</h1>
        <p className="mt-4 text-[17px] leading-relaxed" style={{ color: COLORS.inkSoft }}>Absensi & laporan kerja harian untuk perawatan kuda, burung, dan taman.</p>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="mb-3 block text-[13px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>ID Karyawan</span>
          <input value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} placeholder="contoh: TK-014" className="h-16 w-full rounded-xl border bg-white px-5 text-[17px]" style={{ borderColor: COLORS.border, color: COLORS.ink }} />
        </label>
        <label className="block">
          <span className="mb-3 block text-[13px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Kata Sandi</span>
          <div className="relative">
            <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="h-16 w-full rounded-xl border bg-white px-5 pr-14 text-[17px]" style={{ borderColor: COLORS.border, color: COLORS.ink }} />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2" aria-label="Tampilkan kata sandi">
              {showPassword ? <EyeOff size={23} color={COLORS.inkSoft} /> : <Lock size={23} color={COLORS.inkSoft} />}
            </button>
          </div>
        </label>
        {error && <p className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: COLORS.rustBg, color: COLORS.rust }}>{error}</p>}
        <button className="mt-7 h-16 w-full rounded-xl text-[14px] font-bold text-white" style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(201,99,66,0.3)' }}>Masuk</button>
      </form>
      <p className="mt-6 text-center text-[14px]" style={{ color: COLORS.inkSoft }}>Lupa kata sandi? Hubungi pengawas Anda.</p>
    </main>
  )
}
