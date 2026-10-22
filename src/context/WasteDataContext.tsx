import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  KelurahanId,
  DailyRecord,
  PetugasCollector,
  Tps3rProcessing,
  FilterState,
  KelurahanSummary,
  KecamatanExecutiveSummary,
  OfficialDailyPengelolaan,
  OfficialDailyReportData,
  ResiduRecord,
  AnorganikRecord,
  AnorganikDailyRecord,
  AnorganikMatrixRow,
} from '../types/waste';
import {
  KELURAHAN_LIST,
  INITIAL_COLLECTORS,
  generateInitialDailyRecords,
  generateInitialTps3rProcessing,
  generateInitialOfficialPengelolaan,
  INITIAL_OFFICIAL_PENGELOLAAN,
} from '../data/initialData';
import {
  INITIAL_RESIDU_MATRIX,
  generateInitialResiduRecords,
  generateInitialAnorganikRecords,
  ResiduKelurahanRow,
} from '../data/residuData';
import {
  INITIAL_ANORGANIK_MOBIL_MATRIX,
  INITIAL_ANORGANIK_FUKUDA_MATRIX,
  INITIAL_ANORGANIK_GABUNGAN_MATRIX,
  generateInitialAnorganikDailyRecords,
} from '../data/anorganikData';
import { generateAndDownloadExcel } from '../utils/exportExcel';
import {
  DEFAULT_SPREADSHEET_ID,
  DEFAULT_APPS_SCRIPT_URL,
  fetchGoogleSheetsRecords,
  fetchAnorganikSheetsRecords,
  fetchResiduSheetsRecords,
  fetchHorekaSheetsRecords,
  pushRecordToGoogleAppsScript,
  pushAnorganikToGoogleAppsScript,
  pushResiduToGoogleAppsScript,
  pushHorekaToGoogleAppsScript,
} from '../utils/googleSheetsSync';

import {
  HorekaBusiness,
  HorekaDailyRecord,
  HOREKA_BUSINESSES,
  generateInitialHorekaRecords,
} from '../data/horekaData';

const STORAGE_KEYS = {
  RECORDS: 'sipesat_records_v1',
  COLLECTORS: 'sipesat_collectors_v1',
  TPS3R: 'sipesat_tps3r_v1',
  OFFICIAL_PENGELOLAAN: 'sipesat_official_pengelolaan_v1',
  RESIDU: 'sipesat_residu_v1',
  ANORGANIK: 'sipesat_anorganik_v1',
  ANORGANIK_DAILY: 'sipesat_anorganik_daily_v10',
  HOREKA_DAILY: 'sipesat_horeka_daily_v1',
  GOOGLE_SHEETS_ID: 'sipesat_gsheets_id_v1',
  GOOGLE_APPS_SCRIPT_URL: 'sipesat_gas_url_v1',
  LAST_SYNC_TIME: 'sipesat_last_sync_v1',
};

export type ActiveTab = 'dashboard' | 'residu' | 'official-format' | 'input' | 'table' | 'compliance';
export type InputSubTab = 'organik' | 'anorganik' | 'residu' | 'horeka';
export type RekapSubTab = 'organik' | 'anorganik' | 'residu' | 'horeka';

interface WasteDataContextType {
  records: DailyRecord[];
  collectors: PetugasCollector[];
  tps3rProcessing: Tps3rProcessing[];
  officialPengelolaan: OfficialDailyPengelolaan[];
  residuRecords: ResiduRecord[];
  anorganikRecords: AnorganikRecord[];
  anorganikDailyRecords: AnorganikDailyRecord[];
  horekaBusinesses: HorekaBusiness[];
  horekaDailyRecords: HorekaDailyRecord[];
  totalResiduKg: number;
  totalAnorganikKg: number;
  totalHorekaOrganikKg: number;
  totalHorekaAnorganikKg: number;
  totalHorekaResiduKg: number;
  totalHorekaGrandKg: number;
  residuMatrix: ResiduKelurahanRow[];
  anorganikMobilMatrix: AnorganikMatrixRow[];
  anorganikFukudaMatrix: AnorganikMatrixRow[];
  anorganikGabunganMatrix: AnorganikMatrixRow[];
  filter: FilterState;
  setFilter: (update: Partial<FilterState>) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeInputSubTab: InputSubTab;
  setActiveInputSubTab: (subTab: InputSubTab) => void;
  activeRekapSubTab: RekapSubTab;
  setActiveRekapSubTab: (subTab: RekapSubTab) => void;
  rekapColumnView: 'daily' | 'categories';
  setRekapColumnView: (view: 'daily' | 'categories') => void;
  rekapSearchQuery: string;
  setRekapSearchQuery: (query: string) => void;
  navigateToRekap: (
    subTab: RekapSubTab,
    options?: {
      columnView?: 'daily' | 'categories';
      searchQuery?: string;
    }
  ) => void;
  preselectedInputKelurahan: KelurahanId | null;
  setPreselectedInputKelurahan: (k: KelurahanId | null) => void;
  saveDailyRecord: (record: Omit<DailyRecord, 'id' | 'updatedAt'>) => Promise<void>;
  saveResiduRecord: (record: Omit<ResiduRecord, 'id' | 'updatedAt'>) => void;
  saveAnorganikRecord: (record: Omit<AnorganikRecord, 'id' | 'updatedAt'>) => void;
  saveAnorganikDailyRecord: (record: Omit<AnorganikDailyRecord, 'id' | 'updatedAt'>) => void;
  saveHorekaDailyRecord: (record: Omit<HorekaDailyRecord, 'updatedAt'>) => void;
  addCollector: (collector: Omit<PetugasCollector, 'id'>) => void;
  saveTps3rProcessing: (proc: Tps3rProcessing) => void;
  saveOfficialPengelolaan: (data: OfficialDailyPengelolaan) => void;
  resetToDefaultData: () => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  // Google Sheets Sync
  isSavingToSheets: boolean;
  lastPushResult: { success: boolean; message: string; isScriptError?: boolean } | null;
  clearLastPushResult: () => void;
  googleSheetsId: string;
  setGoogleSheetsId: (id: string) => void;
  googleAppsScriptUrl: string;
  setGoogleAppsScriptUrl: (url: string) => void;
  lastSyncTime: string | null;
  isSyncing: boolean;
  syncMessage: { type: 'success' | 'error'; text: string } | null;
  syncFromGoogleSheets: () => Promise<void>;
  // Computed aggregations
  filteredRecords: DailyRecord[];
  executiveSummary: KecamatanExecutiveSummary;
  kelurahanSummaries: KelurahanSummary[];
  dailyTrendData: {
    date: string;
    dayLabel: string;
    dayNum: number;
    tpa: number;
    tps3r: number;
    pakan: number;
    total: number;
  }[];
  compositionData: {
    name: string;
    value: number;
    color: string;
    percentage: number;
  }[];
  getRecordForDateAndKelurahan: (date: string, kelurahanId: KelurahanId) => DailyRecord | undefined;
  getComplianceForDate: (date: string) => {
    kelurahanId: KelurahanId;
    name: string;
    submitted: boolean;
    totalKg: number;
    record?: DailyRecord;
  }[];
  getOfficialReportForDate: (date: string) => OfficialDailyReportData;
  exportToCsv: () => void;
  exportToExcel: () => void;
}


