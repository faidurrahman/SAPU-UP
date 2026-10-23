import {
  KelurahanId,
  KelurahanMeta,
  PetugasCollector,
  DailyRecord,
  Tps3rProcessing,
  OfficialDailyPengelolaan,
} from '../types/waste';

export const KELURAHAN_LIST: KelurahanMeta[] = [
  {
    id: 'BARU',
    name: 'Kelurahan Baru',
    code: '73.71.01.1001',
    address: 'Jl. Ahmad Yani No. 12',
    lurah: 'H. Syamsuddin, S.Sos',
    contact: '0812-4211-001',
    defaultCollectors: ['Musliadi'],
  },
  {
    id: 'BULOGADING',
    name: 'Kelurahan Bulogading',
    code: '73.71.01.1002',
    address: 'Jl. Somba Opu No. 45',
    lurah: 'Dra. Hj. Nurhaedah',
    contact: '0812-4211-002',
    defaultCollectors: ['Ansu', 'Awal Wahid'],
  },
  {
    id: 'LAE-LAE',
    name: 'Kelurahan Lae-Lae',
    code: '73.71.01.1003',
    address: 'Pulau Lae-Lae Dermaga Kayu Bangkoa',
    lurah: 'Muhammad Aris, SE',
    contact: '0812-4211-003',
    defaultCollectors: [],
  },
  {
    id: 'LAJANGIRU',
    name: 'Kelurahan Lajangiru',
    code: '73.71.01.1004',
    address: 'Jl. Ince Nurdin No. 18',
    lurah: 'Andi Baso, S.STP',
    contact: '0812-4211-004',
    defaultCollectors: [],
  },
  {
    id: 'LOSARI',
    name: 'Kelurahan Losari',
    code: '73.71.01.1005',
    address: 'Jl. Penghibur No. 88',
    lurah: 'Faisal Akbar, S.IP',
    contact: '0812-4211-005',
    defaultCollectors: ['Hasrul'],
  },
  {
    id: 'MALOKU',
    name: 'Kelurahan Maloku',
    code: '73.71.01.1006',
    address: 'Jl. Kajaolalido No. 24',
    lurah: 'Rahmatia, S.Sos',
    contact: '0812-4211-006',
    defaultCollectors: ['Erwin', 'Samsir'],
  },
  {
    id: 'MANGKURA',
    name: 'Kelurahan Mangkura',
    code: '73.71.01.1007',
    address: 'Jl. Botolempangan No. 31',
    lurah: 'Sudirman, S.Pd',
    contact: '0812-4211-007',
    defaultCollectors: ['Malalengga', 'Abd. Rahman'],
  },
  {
    id: 'PISANG SELATAN',
    name: 'Kelurahan Pisang Selatan',
    code: '73.71.01.1008',
    address: 'Jl. Gunung Merapi No. 7',
    lurah: 'Hasnah, S.Sos',
    contact: '0812-4211-008',
    defaultCollectors: [],
  },
  {
    id: 'PISANG UTARA',
    name: 'Kelurahan Pisang Utara',
    code: '73.71.01.1009',
    address: 'Jl. Gunung Latimojong No. 15',
    lurah: 'Irwan, SE',
    contact: '0812-4211-009',
    defaultCollectors: [],
  },
  {
    id: 'SAWERIGADING',
    name: 'Kelurahan Sawerigading',
    code: '73.71.01.1010',
    address: 'Jl. Sawerigading No. 10',
    lurah: 'Drs. H. Mappatunru',
    contact: '0812-4211-010',
    defaultCollectors: ['Nurdin Aco'],
  },
];

export const INITIAL_COLLECTORS: PetugasCollector[] = [
  { id: 'col-musliadi', name: 'Musliadi', kelurahanId: 'BARU', active: true },
  { id: 'col-ansu', name: 'Ansu', kelurahanId: 'BULOGADING', active: true },
  { id: 'col-awal', name: 'Awal Wahid', kelurahanId: 'BULOGADING', active: true },
  { id: 'col-hasrul', name: 'Hasrul', kelurahanId: 'LOSARI', active: true },
  { id: 'col-erwin', name: 'Erwin', kelurahanId: 'MALOKU', active: true },
  { id: 'col-samsir', name: 'Samsir', kelurahanId: 'MALOKU', active: true },
  { id: 'col-malalengga', name: 'Malalengga', kelurahanId: 'MANGKURA', active: true },
  { id: 'col-abd-rahman', name: 'Abd. Rahman', kelurahanId: 'MANGKURA', active: true },
  { id: 'col-nurdin-aco', name: 'Nurdin Aco', kelurahanId: 'SAWERIGADING', active: true },
];

