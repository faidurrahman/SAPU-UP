import React from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { FilterBar } from './FilterBar';
import { ScrollReveal } from './ScrollReveal';
import {
  Scale,
  Truck,
  Recycle,
  Wheat,
  Bug,
  Sparkles,
  TrendingUp,
  Award,
  AlertCircle,
  Building,
  ArrowUpRight,
  Trash2,
  Store,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    executiveSummary,
    kelurahanSummaries,
    dailyTrendData,
    compositionData,
    filter,
    setFilter,
    setActiveTab,
    setPreselectedInputKelurahan,
    totalResiduKg,
    totalAnorganikKg,
    totalHorekaGrandKg,
    navigateToRekap,
  } = useWasteData();

  const diversionRate =
    executiveSummary.grandTotal > 0
      ? ((executiveSummary.totalTps3r + executiveSummary.totalPakan) /
          executiveSummary.grandTotal) *
        100
      : 0;

  // Formatting helper
  const fmt = (n: number) => n.toLocaleString('id-ID');

  const topKelurahan = kelurahanSummaries[0];

  return (
    <div className="space-y-6">
      {/* Filter Bar with gentle reveal */}
      <ScrollReveal delay={0} distance={16} duration={500}>
        <FilterBar />
      </ScrollReveal>

      {/* Hero KPI Cards Grid - Clickable to corresponding Rekapitulasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Timbulan Organik */}
        <ScrollReveal delay={40} distance={28} duration={650} className="h-full">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToRekap('organik', { columnView: 'daily' })}
            title="Klik untuk membuka Rekapitulasi Sampah Organik"
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-2xl hover:shadow-emerald-950/15 hover:-translate-y-2 hover:border-emerald-500 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
          >
            {/* Top smooth accent line indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-800 transition-colors duration-200">
                  Total Sampah Organik
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 ease-out">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums group-hover:text-emerald-950 transition-colors duration-200">
                  {fmt(executiveSummary.grandTotal)}
                </span>
                <span className="text-xs font-semibold text-slate-500">Kg</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px] text-slate-500">Tingkat Kecamatan</span>
              <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
                <span>Lihat Rekap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 2: Total Sampah Anorganik */}
        <ScrollReveal delay={60} distance={28} duration={650} className="h-full">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToRekap('anorganik')}
            title="Klik untuk membuka Rekapitulasi Sampah Anorganik"
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-2xl hover:shadow-teal-950/15 hover:-translate-y-2 hover:border-teal-500 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-teal-800 transition-colors duration-200">
                  Total Sampah Anorganik
                </span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 ease-out">
                  <Recycle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums group-hover:text-teal-950 transition-colors duration-200">
                  {fmt(totalAnorganikKg ?? 0)}
                </span>
                <span className="text-xs font-semibold text-slate-500">Kg</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px] text-slate-500">Mobil & Fukuda</span>
              <span className="text-teal-700 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
                <span>Lihat Rekap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 3: Total Sampah Residu */}
        <ScrollReveal delay={80} distance={28} duration={650} className="h-full">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToRekap('residu')}
            title="Klik untuk membuka Rekapitulasi Sampah Residu TPA"
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-2xl hover:shadow-rose-950/15 hover:-translate-y-2 hover:border-rose-500 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-rose-800 transition-colors duration-200">
                  Total Sampah Residu
                </span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 ease-out">
                  <Trash2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums group-hover:text-rose-950 transition-colors duration-200">
                  {fmt(totalResiduKg ?? 0)}
                </span>
                <span className="text-xs font-semibold text-slate-500">Kg</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px] text-slate-500">TPA Tamangapa</span>
              <span className="text-rose-700 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
                <span>Lihat Rekap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 4: Total Sampah Horeka */}
        <ScrollReveal delay={90} distance={28} duration={650} className="h-full">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToRekap('horeka')}
            title="Klik untuk membuka Rekapitulasi Sektor Horeka"
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-2xl hover:shadow-indigo-950/15 hover:-translate-y-2 hover:border-indigo-500 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-indigo-800 transition-colors duration-200">
                  Total Sampah Horeka
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 ease-out">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums group-hover:text-indigo-950 transition-colors duration-200">
                  {fmt(totalHorekaGrandKg ?? 0)}
                </span>
                <span className="text-xs font-semibold text-slate-500">Kg</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px] text-slate-500">147 Pelaku Usaha</span>
              <span className="text-indigo-700 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
                <span>Lihat Rekap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 5: Angkutan TPA / Bosowa */}
        <ScrollReveal delay={110} distance={28} duration={650} className="h-full">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToRekap('organik', { columnView: 'categories' })}
            title="Klik untuk membuka Rekapitulasi Alokasi TPA (Bosowa)"
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-2xl hover:shadow-sky-950/15 hover:-translate-y-2 hover:border-sky-500 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
          >
            {/* Top smooth accent line indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-sky-800 transition-colors duration-200">
                  Angkutan TPA
                </span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300 ease-out">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums group-hover:text-sky-950 transition-colors duration-200">
                  {fmt(executiveSummary.totalTpa)}
                </span>
                <span className="text-xs font-semibold text-slate-500">Kg</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="font-mono text-[11px] font-semibold text-sky-700 tabular-nums">
                {executiveSummary.percentTpa.toFixed(1)}% Porsi TPA
              </span>
              <span className="text-sky-700 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
                <span>Lihat Rekap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 6: Pengolahan TPS3R */}
        <ScrollReveal delay={180} distance={28} duration={650} className="h-full">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToRekap('organik', { columnView: 'categories' })}
            title="Klik untuk membuka Rekapitulasi Pengolahan TPS3R"
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-2xl hover:shadow-emerald-950/15 hover:-translate-y-2 hover:border-emerald-500 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
          >
            {/* Top smooth accent line indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-800 transition-colors duration-200">
                  Pengolahan TPS3R
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 ease-out">
                  <Recycle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums group-hover:text-emerald-950 transition-colors duration-200">
                  {fmt(executiveSummary.totalTps3r)}
                </span>
                <span className="text-xs font-semibold text-slate-500">Kg</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="font-mono text-[11px] font-semibold text-emerald-700 tabular-nums">
                {executiveSummary.percentTps3r.toFixed(1)}% Reduksi
              </span>
              <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
                <span>Lihat Rekap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 7: Pemanfaatan Pakan Ternak */}
        <ScrollReveal delay={250} distance={28} duration={650} className="h-full">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToRekap('organik', { columnView: 'categories' })}
            title="Klik untuk membuka Rekapitulasi Pemanfaatan Pakan Ternak"
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-2xl hover:shadow-amber-950/15 hover:-translate-y-2 hover:border-amber-500 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
          >
            {/* Top smooth accent line indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-amber-800 transition-colors duration-200">
                  Pemanfaatan Pakan Ternak
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 ease-out">
                  <Wheat className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums group-hover:text-amber-950 transition-colors duration-200">
                  {fmt(executiveSummary.totalPakan)}
                </span>
                <span className="text-xs font-semibold text-slate-500">Kg</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="font-mono text-[11px] font-semibold text-amber-700 tabular-nums">
                {executiveSummary.percentPakan.toFixed(1)}% (9 Petugas)
              </span>
              <span className="text-amber-700 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
                <span>Lihat Rekap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Circular Economy Performance Banner ("kotak hijau Capaian Reduksi") with Scroll Reveal */}
      <ScrollReveal delay={100} distance={32} duration={700}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigateToRekap('organik', { columnView: 'categories' })}
          title="Klik untuk membuka Rekapitulasi Sirkular Ekonomi (TPS3R, Maggot & WDR)"
          className="group bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/30 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-800/60 cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 flex items-center justify-center text-emerald-300 shrink-0 border border-emerald-700/50 shadow-inner group-hover:scale-110 group-hover:bg-emerald-700 transition-all duration-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white group-hover:text-emerald-100 transition-colors">
                  Capaian Reduksi & Sirkular Ekonomi Sampah Organik
                </h3>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-700/60 flex items-center gap-1 group-hover:bg-emerald-700 transition-colors">
                  <span>Lihat Rekap</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5 leading-relaxed">
                Sebesar{' '}
                <strong className="text-white font-mono tabular-nums">
                  {diversionRate.toFixed(1)}% ({fmt(executiveSummary.totalTps3r + executiveSummary.totalPakan)} Kg)
                </strong>{' '}
                sampah organik berhasil dialihkan dari pembuangan TPA melalui TPS3R dan pakan ternak.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigateToRekap('organik', { columnView: 'categories' });
              }}
              title="Lihat rincian pengolahan Biokonversi Maggot"
              className="bg-emerald-800/70 hover:bg-emerald-700 px-4 py-2.5 rounded-xl border border-emerald-700/60 hover:border-emerald-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/50 transition-all duration-300 ease-out text-center cursor-pointer"
            >
              <div className="text-[11px] text-emerald-300 uppercase tracking-wide">Biokonversi Maggot</div>
              <div className="text-base font-bold font-mono text-emerald-100">
                {fmt(executiveSummary.totalMaggot)} Kg
              </div>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigateToRekap('organik', { columnView: 'categories' });
              }}
              title="Lihat rincian pengolahan Open Windrow"
              className="bg-emerald-800/70 hover:bg-emerald-700 px-4 py-2.5 rounded-xl border border-emerald-700/60 hover:border-emerald-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/50 transition-all duration-300 ease-out text-center cursor-pointer"
            >
              <div className="text-[11px] text-emerald-300 uppercase tracking-wide">Open Windrow (WDR)</div>
              <div className="text-base font-bold font-mono text-emerald-100">
                {fmt(executiveSummary.totalOpenWindrow)} Kg
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Charts Row with Scroll Reveal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Trend Chart (2 columns) */}
        <ScrollReveal delay={120} distance={36} duration={700} className="lg:col-span-2 h-full">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-2 hover:border-slate-300 transition-all duration-300 ease-out h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Grafik Tren Harian Sampah Organik (Kg)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Volume harian alokasi TPA (Bosowa), TPS3R, dan Pakan Ternak
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {dailyTrendData.length} Hari Terdata
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyTrendData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorTps3r" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorPakan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="dayLabel"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [
                        `${Number(val || 0).toLocaleString('id-ID')} Kg`,
                      ]}
                      labelFormatter={(lbl) => `Tanggal: ${lbl} Oktober 2026`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tps3r"
                      name="TPS3R (Kg)"
                      stroke="#059669"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTps3r)"
                    />
                    <Area
                      type="monotone"
                      dataKey="tpa"
                      name="TPA Bosowa (Kg)"
                      stroke="#0284c7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTpa)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pakan"
                      name="Pakan Ternak (Kg)"
                      stroke="#d97706"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPakan)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Waste Composition Donut Chart (1 column) */}
        <ScrollReveal delay={220} distance={36} duration={700} className="h-full">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-2 hover:border-slate-300 transition-all duration-300 ease-out flex flex-col justify-between h-full">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Komposisi Sampah Organik
              </h3>
              <p className="text-xs text-slate-500">
                Proporsi kategori bahan organik terhimpun
              </p>
            </div>

            <div className="h-52 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [
                      `${Number(val || 0).toLocaleString('id-ID')} Kg`,
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Clean Legend Matrix with Tabular numbers */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              {compositionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="font-mono tabular-nums text-slate-800">
                    <span className="font-semibold">{fmt(item.value)} Kg</span>{' '}
                    <span className="text-slate-400">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Kelurahan Rankings & Contributions Horizontal Bar Chart + Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScrollReveal delay={120} distance={36} duration={700} className="lg:col-span-2 h-full">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-2 hover:border-slate-300 transition-all duration-300 ease-out h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Peringkat Kontribusi 10 Kelurahan Se-Kecamatan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbandingan total sampah organik terkelola antar kelurahan
                  </p>
                </div>
                {topKelurahan && (
                  <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 shadow-2xs">
                    Tertinggi: <strong>{topKelurahan.kelurahanName}</strong> ({fmt(topKelurahan.grandTotal)} Kg)
                  </span>
                )}
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={kelurahanSummaries}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="kelurahanName"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip
                      formatter={(val: any) => [
                        `${Number(val || 0).toLocaleString('id-ID')} Kg`,
                      ]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="totalTps3r" name="TPS3R (Kg)" stackId="a" fill="#059669" />
                    <Bar dataKey="totalTpa" name="TPA Bosowa (Kg)" stackId="a" fill="#0284c7" />
                    <Bar dataKey="totalPakan" name="Pakan (Kg)" stackId="a" fill="#d97706" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Quick Highlights & Action List */}
        <ScrollReveal delay={220} distance={36} duration={700} className="h-full">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-2 hover:border-slate-300 transition-all duration-300 ease-out flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Rangkuman Wilayah & Petugas
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Status pengumpulan dan petugas pakan yang aktif beroperasi di Kecamatan Ujung Pandang
              </p>

              <div className="space-y-3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigateToRekap('organik', { searchQuery: 'Baru' })}
                  title="Klik untuk membuka Rekapitulasi Kelurahan Baru"
                  className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200/60 hover:border-emerald-400 hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200/60 transition-all duration-300 ease-out cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors">
                      Kelurahan Baru
                    </span>
                    <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                      <span>20.620 Kg</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    TPS3R: 16.063 Kg · TPA: 3.591 Kg · Petugas Pakan: <strong>Musliadi</strong> (966 Kg)
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigateToRekap('organik', { searchQuery: 'Bulogading' })}
                  title="Klik untuk membuka Rekapitulasi Kelurahan Bulogading"
                  className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200/60 hover:border-sky-400 hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200/60 transition-all duration-300 ease-out cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-sky-800 transition-colors">
                      Kelurahan Bulogading
                    </span>
                    <span className="font-mono font-bold text-slate-800 group-hover:text-sky-700 transition-colors flex items-center gap-1">
                      <span>5.157 Kg</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-sky-700 transition-colors" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    TPA: 2.413 Kg · TPS3R: 1.018 Kg · Petugas: <strong>Ansu</strong> (971 Kg), <strong>Awal Wahid</strong> (755 Kg)
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigateToRekap('organik', { searchQuery: 'Mangkura' })}
                  title="Klik untuk membuka Rekapitulasi Kelurahan Mangkura"
                  className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200/60 hover:border-teal-400 hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200/60 transition-all duration-300 ease-out cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-teal-800 transition-colors">
                      Kelurahan Mangkura
                    </span>
                    <span className="font-mono font-bold text-slate-800 group-hover:text-teal-700 transition-colors flex items-center gap-1">
                      <span>4.914 Kg</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-teal-700 transition-colors" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    TPA: 2.121 Kg · TPS3R: 1.464 Kg · Petugas: <strong>Malalengga</strong> (571 Kg), <strong>Abd. Rahman</strong> (758 Kg)
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigateToRekap('organik', { searchQuery: 'Lae-Lae' })}
                  title="Klik untuk membuka Rekapitulasi Kelurahan Lae-Lae"
                  className="p-3.5 bg-amber-50/60 hover:bg-amber-50 rounded-xl border border-amber-200/50 hover:border-amber-400 hover:-translate-y-1 hover:shadow-md hover:shadow-amber-950/10 transition-all duration-300 ease-out cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-amber-900 group-hover:text-amber-950 transition-colors">
                      Kelurahan Lae-Lae
                    </span>
                    <span className="font-mono text-amber-700 font-semibold flex items-center gap-1">
                      <span>0 Kg (Kepulauan)</span>
                      <ArrowUpRight className="w-3 h-3 text-amber-500 group-hover:text-amber-700 transition-colors" />
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-800/80">
                    Tercatat dalam master 10 kelurahan. Siap untuk input berkala via kapal pengangkut.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('table')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>Buka Tabel Matriks Lengkap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setPreselectedInputKelurahan(null);
                  setActiveTab('input');
                }}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                + Input Data
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
