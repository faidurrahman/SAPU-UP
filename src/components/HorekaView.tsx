import React, { useState, useMemo } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { ScrollReveal } from './ScrollReveal';
import { KELURAHAN_LIST } from '../data/initialData';
import { KelurahanId } from '../types/waste';
import {
  Building,
  Download,
  Search,
  TrendingUp,
  Layers,
  FileSpreadsheet,
  Leaf,
  Recycle,
  Trash2,
  Store,
  Hotel,
  Coffee,
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

export const HorekaView: React.FC = () => {
  const {
    horekaBusinesses,
    horekaDailyRecords,
    totalHorekaOrganikKg,
    totalHorekaAnorganikKg,
    totalHorekaResiduKg,
    totalHorekaGrandKg,
    exportToExcel,
  } = useWasteData();

  const [activeCategoryTab, setActiveCategoryTab] = useState<'gabungan' | 'organik' | 'anorganik' | 'residu'>('gabungan');
  const [selectedKelurahanFilter, setSelectedKelurahanFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Days list 1..21
  const daysList = useMemo(() => Array.from({ length: 21 }, (_, i) => i + 1), []);

  // Filtered business list
  const filteredBusinesses = useMemo(() => {
    return horekaBusinesses.filter((b) => {
      const matchKel = selectedKelurahanFilter === 'ALL' || b.kelurahanId === selectedKelurahanFilter;
      const matchSearch =
        b.namaUsaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.alamatUsaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.kelurahanId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchKel && matchSearch;
    });
  }, [horekaBusinesses, selectedKelurahanFilter, searchQuery]);

  // Aggregate matrix per business
  const businessMatrix = useMemo(() => {
    const recordMap = new Map<string, { organik: number; anorganik: number; residu: number }>();
    horekaDailyRecords.forEach((r) => {
      const key = `${r.horekaId}_${r.date}`;
      recordMap.set(key, {
        organik: r.organikKg || 0,
        anorganik: r.anorganikKg || 0,
        residu: r.residuKg || 0,
      });
    });

    return filteredBusinesses.map((b, idx) => {
      const dailyData: { [day: number]: { organik: number; anorganik: number; residu: number; total: number } } = {};
      let totalOrganik = 0;
      let totalAnorganik = 0;
      let totalResidu = 0;

      daysList.forEach((day) => {
        const dStr = day < 10 ? `0${day}` : `${day}`;
        const dateKey = `2026-10-${dStr}`;
        const match = recordMap.get(`${b.id}_${dateKey}`) || { organik: 0, anorganik: 0, residu: 0 };
        const total = match.organik + match.anorganik + match.residu;

        dailyData[day] = {
          organik: match.organik,
          anorganik: match.anorganik,
          residu: match.residu,
          total,
        };

        totalOrganik += match.organik;
        totalAnorganik += match.anorganik;
        totalResidu += match.residu;
      });

      return {
        no: idx + 1,
        ...b,
        dailyData,
        totalOrganik,
        totalAnorganik,
        totalResidu,
        totalGabungan: totalOrganik + totalAnorganik + totalResidu,
      };
    });
  }, [filteredBusinesses, horekaDailyRecords, daysList]);

  // Overall Kecamatan Daily Totals for active category
  const kecamatanDailyTotals = useMemo(() => {
    const totals: { [day: number]: number } = {};
    daysList.forEach((d) => {
      totals[d] = 0;
      businessMatrix.forEach((b) => {
        if (activeCategoryTab === 'organik') totals[d] += b.dailyData[d]?.organik || 0;
        else if (activeCategoryTab === 'anorganik') totals[d] += b.dailyData[d]?.anorganik || 0;
        else if (activeCategoryTab === 'residu') totals[d] += b.dailyData[d]?.residu || 0;
        else totals[d] += b.dailyData[d]?.total || 0;
      });
    });
    return totals;
  }, [businessMatrix, activeCategoryTab, daysList]);

  // Overall grand total for active category tab
  const grandTotalActiveTab = useMemo(() => {
    return Object.values(kecamatanDailyTotals).reduce((sum, val) => sum + val, 0);
  }, [kecamatanDailyTotals]);

  // Top 10 Horeka Contributors
  const topHorekaContributors = useMemo(() => {
    return [...businessMatrix]
      .sort((a, b) => b.totalGabungan - a.totalGabungan)
      .slice(0, 10)
      .map((b) => ({
        name: b.namaUsaha,
        Organik: Math.round(b.totalOrganik),
        Anorganik: Math.round(b.totalAnorganik),
        Residu: Math.round(b.totalResidu),
        Total: Math.round(b.totalGabungan),
      }));
  }, [businessMatrix]);

  // Kelurahan Breakdown Chart Data
  const kelurahanHorekaChart = useMemo(() => {
    const map = new Map<string, { organik: number; anorganik: number; residu: number }>();
    horekaBusinesses.forEach((b) => {
      if (!map.has(b.kelurahanId)) {
        map.set(b.kelurahanId, { organik: 0, anorganik: 0, residu: 0 });
      }
    });

    horekaDailyRecords.forEach((r) => {
      const entry = map.get(r.kelurahanId);
      if (entry) {
        entry.organik += r.organikKg || 0;
        entry.anorganik += r.anorganikKg || 0;
        entry.residu += r.residuKg || 0;
      }
    });

    return Array.from(map.entries()).map(([kelId, val]) => ({
      name: kelId,
      Organik: Math.round(val.organik),
      Anorganik: Math.round(val.anorganik),
      Residu: Math.round(val.residu),
      Total: Math.round(val.organik + val.anorganik + val.residu),
    })).sort((a, b) => b.Total - a.Total);
  }, [horekaBusinesses, horekaDailyRecords]);

  const fmt = (num: number) => (num > 0 ? num.toLocaleString('id-ID') : '0');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <ScrollReveal delay={0} distance={20} duration={600}>
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-900/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-2">
                <Store className="w-3.5 h-3.5" />
                <span>Pencatatan Sektor Komersial Horeka (Hotel, Restoran, Kafe, Kios)</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                REKAPITULASI SAMPAH KAWASAN HOREKA KECAMATAN UJUNG PANDANG
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                Data Harian Timbulan Sampah Terurai Sektor Usaha (147 Subjek Usaha Terdata) — Bulan Oktober 2026
              </p>
            </div>

            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all self-start md:self-auto shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Spreadsheet (.xlsx)</span>
            </button>
          </div>

          {/* Sub-tabs for Category Matrix Switcher */}
          <div className="mt-5 pt-4 border-t border-indigo-800/60 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategoryTab('gabungan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'gabungan'
                  ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                  : 'bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Total Gabungan Horeka ({fmt(totalHorekaGrandKg)} Kg)</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('organik')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'organik'
                  ? 'bg-emerald-400 text-emerald-950 shadow-md font-extrabold'
                  : 'bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200'
              }`}
            >
              <Leaf className="w-4 h-4" />
              <span>Sampah Organik Horeka ({fmt(totalHorekaOrganikKg)} Kg)</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('anorganik')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'anorganik'
                  ? 'bg-teal-400 text-teal-950 shadow-md font-extrabold'
                  : 'bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200'
              }`}
            >
              <Recycle className="w-4 h-4" />
              <span>Sampah Anorganik Horeka ({fmt(totalHorekaAnorganikKg)} Kg)</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('residu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'residu'
                  ? 'bg-rose-400 text-rose-950 shadow-md font-extrabold'
                  : 'bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Sampah Residu Horeka ({fmt(totalHorekaResiduKg)} Kg)</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <ScrollReveal delay={40} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Horeka
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {fmt(totalHorekaGrandKg)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Kg</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Setara <strong>{(totalHorekaGrandKg / 1000).toFixed(2)} Ton</strong>
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Organik Horeka
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {fmt(totalHorekaOrganikKg)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Kg</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Food waste & sisa dapur restoran
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Anorganik Horeka
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Recycle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {fmt(totalHorekaAnorganikKg)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Kg</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Kardus, botol plastik, kaleng
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Residu Horeka
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {fmt(totalHorekaResiduKg)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Kg</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Sampah tercampur & non-recyclable
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200} distance={20} duration={600}>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Usaha Terdata
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Hotel className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {horekaBusinesses.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">Unit</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Kawasan Hotel, Restoran & Kafe
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
              <FileSpreadsheet className="w-5 h-5 text-indigo-700" />
              <h3 className="font-bold text-sm text-slate-900 uppercase">
                {activeCategoryTab === 'gabungan' && 'MATRIKS SAMPAH HOREKA (TOTAL GABUNGAN ORGANIK + ANORGANIK + RESIDU)'}
                {activeCategoryTab === 'organik' && 'MATRIKS SAMPAH ORGANIK HOREKA'}
                {activeCategoryTab === 'anorganik' && 'MATRIKS SAMPAH ANORGANIK HOREKA'}
                {activeCategoryTab === 'residu' && 'MATRIKS SAMPAH RESIDU HOREKA'}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedKelurahanFilter}
                onChange={(e) => setSelectedKelurahanFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="ALL">Semua Kelurahan (10)</option>
                {KELURAHAN_LIST.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama / alamat usaha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2.5 text-center border-r border-slate-300 min-w-[36px] sticky left-0 bg-slate-200 z-20">
                    NO
                  </th>
                  <th className="p-2.5 border-r border-slate-300 min-w-[120px] sticky left-[36px] bg-slate-200 z-20">
                    KELURAHAN
                  </th>
                  <th className="p-2.5 border-r border-slate-300 min-w-[180px] sticky left-[156px] bg-slate-200 z-20 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                    NAMA USAHA
                  </th>
                  <th className="p-2.5 border-r border-slate-300 min-w-[160px]">
                    ALAMAT USAHA
                  </th>
                  {daysList.map((day) => (
                    <th
                      key={day}
                      className="p-2 text-center border-r border-slate-300 min-w-[48px] bg-indigo-50 text-indigo-950 font-bold"
                    >
                      {day}
                    </th>
                  ))}
                  <th className="p-2.5 text-right min-w-[100px] bg-indigo-100 text-indigo-950 font-extrabold border-l border-indigo-300 sticky right-0 z-20 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.08)]">
                    TOTAL (Kg)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {businessMatrix.length === 0 ? (
                  <tr>
                    <td colSpan={26} className="py-8 text-center text-slate-500 font-sans italic">
                      Tidak ada data usaha Horeka yang cocok dengan pencarian / filter.
                    </td>
                  </tr>
                ) : (
                  businessMatrix.map((row) => (
                    <tr key={row.id} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="p-2 text-center border-r border-slate-200 font-bold text-slate-600 sticky left-0 bg-white z-10">
                        {row.no}
                      </td>
                      <td className="p-2 font-sans font-semibold border-r border-slate-200 text-slate-700 text-[10px] sticky left-[36px] bg-white z-10">
                        {row.kelurahanId}
                      </td>
                      <td className="p-2 font-sans font-bold border-r border-slate-200 text-slate-900 sticky left-[156px] bg-white z-10 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.04)]">
                        {row.namaUsaha}
                      </td>
                      <td className="p-2 font-sans text-slate-600 text-[10px] border-r border-slate-200 truncate max-w-[180px]">
                        {row.alamatUsaha}
                      </td>
                      {daysList.map((day) => {
                        const cellData = row.dailyData[day];
                        let val = 0;
                        if (activeCategoryTab === 'organik') val = cellData?.organik || 0;
                        else if (activeCategoryTab === 'anorganik') val = cellData?.anorganik || 0;
                        else if (activeCategoryTab === 'residu') val = cellData?.residu || 0;
                        else val = cellData?.total || 0;

                        return (
                          <td
                            key={day}
                            className={`p-2 text-right border-r border-slate-200 ${
                              val > 0 ? 'text-slate-900 font-medium' : 'text-slate-300'
                            }`}
                          >
                            {val > 0 ? val.toLocaleString('id-ID') : '0'}
                          </td>
                        );
                      })}
                      <td className="p-2 text-right font-extrabold bg-indigo-100 text-indigo-950 border-l border-indigo-300 sticky right-0 z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.06)]">
                        {activeCategoryTab === 'organik' && row.totalOrganik.toLocaleString('id-ID')}
                        {activeCategoryTab === 'anorganik' && row.totalAnorganik.toLocaleString('id-ID')}
                        {activeCategoryTab === 'residu' && row.totalResidu.toLocaleString('id-ID')}
                        {activeCategoryTab === 'gabungan' && row.totalGabungan.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}

                {/* Total Row (KECAMATAN / TOTAL REKAP) */}
                <tr className="bg-amber-100 font-extrabold text-slate-950 border-t-2 border-amber-300 text-xs">
                  <td className="p-2.5 text-center border-r border-amber-200 sticky left-0 bg-amber-100 z-10">
                    -
                  </td>
                  <td className="p-2.5 font-sans tracking-wide border-r border-amber-200 sticky left-[36px] bg-amber-100 z-10 text-amber-950" colSpan={2}>
                    JUMLAH KECAMATAN UJUNG PANDANG (Kg)
                  </td>
                  <td className="p-2.5 border-r border-amber-200 font-sans text-amber-900 text-[10px]">
                    {businessMatrix.length} Usaha Terdata
                  </td>
                  {daysList.map((day) => {
                    const dayTotal = kecamatanDailyTotals[day] || 0;
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
                    {grandTotalActiveTab.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Horeka Contributors */}
        <ScrollReveal delay={200} distance={28} duration={700}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Top 10 Usaha Horeka Kontributor Sampah Terbesar
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Volume akumulasi timbulan sampah (dalam Kg) berdasarkan sektor usaha
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topHorekaContributors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} unit=" Kg" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#334155' }} width={120} />
                  <Tooltip
                    formatter={(val: any) => [`${val} Kg`, 'Total Sampah']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Total" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>

        {/* Kelurahan Horeka Breakdown */}
        <ScrollReveal delay={240} distance={28} duration={700}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Komposisi Sampah Horeka per Kelurahan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Distribusi sampah Organik, Anorganik, dan Residu dari kawasan usaha per kelurahan
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kelurahanHorekaChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" Kg" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Organik" fill="#10b981" stackId="a" />
                  <Bar dataKey="Anorganik" fill="#0d9488" stackId="a" />
                  <Bar dataKey="Residu" fill="#f43f5e" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