/**
 * Deterministically splits an exact cumulative integer across 21 days
 * with realistic daily variation, ensuring sum equals exact target.
 */
function distributeOver21Days(total: number, weights: number[]): number[] {
  if (total === 0) return new Array(21).fill(0);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const result: number[] = [];
  let allocated = 0;

  for (let i = 0; i < 20; i++) {
    const share = Math.round((total * weights[i]) / totalWeight);
    result.push(share);
    allocated += share;
  }
  // 21st day gets the exact remainder
  result.push(total - allocated);
  return result;
}

// 21 standard day-of-month weights simulating typical waste generation rhythm
const DAY_WEIGHTS = [
  1.02, 0.98, 1.05, 1.12, 0.95, 0.91, 1.04,
  1.00, 0.97, 1.06, 1.08, 0.93, 0.96, 1.03,
  0.99, 1.01, 1.07, 1.10, 0.94, 0.92, 1.07,
];

// Seed cumulative targets per kelurahan matching the exact October 2026 dataset
interface KelurahanCumulativeSpec {
  kelurahanId: KelurahanId;
  makananTpa: number;
  makananTps3r: number;
  sisaBuahTpa: number;
  sisaBuahTps3r: number;
  sisaSayurTpa: number;
  sisaSayurTps3r: number;
  daunTpa: number;
  daunTps3r: number;
  collectors: { id: string; name: string; targetKg: number }[];
}

const CUMULATIVE_SPECS: KelurahanCumulativeSpec[] = [
  {
    kelurahanId: 'BARU',
    makananTpa: 3591,
    makananTps3r: 16063,
    sisaBuahTpa: 0,
    sisaBuahTps3r: 0,
    sisaSayurTpa: 0,
    sisaSayurTps3r: 0,
    daunTpa: 0,
    daunTps3r: 0,
    collectors: [{ id: 'col-musliadi', name: 'Musliadi', targetKg: 966 }],
  },
  {
    kelurahanId: 'BULOGADING',
    makananTpa: 886,
    makananTps3r: 518,
    sisaBuahTpa: 248,
    sisaBuahTps3r: 120,
    sisaSayurTpa: 180,
    sisaSayurTps3r: 100,
    daunTpa: 1099,
    daunTps3r: 280,
    collectors: [
      { id: 'col-ansu', name: 'Ansu', targetKg: 971 },
      { id: 'col-awal', name: 'Awal Wahid', targetKg: 755 },
    ],
  },
  {
    kelurahanId: 'LAE-LAE',
    makananTpa: 0,
    makananTps3r: 0,
    sisaBuahTpa: 0,
    sisaBuahTps3r: 0,
    sisaSayurTpa: 0,
    sisaSayurTps3r: 0,
    daunTpa: 0,
    daunTps3r: 0,
    collectors: [],
  },
  {
    kelurahanId: 'LAJANGIRU',
    makananTpa: 92,
    makananTps3r: 0,
    sisaBuahTpa: 115,
    sisaBuahTps3r: 0,
    sisaSayurTpa: 91,
    sisaSayurTps3r: 0,
    daunTpa: 216,
    daunTps3r: 0,
    collectors: [],
  },
  {
    kelurahanId: 'LOSARI',
    makananTpa: 55,
    makananTps3r: 0,
    sisaBuahTpa: 7,
    sisaBuahTps3r: 0,
    sisaSayurTpa: 0,
    sisaSayurTps3r: 0,
    daunTpa: 1498,
    daunTps3r: 0,
    collectors: [{ id: 'col-hasrul', name: 'Hasrul', targetKg: 547 }],
  },
  {
    kelurahanId: 'MALOKU',
    makananTpa: 320,
    makananTps3r: 441,
    sisaBuahTpa: 0,
    sisaBuahTps3r: 0,
    sisaSayurTpa: 80,
    sisaSayurTps3r: 107,
    daunTpa: 178,
    daunTps3r: 167,
    collectors: [
      { id: 'col-erwin', name: 'Erwin', targetKg: 1056 },
      { id: 'col-samsir', name: 'Samsir', targetKg: 989 },
    ],
  },
  {
    kelurahanId: 'MANGKURA',
    makananTpa: 910,
    makananTps3r: 649,
    sisaBuahTpa: 490,
    sisaBuahTps3r: 326,
    sisaSayurTpa: 115,
    sisaSayurTps3r: 87,
    daunTpa: 606,
    daunTps3r: 402,
    collectors: [
      { id: 'col-malalengga', name: 'Malalengga', targetKg: 571 },
      { id: 'col-abd-rahman', name: 'Abd. Rahman', targetKg: 758 },
    ],
  },
  {
    kelurahanId: 'PISANG SELATAN',
    makananTpa: 170,
    makananTps3r: 10,
    sisaBuahTpa: 90,
    sisaBuahTps3r: 3,
    sisaSayurTpa: 13,
    sisaSayurTps3r: 0,
    daunTpa: 96,
    daunTps3r: 2,
    collectors: [],
  },
  {
    kelurahanId: 'PISANG UTARA',
    makananTpa: 55,
    makananTps3r: 338,
    sisaBuahTpa: 0,
    sisaBuahTps3r: 0,
    sisaSayurTpa: 0,
    sisaSayurTps3r: 0,
    daunTpa: 0,
    daunTps3r: 0,
    collectors: [],
  },
  {
    kelurahanId: 'SAWERIGADING',
    makananTpa: 480,
    makananTps3r: 43,
    sisaBuahTpa: 0,
    sisaBuahTps3r: 0,
    sisaSayurTpa: 0,
    sisaSayurTps3r: 0,
    daunTpa: 2209,
    daunTps3r: 0,
    collectors: [{ id: 'col-nurdin-aco', name: 'Nurdin Aco', targetKg: 737 }],
  },
];

