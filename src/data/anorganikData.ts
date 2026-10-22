import { KelurahanId } from '../types/waste';

export interface AnorganikMatrixRow {
  no: number;
  kelurahanId: KelurahanId;
  kelurahanName: string;
  dailyKg: { [day: number]: number };
  totalKg: number;
}

export interface AnorganikDailyRecord {
  id: string; // `${date}_${kelurahanId}`
  date: string; // YYYY-MM-DD
  kelurahanId: KelurahanId;
  satgasMobilKg: number;
  satgasFukudaKg: number;
  totalKg: number;
  catatan?: string;
  updatedAt: string;
  submittedBy?: string;
}

/**
 * Data Rekapitulasi Sampah Anorganik Terpilah (Hasil Satgas Mobil)
 * Lampiran 1 - Bulan Oktober 2026 (Total = 2.531 Kg)
 */
export const INITIAL_ANORGANIK_MOBIL_MATRIX: AnorganikMatrixRow[] = [
  {
    no: 1,
    kelurahanId: 'BARU',
    kelurahanName: 'KELURAHAN BARU',
    dailyKg: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 0,
  },
  {
    no: 2,
    kelurahanId: 'BULOGADING',
    kelurahanName: 'KELURAHAN BULOGADING',
    dailyKg: { 1: 17, 2: 65, 3: 36, 4: 43, 5: 19, 6: 21, 7: 21, 8: 18, 9: 66, 10: 56, 11: 41, 12: 19, 13: 21, 14: 21, 15: 19, 16: 67, 17: 57, 18: 42, 19: 20, 20: 22, 21: 22, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 713,
  },
  {
    no: 3,
    kelurahanId: 'LAJANGIRU',
    kelurahanName: 'KELURAHAN LAJANGIRU',
    dailyKg: { 1: 20, 2: 16, 3: 12, 4: 14, 5: 16, 6: 15, 7: 22, 8: 22, 9: 16, 10: 13, 11: 14, 12: 16, 13: 19, 14: 22, 15: 22, 16: 16, 17: 13, 18: 14, 19: 16, 20: 19, 21: 22, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 359,
  },
  {
    no: 4,
    kelurahanId: 'LOSARI',
    kelurahanName: 'KELURAHAN LOSARI',
    dailyKg: { 1: 5, 2: 6, 3: 5, 4: 6, 5: 7, 6: 6, 7: 15, 8: 5, 9: 6, 10: 5, 11: 26, 12: 7, 13: 6, 14: 7, 15: 14, 16: 6, 17: 6, 18: 6, 19: 27, 20: 6, 21: 7, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 184,
  },
  {
    no: 5,
    kelurahanId: 'MALOKU',
    kelurahanName: 'KELURAHAN MALOKU',
    dailyKg: { 1: 15, 2: 2, 3: 2, 4: 10, 5: 12, 6: 10, 7: 18, 8: 16, 9: 2, 10: 2, 11: 10, 12: 13, 13: 11, 14: 18, 15: 19, 16: 2, 17: 2, 18: 11, 19: 14, 20: 11, 21: 19, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 219,
  },
  {
    no: 6,
    kelurahanId: 'MANGKURA',
    kelurahanName: 'KELURAHAN MANGKURA',
    dailyKg: { 1: 5, 2: 6, 3: 14, 4: 5, 5: 5, 6: 5, 7: 23, 8: 4, 9: 5, 10: 6, 11: 57, 12: 5, 13: 6, 14: 5, 15: 34, 16: 6, 17: 7, 18: 7, 19: 12, 20: 8, 21: 6, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 231,
  },
  {
    no: 7,
    kelurahanId: 'PISANG SELATAN',
    kelurahanName: 'KELURAHAN PISANG SELATAN',
    dailyKg: { 1: 5, 2: 4, 3: 27, 4: 6, 5: 6, 6: 5, 7: 13, 8: 5, 9: 4, 10: 7, 11: 22, 12: 6, 13: 5, 14: 6, 15: 6, 16: 32, 17: 8, 18: 7, 19: 5, 20: 18, 21: 7, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 204,
  },
  {
    no: 8,
    kelurahanId: 'PISANG UTARA',
    kelurahanName: 'KELURAHAN PISANG UTARA',
    dailyKg: { 1: 13, 2: 19, 3: 16, 4: 13, 5: 11, 6: 19, 7: 11, 8: 13, 9: 19, 10: 16, 11: 13, 12: 11, 13: 19, 14: 11, 15: 13, 16: 19, 17: 16, 18: 13, 19: 11, 20: 19, 21: 11, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 306,
  },
  {
    no: 9,
    kelurahanId: 'SAWERIGADING',
    kelurahanName: 'KELURAHAN SAWERIGADING',
    dailyKg: { 1: 14, 2: 16, 3: 17, 4: 19, 5: 9, 6: 13, 7: 17, 8: 14, 9: 16, 10: 17, 11: 19, 12: 9, 13: 13, 14: 17, 15: 14, 16: 16, 17: 17, 18: 19, 19: 9, 20: 13, 21: 17, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 315,
  },
  {
    no: 10,
    kelurahanId: 'LAE-LAE',
    kelurahanName: 'KELURAHAN LAE-LAE (PULAU)',
    dailyKg: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 0,
  },
];

/**
 * Data Rekapitulasi Sampah Anorganik Terpilah (Hasil Satgas Roda Tiga / Fukuda)
 * Lampiran 2 - Bulan Oktober 2026 (Total = 9.705 Kg)
 */
export const INITIAL_ANORGANIK_FUKUDA_MATRIX: AnorganikMatrixRow[] = [
  {
    no: 1,
    kelurahanId: 'BARU',
    kelurahanName: 'KELURAHAN BARU',
    dailyKg: { 1: 347, 2: 320, 3: 375, 4: 384, 5: 319, 6: 419, 7: 318, 8: 342, 9: 326, 10: 350, 11: 359, 12: 382, 13: 316, 14: 373, 15: 410, 16: 421, 17: 611, 18: 417, 19: 492, 20: 421, 21: 148, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 7850,
  },
  {
    no: 2,
    kelurahanId: 'BULOGADING',
    kelurahanName: 'KELURAHAN BULOGADING',
    dailyKg: { 1: 15, 2: 63, 3: 34, 4: 41, 5: 17, 6: 19, 7: 19, 8: 16, 9: 64, 10: 54, 11: 39, 12: 17, 13: 19, 14: 19, 15: 17, 16: 65, 17: 55, 18: 40, 19: 18, 20: 20, 21: 20, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 671,
  },
  {
    no: 3,
    kelurahanId: 'LAJANGIRU',
    kelurahanName: 'KELURAHAN LAJANGIRU',
    dailyKg: { 1: 18, 2: 14, 3: 10, 4: 12, 5: 14, 6: 13, 7: 20, 8: 20, 9: 14, 10: 11, 11: 12, 12: 14, 13: 17, 14: 20, 15: 20, 16: 14, 17: 11, 18: 12, 19: 14, 20: 17, 21: 20, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 317,
  },
  {
    no: 4,
    kelurahanId: 'LOSARI',
    kelurahanName: 'KELURAHAN LOSARI',
    dailyKg: { 1: 1, 2: 2, 3: 1, 4: 2, 5: 3, 6: 2, 7: 1, 8: 1, 9: 2, 10: 1, 11: 2, 12: 3, 13: 2, 14: 3, 15: 1, 16: 2, 17: 2, 18: 2, 19: 3, 20: 2, 21: 3, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 41,
  },
  {
    no: 5,
    kelurahanId: 'MALOKU',
    kelurahanName: 'KELURAHAN MALOKU',
    dailyKg: { 1: 13, 2: 0, 3: 0, 4: 8, 5: 10, 6: 8, 7: 16, 8: 14, 9: 0, 10: 0, 11: 8, 12: 11, 13: 9, 14: 16, 15: 17, 16: 0, 17: 0, 18: 9, 19: 12, 20: 9, 21: 17, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 177,
  },
  {
    no: 6,
    kelurahanId: 'MANGKURA',
    kelurahanName: 'KELURAHAN MANGKURA',
    dailyKg: { 1: 2, 2: 3, 3: 1, 4: 2, 5: 2, 6: 2, 7: 1, 8: 1, 9: 2, 10: 3, 11: 3, 12: 2, 13: 3, 14: 2, 15: 2, 16: 3, 17: 4, 18: 4, 19: 3, 20: 5, 21: 3, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 53,
  },
  {
    no: 7,
    kelurahanId: 'PISANG SELATAN',
    kelurahanName: 'KELURAHAN PISANG SELATAN',
    dailyKg: { 1: 2, 2: 1, 3: 4, 4: 3, 5: 3, 6: 2, 7: 3, 8: 2, 9: 1, 10: 4, 11: 3, 12: 3, 13: 2, 14: 3, 15: 3, 16: 2, 17: 5, 18: 4, 19: 2, 20: 3, 21: 4, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 59,
  },
  {
    no: 8,
    kelurahanId: 'PISANG UTARA',
    kelurahanName: 'KELURAHAN PISANG UTARA',
    dailyKg: { 1: 11, 2: 17, 3: 14, 4: 11, 5: 9, 6: 17, 7: 9, 8: 11, 9: 17, 10: 14, 11: 11, 12: 9, 13: 17, 14: 9, 15: 11, 16: 17, 17: 14, 18: 11, 19: 9, 20: 17, 21: 9, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 264,
  },
  {
    no: 9,
    kelurahanId: 'SAWERIGADING',
    kelurahanName: 'KELURAHAN SAWERIGADING',
    dailyKg: { 1: 12, 2: 14, 3: 15, 4: 17, 5: 7, 6: 11, 7: 15, 8: 12, 9: 14, 10: 15, 11: 17, 12: 7, 13: 11, 14: 15, 15: 12, 16: 14, 17: 15, 18: 17, 19: 7, 20: 11, 21: 15, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 273,
  },
  {
    no: 10,
    kelurahanId: 'LAE-LAE',
    kelurahanName: 'KELURAHAN LAE-LAE (PULAU)',
    dailyKg: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 },
    totalKg: 0,
  },
];

/**
 * Data Rekapitulasi Sampah Anorganik Terpilah (Total Gabungan Mobil + Fukuda)
 * Total = 2.531 + 9.705 = 12.236 Kg (Oktober 2026)
 */
export const INITIAL_ANORGANIK_GABUNGAN_MATRIX: AnorganikMatrixRow[] = INITIAL_ANORGANIK_MOBIL_MATRIX.map((mobilRow) => {
  const fukudaRow = INITIAL_ANORGANIK_FUKUDA_MATRIX.find((f) => f.kelurahanId === mobilRow.kelurahanId);
  const dailyKg: { [day: number]: number } = {};
  let total = 0;
  for (let day = 1; day <= 30; day++) {
    const val = (mobilRow.dailyKg[day] || 0) + (fukudaRow?.dailyKg[day] || 0);
    dailyKg[day] = val;
    total += val;
  }
  return {
    no: mobilRow.no,
    kelurahanId: mobilRow.kelurahanId,
    kelurahanName: mobilRow.kelurahanName,
    dailyKg,
    totalKg: total,
  };
});

/**
 * Generate initial daily records list for Anorganik (Satgas Mobil + Fukuda)
 */
export function generateInitialAnorganikDailyRecords(): AnorganikDailyRecord[] {
  const records: AnorganikDailyRecord[] = [];
  const monthPrefix = '2026-10-';

  for (let day = 1; day <= 30; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const date = `${monthPrefix}${dayStr}`;

    for (const mobilRow of INITIAL_ANORGANIK_MOBIL_MATRIX) {
      const kelId = mobilRow.kelurahanId;
      const fukudaRow = INITIAL_ANORGANIK_FUKUDA_MATRIX.find((f) => f.kelurahanId === kelId);

      const mobilKg = mobilRow.dailyKg[day] || 0;
      const fukudaKg = fukudaRow?.dailyKg[day] || 0;
      const totalKg = mobilKg + fukudaKg;

      records.push({
        id: `${date}_${kelId}`,
        date,
        kelurahanId: kelId,
        satgasMobilKg: mobilKg,
        satgasFukudaKg: fukudaKg,
        totalKg,
        catatan: day <= 21 && totalKg > 0 ? 'Penyetoran Sampah Anorganik Terpilah' : '',
        updatedAt: '2026-10-21T00:00:00Z',
        submittedBy: `Petugas Anorganik ${kelId}`,
      });
    }
  }

  return records;
}
