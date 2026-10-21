export type KelurahanId =
  | 'BARU'
  | 'BULOGADING'
  | 'LAE-LAE'
  | 'LAJANGIRU'
  | 'LOSARI'
  | 'MALOKU'
  | 'MANGKURA'
  | 'PISANG SELATAN'
  | 'PISANG UTARA'
  | 'SAWERIGADING';

export interface PetugasCollector {
  id: string;
  name: string;
  kelurahanId: KelurahanId;
  phone?: string;
  active: boolean;
}

export interface WasteComposition {
  makananTpa: number;
  makananTps3r: number;
  sisaBuahTpa: number;
  sisaBuahTps3r: number;
  sisaSayurTpa: number;
  sisaSayurTps3r: number;
  daunTpa: number;
  daunTps3r: number;
}

export interface PakanCollectorInput {
  collectorId: string;
  collectorName: string;
  weightKg: number;
}

export interface DailyRecord {
  id: string;
  date: string; // Format: YYYY-MM-DD
  kelurahanId: KelurahanId;
  composition: WasteComposition;
  pakanInputs: PakanCollectorInput[];
  updatedAt: string;
  submittedBy?: string;
}

export interface Tps3rProcessing {
  date: string; // Format: YYYY-MM-DD
  maggotKg: number;
  openWindrowKg: number;
}

export interface KelurahanMeta {
  id: KelurahanId;
  name: string;
  code: string;
  address: string;
  lurah: string;
  contact: string;
  defaultCollectors: string[];
}

export interface FilterState {
  month: string; // '2026-10'
  startDate: string; // '2026-10-01'
  endDate: string; // '2026-10-21'
  kelurahanId: KelurahanId | 'ALL';
}

export interface KelurahanSummary {
  kelurahanId: KelurahanId;
  kelurahanName: string;
  totalTpa: number;
  totalTps3r: number;
  totalPakan: number;
  grandTotal: number;
  percentageShare: number;
  makananTotal: number;
  sisaBuahTotal: number;
  sisaSayurTotal: number;
  daunTotal: number;
  collectors: { name: string; totalKg: number }[];
}

export interface KecamatanExecutiveSummary {
  grandTotal: number;
  totalTpa: number;
  totalTps3r: number;
  totalPakan: number;
  percentTpa: number;
  percentTps3r: number;
  percentPakan: number;
  totalMaggot: number;
  totalOpenWindrow: number;
  compositionBreakdown: {
    makanan: number;
    daun: number;
    pakan: number;
    sisaBuah: number;
    sisaSayur: number;
  };
}

export interface OfficialDailyPengelolaan {
  date: string; // Format: YYYY-MM-DD
  kapasaBosowaKg: number;
  bintang5Kg: number;
  pengelolaanTebaKg: number;
  pakanTernakKg: number;
  pengelolaanBioporiKg: number;
  tps3rKarebosiMaggotKg: number;
  tps3rKarebosiOpenWindrowKg: number;
  raisedBedKg: number;
}

export interface OfficialDailyReportData {
  date: string;
  dayName: string;
  formattedFullDate: string;
  kelurahanList: {
    no: number;
    name: string;
    kelurahanId: KelurahanId;
    weightKg: number;
  }[];
  totalSampahOrganik: number;
  pengelolaan: OfficialDailyPengelolaan;
  totalPengelolaan: number;
  whatsAppText: string;
}