// Day 20 exact values mapping for full authenticity
const EXACT_DAY_20_MAP: Record<KelurahanId, {
  composition: {
    makananTpa: number;
    makananTps3r: number;
    sisaBuahTpa: number;
    sisaBuahTps3r: number;
    sisaSayurTpa: number;
    sisaSayurTps3r: number;
    daunTpa: number;
    daunTps3r: number;
  };
  pakan: Record<string, number>;
}> = {
  BARU: {
    composition: { makananTpa: 0, makananTps3r: 1170, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 0, daunTps3r: 0 },
    pakan: { 'col-musliadi': 54 },
  },
  BULOGADING: {
    composition: { makananTpa: 82, makananTps3r: 53, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 42, daunTps3r: 0 },
    pakan: { 'col-ansu': 51, 'col-awal': 38 },
  },
  'LAE-LAE': {
    composition: { makananTpa: 0, makananTps3r: 0, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 0, daunTps3r: 0 },
    pakan: {},
  },
  LAJANGIRU: {
    composition: { makananTpa: 6, makananTps3r: 0, sisaBuahTpa: 4, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 6, daunTps3r: 0 },
    pakan: {},
  },
  LOSARI: {
    composition: { makananTpa: 0, makananTps3r: 0, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 53, daunTps3r: 0 },
    pakan: { 'col-hasrul': 31 },
  },
  MALOKU: {
    composition: { makananTpa: 23, makananTps3r: 50, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 0, daunTps3r: 0 },
    pakan: { 'col-erwin': 62, 'col-samsir': 52 },
  },
  MANGKURA: {
    composition: { makananTpa: 60, makananTps3r: 79, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 56, daunTps3r: 0 },
    pakan: { 'col-malalengga': 31, 'col-abd-rahman': 42 },
  },
  'PISANG SELATAN': {
    composition: { makananTpa: 14, makananTps3r: 1, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 7, daunTps3r: 0 },
    pakan: {},
  },
  'PISANG UTARA': {
    composition: { makananTpa: 3, makananTps3r: 17, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 0, daunTps3r: 0 },
    pakan: {},
  },
  SAWERIGADING: {
    composition: { makananTpa: 32, makananTps3r: 8, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 130, daunTps3r: 0 },
    pakan: { 'col-nurdin-aco': 41 },
  },
};

