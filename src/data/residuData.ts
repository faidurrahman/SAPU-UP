import { KelurahanId } from '../types/waste';

export interface ResiduKelurahanRow {
  no: number;
  kelurahanId: KelurahanId;
  kelurahanName: string;
  dailyKg: { [day: number]: number }; // day 1 to 30
  totalKg: number;
}

export interface ResiduRecord {
  id: string; // `${date}_${kelurahanId}`
  date: string; // YYYY-MM-DD
  kelurahanId: KelurahanId;
  beratKg: number;
  armadaType?: string;
  nomorArmada?: string;
  jamPengangkutan?: string;
  catatan?: string;
  updatedAt: string;
  submittedBy?: string;
}

export interface AnorganikRecord {
  id: string; // `${date}_${kelurahanId}`
  date: string; // YYYY-MM-DD
  kelurahanId: KelurahanId;
  plastikKg: number;
  kertasKartonKg: number;
  logamKalengKg: number;
  kacaBotolKg: number;
  minyakJelantahKg: number;
  totalKg: number;
  bankSampahName?: string;
  catatan?: string;
  updatedAt: string;
  submittedBy?: string;
}

/**
 * Data Mentah Sampah Residu Kecamatan Ujung Pandang - Bulan Oktober 2026
 * Diambil persis dari rekapan resmi spreadsheet (Lampiran Gambar).
 * Satuan: Kg (4.072 = 4.072 Kg).
 */
export const INITIAL_RESIDU_MATRIX: ResiduKelurahanRow[] = [
  {
    no: 1,
    kelurahanId: 'BARU',
    kelurahanName: 'KELURAHAN BARU',
    dailyKg: {
      1: 4072, 2: 3206, 3: 4491, 4: 3702, 5: 4281, 6: 3518, 7: 3822, 8: 4072, 9: 3942, 10: 3740,
      11: 4188, 12: 4006, 13: 4504, 14: 3795, 15: 4081, 16: 4094, 17: 4491, 18: 4070, 19: 4280, 20: 4482,
      21: 3802, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0
    },
    totalKg: 84635,
  },
  {
    no: 2,
    kelurahanId: 'BULOGADING',
    kelurahanName: 'KELURAHAN BULOGADING',
    dailyKg: {
      1: 3385, 2: 3345, 3: 3339, 4: 3122, 5: 2843, 6: 3154, 7: 3286, 8: 3384, 9: 3689, 10: 3325,
      11: 2951, 12: 3198, 13: 3357, 14: 3118, 15: 3385, 16: 3310, 17: 3343, 18: 3087, 19: 2889, 20: 3124,
      21: 3328, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0
    },
    totalKg: 67960,
  },
  {
    no: 3,
    kelurahanId: 'LAJANGIRU',
    kelurahanName: 'KELURAHAN LAJANGIRU',
    dailyKg: {
      1: 1827, 2: 1720, 3: 1740, 4: 1659, 5: 1476, 6: 1844, 7: 1587, 8: 1655, 9: 1410, 10: 1850,
      11: 1650, 12: 1255, 13: 1900, 14: 1400, 15: 1680, 16: 1735, 17: 1760, 18: 1432, 19: 1380, 20: 1570,
      21: 1849, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0
    },
    totalKg: 34379,
  },
  {
    no: 4,
    kelurahanId: 'LOSARI',
    kelurahanName: 'KELURAHAN LOSARI',
    dailyKg: {
      1: 2790, 2: 2718, 3: 2729, 4: 2860, 5: 2962, 6: 2681, 7: 2533, 8: 2698, 9: 2744, 10: 2818,
      11: 2739, 12: 2959, 13: 2682, 14: 2550, 15: 2981, 16: 2895, 17: 2727, 18: 2855, 19: 2851, 20: 2843,
      21: 2616, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0
    },
    totalKg: 58231,
  },
  {
    no: 5,
    kelurahanId: 'MALOKU',
    kelurahanName: 'KELURAHAN MALOKU',
    dailyKg: {
      1: 4235, 2: 4264, 3: 3978, 4: 4391, 5: 4169, 6: 4338, 7: 4530, 8: 4333, 9: 4270, 10: 4210,
      11: 4563, 12: 4081, 13: 4329, 14: 4365, 15: 4274, 16: 4340, 17: 3977, 18: 4411, 19: 4121, 20: 4392,
      21: 4521, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0
    },
    totalKg: 90093,
  },
  {
    no: 6,
    kelurahanId: 'MANGKURA',
    kelurahanName: 'KELURAHAN MANGKURA',
    dailyKg: {
      1: 3956, 2: 4157, 3: 4745, 4: 4502, 5: 4148, 6: 4253, 7: 3955, 8: 4101, 9: 3946, 10: 5325,
      11: 4548, 12: 4452, 13: 5108, 14: 3975, 15: 3949, 16: 3927, 17: 4710, 18: 4458, 19: 4158, 20: 4258,
      21: 3965, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0
    },
    totalKg: 90596,
  },
  {
    no: 7,
    kelurahanId: 'PISANG SELATAN',
    kelurahanName: 'KELURAHAN PISANG SELATAN',
    dailyKg: {
      1: 2753, 2: 2551, 3: 3027, 4: 2553, 5: 3006, 6: 2543, 7: 2570, 8: 2736, 9: 2534, 10: 3029,
      11: 2608, 12: 2994, 13: 2557, 14: 2520, 15: 2738, 16: 2565, 17: 2975, 18: 2525, 19: 3040, 20: 2540,
      21: 2537, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0
    },
    totalKg: 56901,
  },
  {
    no: 8,
    kelurahanId: 'PISANG UTARA',
    kelurahanName: 'KELURAHAN PISANG UTARA',
    dailyKg: {
      1: 2445, 2: 2090, 3: 2088, 4: 1970, 5: 1857, 6: 2303, 7: 1843, 8: 2100, 9: 2320, 10: 1718,
      11: 2432, 12: 1852, 13: 1703, 14: 2477, 15: 2420, 16: 2002, 17: 2113, 18: 1985, 19: 1842, 20: 2273,
      21: 2053, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0
    },
    totalKg: 43887,
  },
  {
    no: 9,
    kelurahanId: 'SAWERIGADING',
    kelurahanName: 'KELURAHAN SAWERIGADING',
    dailyKg: {
      1: 4249, 2: 4062, 3: 4778, 4: 4334, 5: 4665, 6: 4028, 7: 3896, 8: 4293, 9: 3608, 10: 4233,
      11: 4379, 12: 4326, 13: 4077, 14: 4285, 15: 4233, 16: 3823, 17: 4233, 18: 3840, 19: 4251, 20: 3995,
      21: 4518, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0
    },
    totalKg: 88105,
  },
  {
    no: 10,
    kelurahanId: 'LAE-LAE',
    kelurahanName: 'KELURAHAN LAE-LAE (PULAU)',
    dailyKg: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0,
      21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0
    },
    totalKg: 0,
  },
];

