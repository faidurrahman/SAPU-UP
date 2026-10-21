import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { KELURAHAN_LIST } from '../data/initialData';
import { KelurahanId } from '../types/waste';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Wheat,
  Plus,
  Calendar,
  Building2,
  Edit3,
  Recycle,
  Save,
  Bug,
  Sparkles,
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const ComplianceView: React.FC = () => {
  const {
    records,
    collectors,
    tps3rProcessing,
    saveTps3rProcessing,
    addCollector,
    getComplianceForDate,
    setPreselectedInputKelurahan,
    setActiveTab,
  } = useWasteData();

  const [selectedDate, setSelectedDate] = useState<string>('2026-10-21');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCollectorName, setNewCollectorName] = useState<string>('');
  const [newCollectorKelurahan, setNewCollectorKelurahan] = useState<KelurahanId>('BARU');
  const [newCollectorPhone, setNewCollectorPhone] = useState<string>('');

  // Daily TPS3R processing form for the selected date
  const currentTps3r = tps3rProcessing.find((t) => t.date === selectedDate) || {
    date: selectedDate,
    maggotKg: 974,
    openWindrowKg: 93,
  };

  const [maggotInput, setMaggotInput] = useState<number>(currentTps3r.maggotKg);
  const [openWdrInput, setOpenWdrInput] = useState<number>(currentTps3r.openWindrowKg);

  const compliance = getComplianceForDate(selectedDate);
  const submittedCount = compliance.filter((c) => c.submitted).length;
  const complianceRate = (submittedCount / 10) * 100;
  const totalKgToday = compliance.reduce((sum, c) => sum + c.totalKg, 0);

  // Compute total collected per collector across records
  const collectorTotals = new Map<string, number>();
  for (const r of records) {
    if (r.pakanInputs) {
      for (const p of r.pakanInputs) {
        const curr = collectorTotals.get(p.collectorName) || 0;
        collectorTotals.set(p.collectorName, curr + (p.weightKg || 0));
      }
    }
  }

  const handleEditKelurahan = (kelId: KelurahanId) => {
    setPreselectedInputKelurahan(kelId);
    setActiveTab('input');
  };

  const handleSaveTps3r = (e: React.FormEvent) => {
    e.preventDefault();
    saveTps3rProcessing({
      date: selectedDate,
      maggotKg: Number(maggotInput) || 0,
      openWindrowKg: Number(openWdrInput) || 0,
    });
  };

  const handleAddCollectorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectorName.trim()) return;

    addCollector({
      name: newCollectorName.trim(),
      kelurahanId: newCollectorKelurahan,
      phone: newCollectorPhone.trim() || undefined,
      active: true,
    });

    setNewCollectorName('');
    setNewCollectorPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Picker */}
      <ScrollReveal delay={0} distance={18} duration={600}>
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-700" />
                <span>Monitoring Kepatuhan Harian & Direktori Petugas Pakan</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantau kepatuhan input data 10 kelurahan dan performa mitra pengumpul pakan ternak
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <label className="font-semibold text-slate-700">Tanggal Monitoring:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-mono font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* 3 Metric Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200/70 hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-default">
              <span className="text-slate-500 block text-xs">Tingkat Kepatuhan</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {complianceRate.toFixed(0)}%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({submittedCount} dari 10 Kelurahan)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200/70 hover:border-sky-300 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-default">
              <span className="text-slate-500 block text-xs">Total Sampah Terdata Hari Ini</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono text-slate-900">
                  {totalKgToday.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-500">Kg</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200/70 hover:border-teal-300 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-default">
              <span className="text-slate-500 block text-xs">Rata-rata Sampah per Kelurahan</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono text-slate-900">
                  {(totalKgToday / 10).toFixed(0)}
                </span>
                <span className="text-xs text-slate-500">Kg / wilayah</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Compliance Table for 10 Kelurahan */}
      <ScrollReveal delay={100} distance={28} duration={700}>
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 ease-out overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Status Kepatuhan Input 10 Kelurahan ({selectedDate})
            </h3>
          <span className="text-xs text-slate-500">
            Kecamatan Ujung Pandang, Makassar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Kelurahan</th>
                <th className="py-2.5 px-3">Lurah / Penanggung Jawab</th>
                <th className="py-2.5 px-3 text-center">Status Laporan</th>
                <th className="py-2.5 px-3 text-right">TPA (Bosowa)</th>
                <th className="py-2.5 px-3 text-right">TPS3R</th>
                <th className="py-2.5 px-3 text-right">Pakan</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-900">Total Hari Ini</th>
                <th className="py-2.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {compliance.map((c) => {
                const meta = KELURAHAN_LIST.find((k) => k.id === c.kelurahanId);
                const rec = c.record;
                const tpa = rec ? (rec.composition.makananTpa || 0) + (rec.composition.sisaBuahTpa || 0) + (rec.composition.sisaSayurTpa || 0) + (rec.composition.daunTpa || 0) : 0;
                const tps3r = rec ? (rec.composition.makananTps3r || 0) + (rec.composition.sisaBuahTps3r || 0) + (rec.composition.sisaSayurTps3r || 0) + (rec.composition.daunTps3r || 0) : 0;
                const pakan = rec?.pakanInputs?.reduce((sum, p) => sum + (p.weightKg || 0), 0) || 0;

                return (
                  <tr key={c.kelurahanId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{meta?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{meta?.code}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{meta?.lurah}</div>
                      <div className="text-[10px] text-slate-400">{meta?.contact}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {c.submitted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Sudah Input</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Belum Input</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                      {tpa > 0 ? `${tpa.toLocaleString('id-ID')} Kg` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-800 tabular-nums">
                      {tps3r > 0 ? `${tps3r.toLocaleString('id-ID')} Kg` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-800 tabular-nums">
                      {pakan > 0 ? `${pakan.toLocaleString('id-ID')} Kg` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {c.totalKg > 0 ? `${c.totalKg.toLocaleString('id-ID')} Kg` : '0 Kg'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleEditKelurahan(c.kelurahanId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{c.submitted ? 'Edit' : 'Input'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </ScrollReveal>

      {/* 2-Column Split: Master Petugas Pakan & TPS3R Kecamatan Processing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Columns: Master Direktori Petugas Pakan */}
        <ScrollReveal delay={150} distance={28} duration={700} className="lg:col-span-2 h-full">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>Direktori Petugas Pengumpul Pakan Terdaftar</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mitra pengumpul pakan ternak resmi yang bertugas di 10 kelurahan
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Daftar Petugas Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {collectors.map((col) => {
                  const totalKg = collectorTotals.get(col.name) || 0;
                  const kelMeta = KELURAHAN_LIST.find((k) => k.id === col.kelurahanId);

                  return (
                    <div
                      key={col.id}
                      className="p-3 bg-slate-50/80 hover:bg-white rounded-lg border border-slate-200/80 hover:border-amber-300 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {col.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{col.name}</h4>
                            <div className="text-[11px] text-slate-500">
                              {kelMeta?.name}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Aktif
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">Akumulasi Pakan:</span>
                        <span className="font-mono font-bold text-amber-800 tabular-nums">
                          {totalKg.toLocaleString('id-ID')} Kg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Right 1-Column: TPS3R Kecamatan Processing Form */}
        <ScrollReveal delay={220} distance={28} duration={700} className="h-full">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <Recycle className="w-4 h-4 text-emerald-700" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Pengolahan TPS3R Harian
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update data Maggot & Kompos ({selectedDate})
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveTps3r} className="space-y-4">
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60">
                  <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Biokonversi Maggot BSF:</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={maggotInput}
                      onChange={(e) => setMaggotInput(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">Kg</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Sampah organik terkonversi menjadi biomassa larva Maggot.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60">
                  <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Open Windrow / Kompos (WDR):</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={openWdrInput}
                      onChange={(e) => setOpenWdrInput(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">Kg</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Dekomposisi aerobik tumpukan kompos organik windrow.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs transition-colors text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pengolahan TPS3R</span>
                </button>
              </form>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Fasilitas TPS3R Kecamatan Ujung Pandang melayani pengolahan lanjutan sampah organik dari 10 kelurahan.
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Add Collector Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Daftar Petugas Pengumpul Pakan Baru
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan data mitra pengumpul pakan ternak resmi
            </p>

            <form onSubmit={handleAddCollectorSubmit} className="space-y-4">
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
                  Kelurahan Tugas:
                </label>
                <select
                  value={newCollectorKelurahan}
                  onChange={(e) => setNewCollectorKelurahan(e.target.value as KelurahanId)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500"
                >
                  {KELURAHAN_LIST.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Kontak / WhatsApp:
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
                  onClick={() => setShowAddModal(false)}
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
    </div>
  );
};