// Day 22 exact values directly matching the official spreadsheet data
const EXACT_DAY_22_MAP: Record<KelurahanId, {
  composition: {
    makananTpa: number;
    makananTps3r: number;
    sisaBuahTpa: number;
    sisaBuahTps3r: number;
    sisaSayurTpa: number;
    sisaSayurTps3r: number;
    daunTpa: number;
    daunTps3r: number;
  };
  pakan: Record<string, number>;
}> = {
  BARU: {
    composition: { makananTpa: 433, makananTps3r: 750, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 0, daunTps3r: 0 },
    pakan: { 'col-musliadi': 56 },
  },
  BULOGADING: {
    composition: { makananTpa: 0, makananTps3r: 75, sisaBuahTpa: 30, sisaBuahTps3r: 0, sisaSayurTpa: 15, sisaSayurTps3r: 0, daunTpa: 80, daunTps3r: 0 },
    pakan: { 'col-ansu': 49, 'col-awal': 48 },
  },
  'LAE-LAE': {
    composition: { makananTpa: 0, makananTps3r: 0, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 0, daunTps3r: 0 },
    pakan: {},
  },
  LAJANGIRU: {
    composition: { makananTpa: 5, makananTps3r: 0, sisaBuahTpa: 3, sisaBuahTps3r: 0, sisaSayurTpa: 3, sisaSayurTps3r: 0, daunTpa: 10, daunTps3r: 0 },
    pakan: {},
  },
  LOSARI: {
    composition: { makananTpa: 0, makananTps3r: 0, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 105, daunTps3r: 0 },
    pakan: { 'col-hasrul': 30 },
  },
  MALOKU: {
    composition: { makananTpa: 37, makananTps3r: 0, sisaBuahTpa: 36, sisaBuahTps3r: 0, sisaSayurTpa: 56, sisaSayurTps3r: 0, daunTpa: 19, daunTps3r: 0 },
    pakan: { 'col-erwin': 57, 'col-samsir': 56 },
  },
  MANGKURA: {
    composition: { makananTpa: 0, makananTps3r: 85, sisaBuahTpa: 35, sisaBuahTps3r: 0, sisaSayurTpa: 8, sisaSayurTps3r: 0, daunTpa: 55, daunTps3r: 0 },
    pakan: { 'col-malalengga': 38, 'col-abd-rahman': 38 },
  },
  'PISANG SELATAN': {
    composition: { makananTpa: 13, makananTps3r: 0, sisaBuahTpa: 6, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 3, daunTps3r: 0 },
    pakan: {},
  },
  'PISANG UTARA': {
    composition: { makananTpa: 30, makananTps3r: 0, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 0, daunTps3r: 0 },
    pakan: {},
  },
  SAWERIGADING: {
    composition: { makananTpa: 29, makananTps3r: 0, sisaBuahTpa: 0, sisaBuahTps3r: 0, sisaSayurTpa: 0, sisaSayurTps3r: 0, daunTpa: 157, daunTps3r: 0 },
    pakan: { 'col-nurdin-aco': 40 },
  },
};

export function generateInitialDailyRecords(): DailyRecord[] {
  const records: DailyRecord[] = [];

  for (const spec of CUMULATIVE_SPECS) {
    const makananTpaDaily = distributeOver21Days(spec.makananTpa, DAY_WEIGHTS);
    const makananTps3rDaily = distributeOver21Days(spec.makananTps3r, DAY_WEIGHTS);
    const sisaBuahTpaDaily = distributeOver21Days(spec.sisaBuahTpa, DAY_WEIGHTS);
    const sisaBuahTps3rDaily = distributeOver21Days(spec.sisaBuahTps3r, DAY_WEIGHTS);
    const sisaSayurTpaDaily = distributeOver21Days(spec.sisaSayurTpa, DAY_WEIGHTS);
    const sisaSayurTps3rDaily = distributeOver21Days(spec.sisaSayurTps3r, DAY_WEIGHTS);
    const daunTpaDaily = distributeOver21Days(spec.daunTpa, DAY_WEIGHTS);
    const daunTps3rDaily = distributeOver21Days(spec.daunTps3r, DAY_WEIGHTS);

    const collectorsDaily = spec.collectors.map((c) => ({
      collectorId: c.id,
      collectorName: c.name,
      dailyShares: distributeOver21Days(c.targetKg, DAY_WEIGHTS),
    }));

    for (let day = 1; day <= 22; day++) {
      const dayIndex = (day - 1) % 21;
      const dateStr = `2026-10-${day < 10 ? '0' + day : day}`;

      if (day === 20 && EXACT_DAY_20_MAP[spec.kelurahanId]) {
        const exact = EXACT_DAY_20_MAP[spec.kelurahanId];
        records.push({
          id: `${dateStr}_${spec.kelurahanId}`,
          date: dateStr,
          kelurahanId: spec.kelurahanId,
          composition: exact.composition,
          pakanInputs: spec.collectors.map((c) => ({
            collectorId: c.id,
            collectorName: c.name,
            weightKg: exact.pakan[c.id] || 0,
          })),
          updatedAt: `${dateStr}T11:30:00.000Z`,
          submittedBy: `Petugas Kebersihan ${spec.kelurahanId}`,
        });
      } else if (day === 22 && EXACT_DAY_22_MAP[spec.kelurahanId]) {
        const exact = EXACT_DAY_22_MAP[spec.kelurahanId];
        records.push({
          id: `${dateStr}_${spec.kelurahanId}`,
          date: dateStr,
          kelurahanId: spec.kelurahanId,
          composition: exact.composition,
          pakanInputs: spec.collectors.map((c) => ({
            collectorId: c.id,
            collectorName: c.name,
            weightKg: exact.pakan[c.id] || 0,
          })),
          updatedAt: `${dateStr}T11:30:00.000Z`,
          submittedBy: `Staf Kelurahan ${spec.kelurahanId}`,
        });
      } else {
        records.push({
          id: `${dateStr}_${spec.kelurahanId}`,
          date: dateStr,
          kelurahanId: spec.kelurahanId,
          composition: {
            makananTpa: makananTpaDaily[dayIndex],
            makananTps3r: makananTps3rDaily[dayIndex],
            sisaBuahTpa: sisaBuahTpaDaily[dayIndex],
            sisaBuahTps3r: sisaBuahTps3rDaily[dayIndex],
            sisaSayurTpa: sisaSayurTpaDaily[dayIndex],
            sisaSayurTps3r: sisaSayurTps3rDaily[dayIndex],
            daunTpa: daunTpaDaily[dayIndex],
            daunTps3r: daunTps3rDaily[dayIndex],
          },
          pakanInputs: collectorsDaily.map((col) => ({
            collectorId: col.collectorId,
            collectorName: col.collectorName,
            weightKg: col.dailyShares[dayIndex],
          })),
          updatedAt: `${dateStr}T11:30:00.000Z`,
          submittedBy: `Petugas Kebersihan ${spec.kelurahanId}`,
        });
      }
    }
  }

  return records;
}

