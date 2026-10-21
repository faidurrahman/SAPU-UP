import React, { useState, useMemo } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { KELURAHAN_LIST } from '../data/initialData';
import { KelurahanId, DailyRecord } from '../types/waste';
import {
  TableProperties,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  Search,
  Maximize2,
  Minimize2,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  Code2,
} from 'lucide-react';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import { ScrollReveal } from './ScrollReveal';

interface RecapTableViewProps {
  onOpenPrintModal: () => void;
  onOpenSpreadsheetGuide: () => void;
}

export const RecapTableView: React.FC<RecapTableViewProps> = ({
  onOpenPrintModal,
  onOpenSpreadsheetGuide,
}) => {
  const {
    records,
    collectors,
    tps3rProcessing,
    filter,
    setFilter,
    exportToCsv,
    exportToExcel,
    executiveSummary,
    googleSheetsId,
    syncFromGoogleSheets,
    isSyncing,
    lastSyncTime,
  } = useWasteData();

  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Search filter inside table
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Expanded kelurahan set
  const [expandedKelurahan, setExpandedKelurahan] = useState<Set<KelurahanId>>(
    new Set(['BARU', 'BULOGADING'])
  );

  // View mode: 'daily' (shows days 1..21) or 'summary' (shows total composition categories)
  const [columnView, setColumnView] = useState<'daily' | 'categories'>('daily');

  // Days list in current filter range
  const daysList = useMemo(() => {
    const list: string[] = [];
    const startDay = parseInt(filter.startDate.split('-')[2], 10);
    const endDay = parseInt(filter.endDate.split('-')[2], 10);
    const prefix = filter.startDate.substring(0, 8); // '2026-10-'

    for (let d = startDay; d <= endDay; d++) {
      const dStr = d < 10 ? '0' + d : '' + d;
      list.push(`${prefix}${dStr}`);
    }
    return list;
  }, [filter.startDate, filter.endDate]);

  const toggleExpand = (id: KelurahanId) => {
    setExpandedKelurahan((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedKelurahan(new Set(KELURAHAN_LIST.map((k) => k.id)));
  };

  const collapseAll = () => {
    setExpandedKelurahan(new Set());
  };

  // Map records by `${date}_${kelurahanId}` for fast lookup
  const recordMap = useMemo(() => {
    const map = new Map<string, DailyRecord>();
    for (const r of records) {
      map.set(`${r.date}_${r.kelurahanId}`, r);
    }
    return map;
  }, [records]);

  // Filtered Kelurahan list for table
  const displayedKelurahan = useMemo(() => {
    return KELURAHAN_LIST.filter((k) =>
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Helper formatting
  const fmt = (n: number) => (n > 0 ? n.toLocaleString('id-ID') : '-');
  const fmtZero = (n: number) => n.toLocaleString('id-ID');

  // Compute daily totals across all kelurahan for each date in daysList
  const dailyRecap = useMemo(() => {
    const dailyMap = new Map<string, {
      makanan: number;
      buah: number;
      sayur: number;
      daun: number;
      pakan: number;
      tpa: number;
      tps3r: number;
      grand: number;
    }>();

    for (const d of daysList) {
      dailyMap.set(d, { makanan: 0, buah: 0, sayur: 0, daun: 0, pakan: 0, tpa: 0, tps3r: 0, grand: 0 });
    }

    for (const r of records) {
      const entry = dailyMap.get(r.date);
      if (!entry) continue;

      const c = r.composition;
      const m = (c.makananTpa || 0) + (c.makananTps3r || 0);
      const b = (c.sisaBuahTpa || 0) + (c.sisaBuahTps3r || 0);
      const s = (c.sisaSayurTpa || 0) + (c.sisaSayurTps3r || 0);
      const d = (c.daunTpa || 0) + (c.daunTps3r || 0);
      const p = r.pakanInputs?.reduce((sum, pk) => sum + (pk.weightKg || 0), 0) || 0;

      const tpa = (c.makananTpa || 0) + (c.sisaBuahTpa || 0) + (c.sisaSayurTpa || 0) + (c.daunTpa || 0);
      const tps3r = (c.makananTps3r || 0) + (c.sisaBuahTps3r || 0) + (c.sisaSayurTps3r || 0) + (c.daunTps3r || 0);

      entry.makanan += m;
      entry.buah += b;
      entry.sayur += s;
      entry.daun += d;
      entry.pakan += p;
      entry.tpa += tpa;
      entry.tps3r += tps3r;
      entry.grand += (tpa + tps3r + p);
    }

    return dailyMap;
  }, [daysList, records]);

  return (
    <div className="space-y-4">
      {/* Table Control Bar */}
      <ScrollReveal delay={0} distance={18} duration={600}>
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out no-print">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <TableProperties className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Matriks Rekapitulasi Sampah Organik Harian
                </h2>
                <p className="text-xs text-slate-500">
                  Format tabel terstruktur resmi Kecamatan Ujung Pandang (Oktober 2026)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kelurahan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 w-40 sm:w-48"
                />
              </div>

              {/* View Column Toggle */}
              <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
                <button
                  onClick={() => setColumnView('daily')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    columnView === 'daily'
                      ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kolom Harian (Tgl 1–{daysList.length})
                </button>
                <button
                  onClick={() => setColumnView('categories')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    columnView === 'categories'
                      ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Komposisi Destinasi (TPA/TPS3R)
                </button>
              </div>

              {/* Expand / Collapse */}
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <button
                  onClick={expandAll}
                  title="Buka semua baris detail"
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-xs flex items-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Buka Semua</span>
                </button>
                <button
                  onClick={collapseAll}
                  title="Tutup semua baris detail"
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-xs flex items-center gap-1"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tutup</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  title="Buka sinkronisasi Google Sheets & Kode Apps Script"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sinkron Google Sheets</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </button>

                <button
                  onClick={exportToExcel}
                  title="Unduh seluruh file spreadsheet (.xlsx) 6 sheet"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Unduh Excel (.xlsx)</span>
                </button>
                <button
                  onClick={onOpenSpreadsheetGuide}
                  title="Buka panduan nama sheet, nama tabel & rumus"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Struktur Sheet</span>
                </button>
                <button
                  onClick={exportToCsv}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={onOpenPrintModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Live Google Sheets Connection Bar */}
      <ScrollReveal delay={80} distance={20} duration={600}>
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-700">
              Terhubung ke Google Spreadsheet: <strong className="font-mono text-emerald-900">{googleSheetsId}</strong>
            </span>
            {lastSyncTime && (
              <span className="text-slate-500 text-[11px] hidden md:inline">
                (Terakhir diperbarui: {new Date(lastSyncTime).toLocaleTimeString('id-ID')})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={syncFromGoogleSheets}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-semibold text-xs shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Tarik Update dari Sheet'}</span>
            </button>

            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-md font-medium text-xs border border-slate-200 transition-colors"
            >
              <Code2 className="w-3 h-3 text-emerald-700" />
              <span>Kode Apps Script</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Excel-Style Table Wrapper */}
      <ScrollReveal delay={140} distance={28} duration={700}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 ease-out overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar max-h-[720px]">
            <table className="w-full text-left border-collapse text-xs">
              {/* Sticky Table Header */}
              <thead className="bg-slate-100/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="py-2.5 px-3 font-bold sticky left-0 z-40 bg-slate-100/95 min-w-[200px] border-r border-slate-200">
                  Kelurahan / Sub-Kategori
                </th>
                <th className="py-2.5 px-2 font-semibold text-center w-16 border-r border-slate-200">
                  Alur
                </th>

                {columnView === 'daily' ? (
                  <>
                    {daysList.map((d) => {
                      const dayNum = parseInt(d.split('-')[2], 10);
                      return (
                        <th
                          key={d}
                          className="py-2.5 px-2 text-center font-mono font-medium text-[11px] min-w-[48px] border-r border-slate-200"
                        >
                          {dayNum}
                        </th>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-2 text-right font-semibold min-w-[80px] border-r border-slate-200 text-sky-800">
                      TPA (Bosowa)
                    </th>
                    <th className="py-2.5 px-2 text-right font-semibold min-w-[80px] border-r border-slate-200 text-emerald-800">
                      TPS3R
                    </th>
                    <th className="py-2.5 px-2 text-right font-semibold min-w-[80px] border-r border-slate-200 text-amber-800">
                      Pakan Ternak
                    </th>
                  </>
                )}

                <th className="py-2.5 px-3 font-bold text-right sticky right-0 z-40 bg-emerald-100/90 text-emerald-950 min-w-[100px] border-l border-emerald-200">
                  TOTAL (Kg)
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {displayedKelurahan.map((kel) => {
                const isExpanded = expandedKelurahan.has(kel.id);

                // Collect kelurahan records for all days in range
                const kelRecords = daysList.map((d) => recordMap.get(`${d}_${kel.id}`));

                // Kelurahan aggregate numbers
                let totalMakananTpa = 0;
                let totalMakananTps3r = 0;
                let totalBuahTpa = 0;
                let totalBuahTps3r = 0;
                let totalSayurTpa = 0;
                let totalSayurTps3r = 0;
                let totalDaunTpa = 0;
                let totalDaunTps3r = 0;
                let totalPakanSum = 0;

                const collectorSums = new Map<string, number>();

                for (const r of kelRecords) {
                  if (!r) continue;
                  const c = r.composition;
                  totalMakananTpa += c.makananTpa || 0;
                  totalMakananTps3r += c.makananTps3r || 0;
                  totalBuahTpa += c.sisaBuahTpa || 0;
                  totalBuahTps3r += c.sisaBuahTps3r || 0;
                  totalSayurTpa += c.sisaSayurTpa || 0;
                  totalSayurTps3r += c.sisaSayurTps3r || 0;
                  totalDaunTpa += c.daunTpa || 0;
                  totalDaunTps3r += c.daunTps3r || 0;

                  if (r.pakanInputs) {
                    for (const p of r.pakanInputs) {
                      const w = p.weightKg || 0;
                      totalPakanSum += w;
                      collectorSums.set(p.collectorName, (collectorSums.get(p.collectorName) || 0) + w);
                    }
                  }
                }

                const totalTpa = totalMakananTpa + totalBuahTpa + totalSayurTpa + totalDaunTpa;
                const totalTps3r = totalMakananTps3r + totalBuahTps3r + totalSayurTps3r + totalDaunTps3r;
                const grandTotal = totalTpa + totalTps3r + totalPakanSum;

                // Active collectors for this kelurahan
                const activeCollectors = collectors.filter((c) => c.kelurahanId === kel.id);

                return (
                  <React.Fragment key={kel.id}>
                    {/* Main Kelurahan Header Row */}
                    <tr className="bg-slate-50/80 hover:bg-slate-100/70 font-semibold transition-colors">
                      <td className="py-2 px-3 sticky left-0 z-20 bg-slate-50/95 border-r border-slate-200">
                        <button
                          onClick={() => toggleExpand(kel.id)}
                          className="flex items-center gap-1.5 text-left text-slate-900 hover:text-emerald-800"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className="font-bold text-xs">{kel.name}</span>
                        </button>
                      </td>
                      <td className="py-2 px-2 text-center text-[10px] text-slate-500 border-r border-slate-200 font-mono">
                        JUMLAH
                      </td>

                      {columnView === 'daily' ? (
                        <>
                          {kelRecords.map((r, i) => {
                            let dayGrand = 0;
                            if (r) {
                              const c = r.composition;
                              const t = (c.makananTpa || 0) + (c.sisaBuahTpa || 0) + (c.sisaSayurTpa || 0) + (c.daunTpa || 0);
                              const tp = (c.makananTps3r || 0) + (c.sisaBuahTps3r || 0) + (c.sisaSayurTps3r || 0) + (c.daunTps3r || 0);
                              const pk = r.pakanInputs?.reduce((s, p) => s + p.weightKg, 0) || 0;
                              dayGrand = t + tp + pk;
                            }
                            return (
                              <td
                                key={daysList[i]}
                                className="py-2 px-2 text-right font-mono text-[11px] tabular-nums text-slate-800 border-r border-slate-200"
                              >
                                {fmt(dayGrand)}
                              </td>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          <td className="py-2 px-2 text-right font-mono text-sky-800 tabular-nums border-r border-slate-200">
                            {fmtZero(totalTpa)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-emerald-800 tabular-nums border-r border-slate-200">
                            {fmtZero(totalTps3r)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-amber-800 tabular-nums border-r border-slate-200">
                            {fmtZero(totalPakanSum)}
                          </td>
                        </>
                      )}

                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-950 sticky right-0 z-20 bg-emerald-100/90 tabular-nums border-l border-emerald-200">
                        {fmtZero(grandTotal)}
                      </td>
                    </tr>

                    {/* Sub-Rows when expanded */}
                    {isExpanded && (
                      <>
                        {/* Sub-row 1: Makanan */}
                        <tr className="hover:bg-slate-50/50 text-[11px] text-slate-600">
                          <td className="py-1.5 pl-8 pr-3 sticky left-0 z-10 bg-white border-r border-slate-200 text-slate-700">
                            · Makanan (Organik Basah)
                          </td>
                          <td className="py-1.5 px-2 text-center text-[10px] text-slate-400 border-r border-slate-200">
                            Campur
                          </td>
                          {columnView === 'daily' ? (
                            kelRecords.map((r, i) => {
                              const val = r ? (r.composition.makananTpa || 0) + (r.composition.makananTps3r || 0) : 0;
                              return (
                                <td key={daysList[i]} className="py-1.5 px-2 text-right font-mono text-[10px] tabular-nums text-slate-600 border-r border-slate-200">
                                  {fmt(val)}
                                </td>
                              );
                            })
                          ) : (
                            <>
                              <td className="py-1.5 px-2 text-right font-mono text-sky-700 tabular-nums border-r border-slate-200">{fmtZero(totalMakananTpa)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-emerald-700 tabular-nums border-r border-slate-200">{fmtZero(totalMakananTps3r)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-slate-400 border-r border-slate-200">-</td>
                            </>
                          )}
                          <td className="py-1.5 px-3 text-right font-mono text-slate-800 sticky right-0 z-10 bg-white/95 tabular-nums border-l border-emerald-200">
                            {fmtZero(totalMakananTpa + totalMakananTps3r)}
                          </td>
                        </tr>

                        {/* Sub-row 2: Sisa Buah */}
                        <tr className="hover:bg-slate-50/50 text-[11px] text-slate-600">
                          <td className="py-1.5 pl-8 pr-3 sticky left-0 z-10 bg-white border-r border-slate-200 text-slate-700">
                            · Sisa Buah
                          </td>
                          <td className="py-1.5 px-2 text-center text-[10px] text-slate-400 border-r border-slate-200">
                            Campur
                          </td>
                          {columnView === 'daily' ? (
                            kelRecords.map((r, i) => {
                              const val = r ? (r.composition.sisaBuahTpa || 0) + (r.composition.sisaBuahTps3r || 0) : 0;
                              return (
                                <td key={daysList[i]} className="py-1.5 px-2 text-right font-mono text-[10px] tabular-nums text-slate-600 border-r border-slate-200">
                                  {fmt(val)}
                                </td>
                              );
                            })
                          ) : (
                            <>
                              <td className="py-1.5 px-2 text-right font-mono text-sky-700 tabular-nums border-r border-slate-200">{fmtZero(totalBuahTpa)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-emerald-700 tabular-nums border-r border-slate-200">{fmtZero(totalBuahTps3r)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-slate-400 border-r border-slate-200">-</td>
                            </>
                          )}
                          <td className="py-1.5 px-3 text-right font-mono text-slate-800 sticky right-0 z-10 bg-white/95 tabular-nums border-l border-emerald-200">
                            {fmtZero(totalBuahTpa + totalBuahTps3r)}
                          </td>
                        </tr>

                        {/* Sub-row 3: Sisa Sayur */}
                        <tr className="hover:bg-slate-50/50 text-[11px] text-slate-600">
                          <td className="py-1.5 pl-8 pr-3 sticky left-0 z-10 bg-white border-r border-slate-200 text-slate-700">
                            · Sisa Sayur
                          </td>
                          <td className="py-1.5 px-2 text-center text-[10px] text-slate-400 border-r border-slate-200">
                            Campur
                          </td>
                          {columnView === 'daily' ? (
                            kelRecords.map((r, i) => {
                              const val = r ? (r.composition.sisaSayurTpa || 0) + (r.composition.sisaSayurTps3r || 0) : 0;
                              return (
                                <td key={daysList[i]} className="py-1.5 px-2 text-right font-mono text-[10px] tabular-nums text-slate-600 border-r border-slate-200">
                                  {fmt(val)}
                                </td>
                              );
                            })
                          ) : (
                            <>
                              <td className="py-1.5 px-2 text-right font-mono text-sky-700 tabular-nums border-r border-slate-200">{fmtZero(totalSayurTpa)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-emerald-700 tabular-nums border-r border-slate-200">{fmtZero(totalSayurTps3r)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-slate-400 border-r border-slate-200">-</td>
                            </>
                          )}
                          <td className="py-1.5 px-3 text-right font-mono text-slate-800 sticky right-0 z-10 bg-white/95 tabular-nums border-l border-emerald-200">
                            {fmtZero(totalSayurTpa + totalSayurTps3r)}
                          </td>
                        </tr>

                        {/* Sub-row 4: Daun */}
                        <tr className="hover:bg-slate-50/50 text-[11px] text-slate-600">
                          <td className="py-1.5 pl-8 pr-3 sticky left-0 z-10 bg-white border-r border-slate-200 text-slate-700">
                            · Daun
                          </td>
                          <td className="py-1.5 px-2 text-center text-[10px] text-slate-400 border-r border-slate-200">
                            Campur
                          </td>
                          {columnView === 'daily' ? (
                            kelRecords.map((r, i) => {
                              const val = r ? (r.composition.daunTpa || 0) + (r.composition.daunTps3r || 0) : 0;
                              return (
                                <td key={daysList[i]} className="py-1.5 px-2 text-right font-mono text-[10px] tabular-nums text-slate-600 border-r border-slate-200">
                                  {fmt(val)}
                                </td>
                              );
                            })
                          ) : (
                            <>
                              <td className="py-1.5 px-2 text-right font-mono text-sky-700 tabular-nums border-r border-slate-200">{fmtZero(totalDaunTpa)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-emerald-700 tabular-nums border-r border-slate-200">{fmtZero(totalDaunTps3r)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-slate-400 border-r border-slate-200">-</td>
                            </>
                          )}
                          <td className="py-1.5 px-3 text-right font-mono text-slate-800 sticky right-0 z-10 bg-white/95 tabular-nums border-l border-emerald-200">
                            {fmtZero(totalDaunTpa + totalDaunTps3r)}
                          </td>
                        </tr>

                        {/* Sub-row 5: Petugas Pakan breakdown */}
                        {activeCollectors.map((col) => {
                          const colTotal = collectorSums.get(col.name) || 0;
                          return (
                            <tr key={col.id} className="hover:bg-amber-50/40 text-[11px] text-amber-900 bg-amber-50/20">
                              <td className="py-1.5 pl-8 pr-3 sticky left-0 z-10 bg-amber-50/60 border-r border-slate-200 font-medium">
                                ↳ Pakan: {col.name}
                              </td>
                              <td className="py-1.5 px-2 text-center text-[10px] text-amber-600 border-r border-slate-200">
                                Pakan
                              </td>
                              {columnView === 'daily' ? (
                                kelRecords.map((r, i) => {
                                  const pakanItem = r?.pakanInputs?.find((p) => p.collectorId === col.id || p.collectorName === col.name);
                                  const val = pakanItem?.weightKg || 0;
                                  return (
                                    <td key={daysList[i]} className="py-1.5 px-2 text-right font-mono text-[10px] tabular-nums text-amber-800 border-r border-slate-200">
                                      {fmt(val)}
                                    </td>
                                  );
                                })
                              ) : (
                                <>
                                  <td className="py-1.5 px-2 text-right font-mono text-slate-400 border-r border-slate-200">-</td>
                                  <td className="py-1.5 px-2 text-right font-mono text-slate-400 border-r border-slate-200">-</td>
                                  <td className="py-1.5 px-2 text-right font-mono text-amber-700 font-semibold tabular-nums border-r border-slate-200">{fmtZero(colTotal)}</td>
                                </>
                              )}
                              <td className="py-1.5 px-3 text-right font-mono font-semibold text-amber-900 sticky right-0 z-10 bg-amber-100/60 tabular-nums border-l border-emerald-200">
                                {fmtZero(colTotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Bottom Sticky Summary Block: REKAP KECAMATAN UJUNG PANDANG */}
            <tfoot className="border-t-2 border-slate-300 bg-slate-900 text-white font-bold text-xs sticky bottom-0 z-30">
              {/* Grand Total Row */}
              <tr>
                <td className="py-3 px-3 sticky left-0 z-40 bg-slate-900 border-r border-slate-700">
                  REKAP KECAMATAN UJUNG PANDANG
                </td>
                <td className="py-3 px-2 text-center text-[10px] text-emerald-400 border-r border-slate-700 font-mono">
                  TOTAL
                </td>

                {columnView === 'daily' ? (
                  daysList.map((d) => {
                    const stats = dailyRecap.get(d);
                    return (
                      <td
                        key={d}
                        className="py-3 px-2 text-right font-mono text-[11px] tabular-nums text-emerald-300 border-r border-slate-700"
                      >
                        {fmt(stats?.grand || 0)}
                      </td>
                    );
                  })
                ) : (
                  <>
                    <td className="py-3 px-2 text-right font-mono text-sky-300 tabular-nums border-r border-slate-700">
                      {fmtZero(executiveSummary.totalTpa)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-emerald-300 tabular-nums border-r border-slate-700">
                      {fmtZero(executiveSummary.totalTps3r)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-amber-300 tabular-nums border-r border-slate-700">
                      {fmtZero(executiveSummary.totalPakan)}
                    </td>
                  </>
                )}

                <td className="py-3 px-3 text-right font-mono text-base font-extrabold text-emerald-400 sticky right-0 z-40 bg-slate-950 tabular-nums border-l border-slate-700">
                  {fmtZero(executiveSummary.grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      </ScrollReveal>

      {/* Kecamatan Secondary Summary Block (Composition & TPS3R Maggot/Open Windrow) */}
      <ScrollReveal delay={180} distance={30} duration={700}>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
            Rincian Akumulatif Tingkat Kecamatan Ujung Pandang (Oktober 2026)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            <div className="p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200/80 hover:border-slate-300 hover:-translate-y-1 hover:shadow-sm transition-all duration-200 cursor-default">
              <span className="text-slate-500 block text-[11px]">Makanan</span>
              <span className="font-bold font-mono text-slate-900 text-sm">
                {fmtZero(executiveSummary.compositionBreakdown.makanan)} Kg
              </span>
            </div>
            <div className="p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200/80 hover:border-slate-300 hover:-translate-y-1 hover:shadow-sm transition-all duration-200 cursor-default">
              <span className="text-slate-500 block text-[11px]">Sisa Buah</span>
              <span className="font-bold font-mono text-slate-900 text-sm">
                {fmtZero(executiveSummary.compositionBreakdown.sisaBuah)} Kg
              </span>
            </div>
            <div className="p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200/80 hover:border-slate-300 hover:-translate-y-1 hover:shadow-sm transition-all duration-200 cursor-default">
              <span className="text-slate-500 block text-[11px]">Sisa Sayur</span>
              <span className="font-bold font-mono text-slate-900 text-sm">
                {fmtZero(executiveSummary.compositionBreakdown.sisaSayur)} Kg
              </span>
            </div>
            <div className="p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200/80 hover:border-slate-300 hover:-translate-y-1 hover:shadow-sm transition-all duration-200 cursor-default">
              <span className="text-slate-500 block text-[11px]">Daun</span>
              <span className="font-bold font-mono text-slate-900 text-sm">
                {fmtZero(executiveSummary.compositionBreakdown.daun)} Kg
              </span>
            </div>
            <div className="p-3 bg-amber-50 hover:bg-amber-100/50 rounded-lg border border-amber-200/80 hover:border-amber-300 hover:-translate-y-1 hover:shadow-sm transition-all duration-200 cursor-default">
              <span className="text-amber-800 block text-[11px]">Pakan Ternak</span>
              <span className="font-bold font-mono text-amber-900 text-sm">
                {fmtZero(executiveSummary.totalPakan)} Kg
              </span>
            </div>
            <div className="p-3 bg-emerald-50 hover:bg-emerald-100/50 rounded-lg border border-emerald-200/80 hover:border-emerald-300 hover:-translate-y-1 hover:shadow-sm transition-all duration-200 cursor-default">
              <span className="text-emerald-800 block text-[11px]">Biokonversi Maggot</span>
              <span className="font-bold font-mono text-emerald-900 text-sm">
                {fmtZero(executiveSummary.totalMaggot)} Kg
              </span>
            </div>
            <div className="p-3 bg-emerald-50 hover:bg-emerald-100/50 rounded-lg border border-emerald-200/80 hover:border-emerald-300 hover:-translate-y-1 hover:shadow-sm transition-all duration-200 cursor-default">
              <span className="text-emerald-800 block text-[11px]">Open Windrow (WDR)</span>
              <span className="font-bold font-mono text-emerald-900 text-sm">
                {fmtZero(executiveSummary.totalOpenWindrow)} Kg
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Google Sheets Sync & Apps Script Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};
