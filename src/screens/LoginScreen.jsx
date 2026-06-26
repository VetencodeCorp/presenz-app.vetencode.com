import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { useAuthStore } from '../store/useAuthStore'

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login, loading, error: storeError, clearError } = useAuthStore()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (storeError) setError(storeError)
  }, [storeError])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    clearError()
    const ok = await login(employeeId, password)
    if (ok) navigate('/', { replace: true })
  }

  return (
    <main className="screen-no-nav flex flex-col justify-center">
      <div className="mb-8">
        <div className="mb-8 flex h-[55px] w-[60px] items-center justify-center rounded-2xl text-[26px] font-bold text-white shadow-lg -rotate-2 fraunces" style={{ background: COLORS.terracotta, boxShadow: '0 8px 20px rgba(201,99,66,0.3)' }}>P</div>
        <h1 className="fraunces text-[30px] font-bold leading-tight tracking-[-0.03em]" style={{ color: COLORS.ink }}>PresenZ</h1>
        <p className="mt-4 text-[17px] leading-relaxed" style={{ color: COLORS.inkSoft }}>Absensi & laporan kerja harian untuk perawatan kuda, burung, dan taman.</p>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="mb-3 block text-[15px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Username</span>
          <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="username Anda" className="h-14 w-full rounded-xl border bg-white px-5 text-[17px]" style={{ borderColor: COLORS.border, color: COLORS.ink }} />
        </label>
        <label className="block">
          <span className="mb-3 block text-[15px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Kata Sandi</span>
          <div className="relative">
            <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Masukkan kata sandi" className="h-14 w-full rounded-xl border bg-white px-5 pr-14 text-[17px]" style={{ borderColor: COLORS.border, color: COLORS.ink }} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2" aria-label="Tampilkan kata sandi">
              {showPassword ? <EyeOff size={23} color={COLORS.inkSoft} /> : <Lock size={23} color={COLORS.inkSoft} />}
            </button>
          </div>
        </label>
        {error && <p className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: storeError ? COLORS.rustBg : COLORS.rustBg, color: COLORS.rust }}>{error}</p>}
        <button className="mt-6 h-14 w-full rounded-xl text-[17px] font-bold text-white" style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(201,99,66,0.3)' }}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      <p className="mt-5 text-center text-[14px]" style={{ color: COLORS.inkSoft }}>Lupa kata sandi? Hubungi pengawas Anda.</p>
    </main>
  )
}