// Initial TPS3R processing records for October 1-22, 2026
// Maggot: cumulative 20.452 Kg, Open Windrow: cumulative 1.950 Kg
export function generateInitialTps3rProcessing(): Tps3rProcessing[] {
  const maggotDaily = distributeOver21Days(20452, DAY_WEIGHTS);
  const openWdrDaily = distributeOver21Days(1950, DAY_WEIGHTS);

  const list: Tps3rProcessing[] = [];
  for (let day = 1; day <= 22; day++) {
    const dayStr = day < 10 ? '0' + day : '' + day;
    const m = day === 20 ? 780 : (day === 22 ? 850 : maggotDaily[(day - 1) % 21]);
    const w = day === 20 ? 0 : (day === 22 ? 60 : openWdrDaily[(day - 1) % 21]);
    list.push({
      date: `2026-10-${dayStr}`,
      maggotKg: m,
      openWindrowKg: w,
    });
  }
  return list;
}

// Initial Official Pengelolaan records (Kapasa, Bintang 5, Teba, Pakan Ternak, Biopori, TPS3R Karebosi, Raised Bed)
export function generateInitialOfficialPengelolaan(): OfficialDailyPengelolaan[] {
  const list: OfficialDailyPengelolaan[] = [];

  for (let day = 1; day <= 22; day++) {
    const dayStr = day < 10 ? '0' + day : '' + day;
    const dateStr = `2026-10-${dayStr}`;

    if (day === 20) {
      // Tuesday 20 October 2026 - Exact official report from Kecamatan
      list.push({
        date: dateStr,
        kapasaBosowaKg: 0,
        bintang5Kg: 1108,
        pengelolaanTebaKg: 0,
        pakanTernakKg: 410,
        pengelolaanBioporiKg: 0,
        tps3rKarebosiMaggotKg: 780,
        tps3rKarebosiOpenWindrowKg: 0,
        raisedBedKg: 0,
      });
    } else if (day === 22) {
      // Thursday 22 October 2026 - Exact official report matching spreadsheet
      list.push({
        date: dateStr,
        kapasaBosowaKg: 0,
        bintang5Kg: 1168,
        pengelolaanTebaKg: 0,
        pakanTernakKg: 412,
        pengelolaanBioporiKg: 0,
        tps3rKarebosiMaggotKg: 850,
        tps3rKarebosiOpenWindrowKg: 60,
        raisedBedKg: 0,
      });
    } else {
      // Proportional distribution for other days in October
      list.push({
        date: dateStr,
        kapasaBosowaKg: 0,
        bintang5Kg: 950,
        pengelolaanTebaKg: 0,
        pakanTernakKg: 350,
        pengelolaanBioporiKg: 0,
        tps3rKarebosiMaggotKg: 900,
        tps3rKarebosiOpenWindrowKg: 50,
        raisedBedKg: 0,
      });
    }
  }

  return list;
}

export const INITIAL_OFFICIAL_PENGELOLAAN: OfficialDailyPengelolaan[] = generateInitialOfficialPengelolaan();
