import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import {
  FileText,
  Copy,
  Check,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  RotateCcw,
  Scale,
  Sparkles,
  Building,
  CheckCircle2,
  AlertTriangle,
  Send,
  Printer,
  Download,
  RefreshCw,
} from 'lucide-react';
import { OfficialDailyPengelolaan } from '../types/waste';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import { ScrollReveal } from './ScrollReveal';

export const OfficialReportView: React.FC = () => {
  const {
    getOfficialReportForDate,
    saveOfficialPengelolaan,
    setToastMessage,
    records,
    exportToExcel,
    syncFromGoogleSheets,
    isSyncing,
  } = useWasteData();

  // Selected date
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-22');
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditingPengelolaan, setIsEditingPengelolaan] = useState<boolean>(false);
  const [showAllKelurahan, setShowAllKelurahan] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Retrieve report data
  const report = getOfficialReportForDate(selectedDate);

  // Editable state for Pengelolaan Sampah Organik
  const [editForm, setEditForm] = useState<OfficialDailyPengelolaan>(report.pengelolaan);

  // Synchronize editForm when selectedDate changes
  React.useEffect(() => {
    setEditForm(report.pengelolaan);
  }, [selectedDate, report.pengelolaan]);

  // Copy WhatsApp text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(report.whatsAppText);
      setCopied(true);
      setToastMessage('Format rekap resmi berhasil disalin! Siap ditempel di WhatsApp/Telegram.');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = report.whatsAppText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setToastMessage('Format rekap resmi berhasil disalin!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Open direct WhatsApp share
  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(report.whatsAppText);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Save changes to Pengelolaan
  const handleSavePengelolaan = (e: React.FormEvent) => {
    e.preventDefault();
    saveOfficialPengelolaan({
      ...editForm,
      date: selectedDate,
    });
    setIsEditingPengelolaan(false);
  };

  // Quick Date Navigation
  const changeDateByDays = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const currentDate = new Date(Date.UTC(y, m - 1, d));
    currentDate.setUTCDate(currentDate.getUTCDate() + delta);
    const newY = currentDate.getUTCFullYear();
    const newM = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const newD = String(currentDate.getUTCDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  // Check balance
  const isBalanced = report.totalSampahOrganik === report.totalPengelolaan;
  const balanceDiff = report.totalPengelolaan - report.totalSampahOrganik;

  // Filtered kelurahan list based on toggle
  const displayedKelurahan = showAllKelurahan
    ? report.kelurahanList
    : report.kelurahanList.filter((k) => k.weightKg > 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <ScrollReveal delay={0} distance={20} duration={600}>
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-medium text-emerald-100 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Format Standar Laporan Harian Kecamatan</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                Rekap Sampah Organik Harian Kecamatan Ujung Pandang
              </h1>
              <p className="text-xs md:text-sm text-emerald-100/90 mt-1">
                Format broadcast resmi siap salin ke WhatsApp grup, laporan pimpinan DLH / Camat, dan rincian alur pengelolaan.
              </p>
            </div>

            {/* Quick Date Control */}
            <div className="flex items-center gap-2 bg-emerald-900/60 p-2 rounded-xl backdrop-blur-xs border border-white/10 self-start md:self-auto">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                title="Hari Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-2">
                <Calendar className="w-4 h-4 text-emerald-300" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
                />
              </div>

              <button
                onClick={() => changeDateByDays(1)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                title="Hari Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate('2026-10-20')}
                className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
                  selectedDate === '2026-10-20'
                    ? 'bg-amber-400 text-amber-950 font-semibold'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Kembali ke Tanggal Resmi 20 Okt 2026"
              >
                20 Okt
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Grid: Left is Official Layout Card, Right is Management & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official WhatsApp/Report Output (7 cols) */}
        <ScrollReveal delay={100} distance={28} duration={700} className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-out overflow-hidden">
            {/* Card Header & Action Bar */}
            <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs tracking-wide uppercase text-slate-200">
                  Tampilan Format Broadcast Resmi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                  title="Salin teks dengan format persis ke clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Format Teks</span>
                    </>
                  )}
                </button>


                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700/90 hover:bg-emerald-600 text-white transition-colors border border-emerald-600 shadow-2xs"
                  title="Unduh file spreadsheet Excel 6 sheet siap pakai"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Excel (.xlsx)</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Cetak Halaman"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Report Text Box (Formatted identically to requested spec) */}
            <div className="p-6 bg-[#fbfdfa] font-mono text-sm leading-relaxed text-slate-800 select-all border-b border-slate-200/80">
              <div className="space-y-4 max-w-xl">
                <div>
                  <div className="font-bold text-slate-900 tracking-wide">
                    REKAP SAMPAH ORGANIK KECAMATAN UJUNG PANDANG
                  </div>
                  <div className="text-slate-700 font-semibold mt-1">
                    {report.formattedFullDate}
                  </div>
                </div>

                {/* List Kelurahan */}
                <div className="space-y-1 py-1">
                  {displayedKelurahan.map((kel, idx) => (
                    <div key={kel.kelurahanId} className="flex justify-between items-center text-slate-800">
                      <span>
                        {idx + 1}. {kel.name}
                      </span>
                      <span className="font-bold">
                        — &nbsp;{kel.weightKg.toLocaleString('id-ID')} Kg
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total Timbulan */}
                <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between items-center font-bold text-emerald-900 bg-emerald-50/70 p-2.5 rounded-lg">
                  <span>TOTAL SAMPAH ORGANIK :</span>
                  <span className="text-base">
                    {report.totalSampahOrganik.toLocaleString('id-ID')} Kg
                  </span>
                </div>

                {/* Pengelolaan Sampah Organik Section */}
                <div className="pt-2 space-y-1.5">
                  <div className="font-bold text-slate-900 tracking-wide">
                    PENGELOLAAN SAMPAH ORGANIK
                  </div>

                  <div className="space-y-1 text-slate-800">
                    <div className="flex justify-between items-center">
                      <span>* Kapasa (Bosowa)</span>
                      <span className="font-semibold">
                        : {report.pengelolaan.kapasaBosowaKg.toLocaleString('id-ID')} Kg
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>* Bintang 5</span>
                      <span className="font-semibold text-emerald-800">
                        : {report.pengelolaan.bintang5Kg.toLocaleString('id-ID')} Kg
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>* Pengelolaan Teba</span>
                      <span className="font-semibold">
                        : {report.pengelolaan.pengelolaanTebaKg.toLocaleString('id-ID')} Kg
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>* Pakan Ternak</span>
                      <span className="font-semibold text-amber-800">
                        : {report.pengelolaan.pakanTernakKg.toLocaleString('id-ID')} Kg
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>* Pengelolaan Biopori</span>
                      <span className="font-semibold">
                        : {report.pengelolaan.pengelolaanBioporiKg.toLocaleString('id-ID')} Kg
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span>* TPS3R KAREBOSI</span>
                        <span className="font-semibold text-teal-800">
                          : {(
                            report.pengelolaan.tps3rKarebosiMaggotKg +
                            report.pengelolaan.tps3rKarebosiOpenWindrowKg
                          ).toLocaleString('id-ID')} Kg
                        </span>
                      </div>
                      <div className="pl-6 text-xs text-slate-600 flex justify-between items-center">
                        <span>'-Maggot</span>
                        <span>: {report.pengelolaan.tps3rKarebosiMaggotKg.toLocaleString('id-ID')} Kg</span>
                      </div>
                      <div className="pl-6 text-xs text-slate-600 flex justify-between items-center">
                        <span>'-Open Windrow</span>
                        <span>: {report.pengelolaan.tps3rKarebosiOpenWindrowKg.toLocaleString('id-ID')} Kg</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>* Raised bed</span>
                      <span className="font-semibold">
                        : {report.pengelolaan.raisedBedKg.toLocaleString('id-ID')} Kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Pengelolaan */}
                <div
                  className={`pt-2 border-t border-dashed border-slate-300 flex justify-between items-center font-bold p-2.5 rounded-lg ${
                    isBalanced
                      ? 'bg-emerald-100/70 text-emerald-950'
                      : 'bg-amber-100/70 text-amber-950'
                  }`}
                >
                  <span>TOTAL PENGELOLAAN :</span>
                  <span className="text-base">
                    {report.totalPengelolaan.toLocaleString('id-ID')} Kg
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Card Footer with Info & Toggles */}
            <div className="p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showAllKelurahan}
                  onChange={(e) => setShowAllKelurahan(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Tampilkan seluruh 10 Kelurahan (termasuk yang 0 Kg)</span>
              </label>

              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Neraca Seimbang (100%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Selisih: {Math.abs(balanceDiff).toLocaleString('id-ID')} Kg
                  </span>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Right Column: Edit Pengelolaan Stream & Analytics (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Editor for Pengelolaan Categories */}
          <ScrollReveal delay={160} distance={28} duration={700}>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <Scale className="w-4 h-4" />
                  </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Penyesuaian Neraca Pengelolaan
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Input rincian alur pemrosesan sampah organik tanggal {selectedDate}
                  </p>
                </div>
              </div>

              {!isEditingPengelolaan ? (
                <button
                  onClick={() => setIsEditingPengelolaan(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors border border-emerald-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ubah Angka</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditForm(report.pengelolaan);
                    setIsEditingPengelolaan(false);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <span>Batal</span>
                </button>
              )}
            </div>

            {isEditingPengelolaan ? (
              <form onSubmit={handleSavePengelolaan} className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Kapasa (Bosowa)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={editForm.kapasaBosowaKg}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            kapasaBosowaKg: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-right font-mono pr-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                        Kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Bintang 5
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={editForm.bintang5Kg}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            bintang5Kg: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-right font-mono pr-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                        Kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Pengelolaan Teba
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={editForm.pengelolaanTebaKg}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            pengelolaanTebaKg: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-right font-mono pr-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                        Kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Pakan Ternak
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={editForm.pakanTernakKg}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            pakanTernakKg: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-right font-mono pr-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                        Kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Pengelolaan Biopori
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={editForm.pengelolaanBioporiKg}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            pengelolaanBioporiKg: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-right font-mono pr-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                        Kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Raised Bed
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={editForm.raisedBedKg}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            raisedBedKg: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-right font-mono pr-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                        Kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      TPS3R Maggot
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={editForm.tps3rKarebosiMaggotKg}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tps3rKarebosiMaggotKg: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-right font-mono pr-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                        Kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      TPS3R Open Windrow
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={editForm.tps3rKarebosiOpenWindrowKg}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tps3rKarebosiOpenWindrowKg: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-right font-mono pr-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                        Kg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Kapasa (Bosowa)</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {report.pengelolaan.kapasaBosowaKg.toLocaleString('id-ID')} Kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium text-emerald-900">Bintang 5</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {report.pengelolaan.bintang5Kg.toLocaleString('id-ID')} Kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Pengelolaan Teba</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {report.pengelolaan.pengelolaanTebaKg.toLocaleString('id-ID')} Kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium text-amber-900">Pakan Ternak</span>
                  <span className="font-mono font-bold text-amber-800">
                    {report.pengelolaan.pakanTernakKg.toLocaleString('id-ID')} Kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Pengelolaan Biopori</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {report.pengelolaan.pengelolaanBioporiKg.toLocaleString('id-ID')} Kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium text-teal-900">
                    TPS3R Karebosi (Maggot + Open Windrow)
                  </span>
                  <span className="font-mono font-bold text-teal-800">
                    {(
                      report.pengelolaan.tps3rKarebosiMaggotKg +
                      report.pengelolaan.tps3rKarebosiOpenWindrowKg
                    ).toLocaleString('id-ID')}{' '}
                    Kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-600">Raised Bed</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {report.pengelolaan.raisedBedKg.toLocaleString('id-ID')} Kg
                  </span>
                </div>
              </div>
            )}
            </div>
          </ScrollReveal>

          {/* Contribution Progress Bar Card */}
          <ScrollReveal delay={240} distance={28} duration={700}>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-out space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Peringkat Kontribusi Kelurahan ({report.formattedFullDate})
              </h3>

              <div className="space-y-2">
                {displayedKelurahan.map((kel) => {
                  const pct =
                    report.totalSampahOrganik > 0
                      ? ((kel.weightKg / report.totalSampahOrganik) * 100).toFixed(1)
                      : '0';

                  return (
                    <div key={kel.kelurahanId} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">
                          {kel.no}. {kel.name}
                        </span>
                        <span className="font-mono text-slate-900 font-semibold">
                          {kel.weightKg.toLocaleString('id-ID')} Kg{' '}
                          <span className="text-slate-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(2, Number(pct)))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Google Sheets Sync & Apps Script Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};
