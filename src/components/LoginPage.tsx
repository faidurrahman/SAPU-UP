import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  ArrowRight,
  Leaf,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Harap masukkan username Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Harap masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    // Simulate brief smooth auth validation
    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Username atau password tidak sesuai.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-emerald-600 selection:text-white">
      {/* Background Decorative ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md mx-auto my-auto relative z-10">
        {/* Civic Logo & Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          {/* Logo ikon daun hijau dalam kotak hijau - tepat di atas tombol kapsul secara vertikal & centered */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-900/40 border border-emerald-400/30 text-white mb-2.5">
            <Leaf className="w-9 h-9 text-emerald-100" />
          </div>
          {/* Tombol kapsul hijau KECAMATAN UJUNG PANDANG */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold tracking-wide uppercase mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Kecamatan Ujung Pandang</span>
          </div>
          {/* Judul besar tebal putih: SAPU-UP (kata MAKASSAR dihilangkan sepenuhnya) */}
          <h1 className="text-3xl font-black text-white tracking-tight mb-1.5">
            SAPU-UP
          </h1>
          {/* Penyelarasan teks lurus di tengah (centered) di bawah teks SAPU-UP */}
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed text-center">
            Sistem Aplikasi Persampahan Ujung Pandang
            <br />
            <span className="text-emerald-400 font-medium">
              Portal Akses Terintegrasi 10 Kelurahan
            </span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-7">
          <div className="border-b border-slate-100 pb-4 mb-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Masuk ke Akun Anda</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan masukkan kredensial resmi Kecamatan atau Kelurahan Anda.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username / Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-800/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Subtle Security Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Sistem Terproteksi & Akses Terbatas</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-slate-400 text-[11px]">
          Pemerintah Kota Makassar · Kecamatan Ujung Pandang · Sulawesi Selatan
        </div>
      </div>
    </div>
  );
};
