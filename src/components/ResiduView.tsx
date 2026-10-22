import React, { useState, useMemo } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { ScrollReveal } from './ScrollReveal';
import {
  Trash2,
  Download,
  Search,
  Truck,
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  Scale,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export const ResiduView: React.FC = () => {
  const { residuMatrix, totalResiduKg, exportToExcel } = useWasteData();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter matrix by search query
  const filteredMatrix = useMemo(() => {
    return residuMatrix.filter((row) =>
      row.kelurahanName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [residuMatrix, searchQuery]);

  // Compute daily totals across all 10 kelurahan
  const dailyTotals = useMemo(() => {
    const totals: { [day: number]: number } = {};
    for (let d = 1; d <= 30; d++) {
      totals[d] = 0;
      for (const row of residuMatrix) {
        totals[d] += row.dailyKg[d] || 0;
      }
    }
    return totals;
  }, [residuMatrix]);

  // Calculate total across all days
  const grandTotalResidu = useMemo(() => {
    return Object.values(dailyTotals).reduce((sum, val) => sum + val, 0);
  }, [dailyTotals]);

  // Average daily for active days (1..21)
  const avgDaily = Math.round(grandTotalResidu / 21);

  // Daily trend data for chart
  const dailyChartData = useMemo(() => {
    const list = [];
    for (let d = 1; d <= 21; d++) {
      list.push({
        day: `Tgl ${d}`,
        beratKg: dailyTotals[d] || 0,
        beratTon: Number(((dailyTotals[d] || 0) / 1000).toFixed(2)),
      });
    }
    return list;
  }, [dailyTotals]);

  // Kelurahan ranking chart data
  const kelurahanChartData = useMemo(() => {
    return residuMatrix
      .filter((r) => r.totalKg > 0)
      .map((r) => ({
        name: r.kelurahanName.replace('KELURAHAN ', ''),
        totalKg: r.totalKg,
        totalTon: Number((r.totalKg / 1000).toFixed(2)),
      }))
      .sort((a, b) => b.totalKg - a.totalKg);
  }, [residuMatrix]);

  const fmt = (num: number) => (num > 0 ? num.toLocaleString('id-ID') : '0');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <ScrollReveal delay={0} distance={20} duration={600}>
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-rose-900/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 mb-2">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Rekapitulasi Residu TPA Tamangapa</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                SAMPAH RESIDU KECAMATAN UJUNG PANDANG
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                Data Harian Pencatatan Timbulan Sampah Residu Kontainer & Armada TPA — Bulan Oktober 2026
              </p>
            </div>

            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all self-start md:self-auto shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Spreadsheet (.xlsx)</span>
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
                Total Sampah Residu
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <Trash2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {fmt(grandTotalResidu)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Kg</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Setara <strong>{(grandTotalResidu / 1000).toFixed(2)} Ton</strong> (Oktober 2026)
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Rata-Rata Harian
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {fmt(avgDaily)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Kg/Hari</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Rata-rata <strong>{(avgDaily / 1000).toFixed(2)} Ton/Hari</strong> angkutan kontainer
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Kelurahan Tertinggi
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900">
              1. Mangkura: {fmt(90596)} Kg
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              2. Maloku: {fmt(90093)} Kg
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Kawasan komersial & fasilitas publik
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Destinasi Akhir
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Truck className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              TPA Tamangapa
            </div>
            <p className="text-xs text-slate-600 mt-1">
              9 Kelurahan Daratan Ujung Pandang
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
              Status: 100% Terangkut
            </span>
          </div>
        </ScrollReveal>
      </div>

      {/* Main Table Card */}
      <ScrollReveal delay={180} distance={28} duration={700}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-rose-700" />
              <h3 className="font-bold text-sm text-slate-900">
                Tabel Matriks Sampah Residu per Kelurahan (Tgl 1 - 30)
              </h3>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kelurahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
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
                      className={`p-2 text-center border-r border-slate-300 min-w-[55px] ${
                        day <= 21 ? 'bg-rose-50 text-rose-950 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                  <th className="p-2.5 text-right min-w-[95px] bg-purple-100 text-purple-950 font-extrabold border-l border-slate-300 sticky right-0 z-20 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.08)]">
                    JUMLAH (Kg)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {filteredMatrix.map((row) => (
                  <tr key={row.kelurahanId} className="hover:bg-rose-50/40 transition-colors">
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
                            val > 0 ? 'text-slate-900' : 'text-slate-300'
                          }`}
                        >
                          {val > 0 ? val.toLocaleString('id-ID') : '0'}
                        </td>
                      );
                    })}
                    <td className="p-2 text-right font-extrabold bg-purple-100 text-purple-950 border-l border-slate-300 sticky right-0 z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.06)]">
                      {row.totalKg.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}

                {/* Total Row (KECAMATAN) - Exact match to yellow bottom row in spreadsheet image */}
                <tr className="bg-amber-100 font-extrabold text-slate-950 border-t-2 border-amber-300 text-xs">
                  <td className="p-2.5 text-center border-r border-amber-200 sticky left-0 bg-amber-100 z-10">
                    -
                  </td>
                  <td className="p-2.5 font-sans tracking-wide border-r border-amber-200 sticky left-[40px] bg-amber-100 z-10 text-amber-950">
                    KECAMATAN
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
                    {grandTotalResidu.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Residu Trend Chart */}
        <ScrollReveal delay={200} distance={28} duration={700}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Grafik Tren Timbulan Residu Harian (Oktober 2026)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Total volume sampah residu yang diangkut ke TPA per hari (dalam Ton)
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" Ton" />
                  <Tooltip
                    formatter={(val: any) => [`${val} Ton`, 'Berat Residu']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="beratTon" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>

        {/* Residu Per Kelurahan Chart */}
        <ScrollReveal delay={240} distance={28} duration={700}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Peringkat Volumasi Residu per Kelurahan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Perbandingan akumulasi sampah residu selama bulan Oktober 2026 (dalam Ton)
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kelurahanChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} unit=" Ton" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={100} />
                  <Tooltip
                    formatter={(val: any) => [`${val} Ton`, 'Total Residu']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="totalTon" fill="#be123c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
