import React from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { KELURAHAN_LIST } from '../data/initialData';
import { Printer, X, Download } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const { filter, kelurahanSummaries, executiveSummary, exportToCsv } = useWasteData();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const fmt = (n: number) => n.toLocaleString('id-ID');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-800">
              Pratinjau Cetak Laporan Resmi Kecamatan Ujung Pandang
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible text-slate-900 bg-white" id="printable-report">
          {/* Official Letterhead (Kop Surat) */}
          <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Pemerintah Kota Makassar
            </h2>
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-950">
              Kecamatan Ujung Pandang
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              SAPU-UP (Sistem Aplikasi Persampahan Ujung Pandang) & Fasilitas TPS3R
            </p>
            <p className="text-[11px] text-slate-500 italic mt-0.5">
              Alamat: Jl. Sultan Hasanuddin No. 1, Kota Makassar, Sulawesi Selatan
            </p>
          </div>

          {/* Title & Metadata */}
          <div className="text-center mb-6">
            <h3 className="text-base font-bold underline uppercase tracking-wide">
              Berita Acara Rekapitulasi Sampah Organik Harian
            </h3>
            <div className="text-xs text-slate-600 mt-1 font-mono">
              Periode Laporan: <strong>{filter.startDate}</strong> s/d <strong>{filter.endDate}</strong>
            </div>
          </div>

          {/* Main 10 Kelurahan Summary Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">
              I. Rekapitulasi Alokasi Sampah 10 Kelurahan
            </h4>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2 px-3 text-center border-r border-slate-300 w-10">No</th>
                  <th className="py-2 px-3 text-left border-r border-slate-300">Kelurahan</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300">TPA / Bosowa (Kg)</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300">TPS3R (Kg)</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300">Pakan Ternak (Kg)</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300 font-extrabold">Total (Kg)</th>
                  <th className="py-2 px-3 text-right font-semibold w-16">Porsi (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {KELURAHAN_LIST.map((k, index) => {
                  const summary = kelurahanSummaries.find((s) => s.kelurahanId === k.id);
                  const tpa = summary?.totalTpa || 0;
                  const tps3r = summary?.totalTps3r || 0;
                  const pakan = summary?.totalPakan || 0;
                  const grand = summary?.grandTotal || 0;
                  const porsi = summary?.percentageShare || 0;

                  return (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-center border-r border-slate-300 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-1.5 px-3 border-r border-slate-300 font-semibold">
                        {k.name}
                      </td>
                      <td className="py-1.5 px-3 text-right border-r border-slate-300 font-mono">
                        {fmt(tpa)}
                      </td>
                      <td className="py-1.5 px-3 text-right border-r border-slate-300 font-mono">
                        {fmt(tps3r)}
                      </td>
                      <td className="py-1.5 px-3 text-right border-r border-slate-300 font-mono">
                        {fmt(pakan)}
                      </td>
                      <td className="py-1.5 px-3 text-right border-r border-slate-300 font-mono font-bold">
                        {fmt(grand)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono">
                        {porsi.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200 font-bold border-t-2 border-slate-400 text-slate-900">
                  <td colSpan={2} className="py-2 px-3 border-r border-slate-300 text-center">
                    TOTAL KECAMATAN UJUNG PANDANG
                  </td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 font-mono">
                    {fmt(executiveSummary.totalTpa)}
                  </td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 font-mono">
                    {fmt(executiveSummary.totalTps3r)}
                  </td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 font-mono">
                    {fmt(executiveSummary.totalPakan)}
                  </td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 font-mono font-black text-sm">
                    {fmt(executiveSummary.grandTotal)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    100.0%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Section II: Composition & Circular Economy */}
          <div className="grid grid-cols-2 gap-4 mb-6 print-avoid-break">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">
                II. Komposisi Sampah Organik
              </h4>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 px-2.5 font-medium">Makanan (Organik Basah)</td>
                    <td className="py-1 px-2.5 text-right font-mono font-bold">
                      {fmt(executiveSummary.compositionBreakdown.makanan)} Kg
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 px-2.5 font-medium">Sisa Buah</td>
                    <td className="py-1 px-2.5 text-right font-mono font-bold">
                      {fmt(executiveSummary.compositionBreakdown.sisaBuah)} Kg
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 px-2.5 font-medium">Sisa Sayur</td>
                    <td className="py-1 px-2.5 text-right font-mono font-bold">
                      {fmt(executiveSummary.compositionBreakdown.sisaSayur)} Kg
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 px-2.5 font-medium">Daun (Sapuan Jalan & Taman)</td>
                    <td className="py-1 px-2.5 text-right font-mono font-bold">
                      {fmt(executiveSummary.compositionBreakdown.daun)} Kg
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 font-medium">Pemanfaatan Pakan Ternak</td>
                    <td className="py-1 px-2.5 text-right font-mono font-bold">
                      {fmt(executiveSummary.totalPakan)} Kg
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">
                III. Fasilitas Pengolahan TPS3R
              </h4>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 px-2.5 font-medium">Biokonversi Maggot BSF</td>
                    <td className="py-1 px-2.5 text-right font-mono font-bold text-emerald-800">
                      {fmt(executiveSummary.totalMaggot)} Kg
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 px-2.5 font-medium">Open Windrow Compost (WDR)</td>
                    <td className="py-1 px-2.5 text-right font-mono font-bold text-emerald-800">
                      {fmt(executiveSummary.totalOpenWindrow)} Kg
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 font-medium">Tingkat Reduksi Sampah TPA</td>
                    <td className="py-1 px-2.5 text-right font-mono font-bold text-emerald-900">
                      {(
                        ((executiveSummary.totalTps3r + executiveSummary.totalPakan) /
                          (executiveSummary.grandTotal || 1)) *
                        100
                      ).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center print-avoid-break">
            <div>
              <p className="text-slate-500 mb-1">Mengetahui,</p>
              <p className="font-bold text-slate-900">Camat Ujung Pandang</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-950">Syahruddin, S.Sos., M.Si</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP. 19780512 200502 1 003</p>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Makassar, 21 Oktober 2026</p>
              <p className="font-bold text-slate-900">Koordinator TPS3R & Kebersihan</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-950">Mansyur Daeng Bella</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP. 19830419 201001 1 018</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
