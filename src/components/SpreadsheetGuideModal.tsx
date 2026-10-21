import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { KELURAHAN_LIST } from '../data/initialData';
import {
  FileSpreadsheet,
  Download,
  X,
  Table,
  Check,
  Layers,
  Copy,
  Info,
} from 'lucide-react';

interface SpreadsheetGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpreadsheetGuideModal: React.FC<SpreadsheetGuideModalProps> = ({ isOpen, onClose }) => {
  const { collectors, filteredRecords, exportToExcel } = useWasteData();
  const [activeTab, setActiveTab] = useState<'sheets' | 'formulas' | 'templates'>('sheets');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Function to download CSV template for Sheet 1 (Input Harian)
  const downloadInputTemplate = () => {
    const headers = [
      'No_Laporan',
      'Tanggal',
      'Kelurahan',
      'Makanan_TPA_Kg',
      'Makanan_TPS3R_Kg',
      'Sisa_Buah_TPA_Kg',
      'Sisa_Buah_TPS3R_Kg',
      'Sisa_Sayur_TPA_Kg',
      'Sisa_Sayur_TPS3R_Kg',
      'Daun_TPA_Kg',
      'Daun_TPS3R_Kg',
      'Nama_Petugas_Pakan',
      'Berat_Pakan_Kg',
      'Petugas_Input',
    ];

    const sampleRows = [
      'LPR-20261021-001,2026-10-21,BARU,170,760,0,0,0,0,0,0,Musliadi,45,Petugas Baru',
      'LPR-20261021-002,2026-10-21,BULOGADING,42,24,12,6,8,5,52,13,Ansu,46,Petugas Bulogading',
      'LPR-20261021-003,2026-10-21,BULOGADING,0,0,0,0,0,0,0,0,Awal Wahid,36,Petugas Bulogading',
      'LPR-20261021-004,2026-10-21,MALOKU,15,21,0,0,4,5,8,8,Erwin,50,Petugas Maloku',
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...sampleRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Template_Sheet1_INPUT_HARIAN.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download CSV template for Sheet 4 (Master Data)
  const downloadMasterDataTemplate = () => {
    const kelHeaders = ['Kode_Kelurahan', 'Nama_Kelurahan', 'Alamat_Kantor', 'Nama_Lurah', 'Kontak'];
    const kelRows = KELURAHAN_LIST.map(
      (k) => `${k.code},"${k.name}","${k.address}","${k.lurah}","${k.contact}"`
    );

    const collectorHeaders = ['ID_Petugas', 'Nama_Petugas', 'Kelurahan_Tugas', 'Status_Aktif'];
    const collectorRows = collectors.map(
      (c) => `${c.id},"${c.name}","${c.kelurahanId}",Aktif`
    );

    const fullContent = [
      '### TABEL 1: MASTER KELURAHAN ###',
      kelHeaders.join(','),
      ...kelRows,
      '',
      '### TABEL 2: MASTER PETUGAS PAKAN ###',
      collectorHeaders.join(','),
      ...collectorRows,
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + fullContent;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Template_Sheet4_MASTER_DATA.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sheetsList = [
    {
      num: 1,
      sheetName: 'INPUT_HARIAN',
      tableName: 'tbl_InputHarian',
      purpose: 'Formulir data transaksi/timbangan harian yang diisi oleh operator masing-masing kelurahan.',
      columns: [
        'No_Laporan',
        'Tanggal (YYYY-MM-DD)',
        'Kelurahan (Dropdown 10 Kelurahan)',
        'Makanan_TPA (Kg)',
        'Makanan_TPS3R (Kg)',
        'Sisa_Buah_TPA (Kg)',
        'Sisa_Buah_TPS3R (Kg)',
        'Sisa_Sayur_TPA (Kg)',
        'Sisa_Sayur_TPS3R (Kg)',
        'Daun_TPA (Kg)',
        'Daun_TPS3R (Kg)',
        'Nama_Petugas_Pakan',
        'Berat_Pakan_Kg (Kg)',
        'Total_TPA_Kg (Formula Otomatis)',
        'Total_TPS3R_Kg (Formula Otomatis)',
        'Grand_Total_Kg (Formula Otomatis)',
        'Operator_Input',
      ],
    },
    {
      num: 2,
      sheetName: 'REKAP_MATRIKS_BULANAN',
      tableName: 'tbl_RekapMatriks',
      purpose: 'Tabel matriks harian tanggal 1 s/d 31 untuk 10 kelurahan (format resmi kecamatan).',
      columns: [
        'Kelurahan / Sub-Kategori',
        'Alur_Tujuan (TPA / TPS3R / Pakan / Campur)',
        'Tgl_01, Tgl_02, ... s/d Tgl_31 (Kg)',
        'Total_Akumulasi_Bulan_Ini (Kg)',
        'Persentase_Kontribusi (%)',
      ],
    },
    {
      num: 3,
      sheetName: 'PENGOLAHAN_TPS3R',
      tableName: 'tbl_PengolahanTPS3R',
      purpose: 'Pencatatan pengolahan sirkular ekonomi di TPS3R Kecamatan (Biokonversi Maggot & Open Windrow).',
      columns: [
        'Tanggal',
        'Bahan_Baku_Organik_Masuk (Kg)',
        'Biokonversi_Maggot_BSF (Kg)',
        'Open_Windrow_WDR_Kompos (Kg)',
        'Residu_Terkirim_TPA (Kg)',
        'Tingkat_Reduksi (%)',
        'Petugas_TPS3R',
      ],
    },
    {
      num: 4,
      sheetName: 'MASTER_DATA',
      tableName: 'tbl_MasterKelurahan & tbl_MasterPetugas',
      purpose: 'Tabel referensi 10 kelurahan dan daftar petugas pengumpul pakan untuk Data Validation dropdown.',
      columns: [
        'Tabel 1: Kode_Kelurahan, Nama_Kelurahan, Nama_Lurah, Kontak',
        'Tabel 2: ID_Petugas, Nama_Petugas_Pakan, Kelurahan_Tugas, Status_Aktif',
      ],
    },
  ];

  const formulaList = [
    {
      name: 'Total TPA Harian di Sheet INPUT_HARIAN',
      formula: '=D2+F2+H2+J2',
      description: 'Menjumlahkan Makanan(TPA) + Sisa Buah(TPA) + Sisa Sayur(TPA) + Daun(TPA)',
    },
    {
      name: 'Total TPS3R Harian di Sheet INPUT_HARIAN',
      formula: '=E2+G2+I2+K2',
      description: 'Menjumlahkan Makanan(TPS3R) + Sisa Buah(TPS3R) + Sisa Sayur(TPS3R) + Daun(TPS3R)',
    },
    {
      name: 'Grand Total Harian per Kelurahan',
      formula: '=N2+O2+M2',
      description: 'Total TPA + Total TPS3R + Berat Pakan Kolektor',
    },
    {
      name: 'Rekap Otomatis per Kelurahan di Sheet REKAP_MATRIKS (SUMIFS)',
      formula: '=SUMIFS(INPUT_HARIAN!$P:$P, INPUT_HARIAN!$C:$C, "BARU", INPUT_HARIAN!$B:$B, DATE(2026,10,1))',
      description: 'Mengambil total sampah Kelurahan Baru pada tanggal 1 Oktober 2026 secara otomatis dari tabel Input Harian.',
    },
    {
      name: 'Total Pakan Petugas Tertentu (contoh Musliadi)',
      formula: '=SUMIFS(INPUT_HARIAN!$M:$M, INPUT_HARIAN!$L:$L, "Musliadi")',
      description: 'Menghitung total pakan yang berhasil dikumpulkan oleh petugas Musliadi dalam periode berjalan.',
    },
    {
      name: 'Tingkat Reduksi Sampah Kecamatan (% Diversion)',
      formula: '=(SUM(tbl_InputHarian[Total_TPS3R_Kg]) + SUM(tbl_InputHarian[Berat_Pakan_Kg])) / SUM(tbl_InputHarian[Grand_Total_Kg])',
      description: 'Menghitung persentase sampah yang berhasil dialihkan dari pembuangan TPA (sekitar 66%).',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base">
                Panduan Struktur Spreadsheet Excel / Google Sheets
              </h2>
              <p className="text-xs text-emerald-200">
                Rekomendasi nama sheet, nama tabel, kolom, dan rumus untuk Kecamatan Ujung Pandang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'sheets'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Daftar 4 Sheet & Nama Tabel
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'formulas'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Rumus Excel Otomatis
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Unduh Template CSV Siap Pakai
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Hero Download Card (Always visible at top of modal) */}
          <div className="bg-emerald-800 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-emerald-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded">
                  Format Resmi .XLSX
                </span>
                <span className="text-xs text-emerald-200">
                  4 Sheet Lengkap · Formula Otomatis
                </span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white mt-1">
                Unduh Workbook Spreadsheet Siap Pakai (.xlsx)
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Berisi Sheet <strong>INPUT_HARIAN</strong>, <strong>REKAP_MATRIKS_BULANAN</strong>, <strong>PENGOLAHAN_TPS3R</strong>, dan <strong>MASTER_DATA</strong> beserta data riil Oktober 2026.
              </p>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs rounded-xl shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Unduh File Excel (.xlsx)</span>
            </button>
          </div>

          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Rekomendasi Nama File:</strong>{' '}
                  <code className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                    REKAP_SAMPAH_KECAMATAN_UJUNG_PANDANG_2026.xlsx
                  </code>
                  <p className="mt-1 text-emerald-800">
                    Gunakan 4 sheet di bawah ini untuk memisahkan pencatatan harian, matriks bulanan, pengolahan TPS3R, dan master data penugasan petugas pakan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sheetsList.map((s) => (
                  <div
                    key={s.sheetName}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                          {s.num}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900">
                          Sheet: <span className="font-mono text-emerald-800">{s.sheetName}</span>
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        Tabel: {s.tableName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3">{s.purpose}</p>

                    <div className="border-t border-slate-100 pt-2.5">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                        Rincian Kolom:
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {s.columns.map((col, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">›</span>
                            <span className="font-mono text-[11px] text-slate-700">{col}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Salin rumus-rumus di bawah ini ke dalam file Excel atau Google Sheets Anda agar seluruh perhitungan total, persentase, dan rekap berjalan secara otomatis tanpa hitung manual.
              </p>

              <div className="space-y-3">
                {formulaList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                      <button
                        onClick={() => copyText(item.formula, idx)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2 py-1 rounded border border-emerald-200/60"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Rumus</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-slate-900 text-emerald-300 font-mono text-xs px-3 py-2 rounded-lg overflow-x-auto">
                      {item.formula}
                    </div>

                    <p className="text-[11px] text-slate-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Anda dapat langsung mengunduh template CSV siap pakai berikut. File ini bisa langsung dibuka di <strong>Microsoft Excel</strong> atau diimpor ke <strong>Google Sheets</strong>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                    <h4 className="font-bold text-xs text-slate-900">
                      Template Sheet 1: INPUT_HARIAN.csv
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Berisi baris header lengkap untuk 10 kelurahan, split TPA (Bosowa) vs TPS3R, dan input pakan kolektor dengan baris contoh data.
                  </p>
                  <button
                    onClick={downloadInputTemplate}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Template Input Harian</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Table className="w-5 h-5 text-emerald-700" />
                    <h4 className="font-bold text-xs text-slate-900">
                      Template Sheet 4: MASTER_DATA.csv
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Berisi tabel master 10 kelurahan (nama lurah & kontak) serta 9 nama petugas pakan resmi terdaftar di Ujung Pandang.
                  </p>
                  <button
                    onClick={downloadMasterDataTemplate}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Master Data & Petugas</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Disesuaikan dengan format resmi Kecamatan Ujung Pandang, Kota Makassar
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