const WasteDataContext = createContext<WasteDataContextType | undefined>(undefined);

export const WasteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<DailyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading records from localStorage:', e);
    }
    return generateInitialDailyRecords();
  });

  const [collectors, setCollectors] = useState<PetugasCollector[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COLLECTORS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading collectors from localStorage:', e);
    }
    return INITIAL_COLLECTORS;
  });

  const [tps3rProcessing, setTps3rProcessing] = useState<Tps3rProcessing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TPS3R);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading TPS3R processing from localStorage:', e);
    }
    return generateInitialTps3rProcessing();
  });

  const [officialPengelolaan, setOfficialPengelolaan] = useState<OfficialDailyPengelolaan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFICIAL_PENGELOLAAN);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading official pengelolaan from localStorage:', e);
    }
    return INITIAL_OFFICIAL_PENGELOLAAN;
  });

  const [residuRecords, setResiduRecords] = useState<ResiduRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESIDU);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading residu records from localStorage:', e);
    }
    return generateInitialResiduRecords();
  });

  const [anorganikRecords, setAnorganikRecords] = useState<AnorganikRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANORGANIK);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading anorganik records from localStorage:', e);
    }
    return generateInitialAnorganikRecords();
  });

  const [anorganikDailyRecords, setAnorganikDailyRecords] = useState<AnorganikDailyRecord[]>(() => {
    try {
      // Clean up legacy keys if present
      ['sipesat_anorganik_daily_v1', 'sipesat_anorganik_daily_v2', 'sipesat_anorganik_daily_v3', 'sipesat_anorganik_v1'].forEach((k) => {
        localStorage.removeItem(k);
      });

      const saved = localStorage.getItem(STORAGE_KEYS.ANORGANIK_DAILY);
      if (saved) {
        const parsed: AnorganikDailyRecord[] = JSON.parse(saved);
        const sum = parsed.reduce((acc, r) => acc + (r.totalKg || 0), 0);
        if (sum >= 12000) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading anorganik daily records from localStorage:', e);
    }
    return generateInitialAnorganikDailyRecords();
  });

  const [horekaDailyRecords, setHorekaDailyRecords] = useState<HorekaDailyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOREKA_DAILY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading horeka daily records from localStorage:', e);
    }
    return generateInitialHorekaRecords();
  });

  const [activeInputSubTab, setActiveInputSubTab] = useState<InputSubTab>('organik');
  const [activeRekapSubTab, setActiveRekapSubTab] = useState<RekapSubTab>('organik');
  const [rekapColumnView, setRekapColumnView] = useState<'daily' | 'categories'>('daily');
  const [rekapSearchQuery, setRekapSearchQuery] = useState<string>('');

  const navigateToRekap = (
    subTab: RekapSubTab,
    options?: {
      columnView?: 'daily' | 'categories';
      searchQuery?: string;
    }
  ) => {
    setActiveRekapSubTab(subTab);
    if (options?.columnView) {
      setRekapColumnView(options.columnView);
    }
    if (options?.searchQuery !== undefined) {
      setRekapSearchQuery(options.searchQuery);
    } else {
      setRekapSearchQuery('');
    }
    setActiveTab('table');
    // Scroll smoothly to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [filter, setFilterState] = useState<FilterState>({
    month: '2026-10',
    startDate: '2026-10-01',
    endDate: '2026-10-22',
    kelurahanId: 'ALL',
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [preselectedInputKelurahan, setPreselectedInputKelurahan] = useState<KelurahanId | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Google Sheets & Apps Script Sync State
  const [googleSheetsId, setGoogleSheetsId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEETS_ID);
      if (saved) return saved;
    } catch (e) {}
    return DEFAULT_SPREADSHEET_ID;
  });

  const [googleAppsScriptUrl, setGoogleAppsScriptUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOOGLE_APPS_SCRIPT_URL);
      if (
        saved &&
        saved.trim().length > 0 &&
        saved.includes('AKfycbxgHPesDIemOQxCiqQGP6VXjt1Mucag46FeozgO5rQsvowC9NOGKpp3ONgEjOKTRfjJBQ')
      ) {
        return saved;
      }
    } catch (e) {}
    return DEFAULT_APPS_SCRIPT_URL;
  });

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
    } catch (e) {}
    return null;
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingToSheets, setIsSavingToSheets] = useState<boolean>(false);
  const [lastPushResult, setLastPushResult] = useState<{
    success: boolean;
    message: string;
    isScriptError?: boolean;
  } | null>(null);

  const clearLastPushResult = () => setLastPushResult(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage:', e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(collectors));
    } catch (e) {
      console.error('Failed to save collectors to localStorage:', e);
    }
  }, [collectors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TPS3R, JSON.stringify(tps3rProcessing));
    } catch (e) {
      console.error('Failed to save tps3r processing to localStorage:', e);
    }
  }, [tps3rProcessing]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFICIAL_PENGELOLAAN, JSON.stringify(officialPengelolaan));
    } catch (e) {
      console.error('Failed to save official pengelolaan to localStorage:', e);
    }
  }, [officialPengelolaan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESIDU, JSON.stringify(residuRecords));
    } catch (e) {
      console.error('Failed to save residu records to localStorage:', e);
    }
  }, [residuRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANORGANIK, JSON.stringify(anorganikRecords));
    } catch (e) {
      console.error('Failed to save anorganik records to localStorage:', e);
    }
  }, [anorganikRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANORGANIK_DAILY, JSON.stringify(anorganikDailyRecords));
    } catch (e) {
      console.error('Failed to save anorganik daily records to localStorage:', e);
    }
  }, [anorganikDailyRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOREKA_DAILY, JSON.stringify(horekaDailyRecords));
    } catch (e) {
      console.error('Failed to save horeka daily records to localStorage:', e);
    }
  }, [horekaDailyRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEETS_ID, googleSheetsId);
    } catch (e) {}
  }, [googleSheetsId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_APPS_SCRIPT_URL, googleAppsScriptUrl);
    } catch (e) {}
  }, [googleAppsScriptUrl]);

  // Toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const setFilter = (update: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...update }));
  };

  // Sync from Google Sheets (Fetch CSV/API from live spreadsheet for all sheets)
  const syncFromGoogleSheets = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const [orgRes, anorgRes, resRes, horRes] = await Promise.all([
        fetchGoogleSheetsRecords(googleSheetsId, googleAppsScriptUrl),
        fetchAnorganikSheetsRecords(googleSheetsId, googleAppsScriptUrl),
        fetchResiduSheetsRecords(googleSheetsId, googleAppsScriptUrl),
        fetchHorekaSheetsRecords(googleSheetsId, googleAppsScriptUrl),
      ]);

      let updatedCount = 0;

      if (orgRes.success && orgRes.records.length > 0) {
        setRecords(orgRes.records);
        updatedCount += orgRes.records.length;
      }
      if (anorgRes.success && anorgRes.records.length > 0) {
        setAnorganikDailyRecords(anorgRes.records);
        updatedCount += anorgRes.records.length;
      }
      if (resRes.success && resRes.records.length > 0) {
        setResiduRecords(resRes.records);
        updatedCount += resRes.records.length;
      }
      if (horRes.success && horRes.records.length > 0) {
        setHorekaDailyRecords(horRes.records);
        updatedCount += horRes.records.length;
      }

      const now = new Date().toISOString();
      setLastSyncTime(now);
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, now);
      } catch (e) {}

      setSyncMessage({
        type: 'success',
        text: `Berhasil menyinkronkan data langsung dari Google Sheets!`,
      });
      setToastMessage(`Sinkronisasi sukses! Data terhubung langsung dengan Google Sheets.`);
    } catch (err: any) {
      setSyncMessage({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan saat menyinkronkan data.',
      });
      setToastMessage('Gagal menyinkronkan data.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto sync on initial mount
  useEffect(() => {
    syncFromGoogleSheets();
  }, []);

  const saveDailyRecord = async (newRecord: Omit<DailyRecord, 'id' | 'updatedAt'>) => {
    const id = `${newRecord.date}_${newRecord.kelurahanId}`;
    const recordWithMeta: DailyRecord = {
      ...newRecord,
      id,
      updatedAt: new Date().toISOString(),
    };

    setRecords((prev) => {
      const existsIndex = prev.findIndex((r) => r.id === id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = recordWithMeta;
        return copy;
      }
      return [...prev, recordWithMeta];
    });

    if (googleAppsScriptUrl) {
      setIsSavingToSheets(true);
      try {
        const res = await pushRecordToGoogleAppsScript(googleAppsScriptUrl, newRecord);
        setLastPushResult(res);
        setToastMessage("Data Berhasil Di Simpan");
      } catch (err: any) {
        const errObj = {
          success: false,
          isScriptError: false,
          message: err?.message || 'Gagal menghubungi server Google Apps Script.',
        };
        setLastPushResult(errObj);
        setToastMessage("Data Berhasil Di Simpan");
      } finally {
        setIsSavingToSheets(false);
      }
    } else {
      setToastMessage("Data Berhasil Di Simpan");
    }
  };

  const addCollector = (collector: Omit<PetugasCollector, 'id'>) => {
    const newCollector: PetugasCollector = {
      ...collector,
      id: `col-${Date.now()}-${collector.name.toLowerCase().replace(/\s+/g, '-')}`,
    };
    setCollectors((prev) => [...prev, newCollector]);
    setToastMessage(`Petugas pakan "${collector.name}" berhasil ditambahkan ke Kelurahan ${collector.kelurahanId}.`);
  };

  const saveTps3rProcessing = (proc: Tps3rProcessing) => {
    setTps3rProcessing((prev) => {
      const index = prev.findIndex((p) => p.date === proc.date);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = proc;
        return copy;
      }
      return [...prev, proc];
    });
    setToastMessage("Data Berhasil Di Simpan");
  };

  const saveOfficialPengelolaan = (data: OfficialDailyPengelolaan) => {
    setOfficialPengelolaan((prev) => {
      const idx = prev.findIndex((p) => p.date === data.date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = data;
        return next;
      }
      return [...prev, data];
    });
    setToastMessage("Data Berhasil Di Simpan");
  };

  const saveResiduRecord = async (record: Omit<ResiduRecord, 'id' | 'updatedAt'>) => {
    const id = `${record.date}_${record.kelurahanId}`;
    const newRecord: ResiduRecord = {
      ...record,
      id,
      updatedAt: new Date().toISOString(),
    };
    setResiduRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newRecord;
        return copy;
      }
      return [...prev, newRecord];
    });

    if (googleAppsScriptUrl) {
      setIsSavingToSheets(true);
      try {
        const res = await pushResiduToGoogleAppsScript(googleAppsScriptUrl, {
          date: record.date,
          kelurahanId: record.kelurahanId,
          beratKg: record.beratKg,
          catatan: record.catatan,
          submittedBy: record.submittedBy,
        });
        setLastPushResult(res);
        setToastMessage("Data Berhasil Di Simpan");
      } catch (err: any) {
        setLastPushResult({ success: false, message: 'Gagal menghubungi Google Apps Script.' });
        setToastMessage("Data Berhasil Di Simpan");
      } finally {
        setIsSavingToSheets(false);
      }
    } else {
      setToastMessage("Data Berhasil Di Simpan");
    }
  };

  const saveAnorganikRecord = (record: Omit<AnorganikRecord, 'id' | 'updatedAt'>) => {
    const id = `${record.date}_${record.kelurahanId}`;
    const newRecord: AnorganikRecord = {
      ...record,
      id,
      updatedAt: new Date().toISOString(),
    };
    setAnorganikRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newRecord;
        return copy;
      }
      return [...prev, newRecord];
    });
    setToastMessage("Data Berhasil Di Simpan");
  };

  const saveAnorganikDailyRecord = async (record: Omit<AnorganikDailyRecord, 'id' | 'updatedAt'>) => {
    const id = `${record.date}_${record.kelurahanId}`;
    const totalKg = (record.satgasMobilKg || 0) + (record.satgasFukudaKg || 0);
    const newRecord: AnorganikDailyRecord = {
      ...record,
      totalKg,
      id,
      updatedAt: new Date().toISOString(),
    };
    setAnorganikDailyRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newRecord;
        return copy;
      }
      return [...prev, newRecord];
    });

    if (googleAppsScriptUrl) {
      setIsSavingToSheets(true);
      try {
        const res = await pushAnorganikToGoogleAppsScript(googleAppsScriptUrl, {
          date: record.date,
          kelurahanId: record.kelurahanId,
          satgasMobilKg: record.satgasMobilKg,
          satgasFukudaKg: record.satgasFukudaKg,
          catatan: record.catatan,
          submittedBy: record.submittedBy,
        });
        setLastPushResult(res);
        setToastMessage("Data Berhasil Di Simpan");
      } catch (err: any) {
        setLastPushResult({ success: false, message: 'Gagal menghubungi Google Apps Script.' });
        setToastMessage("Data Berhasil Di Simpan");
      } finally {
        setIsSavingToSheets(false);
      }
    } else {
      setToastMessage("Data Berhasil Di Simpan");
    }
  };

  const saveHorekaDailyRecord = async (record: Omit<HorekaDailyRecord, 'updatedAt'>) => {
    const newRecord: HorekaDailyRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    setHorekaDailyRecords((prev) => {
      const idx = prev.findIndex((r) => r.date === record.date && r.horekaId === record.horekaId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newRecord;
        return copy;
      }
      return [...prev, newRecord];
    });

    const business = HOREKA_BUSINESSES.find((b) => b.id === record.horekaId);
    const namaUsaha = business ? business.namaUsaha : record.horekaId;
    const alamat = business ? business.alamatUsaha : '-';

    if (googleAppsScriptUrl) {
      setIsSavingToSheets(true);
      try {
        const res = await pushHorekaToGoogleAppsScript(googleAppsScriptUrl, {
          date: record.date,
          horekaId: record.horekaId,
          namaUsaha,
          kelurahanId: record.kelurahanId,
          alamat,
          organikKg: record.organikKg,
          anorganikKg: record.anorganikKg,
          residuKg: record.residuKg,
          operatorName: record.operatorName,
        });
        setLastPushResult(res);
        setToastMessage("Data Berhasil Di Simpan");
      } catch (err: any) {
        setLastPushResult({ success: false, message: 'Gagal menghubungi Google Apps Script.' });
        setToastMessage("Data Berhasil Di Simpan");
      } finally {
        setIsSavingToSheets(false);
      }
    } else {
      setToastMessage("Data Berhasil Di Simpan");
    }
  };

  const resetToDefaultData = () => {
    const initialRecords = generateInitialDailyRecords();
    const initialProc = generateInitialTps3rProcessing();
    const initialOfficial = generateInitialOfficialPengelolaan();
    setRecords(initialRecords);
    setCollectors(INITIAL_COLLECTORS);
    setTps3rProcessing(initialProc);
    setOfficialPengelolaan(initialOfficial);
    setResiduRecords(generateInitialResiduRecords());
    setAnorganikRecords(generateInitialAnorganikRecords());
    setAnorganikDailyRecords(generateInitialAnorganikDailyRecords());
    setHorekaDailyRecords(generateInitialHorekaRecords());
    setFilterState({
      month: '2026-10',
      startDate: '2026-10-01',
      endDate: '2026-10-21',
      kelurahanId: 'ALL',
    });
    setToastMessage('Data berhasil direset ke dataset resmi Oktober 2026.');
  };

  // Matrix and total for Residu
  const residuMatrix = useMemo<ResiduKelurahanRow[]>(() => {
    return INITIAL_RESIDU_MATRIX.map((base) => {
      const dailyKg: { [day: number]: number } = { ...base.dailyKg };
      let sum = 0;
      for (let day = 1; day <= 30; day++) {
        const dStr = day < 10 ? `0${day}` : `${day}`;
        const dateKey = `2026-10-${dStr}`;
        const match = residuRecords.find((r) => r.kelurahanId === base.kelurahanId && r.date === dateKey);
        if (match) {
          dailyKg[day] = match.beratKg;
        }
        sum += dailyKg[day] || 0;
      }
      return {
        ...base,
        dailyKg,
        totalKg: sum,
      };
    });
  }, [residuRecords]);

  // Matrices for Anorganik (Satgas Mobil, Satgas Fukuda, Total Gabungan)
  const anorganikMobilMatrix = useMemo<AnorganikMatrixRow[]>(() => {
    return INITIAL_ANORGANIK_MOBIL_MATRIX.map((base) => {
      const dailyKg: { [day: number]: number } = { ...base.dailyKg };
      let sum = 0;
      for (let day = 1; day <= 30; day++) {
        const dStr = day < 10 ? `0${day}` : `${day}`;
        const dateKey = `2026-10-${dStr}`;
        const match = anorganikDailyRecords.find((r) => r.kelurahanId === base.kelurahanId && r.date === dateKey);
        if (match) {
          dailyKg[day] = match.satgasMobilKg ?? 0;
        }
        sum += dailyKg[day] || 0;
      }
      return {
        ...base,
        dailyKg,
        totalKg: sum,
      };
    });
  }, [anorganikDailyRecords]);

  const anorganikFukudaMatrix = useMemo<AnorganikMatrixRow[]>(() => {
    return INITIAL_ANORGANIK_FUKUDA_MATRIX.map((base) => {
      const dailyKg: { [day: number]: number } = { ...base.dailyKg };
      let sum = 0;
      for (let day = 1; day <= 30; day++) {
        const dStr = day < 10 ? `0${day}` : `${day}`;
        const dateKey = `2026-10-${dStr}`;
        const match = anorganikDailyRecords.find((r) => r.kelurahanId === base.kelurahanId && r.date === dateKey);
        if (match) {
          dailyKg[day] = match.satgasFukudaKg ?? 0;
        }
        sum += dailyKg[day] || 0;
      }
      return {
        ...base,
        dailyKg,
        totalKg: sum,
      };
    });
  }, [anorganikDailyRecords]);

  const anorganikGabunganMatrix = useMemo<AnorganikMatrixRow[]>(() => {
    return INITIAL_ANORGANIK_GABUNGAN_MATRIX.map((base) => {
      const dailyKg: { [day: number]: number } = { ...base.dailyKg };
      let sum = 0;
      for (let day = 1; day <= 30; day++) {
        const dStr = day < 10 ? `0${day}` : `${day}`;
        const dateKey = `2026-10-${dStr}`;
        const match = anorganikDailyRecords.find((r) => r.kelurahanId === base.kelurahanId && r.date === dateKey);
        if (match) {
          dailyKg[day] = match.totalKg ?? ((match.satgasMobilKg || 0) + (match.satgasFukudaKg || 0));
        }
        sum += dailyKg[day] || 0;
      }
      return {
        ...base,
        dailyKg,
        totalKg: sum,
      };
    });
  }, [anorganikDailyRecords]);

  const totalResiduKg = useMemo(() => {
    let sum = 0;
    const startDay = filter.startDate ? parseInt(filter.startDate.split('-')[2], 10) : 1;
    const endDay = filter.endDate ? parseInt(filter.endDate.split('-')[2], 10) : 31;

    for (const row of residuMatrix) {
      if (filter.kelurahanId !== 'ALL' && row.kelurahanId !== filter.kelurahanId) continue;
      for (let day = startDay; day <= endDay; day++) {
        sum += row.dailyKg[day] || 0;
      }
    }
    return sum;
  }, [residuMatrix, filter]);

  const totalAnorganikKg = useMemo(() => {
    let sum = 0;
    const startDay = filter.startDate ? parseInt(filter.startDate.split('-')[2], 10) : 1;
    const endDay = filter.endDate ? parseInt(filter.endDate.split('-')[2], 10) : 31;

    for (const row of anorganikGabunganMatrix) {
      if (filter.kelurahanId !== 'ALL' && row.kelurahanId !== filter.kelurahanId) continue;
      for (let day = startDay; day <= endDay; day++) {
        sum += row.dailyKg[day] || 0;
      }
    }
    return sum;
  }, [anorganikGabunganMatrix, filter]);

  const filteredHorekaRecords = useMemo(() => {
    return horekaDailyRecords.filter((r) => {
      if (filter.startDate && r.date < filter.startDate) return false;
      if (filter.endDate && r.date > filter.endDate) return false;
      if (filter.kelurahanId !== 'ALL' && r.kelurahanId !== filter.kelurahanId) return false;
      return true;
    });
  }, [horekaDailyRecords, filter]);

  const totalHorekaOrganikKg = useMemo(() => {
    return filteredHorekaRecords.reduce((sum, r) => sum + (r.organikKg || 0), 0);
  }, [filteredHorekaRecords]);

  const totalHorekaAnorganikKg = useMemo(() => {
    return filteredHorekaRecords.reduce((sum, r) => sum + (r.anorganikKg || 0), 0);
  }, [filteredHorekaRecords]);

  const totalHorekaResiduKg = useMemo(() => {
    return filteredHorekaRecords.reduce((sum, r) => sum + (r.residuKg || 0), 0);
  }, [filteredHorekaRecords]);

  const totalHorekaGrandKg = totalHorekaOrganikKg + totalHorekaAnorganikKg + totalHorekaResiduKg;

  const getRecordForDateAndKelurahan = (date: string, kelurahanId: KelurahanId) => {
    return records.find((r) => r.date === date && r.kelurahanId === kelurahanId);
  };

  // Filtered records based on active date range and kelurahan
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesDate = r.date >= filter.startDate && r.date <= filter.endDate;
      const matchesKelurahan = filter.kelurahanId === 'ALL' || r.kelurahanId === filter.kelurahanId;
      return matchesDate && matchesKelurahan;
    });
  }, [records, filter]);

  // Kelurahan summaries within the filtered date range
  const kelurahanSummaries = useMemo<KelurahanSummary[]>(() => {
    const dateFiltered = records.filter(
      (r) => r.date >= filter.startDate && r.date <= filter.endDate
    );

    // Sum overall across all kelurahan to calculate percentage shares
    let totalAll = 0;

    const map = new Map<KelurahanId, {
      tpa: number;
      tps3r: number;
      pakan: number;
      makanan: number;
      buah: number;
      sayur: number;
      daun: number;
      collectorMap: Map<string, number>;
    }>();

    for (const k of KELURAHAN_LIST) {
      map.set(k.id, {
        tpa: 0,
        tps3r: 0,
        pakan: 0,
        makanan: 0,
        buah: 0,
        sayur: 0,
        daun: 0,
        collectorMap: new Map(),
      });
    }

    for (const r of dateFiltered) {
      const entry = map.get(r.kelurahanId);
      if (!entry) continue;

      const tpaPart =
        (r.composition.makananTpa || 0) +
        (r.composition.sisaBuahTpa || 0) +
        (r.composition.sisaSayurTpa || 0) +
        (r.composition.daunTpa || 0);

      const tps3rPart =
        (r.composition.makananTps3r || 0) +
        (r.composition.sisaBuahTps3r || 0) +
        (r.composition.sisaSayurTps3r || 0) +
        (r.composition.daunTps3r || 0);

      let pakanPart = 0;
      if (r.pakanInputs) {
        for (const p of r.pakanInputs) {
          const w = p.weightKg || 0;
          pakanPart += w;
          const curr = entry.collectorMap.get(p.collectorName) || 0;
          entry.collectorMap.set(p.collectorName, curr + w);
        }
      }

      entry.tpa += tpaPart;
      entry.tps3r += tps3rPart;
      entry.pakan += pakanPart;
      entry.makanan += (r.composition.makananTpa || 0) + (r.composition.makananTps3r || 0);
      entry.buah += (r.composition.sisaBuahTpa || 0) + (r.composition.sisaBuahTps3r || 0);
      entry.sayur += (r.composition.sisaSayurTpa || 0) + (r.composition.sisaSayurTps3r || 0);
      entry.daun += (r.composition.daunTpa || 0) + (r.composition.daunTps3r || 0);

      totalAll += (tpaPart + tps3rPart + pakanPart);
    }

    const summaries: KelurahanSummary[] = KELURAHAN_LIST.map((meta) => {
      const stats = map.get(meta.id)!;
      const grandTotal = stats.tpa + stats.tps3r + stats.pakan;
      const percentageShare = totalAll > 0 ? (grandTotal / totalAll) * 100 : 0;

      const collectorsList = Array.from(stats.collectorMap.entries()).map(([name, totalKg]) => ({
        name,
        totalKg,
      }));

      return {
        kelurahanId: meta.id,
        kelurahanName: meta.name,
        totalTpa: stats.tpa,
        totalTps3r: stats.tps3r,
        totalPakan: stats.pakan,
        grandTotal,
        percentageShare,
        makananTotal: stats.makanan,
        sisaBuahTotal: stats.buah,
        sisaSayurTotal: stats.sayur,
        daunTotal: stats.daun,
        collectors: collectorsList,
      };
    });

    return summaries.sort((a, b) => b.grandTotal - a.grandTotal);
  }, [records, filter.startDate, filter.endDate]);

  // Executive summary aggregations
  const executiveSummary = useMemo<KecamatanExecutiveSummary>(() => {
    let grandTotal = 0;
    let totalTpa = 0;
    let totalTps3r = 0;
    let totalPakan = 0;
    let makanan = 0;
    let daun = 0;
    let sisaBuah = 0;
    let sisaSayur = 0;

    for (const r of filteredRecords) {
      const c = r.composition;
      const rTpa = (c.makananTpa || 0) + (c.sisaBuahTpa || 0) + (c.sisaSayurTpa || 0) + (c.daunTpa || 0);
      const rTps3r = (c.makananTps3r || 0) + (c.sisaBuahTps3r || 0) + (c.sisaSayurTps3r || 0) + (c.daunTps3r || 0);
      let rPakan = 0;
      if (r.pakanInputs) {
        for (const p of r.pakanInputs) {
          rPakan += p.weightKg || 0;
        }
      }

      totalTpa += rTpa;
      totalTps3r += rTps3r;
      totalPakan += rPakan;
      grandTotal += (rTpa + rTps3r + rPakan);

      makanan += (c.makananTpa || 0) + (c.makananTps3r || 0);
      daun += (c.daunTpa || 0) + (c.daunTps3r || 0);
      sisaBuah += (c.sisaBuahTpa || 0) + (c.sisaBuahTps3r || 0);
      sisaSayur += (c.sisaSayurTpa || 0) + (c.sisaSayurTps3r || 0);
    }

    // Filter TPS3R processing by date
    const filteredProc = tps3rProcessing.filter(
      (p) => p.date >= filter.startDate && p.date <= filter.endDate
    );
    const totalMaggot = filteredProc.reduce((acc, curr) => acc + (curr.maggotKg || 0), 0);
    const totalOpenWindrow = filteredProc.reduce((acc, curr) => acc + (curr.openWindrowKg || 0), 0);

    const percentTpa = grandTotal > 0 ? (totalTpa / grandTotal) * 100 : 0;
    const percentTps3r = grandTotal > 0 ? (totalTps3r / grandTotal) * 100 : 0;
    const percentPakan = grandTotal > 0 ? (totalPakan / grandTotal) * 100 : 0;

    return {
      grandTotal,
      totalTpa,
      totalTps3r,
      totalPakan,
      percentTpa,
      percentTps3r,
      percentPakan,
      totalMaggot,
      totalOpenWindrow,
      compositionBreakdown: {
        makanan,
        daun,
        pakan: totalPakan,
        sisaBuah,
        sisaSayur,
      },
    };
  }, [filteredRecords, tps3rProcessing, filter.startDate, filter.endDate]);

  // Daily Trend Data from filter.startDate to filter.endDate
  const dailyTrendData = useMemo(() => {
    // Collect unique dates in range sorted
    const dayMap = new Map<string, { tpa: number; tps3r: number; pakan: number; total: number }>();

    for (const r of filteredRecords) {
      if (!dayMap.has(r.date)) {
        dayMap.set(r.date, { tpa: 0, tps3r: 0, pakan: 0, total: 0 });
      }
      const entry = dayMap.get(r.date)!;

      const tpa = (r.composition.makananTpa || 0) + (r.composition.sisaBuahTpa || 0) + (r.composition.sisaSayurTpa || 0) + (r.composition.daunTpa || 0);
      const tps3r = (r.composition.makananTps3r || 0) + (r.composition.sisaBuahTps3r || 0) + (r.composition.sisaSayurTps3r || 0) + (r.composition.daunTps3r || 0);
      let pakan = 0;
      if (r.pakanInputs) {
        for (const p of r.pakanInputs) {
          pakan += p.weightKg || 0;
        }
      }

      entry.tpa += tpa;
      entry.tps3r += tps3r;
      entry.pakan += pakan;
      entry.total += (tpa + tps3r + pakan);
    }

    const sortedDates = Array.from(dayMap.keys()).sort();

    return sortedDates.map((date) => {
      const stats = dayMap.get(date)!;
      const dayNum = parseInt(date.split('-')[2], 10);
      return {
        date,
        dayLabel: `Tgl ${dayNum}`,
        dayNum,
        tpa: stats.tpa,
        tps3r: stats.tps3r,
        pakan: stats.pakan,
        total: stats.total,
      };
    });
  }, [filteredRecords]);

  // Composition data for donut chart
  const compositionData = useMemo(() => {
    const comp = executiveSummary.compositionBreakdown;
    const total = executiveSummary.grandTotal;

    const items = [
      { name: 'Makanan', value: comp.makanan, color: '#10b981' }, // Emerald
      { name: 'Pakan', value: comp.pakan, color: '#f59e0b' }, // Amber
      { name: 'Daun', value: comp.daun, color: '#065f46' }, // Dark Green
      { name: 'Sisa Buah', value: comp.sisaBuah, color: '#0284c7' }, // Sky Blue
      { name: 'Sisa Sayur', value: comp.sisaSayur, color: '#8b5cf6' }, // Purple
    ];

    return items.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }, [executiveSummary]);

  // Compliance for a specific date (e.g. today or user selected)
  const getComplianceForDate = (date: string) => {
    return KELURAHAN_LIST.map((kel) => {
      const record = records.find((r) => r.date === date && r.kelurahanId === kel.id);
      const isLaeLae = kel.id === 'LAE-LAE';
      const submitted = Boolean(record && (isLaeLae ? record.submittedBy : (
        (record.composition.makananTpa || 0) +
        (record.composition.makananTps3r || 0) +
        (record.composition.daunTpa || 0) +
        (record.composition.sisaBuahTpa || 0) +
        (record.composition.sisaSayurTpa || 0) +
        (record.pakanInputs?.reduce((sum, p) => sum + p.weightKg, 0) || 0) > 0
      )));

      let totalKg = 0;
      if (record) {
        totalKg =
          (record.composition.makananTpa || 0) +
          (record.composition.makananTps3r || 0) +
          (record.composition.sisaBuahTpa || 0) +
          (record.composition.sisaBuahTps3r || 0) +
          (record.composition.sisaSayurTpa || 0) +
          (record.composition.sisaSayurTps3r || 0) +
          (record.composition.daunTpa || 0) +
          (record.composition.daunTps3r || 0) +
          (record.pakanInputs?.reduce((s, p) => s + p.weightKg, 0) || 0);
      }

      return {
        kelurahanId: kel.id,
        name: kel.name,
        submitted,
        totalKg,
        record,
      };
    });
  };

  // Official Daily Recap report according to official Kecamatan format
  const getOfficialReportForDate = (date: string): OfficialDailyReportData => {
    // Parse date parts directly from YYYY-MM-DD
    const [yearStr, monthStr, dayStr] = date.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    const d = new Date(Date.UTC(year, month, day, 12, 0, 0));

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    const dayName = dayNames[d.getUTCDay()];
    const monthName = monthNames[month];
    const formattedFullDate = `Hari ${dayName}, ${day} ${monthName} ${year}`;

    // Official order matching government list
    const officialOrder: KelurahanId[] = [
      'BARU',
      'BULOGADING',
      'LAJANGIRU',
      'LOSARI',
      'MALOKU',
      'MANGKURA',
      'PISANG SELATAN',
      'PISANG UTARA',
      'SAWERIGADING',
      'LAE-LAE',
    ];

    let totalSampahOrganik = 0;
    const kelurahanList = officialOrder.map((kelId, index) => {
      const kelMeta = KELURAHAN_LIST.find((k) => k.id === kelId);
      const rec = records.find((r) => r.date === date && r.kelurahanId === kelId);
      let weightKg = 0;
      if (rec) {
        const c = rec.composition;
        const compSum =
          (c.makananTpa || 0) +
          (c.makananTps3r || 0) +
          (c.sisaBuahTpa || 0) +
          (c.sisaBuahTps3r || 0) +
          (c.sisaSayurTpa || 0) +
          (c.sisaSayurTps3r || 0) +
          (c.daunTpa || 0) +
          (c.daunTps3r || 0);
        const pakanSum = rec.pakanInputs?.reduce((sum, p) => sum + (p.weightKg || 0), 0) || 0;
        weightKg = compSum + pakanSum;
      }
      totalSampahOrganik += weightKg;
      return {
        no: index + 1,
        name: kelMeta?.name.replace('Kelurahan ', '') || kelId,
        kelurahanId: kelId,
        weightKg,
      };
    });

    let existingPengelolaan = officialPengelolaan.find((p) => p.date === date);
    if (!existingPengelolaan) {
      const tps3r = tps3rProcessing.find((t) => t.date === date);
      const pakanTotal = records
        .filter((r) => r.date === date)
        .reduce(
          (sum, r) => sum + (r.pakanInputs?.reduce((s, p) => s + (p.weightKg || 0), 0) || 0),
          0
        );

      const maggotKg = tps3r?.maggotKg || 0;
      const openWdrKg = tps3r?.openWindrowKg || 0;
      const bintang5 = Math.max(0, totalSampahOrganik - pakanTotal - maggotKg - openWdrKg);

      existingPengelolaan = {
        date,
        kapasaBosowaKg: 0,
        bintang5Kg: bintang5,
        pengelolaanTebaKg: 0,
        pakanTernakKg: pakanTotal,
        pengelolaanBioporiKg: 0,
        tps3rKarebosiMaggotKg: maggotKg,
        tps3rKarebosiOpenWindrowKg: openWdrKg,
        raisedBedKg: 0,
      };
    }

    const p = existingPengelolaan;
    const totalTps3rKarebosi = (p.tps3rKarebosiMaggotKg || 0) + (p.tps3rKarebosiOpenWindrowKg || 0);
    const totalPengelolaan =
      (p.kapasaBosowaKg || 0) +
      (p.bintang5Kg || 0) +
      (p.pengelolaanTebaKg || 0) +
      (p.pakanTernakKg || 0) +
      (p.pengelolaanBioporiKg || 0) +
      totalTps3rKarebosi +
      (p.raisedBedKg || 0);

    // Filter to active kelurahan (or standard 9 when Lae-Lae is 0, like official WhatsApp format)
    const activeKelurahan = kelurahanList.filter((k) => k.weightKg > 0);
    const displayedKelurahan = activeKelurahan.length > 0 ? activeKelurahan : kelurahanList.slice(0, 9);
    const kelurahanLines = displayedKelurahan
      .map((k, i) => `${i + 1}. ${k.name} —  ${k.weightKg.toLocaleString('id-ID')} Kg`)
      .join('\n');

    const whatsAppText = `REKAP SAMPAH ORGANIK KECAMATAN UJUNG PANDANG\n\n${formattedFullDate}\n\n${kelurahanLines}\n\nTOTAL SAMPAH ORGANIK : ${totalSampahOrganik.toLocaleString('id-ID')} Kg\n\nPENGELOLAAN SAMPAH ORGANIK \n* Kapasa (Bosowa) : ${p.kapasaBosowaKg.toLocaleString('id-ID')} Kg\n* Bintang 5 : ${p.bintang5Kg.toLocaleString('id-ID')} Kg\n* Pengelolaan Teba : ${p.pengelolaanTebaKg.toLocaleString('id-ID')} Kg\n* Pakan Ternak : ${p.pakanTernakKg.toLocaleString('id-ID')} Kg\n* Pengelolaan Biopori : ${p.pengelolaanBioporiKg.toLocaleString('id-ID')} Kg\n* TPS3R KAREBOSI: ${totalTps3rKarebosi.toLocaleString('id-ID')} Kg\n       '-Maggot : ${p.tps3rKarebosiMaggotKg.toLocaleString('id-ID')} Kg\n       '-Open Windrow : ${p.tps3rKarebosiOpenWindrowKg.toLocaleString('id-ID')} Kg\n* Raised bed : ${p.raisedBedKg.toLocaleString('id-ID')} Kg\n\nTOTAL PENGELOLAAN:  ${totalPengelolaan.toLocaleString('id-ID')} Kg`;

    return {
      date,
      dayName,
      formattedFullDate,
      kelurahanList,
      totalSampahOrganik,
      pengelolaan: p,
      totalPengelolaan,
      whatsAppText,
    };
  };

  // Export to CSV
  const exportToCsv = () => {
    const headers = [
      'Tanggal',
      'Kelurahan',
      'Makanan (TPA)',
      'Makanan (TPS3R)',
      'Sisa Buah (TPA)',
      'Sisa Buah (TPS3R)',
      'Sisa Sayur (TPA)',
      'Sisa Sayur (TPS3R)',
      'Daun (TPA)',
      'Daun (TPS3R)',
      'Total TPA (Kg)',
      'Total TPS3R (Kg)',
      'Total Pakan (Kg)',
      'Grand Total (Kg)',
      'Rincian Petugas Pakan',
    ];

    const rows = filteredRecords.map((r) => {
      const c = r.composition;
      const tpa = (c.makananTpa || 0) + (c.sisaBuahTpa || 0) + (c.sisaSayurTpa || 0) + (c.daunTpa || 0);
      const tps3r = (c.makananTps3r || 0) + (c.sisaBuahTps3r || 0) + (c.sisaSayurTps3r || 0) + (c.daunTps3r || 0);
      const pakan = r.pakanInputs?.reduce((s, p) => s + p.weightKg, 0) || 0;
      const grand = tpa + tps3r + pakan;
      const collectorsDetail = r.pakanInputs?.map((p) => `${p.collectorName}: ${p.weightKg}Kg`).join('; ') || '-';

      return [
        r.date,
        r.kelurahanId,
        c.makananTpa || 0,
        c.makananTps3r || 0,
        c.sisaBuahTpa || 0,
        c.sisaBuahTps3r || 0,
        c.sisaSayurTpa || 0,
        c.sisaSayurTps3r || 0,
        c.daunTpa || 0,
        c.daunTps3r || 0,
        tpa,
        tps3r,
        pakan,
        grand,
        `"${collectorsDetail}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Sampah_Kecamatan_Ujung_Pandang_${filter.startDate}_sd_${filter.endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Laporan CSV berhasil diunduh.');
  };

  // Export to genuine multi-sheet Excel (.xlsx)
  const exportToExcel = () => {
    try {
      generateAndDownloadExcel(
        records,
        collectors,
        tps3rProcessing,
        residuRecords,
        anorganikDailyRecords,
        horekaDailyRecords
      );
      setToastMessage('File Excel (.xlsx) 9 Sheet lengkap berhasil diunduh!');
    } catch (e) {
      console.error('Failed to export Excel:', e);
      setToastMessage('Gagal membuat file Excel.');
    }
  };

  return (
    <WasteDataContext.Provider
      value={{
        residuRecords,
        anorganikRecords,
        anorganikDailyRecords,
        horekaBusinesses: HOREKA_BUSINESSES,
        horekaDailyRecords,
        totalResiduKg,
        totalAnorganikKg,
        totalHorekaOrganikKg,
        totalHorekaAnorganikKg,
        totalHorekaResiduKg,
        totalHorekaGrandKg,
        residuMatrix,
        anorganikMobilMatrix,
        anorganikFukudaMatrix,
        anorganikGabunganMatrix,
        activeInputSubTab,
        setActiveInputSubTab,
        activeRekapSubTab,
        setActiveRekapSubTab,
        rekapColumnView,
        setRekapColumnView,
        rekapSearchQuery,
        setRekapSearchQuery,
        navigateToRekap,
        saveResiduRecord,
        saveAnorganikRecord,
        saveAnorganikDailyRecord,
        saveHorekaDailyRecord,
        records,
        collectors,
        tps3rProcessing,
        officialPengelolaan,
        filter,
        setFilter,
        activeTab,
        setActiveTab,
        preselectedInputKelurahan,
        setPreselectedInputKelurahan,
        saveDailyRecord,
        addCollector,
        saveTps3rProcessing,
        saveOfficialPengelolaan,
        resetToDefaultData,
        toastMessage,
        setToastMessage,
        googleSheetsId,
        setGoogleSheetsId,
        googleAppsScriptUrl,
        setGoogleAppsScriptUrl,
        lastSyncTime,
        isSyncing,
        syncMessage,
        syncFromGoogleSheets,
        isSavingToSheets,
        lastPushResult,
        clearLastPushResult,
        filteredRecords,
        executiveSummary,
        kelurahanSummaries,
        dailyTrendData,
        compositionData,
        getRecordForDateAndKelurahan,
        getComplianceForDate,
        getOfficialReportForDate,
        exportToCsv,
        exportToExcel,
      }}
    >
      {children}
    </WasteDataContext.Provider>
  );
};

export const useWasteData = () => {
  const context = useContext(WasteDataContext);
  if (!context) {
    throw new Error('useWasteData must be used within a WasteDataProvider');
  }
  return context;
};
