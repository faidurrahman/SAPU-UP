import React, { useState, useEffect } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { KELURAHAN_LIST } from '../data/initialData';
import { KelurahanId, WasteComposition, PakanCollectorInput } from '../types/waste';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  RotateCcw,
  UserCheck,
  Calendar,
  Building2,
  Trash2,
  ArrowRight,
  Info,
  Download,
  ExternalLink,
  RefreshCw,
  Code2,
} from 'lucide-react';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import { ScrollReveal } from './ScrollReveal';

export const InputPortalView: React.FC = () => {
  const {
    records,
    collectors,
    saveDailyRecord,
    addCollector,
    getRecordForDateAndKelurahan,
    getComplianceForDate,
    preselectedInputKelurahan,
    setPreselectedInputKelurahan,
    setActiveTab,
    exportToExcel,
    googleSheetsId,
    syncFromGoogleSheets,
    isSyncing,
  } = useWasteData();

  // Selected date and kelurahan
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-21');
  const [selectedKelurahan, setSelectedKelurahan] = useState<KelurahanId>(
    preselectedInputKelurahan || 'BULOGADING'
  );
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Form states
  const [composition, setComposition] = useState<WasteComposition>({
    makananTpa: 0,
    makananTps3r: 0,
    sisaBuahTpa: 0,
    sisaBuahTps3r: 0,
    sisaSayurTpa: 0,
    sisaSayurTps3r: 0,
    daunTpa: 0,
    daunTps3r: 0,
  });

  const [pakanInputs, setPakanInputs] = useState<PakanCollectorInput[]>([]);
  const [operatorName, setOperatorName] = useState<string>('Petugas Kebersihan Kelurahan');
  const [showAddCollectorModal, setShowAddCollectorModal] = useState<boolean>(false);
  const [newCollectorName, setNewCollectorName] = useState<string>('');
  const [newCollectorPhone, setNewCollectorPhone] = useState<string>('');
  const [isExistingRecord, setIsExistingRecord] = useState<boolean>(false);

  // When preselectedInputKelurahan changes from outside
  useEffect(() => {
    if (preselectedInputKelurahan) {
      setSelectedKelurahan(preselectedInputKelurahan);
    }
  }, [preselectedInputKelurahan]);

  // Load existing data or initialize when date or kelurahan changes
  useEffect(() => {
    const existing = getRecordForDateAndKelurahan(selectedDate, selectedKelurahan);

    // Filter collectors for this kelurahan
    const kelCollectors = collectors.filter(
      (c) => c.kelurahanId === selectedKelurahan && c.active
    );

    if (existing) {
      setIsExistingRecord(true);
      setComposition(existing.composition);
      setOperatorName(existing.submittedBy || `Petugas ${selectedKelurahan}`);

      // Map collectors including existing weights
      const mappedPakan: PakanCollectorInput[] = kelCollectors.map((c) => {
        const found = existing.pakanInputs?.find((p) => p.collectorId === c.id || p.collectorName === c.name);
        return {
          collectorId: c.id,
          collectorName: c.name,
          weightKg: found ? found.weightKg : 0,
        };
      });
      setPakanInputs(mappedPakan);
    } else {
      setIsExistingRecord(false);
      setComposition({
        makananTpa: 0,
        makananTps3r: 0,
        sisaBuahTpa: 0,
        sisaBuahTps3r: 0,
        sisaSayurTpa: 0,
        sisaSayurTps3r: 0,
        daunTpa: 0,
        daunTps3r: 0,
      });
      setOperatorName(`Petugas Kebersihan Kel. ${selectedKelurahan}`);

      const initialPakan: PakanCollectorInput[] = kelCollectors.map((c) => ({
        collectorId: c.id,
        collectorName: c.name,
        weightKg: 0,
      }));
      setPakanInputs(initialPakan);
    }
  }, [selectedDate, selectedKelurahan, collectors, records]);

  // Handle number input change for composition
  const handleCompChange = (field: keyof WasteComposition, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setComposition((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  // Handle collector weight change
  const handlePakanChange = (collectorId: string, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setPakanInputs((prev) =>
      prev.map((p) => (p.collectorId === collectorId ? { ...p, weightKg: num } : p))
    );
  };

  // Live Auto-Calculated Totals
  const totalTpa =
    composition.makananTpa +
    composition.sisaBuahTpa +
    composition.sisaSayurTpa +
    composition.daunTpa;

  const totalTps3r =
    composition.makananTps3r +
    composition.sisaBuahTps3r +
    composition.sisaSayurTps3r +
    composition.daunTps3r;

  const totalPakan = pakanInputs.reduce((sum, p) => sum + (p.weightKg || 0), 0);

  const grandTotal = totalTpa + totalTps3r + totalPakan;

  // Handle Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyRecord({
      date: selectedDate,
      kelurahanId: selectedKelurahan,
      composition,
      pakanInputs,
      submittedBy: operatorName,
    });
  };

  // Handle Add New Collector
  const handleAddNewCollector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectorName.trim()) return;

    addCollector({
      name: newCollectorName.trim(),
      kelurahanId: selectedKelurahan,
      phone: newCollectorPhone.trim() || undefined,
      active: true,
    });

    setNewCollectorName('');
    setNewCollectorPhone('');
    setShowAddCollectorModal(false);
  };

  // Compliance list for the selected date
  const compliance = getComplianceForDate(selectedDate);
  const submittedCount = compliance.filter((c) => c.submitted).length;

  const activeMeta = KELURAHAN_LIST.find((k) => k.id === selectedKelurahan);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <ScrollReveal delay={0} distance={20} duration={600}>
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <span>Portal Input Harian Kelurahan</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Formulir pencatatan timbulan sampah organik dan alokasi pakan per kelurahan
              </p>
            </div>

            {/* Quick Selectors for Kelurahan and Date */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <label className="font-semibold text-slate-700">Kelurahan:</label>
                <select
                  value={selectedKelurahan}
                  onChange={(e) => setSelectedKelurahan(e.target.value as KelurahanId)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-hidden cursor-pointer"
                >
                  {KELURAHAN_LIST.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                <Calendar className="w-4 h-4 text-slate-500" />
                <label className="font-semibold text-slate-700">Tanggal:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-mono font-medium text-slate-900 focus:outline-hidden cursor-pointer"
                />
              </div>
            </div>
          </div>

          {isExistingRecord && (
            <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Mode Edit:</strong> Laporan untuk <strong>{selectedKelurahan}</strong> pada tanggal{' '}
                <strong>{selectedDate}</strong> sudah pernah tersimpan. Menyimpan kembali akan memperbarui data rekapitulasi.
              </span>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Download Spreadsheet Template Card for Daily Input */}
      <ScrollReveal delay={100} distance={28} duration={700}>
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md hover:shadow-2xl hover:-translate-y-1.5 hover:border-emerald-500/70 transition-all duration-300 ease-out border border-emerald-700/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>File Excel (.xlsx) Siap Pakai Untuk Google Sheets / Excel</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              File Spreadsheet Siap Import untuk Input Harian
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              File ini berisi <strong>6 sheet lengkap</strong> dengan rumus otomatis (<code className="bg-black/30 px-1 py-0.5 rounded text-emerald-200">=SUM</code>), 210 baris data resmi Oktober 2026, baris kosong siap ketik untuk kelurahan, serta sheet rekap harian format WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="bg-white/10 px-2 py-1 rounded">✓ Sheet INPUT_HARIAN</span>
              <span className="bg-white/10 px-2 py-1 rounded">✓ Sheet REKAP_HARIAN_RESMI</span>
              <span className="bg-white/10 px-2 py-1 rounded">✓ Sheet REKAP_MATRIKS_BULANAN</span>
              <span className="bg-white/10 px-2 py-1 rounded">✓ Sheet PENGOLAHAN_TPS3R</span>
              <span className="bg-white/10 px-2 py-1 rounded">✓ Sheet MASTER_DATA</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all duration-150 transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Excel (.xlsx)</span>
            </button>
            <a
              href={`https://docs.google.com/spreadsheets/d/${googleSheetsId}/edit`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/70 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors border border-emerald-500/50 text-center"
            >
              <span>Buka Google Sheet Saya</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={syncFromGoogleSheets}
              disabled={isSyncing}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-medium text-xs transition-colors border border-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Tarik Data dari Sheet'}</span>
            </button>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-colors border border-white/20"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Sinkron & Kode Apps Script</span>
            </button>
          </div>
        </div>

        {/* Step-by-step import guide */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
            <span>Buka <strong>drive.google.com</strong>, klik <em>+ Baru</em> &gt; <em>Upload File</em>, lalu pilih file .xlsx ini.</span>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
            <span>Buka file yang terunggah, lalu klik menu <em>File &gt; Simpan sebagai Google Spreadsheet</em>.</span>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
            <span>Bagikan link ke staf 10 Kelurahan untuk mulai menginput data harian dengan rumus otomatis!</span>
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* Main 2-Column Form & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Columns: Input Grid */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Section 1: Komposisi Sampah Organik (TPA vs TPS3R Matrix) */}
          <ScrollReveal delay={150} distance={28} duration={700}>
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    1. Komposisi Sampah Organik (Kilogram)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Masukkan berat bersih berdasarkan destinasi pemrosesan
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Satuan: Kg
                </span>
              </div>

            {/* Matrix Header */}
            <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
              <div className="col-span-4">Kategori Bahan Organik</div>
              <div className="col-span-4 text-sky-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-600" />
                <span>Angkutan TPA (Bosowa)</span>
              </div>
              <div className="col-span-4 text-emerald-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Pengolahan TPS3R</span>
              </div>
            </div>

            {/* Row 1: Makanan */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg hover:bg-slate-50/70 transition-colors">
              <div className="col-span-4">
                <div className="text-xs font-semibold text-slate-900">Makanan</div>
                <div className="text-[11px] text-slate-400">Sisa nasi, lauk, roti, olahan</div>
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={composition.makananTpa || ''}
                    onChange={(e) => handleCompChange('makananTpa', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 pointer-events-none">Kg</span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={composition.makananTps3r || ''}
                    onChange={(e) => handleCompChange('makananTps3r', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 pointer-events-none">Kg</span>
                </div>
              </div>
            </div>

            {/* Row 2: Sisa Buah */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg hover:bg-slate-50/70 transition-colors border-t border-slate-100">
              <div className="col-span-4">
                <div className="text-xs font-semibold text-slate-900">Sisa Buah</div>
                <div className="text-[11px] text-slate-400">Kulit buah, ampas, buah afkir</div>
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={composition.sisaBuahTpa || ''}
                    onChange={(e) => handleCompChange('sisaBuahTpa', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 pointer-events-none">Kg</span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={composition.sisaBuahTps3r || ''}
                    onChange={(e) => handleCompChange('sisaBuahTps3r', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 pointer-events-none">Kg</span>
                </div>
              </div>
            </div>

            {/* Row 3: Sisa Sayur */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg hover:bg-slate-50/70 transition-colors border-t border-slate-100">
              <div className="col-span-4">
                <div className="text-xs font-semibold text-slate-900">Sisa Sayur</div>
                <div className="text-[11px] text-slate-400">Sisa sayur pasar, dapur, batang</div>
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={composition.sisaSayurTpa || ''}
                    onChange={(e) => handleCompChange('sisaSayurTpa', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 pointer-events-none">Kg</span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={composition.sisaSayurTps3r || ''}
                    onChange={(e) => handleCompChange('sisaSayurTps3r', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 pointer-events-none">Kg</span>
                </div>
              </div>
            </div>

            {/* Row 4: Daun */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg hover:bg-slate-50/70 transition-colors border-t border-slate-100">
              <div className="col-span-4">
                <div className="text-xs font-semibold text-slate-900">Daun</div>
                <div className="text-[11px] text-slate-400">Sapuan jalan, ranting, taman</div>
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={composition.daunTpa || ''}
                    onChange={(e) => handleCompChange('daunTpa', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 pointer-events-none">Kg</span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={composition.daunTps3r || ''}
                    onChange={(e) => handleCompChange('daunTps3r', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 pointer-events-none">Kg</span>
                </div>
              </div>
            </div>

            {/* Subtotal preview */}
            <div className="grid grid-cols-12 gap-3 pt-3 border-t border-slate-200 text-xs font-bold bg-slate-50/80 p-2.5 rounded-lg">
              <div className="col-span-4 text-slate-700">Subtotal Sampah</div>
              <div className="col-span-4 text-sky-800 font-mono">
                {totalTpa.toLocaleString('id-ID')} Kg
              </div>
              <div className="col-span-4 text-emerald-800 font-mono">
                {totalTps3r.toLocaleString('id-ID')} Kg
              </div>
            </div>
            </div>
          </ScrollReveal>

          {/* Section 2: Dynamic Petugas Pakan */}
          <ScrollReveal delay={220} distance={28} duration={700}>
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>2. Distribusi Pakan (Petugas Pengumpul)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mitra pengumpul pakan ternak resmi terdaftar di {activeMeta?.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCollectorModal(true)}
                  className="flex items-center gap-1 text-xs text-emerald-800 hover:text-emerald-950 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Petugas Baru</span>
                </button>
              </div>

              {pakanInputs.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  <p>Belum ada petugas pakan yang terdaftar untuk {activeMeta?.name}.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddCollectorModal(true)}
                    className="mt-2 text-emerald-700 font-semibold underline"
                  >
                    Daftarkan Petugas Pakan Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pakanInputs.map((pakan) => (
                    <div
                      key={pakan.collectorId}
                      className="p-3 bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-amber-300 rounded-lg flex items-center justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                          {pakan.collectorName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {pakan.collectorName}
                          </div>
                          <div className="text-[10px] text-amber-700 font-medium">
                            Pengumpul Pakan
                          </div>
                        </div>
                      </div>

                      <div className="w-32 relative">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={pakan.weightKg || ''}
                          onChange={(e) => handlePakanChange(pakan.collectorId, e.target.value)}
                          placeholder="0"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-right pr-7"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-slate-400 pointer-events-none">
                          Kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Operator Notes & Identity */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <span className="text-slate-500">Petugas Input / Operator:</span>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium text-xs focus:outline-hidden"
                  />
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Kecamatan Ujung Pandang, Makassar
                </div>
              </div>
            </div>
          </ScrollReveal>
        </form>

        {/* Right 1-Column: Live Summary Preview Card */}
        <div className="space-y-6">
          <ScrollReveal delay={150} distance={28} duration={700}>
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-out sticky top-20">
              <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
                Ringkasan Live Input
              </h3>

              <div className="my-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 text-slate-600">
                  <span>Kelurahan:</span>
                  <span className="font-bold text-slate-900">{activeMeta?.name}</span>
                </div>
                <div className="flex items-center justify-between py-1 text-slate-600">
                  <span>Tanggal Laporan:</span>
                  <span className="font-mono font-medium text-slate-900">{selectedDate}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                      <span>Total TPA (Bosowa):</span>
                    </div>
                    <span className="font-mono font-bold text-sky-800">
                      {totalTpa.toLocaleString('id-ID')} Kg
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <span>Total TPS3R:</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-800">
                      {totalTps3r.toLocaleString('id-ID')} Kg
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                      <span>Total Pakan Ternak:</span>
                    </div>
                    <span className="font-mono font-bold text-amber-800">
                      {totalPakan.toLocaleString('id-ID')} Kg
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-200">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      Grand Total Hari Ini:
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-emerald-800 font-mono tabular-nums">
                        {grandTotal.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 ml-1">Kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs transition-colors text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Kirim Laporan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-xs"
                >
                  <span>Lihat di Tabel Matriks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Status Kepatuhan Input Harian Grid */}
      <ScrollReveal delay={200} distance={32} duration={700}>
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Status Kepatuhan Input Harian (Tanggal: {selectedDate})
              </h3>
              <p className="text-xs text-slate-500">
                Pemantauan input 10 kelurahan. Klik salah satu kelurahan untuk langsung mengisi laporannya.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
              {submittedCount} / 10 Kelurahan Terinput
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {compliance.map((item) => {
              const isCurrent = item.kelurahanId === selectedKelurahan;
              return (
                <button
                  key={item.kelurahanId}
                  type="button"
                  onClick={() => setSelectedKelurahan(item.kelurahanId)}
                  className={`p-3 rounded-lg border text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                    isCurrent
                      ? 'ring-2 ring-emerald-600 border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {item.name.replace('Kelurahan ', '')}
                    </span>
                    {item.submitted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                  </div>

                  <div className="text-[11px] font-mono tabular-nums text-slate-600">
                    {item.submitted ? (
                      <span className="text-emerald-700 font-semibold">
                        {item.totalKg.toLocaleString('id-ID')} Kg
                      </span>
                    ) : (
                      <span className="text-amber-600">Belum Ada</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Add Collector Modal */}
      {showAddCollectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Tambah Petugas Pengumpul Pakan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Daftarkan mitra pengumpul pakan ternak baru untuk {activeMeta?.name}
            </p>

            <form onSubmit={handleAddNewCollector} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Petugas Pakan:
                </label>
                <input
                  type="text"
                  required
                  value={newCollectorName}
                  onChange={(e) => setNewCollectorName(e.target.value)}
                  placeholder="Contoh: Daeng Ramli"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp (Opsional):
                </label>
                <input
                  type="tel"
                  value={newCollectorPhone}
                  onChange={(e) => setNewCollectorPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCollectorModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                >
                  Simpan Petugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sheets Sync & Apps Script Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};
