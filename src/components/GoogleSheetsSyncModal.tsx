import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import {
  FileSpreadsheet,
  X,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Code2,
  CheckCircle2,
  AlertCircle,
  Link2,
  HelpCircle,
  Send,
  Sparkles,
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/googleAppsScriptCode';
import {
  DEFAULT_SPREADSHEET_ID,
  DEFAULT_APPS_SCRIPT_URL,
  fetchGoogleSheetsRecords,
  testAppsScriptConnection,
  sendTestRecordToGoogleSheets,
} from '../utils/googleSheetsSync';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    googleSheetsId,
    setGoogleSheetsId,
    googleAppsScriptUrl,
    setGoogleAppsScriptUrl,
    lastSyncTime,
    syncFromGoogleSheets,
    isSyncing,
    syncMessage,
  } = useWasteData();

  const [activeTab, setActiveTab] = useState<'status' | 'code' | 'tutorial'>('status');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [tempScriptUrl, setTempScriptUrl] = useState<string>(googleAppsScriptUrl || DEFAULT_APPS_SCRIPT_URL);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: 'active' | 'reference_error' | 'missing_doget' | 'unreachable';
    message: string;
  } | null>(null);

  const [isTestingWrite, setIsTestingWrite] = useState<boolean>(false);
  const [writeTestResult, setWriteTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.error('Failed to copy code: ', e);
    }
  };

  const handleSaveScriptUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleAppsScriptUrl(tempScriptUrl.trim());
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    const url = (tempScriptUrl || googleAppsScriptUrl || '').trim();
    if (!url) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testAppsScriptConnection(url);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 'unreachable',
        message: err?.message || 'Gagal menghubungi server Apps Script.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestWrite = async () => {
    const url = (tempScriptUrl || googleAppsScriptUrl || '').trim();
    if (!url) return;
    setIsTestingWrite(true);
    setWriteTestResult(null);
    try {
      const res = await sendTestRecordToGoogleSheets(url);
      setWriteTestResult(res);
    } catch (err: any) {
      setWriteTestResult({
        success: false,
        message: err?.message || 'Gagal mengirim data uji coba ke Spreadsheet.',
      });
    } finally {
      setIsTestingWrite(false);
    }
  };

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${googleSheetsId || DEFAULT_SPREADSHEET_ID}/edit`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
              <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">Sinkronisasi Google Spreadsheet</h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded-full border border-white/20">
                  ID: {googleSheetsId?.substring(0, 12)}...
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">
                Terhubung dengan spreadsheet resmi & API Google Apps Script
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Status & Tarik Data</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Kode Google Apps Script</span>
          </button>

          <button
            onClick={() => setActiveTab('tutorial')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'tutorial'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Panduan Pasang (Tutorial)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* TAB 1: STATUS & PULL DATA */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Spreadsheet Connection Info Box */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                      Spreadsheet Terhubung
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-700 bg-white/80 px-2.5 py-1 rounded border border-emerald-200/60 inline-block">
                    {googleSheetsId}
                  </div>
                  <div className="text-[11px] text-emerald-900">
                    {lastSyncTime
                      ? `Terakhir disinkronkan: ${new Date(lastSyncTime).toLocaleString('id-ID')}`
                      : 'Belum pernah disinkronkan pada sesi ini'}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={syncFromGoogleSheets}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Menyinkronkan...' : 'Tarik Data dari Spreadsheet'}</span>
                  </button>

                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 font-medium rounded-lg text-xs transition-colors border border-slate-300 shadow-2xs"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                </div>
              </div>

              {/* Sync Result Banner */}
              {syncMessage && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    syncMessage.type === 'success'
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                      : 'bg-amber-100/70 border-amber-300 text-amber-900'
                  }`}
                >
                  {syncMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  )}
                  <span className="font-medium">{syncMessage.text}</span>
                </div>
              )}

              {/* Two-Way Push: Google Apps Script Web App URL */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-emerald-700" />
                      <span>URL Web App Google Apps Script (Sinkronisasi Otomatis 2-Arah)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      URL Web App digunakan agar setiap input harian kelurahan di web langsung tersimpan ke spreadsheet Anda secara real-time.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-auto shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>URL Aktif</span>
                  </span>
                </div>

                <form onSubmit={handleSaveScriptUrl} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={tempScriptUrl}
                      onChange={(e) => setTempScriptUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-slate-800"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
                      >
                        Simpan URL
                      </button>
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>{isTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTestWrite}
                        disabled={isTestingWrite}
                        className="flex items-center gap-1.5 px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                        title="Kirim 1 baris data uji coba langsung ke sheet INPUT_HARIAN"
                      >
                        <Send className={`w-3.5 h-3.5 ${isTestingWrite ? 'animate-spin' : ''}`} />
                        <span>{isTestingWrite ? 'Mengirim...' : 'Tes Tulis 1 Baris ke Sheet'}</span>
                      </button>
                    </div>
                  </div>

                  {tempScriptUrl !== DEFAULT_APPS_SCRIPT_URL && (
                    <button
                      type="button"
                      onClick={() => setTempScriptUrl(DEFAULT_APPS_SCRIPT_URL)}
                      className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Kembalikan ke URL Aktif Default:</span>
                      <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                        AKfycbwF_30eYsRZDUBSXB3DNB4ByWsRPaHyz8N4tziyRaVqvdv0gkLDH1KhiTO8cWvljMlPcw
                      </code>
                    </button>
                  )}
                </form>

                {/* Direct Write Test Result Banner */}
                {writeTestResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      writeTestResult.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {writeTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                      )}
                      <span>
                        {writeTestResult.success
                          ? 'Tes Tulis Berhasil! Data Masuk ke Google Spreadsheet!'
                          : 'Tes Tulis Gagal: Data Belum Masuk ke Spreadsheet'}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed pl-6">{writeTestResult.message}</p>
                    {writeTestResult.success && (
                      <div className="pl-6 pt-1">
                        <a
                          href={spreadsheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 font-bold underline hover:text-emerald-900"
                        >
                          <span>Buka Google Spreadsheet untuk Memeriksa Baris Baru</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Connection Test Diagnostic Banner */}
                {testResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      testResult.status === 'active'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : testResult.status === 'reference_error'
                        ? 'bg-rose-50 border-2 border-rose-400 text-rose-950'
                        : testResult.status === 'missing_doget'
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 font-bold">
                      {testResult.status === 'active' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="block text-sm">
                          {testResult.status === 'active'
                            ? 'Koneksi Berhasil & Siap Simpan!'
                            : testResult.status === 'reference_error'
                            ? 'Penyebab Terdeteksi: Kode di Google Apps Script Terpotong (ReferenceError)'
                            : testResult.status === 'missing_doget'
                            ? 'Fungsi doGet/doPost Belum Dideploy di Versi Baru'
                            : 'Koneksi ke Google Apps Script Gagal'}
                        </span>
                        <p className="text-[11px] font-normal leading-relaxed mt-1">{testResult.message}</p>
                      </div>
                    </div>

                    {testResult.status === 'reference_error' && (
                      <div className="bg-white/90 rounded-lg p-3 border border-rose-200 text-[11px] space-y-2 mt-2">
                        <strong className="text-slate-900 block font-semibold">
                          Cara Memperbaiki Agar Update & Tambah Data Masuk ke Spreadsheet:
                        </strong>
                        <ol className="list-decimal list-inside space-y-1 text-slate-700">
                          <li>Klik tombol <strong>"Salin Seluruh Kode Baru"</strong> di bawah.</li>
                          <li>Buka Google Spreadsheet &gt; menu <strong>Ekstensi &gt; Apps Script</strong>.</li>
                          <li>Hapus SEMUA baris di file <code>Kode.gs</code> lama, lalu <strong>Paste/Tempel</strong> seluruh kode baru.</li>
                          <li>Tekan <strong>Ctrl + S</strong> (Simpan).</li>
                          <li>
                            Klik tombol biru <strong>Terapkan (Deploy)</strong> &gt; pilih <strong>Kelola deployment</strong> &gt; klik <strong>ikon Pensil (Edit)</strong> &gt; ubah Versi menjadi <strong>Versi baru (New version)</strong> &gt; klik <strong>Terapkan</strong>.
                          </li>
                        </ol>
                        <div className="pt-1 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedCode ? 'Seluruh Kode Tersalin!' : 'Salin Seluruh Kode Lengkap (324 Baris)'}</span>
                          </button>
                          <a
                            href={spreadsheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded font-semibold text-xs text-slate-800 flex items-center gap-1"
                          >
                            <span>Buka Google Spreadsheet Saya</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {testResult.status === 'missing_doget' && (
                      <div className="pl-6 pt-1 text-[11px] text-amber-800">
                        <strong>Langkah Perbaikan:</strong> Buka spreadsheet Anda &gt; menu{' '}
                        <strong>Ekstensi &gt; Apps Script</strong> &gt; tempel kode dari tab{' '}
                        <button
                          onClick={() => setActiveTab('code')}
                          className="font-bold underline text-emerald-800 hover:text-emerald-950"
                        >
                          "Kode Google Apps Script"
                        </button>
                        , tekan <strong>Ctrl + S</strong>, lalu klik{' '}
                        <strong>Deploy &gt; Kelola deployment &gt; Edit (pensil) &gt; Versi: Versi Baru &gt; Terapkan</strong>.
                      </div>
                    )}
                  </div>
                )}

                {googleAppsScriptUrl && !testResult && !writeTestResult && (
                  <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      URL Web App aktif. Klik tombol <strong>"Tes Tulis 1 Baris ke Sheet"</strong> di atas untuk memverifikasi apakah penulisan ke Google Spreadsheet Anda berjalan normal.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: APPS SCRIPT CODE */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Kode Google Apps Script SAPU-UP (Lengkap 324 Baris - Siap Tempel)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Buka Spreadsheet &gt; menu <strong>Ekstensi &gt; Apps Script</strong>, hapus <strong>SEMUA</strong> kode lama di <code>Kode.gs</code>, lalu tempel seluruh kode berikut:
                  </p>
                </div>

                <button
                  onClick={handleCopyCode}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    copiedCode
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Kode Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Seluruh Kode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Box */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>Kode.gs / Code.gs</span>
                  <span>JavaScript / Google Apps Script</span>
                </div>
                <pre className="p-4 text-xs font-mono overflow-x-auto max-h-[380px] leading-relaxed select-all">
                  <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP TUTORIAL */}
          {activeTab === 'tutorial' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Langkah-Langkah Memasang Google Apps Script di Spreadsheet Anda
                </h4>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900">Buka Spreadsheet Anda:</strong>
                      <p className="mt-0.5 text-slate-600">
                        Buka spreadsheet dengan link:{' '}
                        <a
                          href={spreadsheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 font-mono underline"
                        >
                          {spreadsheetUrl}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900">Buka Editor Apps Script:</strong>
                      <p className="mt-0.5 text-slate-600">
                        Pada menu bagian atas Google Sheets, klik menu <strong>Ekstensi (Extensions)</strong> &gt; pilih <strong>Apps Script</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900">Tempelkan Kode Script:</strong>
                      <p className="mt-0.5 text-slate-600">
                        Hapus kode bawaan (<code className="bg-slate-200 px-1 py-0.5 rounded">function myFunction()</code>), lalu salin seluruh kode dari tab <em>"Kode Google Apps Script"</em> di atas dan tempelkan. Tekan <strong>Ctrl + S</strong> untuk menyimpan.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      4
                    </span>
                    <div>
                      <strong className="text-slate-900">Terapkan Sebagai Web App (Deploy):</strong>
                      <p className="mt-0.5 text-slate-600">
                        Klik tombol biru <strong>Terapkan (Deploy)</strong> di pojok kanan atas &gt; pilih <strong>Penerapan baru (New deployment)</strong>.
                      </p>
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                        <li>Pilih jenis roda gigi: <strong>Aplikasi Web (Web App)</strong>.</li>
                        <li>Deskripsi: <em>SIPESAT Sync API</em></li>
                        <li>Jalankan sebagai: <strong>Saya (email akun Anda)</strong></li>
                        <li>Siapa yang memiliki akses: <strong>Siapa saja (Anyone)</strong></li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      5
                    </span>
                    <div>
                      <strong className="text-slate-900">Salin URL Web App:</strong>
                      <p className="mt-0.5 text-slate-600">
                        Setelah menekan <em>Deploy</em> dan memberikan izin akses Google, Anda akan mendapatkan URL Web App yang berakhiran <code className="bg-slate-200 px-1 py-0.5 rounded">/exec</code>. Tempelkan URL tersebut ke kolom di tab <em>"Status & Tarik Data"</em>.
                      </p>
                    </div>
                  </div>

                  {/* Troubleshooting Callout */}
                  <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl space-y-2 mt-2">
                    <strong className="text-amber-950 font-bold flex items-center gap-1.5 text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Penting: Cara Memperbarui Kode jika Muncul "找不到以下指令碼函式：doGet"</span>
                    </strong>
                    <p className="text-amber-900 text-[11px] leading-relaxed">
                      Jika saat pengujian muncul pesan fungsi <em>doGet tidak ditemukan</em>, itu artinya Web App masih menjalankan kode bawaan sebelumnya. Lakukan langkah berikut:
                    </p>
                    <ol className="list-decimal pl-5 text-[11px] text-amber-950 space-y-1 font-medium">
                      <li>Buka editor Apps Script di spreadsheet Anda.</li>
                      <li>Pastikan seluruh isi file kode telah diganti dengan kode dari tab <strong>"Kode Google Apps Script"</strong>.</li>
                      <li>Tekan <strong>Ctrl + S</strong> untuk menyimpan file.</li>
                      <li>Klik <strong>Deploy (Terapkan) &gt; Kelola deployment (Manage deployments)</strong>.</li>
                      <li>Klik <strong>ikon Pensil (Edit)</strong> pada deployment aktif Anda.</li>
                      <li>Pada menu dropdown Versi, pilih <strong>Versi baru (New version)</strong>, lalu klik tombol <strong>Terapkan (Deploy)</strong>.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Spreadsheet ID: <code className="font-mono text-slate-700">{googleSheetsId}</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
