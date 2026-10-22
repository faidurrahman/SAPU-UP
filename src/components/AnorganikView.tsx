import React, { useState, useMemo } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { ScrollReveal } from './ScrollReveal';
import {
  Recycle,
  Download,
  Search,
  Truck,
  TrendingUp,
  Building2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AnorganikView: React.FC = () => {
  const {
    anorganikMobilMatrix,
    anorganikFukudaMatrix,
    anorganikGabunganMatrix,
    totalAnorganikKg,
    exportToExcel,
  } = useWasteData();

  const [activeMatrixTab, setActiveMatrixTab] = useState<'gabungan' | 'mobil' | 'fukuda'>('gabungan');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Select matrix based on active sub tab
  const currentMatrix = useMemo(() => {
    if (activeMatrixTab === 'mobil') return anorganikMobilMatrix;
    if (activeMatrixTab === 'fukuda') return anorganikFukudaMatrix;
    return anorganikGabunganMatrix;
  }, [activeMatrixTab, anorganikMobilMatrix, anorganikFukudaMatrix, anorganikGabunganMatrix]);

  // Filter matrix by search query
  const filteredMatrix = useMemo(() => {
    return currentMatrix.filter((row) =>
      row.kelurahanName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentMatrix, searchQuery]);

  // Daily totals across all kelurahan
  const dailyTotals = useMemo(() => {
    const totals: { [day: number]: number } = {};
    for (let d = 1; d <= 30; d++) {
      totals[d] = 0;
      for (const row of currentMatrix) {
        totals[d] += row.dailyKg[d] || 0;
      }
    }
    return totals;
  }, [currentMatrix]);

  // Grand total for active matrix
  const grandTotal = useMemo(() => {
    return Object.values(dailyTotals).reduce((sum, val) => sum + val, 0);
  }, [dailyTotals]);

  // Total for Satgas Mobil & Fukuda specifically
  const mobilTotalAll = useMemo(() => {
    return anorganikMobilMatrix.reduce((sum, r) => sum + r.totalKg, 0);
  }, [anorganikMobilMatrix]);

  const fukudaTotalAll = useMemo(() => {
    return anorganikFukudaMatrix.reduce((sum, r) => sum + r.totalKg, 0);
  }, [anorganikFukudaMatrix]);

  const combinedTotalAll = mobilTotalAll + fukudaTotalAll;

  // Chart data: Kelurahan breakdown (Satgas Mobil vs Satgas Fukuda)
  const kelurahanComparisonData = useMemo(() => {
    return anorganikGabunganMatrix
      .filter((row) => row.totalKg > 0)
      .map((row) => {
        const mobil = anorganikMobilMatrix.find((m) => m.kelurahanId === row.kelurahanId)?.totalKg || 0;
        const fukuda = anorganikFukudaMatrix.find((f) => f.kelurahanId === row.kelurahanId)?.totalKg || 0;
        return {
          name: row.kelurahanName.replace('KELURAHAN ', ''),
          Mobil: mobil,
          Fukuda: fukuda,
          Total: row.totalKg,
        };
      })
      .sort((a, b) => b.Total - a.Total);
  }, [anorganikGabunganMatrix, anorganikMobilMatrix, anorganikFukudaMatrix]);

  // Daily trend data (Days 1..21)
  const dailyTrendChartData = useMemo(() => {
    const list = [];
    for (let d = 1; d <= 21; d++) {
      list.push({
        day: `Tgl ${d}`,
        beratKg: dailyTotals[d] || 0,
      });
    }
    return list;
  }, [dailyTotals]);

  const topAnorganik = useMemo(() => {
    return [...anorganikGabunganMatrix].sort((a, b) => b.totalKg - a.totalKg);
  }, [anorganikGabunganMatrix]);

  const fmt = (num: number) => (num > 0 ? num.toLocaleString('id-ID') : '0');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <ScrollReveal delay={0} distance={20} duration={600}>
        <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-teal-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 mb-2">
                <Recycle className="w-3.5 h-3.5" />
                <span>Rekapitulasi Sampah Anorganik Terpilah</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                SAMPAH ANORGANIK TERPILAH KECAMATAN UJUNG PANDANG
              </h1>
              <p className="text-xs md:text-sm text-teal-200 mt-1">
                Data Pencatatan Harian Satgas Mobil & Satgas Fukuda — Bulan Oktober 2026
              </p>
            </div>

            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all self-start md:self-auto shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Spreadsheet (.xlsx)</span>
            </button>
          </div>

          {/* Sub Tab Buttons inside Anorganik */}
          <div className="mt-5 pt-4 border-t border-teal-800/60 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveMatrixTab('gabungan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMatrixTab === 'gabungan'
                  ? 'bg-white text-teal-950 shadow-md font-extrabold'
                  : 'bg-teal-900/60 hover:bg-teal-800/80 text-teal-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Total Gabungan ({fmt(combinedTotalAll)} Kg)</span>
            </button>

            <button
              onClick={() => setActiveMatrixTab('mobil')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMatrixTab === 'mobil'
                  ? 'bg-teal-400 text-teal-950 shadow-md font-extrabold'
                  : 'bg-teal-900/60 hover:bg-teal-800/80 text-teal-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Satgas Mobil ({fmt(mobilTotalAll)} Kg)</span>
            </button>

            <button
              onClick={() => setActiveMatrixTab('fukuda')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMatrixTab === 'fukuda'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-extrabold'
                  : 'bg-teal-900/60 hover:bg-teal-800/80 text-teal-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Satgas Fukuda ({fmt(fukudaTotalAll)} Kg)</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScrollReveal delay={40} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Sampah Anorganik
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Recycle className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {fmt(combinedTotalAll)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Kg</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Satgas Mobil ({fmt(mobilTotalAll)} Kg) + Fukuda ({fmt(fukudaTotalAll)} Kg)
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Satgas Mobil
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Truck className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {fmt(mobilTotalAll)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Kg</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Penyetoran 9 Kelurahan Daratan (2.531 Kg)
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Satgas Fukuda
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {fmt(fukudaTotalAll)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Kg</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Pengangkutan Armada Roda Tiga (9.705 Kg)
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Kelurahan Tertinggi
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900">
              1. {topAnorganik[0]?.kelurahanName.replace('KELURAHAN ', '')}: {fmt(topAnorganik[0]?.totalKg || 0)} Kg
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              2. {topAnorganik[1]?.kelurahanName.replace('KELURAHAN ', '')}: {fmt(topAnorganik[1]?.totalKg || 0)} Kg
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              3. {topAnorganik[2]?.kelurahanName.replace('KELURAHAN ', '')}: {fmt(topAnorganik[2]?.totalKg || 0)} Kg
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Main Table Card */}
      <ScrollReveal delay={180} distance={28} duration={700}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-700" />
              <h3 className="font-bold text-sm text-slate-900">
                {activeMatrixTab === 'mobil' && 'MATRIKS SAMPAH ANORGANIK TERPILAH (SATGAS MOBIL)'}
                {activeMatrixTab === 'fukuda' && 'MATRIKS SAMPAH ANORGANIK TERPILAH (SATGAS FUKUDA)'}
                {activeMatrixTab === 'gabungan' && 'MATRIKS SAMPAH ANORGANIK TERPILAH (GABUNGAN MOBIL + FUKUDA)'}
              </h3>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kelurahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-200/80 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2.5 text-center border-r border-slate-300 min-w-[40px] sticky left-0 bg-slate-200 z-10">
                    NO
                  </th>
                  <th className="p-2.5 border-r border-slate-300 min-w-[170px] sticky left-[40px] bg-slate-200 z-10">
                    KELURAHAN
                  </th>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                    <th
                      key={day}
                      className={`p-2 text-center border-r border-slate-300 min-w-[48px] ${
                        day <= 21 ? 'bg-teal-50 text-teal-950 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                  <th className="p-2.5 text-right min-w-[95px] bg-teal-100 text-teal-950 font-extrabold border-l border-slate-300 sticky right-0 z-20 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.08)]">
                    JUMLAH (Kg)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {filteredMatrix.map((row) => (
                  <tr key={row.kelurahanId} className="hover:bg-teal-50/40 transition-colors">
                    <td className="p-2 text-center border-r border-slate-200 font-bold text-slate-600 sticky left-0 bg-white z-10">
                      {row.no}
                    </td>
                    <td className="p-2 font-sans font-semibold border-r border-slate-200 text-slate-900 sticky left-[40px] bg-white z-10">
                      {row.kelurahanName}
                    </td>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                      const val = row.dailyKg[day] || 0;
                      return (
                        <td
                          key={day}
                          className={`p-2 text-right border-r border-slate-200 ${
                            val > 0 ? 'text-slate-900 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {val > 0 ? val.toLocaleString('id-ID') : '0'}
                        </td>
                      );
                    })}
                    <td className="p-2 text-right font-extrabold bg-teal-100 text-teal-950 border-l border-slate-300 sticky right-0 z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.06)]">
                      {row.totalKg.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}

                {/* Total Row (JUMLAH / KECAMATAN) */}
                <tr className="bg-amber-100 font-extrabold text-slate-950 border-t-2 border-amber-300 text-xs">
                  <td className="p-2.5 text-center border-r border-amber-200 sticky left-0 bg-amber-100 z-10">
                    -
                  </td>
                  <td className="p-2.5 font-sans tracking-wide border-r border-amber-200 sticky left-[40px] bg-amber-100 z-10 text-amber-950">
                    JUMLAH (Kg)
                  </td>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                    const dayTotal = dailyTotals[day] || 0;
                    return (
                      <td
                        key={day}
                        className={`p-2 text-right border-r border-amber-200 ${
                          dayTotal > 0 ? 'text-amber-950 font-extrabold' : 'text-slate-400'
                        }`}
                      >
                        {dayTotal > 0 ? dayTotal.toLocaleString('id-ID') : '0'}
                      </td>
                    );
                  })}
                  <td className="p-2.5 text-right font-extrabold bg-amber-200 text-amber-950 border-l border-amber-300 text-sm sticky right-0 z-20 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                    {grandTotal.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Anorganik Trend Chart */}
        <ScrollReveal delay={200} distance={28} duration={700}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Grafik Tren Penyetoran Anorganik Harian (Oktober 2026)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pencatatan harian volume sampah anorganik terpilah (dalam Kg)
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrendChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" Kg" />
                  <Tooltip
                    formatter={(val: any) => [`${val} Kg`, 'Berat Anorganik']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="beratKg" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>

        {/* Kelurahan Satgas Mobil vs Fukuda Chart */}
        <ScrollReveal delay={240} distance={28} duration={700}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Perbandingan Satgas Mobil vs Satgas Fukuda per Kelurahan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Distribusi perolehan sampah anorganik terpilah berdasarkan jenis satgas pengumpul
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kelurahanComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" Kg" />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Kg`, name === 'Mobil' ? 'Satgas Mobil' : 'Satgas Fukuda']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Mobil" name="Satgas Mobil" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Fukuda" name="Satgas Fukuda" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