/**
 * Generate initial daily records list for Residu
 */
export function generateInitialResiduRecords(): ResiduRecord[] {
  const records: ResiduRecord[] = [];
  const monthPrefix = '2026-10-';

  for (const row of INITIAL_RESIDU_MATRIX) {
    for (let day = 1; day <= 30; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const date = `${monthPrefix}${dayStr}`;
      const beratKg = row.dailyKg[day] || 0;

      records.push({
        id: `${date}_${row.kelurahanId}`,
        date,
        kelurahanId: row.kelurahanId,
        beratKg,
        armadaType: 'Truk Kontainer DLH',
        nomorArmada: `DD ${8000 + row.no} UP`,
        jamPengangkutan: '06:30 - 08:00 WITA',
        catatan: day <= 21 ? 'Tercatat di TPA Tamangapa' : 'Jadwal Siap Diisi',
        updatedAt: '2026-10-21T00:00:00Z',
        submittedBy: `Staf Kebersihan ${row.kelurahanName}`,
      });
    }
  }

  return records;
}

/**
 * Generate sample initial data for Anorganik (Bank Sampah)
 */
export function generateInitialAnorganikRecords(): AnorganikRecord[] {
  const records: AnorganikRecord[] = [];
  const monthPrefix = '2026-10-';

  // Sampel per kelurahan dengan data realistis bank sampah
  const sampleWeights: { [key in KelurahanId]?: { plastik: number; kertas: number; logam: number; kaca: number; minyak: number } } = {
    'BARU': { plastik: 45, kertas: 60, logam: 15, kaca: 12, minyak: 8 },
    'BULOGADING': { plastik: 38, kertas: 52, logam: 12, kaca: 10, minyak: 5 },
    'LAJANGIRU': { plastik: 28, kertas: 40, logam: 8, kaca: 6, minyak: 4 },
    'LOSARI': { plastik: 42, kertas: 55, logam: 14, kaca: 9, minyak: 6 },
    'MALOKU': { plastik: 50, kertas: 70, logam: 18, kaca: 15, minyak: 10 },
    'MANGKURA': { plastik: 48, kertas: 68, logam: 16, kaca: 14, minyak: 9 },
    'PISANG SELATAN': { plastik: 35, kertas: 45, logam: 10, kaca: 8, minyak: 5 },
    'PISANG UTARA': { plastik: 32, kertas: 42, logam: 9, kaca: 7, minyak: 4 },
    'SAWERIGADING': { plastik: 46, kertas: 65, logam: 17, kaca: 13, minyak: 8 },
    'LAE-LAE': { plastik: 18, kertas: 22, logam: 5, kaca: 4, minyak: 2 },
  };

  for (let day = 1; day <= 21; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const date = `${monthPrefix}${dayStr}`;

    for (const [kId, w] of Object.entries(sampleWeights)) {
      const kelId = kId as KelurahanId;
      const plastik = Math.round(w.plastik * (0.8 + ((day * 7) % 5) * 0.1));
      const kertas = Math.round(w.kertas * (0.85 + ((day * 3) % 4) * 0.1));
      const logam = Math.round(w.logam * (0.8 + ((day * 5) % 4) * 0.1));
      const kaca = Math.round(w.kaca * (0.8 + ((day * 2) % 4) * 0.1));
      const minyak = Math.round(w.minyak * (0.9 + ((day * 1) % 3) * 0.1));
      const total = plastik + kertas + logam + kaca + minyak;

      records.push({
        id: `${date}_${kelId}`,
        date,
        kelurahanId: kelId,
        plastikKg: plastik,
        kertasKartonKg: kertas,
        logamKalengKg: logam,
        kacaBotolKg: kaca,
        minyakJelantahKg: minyak,
        totalKg: total,
        bankSampahName: `Bank Sampah Unit ${kelId}`,
        catatan: 'Penyetoran nasabah & pemilahan warga',
        updatedAt: '2026-10-21T00:00:00Z',
        submittedBy: `Pengurus Bank Sampah ${kelId}`,
      });
    }
  }

  return records;
}
