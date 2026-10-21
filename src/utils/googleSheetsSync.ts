import { DailyRecord, KelurahanId, WasteComposition, PakanCollectorInput } from '../types/waste';
import { KELURAHAN_LIST } from '../data/initialData';

export const DEFAULT_SPREADSHEET_ID = '1NU5cVMjCR0tQuzFZjMZxh56X6ouzsJqahROiPKzXl2s';
export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbx-H4zOPo3oebIabWu5mL7_bisXHbOANNVaAUGdcCEYAh1j5B4CAde8pIDq8p_st50Suw/exec';

/**
 * Robust CSV parser handling quotes and commas
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Fetch and parse data from Google Sheets INPUT_HARIAN
 */
export async function fetchGoogleSheetsRecords(
  spreadsheetId = DEFAULT_SPREADSHEET_ID
): Promise<{ success: boolean; records: DailyRecord[]; totalRows: number; error?: string }> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=INPUT_HARIAN`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Gagal menghubungi Google Sheets (Status: ${response.status})`);
    }

    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      throw new Error('Spreadsheet kosong atau tidak memiliki data.');
    }

    // Header validation
    const header = parseCsvLine(lines[0]);
    const dateIdx = header.findIndex((h) => h.toLowerCase().includes('tanggal'));
    const kelIdx = header.findIndex(
      (h) => h.toLowerCase().includes('nama_kelurahan') || h.toLowerCase().includes('kelurahan')
    );

    if (dateIdx === -1 || kelIdx === -1) {
      throw new Error('Format kolom sheet INPUT_HARIAN tidak sesuai.');
    }

    const records: DailyRecord[] = [];
    const validKelurahanIds: KelurahanId[] = [
      'BARU',
      'BULOGADING',
      'LAE-LAE',
      'LAJANGIRU',
      'LOSARI',
      'MALOKU',
      'MANGKURA',
      'PISANG SELATAN',
      'PISANG UTARA',
      'SAWERIGADING',
    ];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length < 14) continue;

      const date = cols[1]?.replace(/['"]/g, '').trim();
      const rawKel = cols[3]?.replace(/['"]/g, '').trim().toUpperCase();

      if (!date || !rawKel) continue;

      // Find matching kelurahan ID
      const matchedKel = validKelurahanIds.find((id) => {
        const meta = KELURAHAN_LIST.find((k) => k.id === id);
        return (
          rawKel.includes(id) ||
          (meta && rawKel.includes(meta.name.toUpperCase())) ||
          rawKel === id
        );
      });

      if (!matchedKel) continue;

      const makananTpa = Number(cols[4]) || 0;
      const makananTps3r = Number(cols[5]) || 0;
      const sisaBuahTpa = Number(cols[6]) || 0;
      const sisaBuahTps3r = Number(cols[7]) || 0;
      const sisaSayurTpa = Number(cols[8]) || 0;
      const sisaSayurTps3r = Number(cols[9]) || 0;
      const daunTpa = Number(cols[10]) || 0;
      const daunTps3r = Number(cols[11]) || 0;
      const rawCollector = cols[12]?.replace(/['"]/g, '').trim() || '-';
      const pakanWeight = Number(cols[13]) || 0;
      const submittedBy = cols[18]?.replace(/['"]/g, '').trim() || `Petugas ${matchedKel}`;

      const composition: WasteComposition = {
        makananTpa,
        makananTps3r,
        sisaBuahTpa,
        sisaBuahTps3r,
        sisaSayurTpa,
        sisaSayurTps3r,
        daunTpa,
        daunTps3r,
      };

      const pakanInputs: PakanCollectorInput[] = [];
      if (pakanWeight > 0) {
        // Parse collector name(s)
        pakanInputs.push({
          collectorId: `col-${matchedKel.toLowerCase()}`,
          collectorName: rawCollector !== '-' ? rawCollector : 'Petugas Pakan',
          weightKg: pakanWeight,
        });
      }

      records.push({
        id: `${date}_${matchedKel}`,
        date,
        kelurahanId: matchedKel,
        composition,
        pakanInputs,
        updatedAt: new Date().toISOString(),
        submittedBy,
      });
    }

    return {
      success: true,
      records,
      totalRows: lines.length - 1,
    };
  } catch (err: any) {
    console.error('Error fetching Google Sheets data:', err);
    return {
      success: false,
      records: [],
      totalRows: 0,
      error: err?.message || 'Gagal menyinkronkan dengan Google Sheets',
    };
  }
}

/**
 * Send new record to Google Apps Script Web App
 */
export async function pushRecordToGoogleAppsScript(
  scriptUrl: string,
  record: {
    date: string;
    kelurahanId: KelurahanId;
    composition: WasteComposition;
    pakanInputs: PakanCollectorInput[];
    submittedBy?: string;
  }
): Promise<{ success: boolean; message: string }> {
  if (!scriptUrl || scriptUrl.trim().length === 0) {
    return {
      success: false,
      message: 'URL Google Apps Script belum disetel.',
    };
  }

  const payload = JSON.stringify({
    action: 'saveRecord',
    data: record,
  });

  try {
    // text/plain avoids CORS preflight OPTIONS in Google Apps Script
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
    });

    try {
      const result = await response.json();
      return {
        success: result.status === 'success' || result.success === true,
        message: result.message || 'Data berhasil dikirim ke Google Sheets',
      };
    } catch {
      // Successful HTTP call but couldn't parse JSON (e.g. redirected)
      return {
        success: true,
        message: 'Data berhasil terkirim ke Google Apps Script.',
      };
    }
  } catch (err: any) {
    console.warn('Standard POST failed, retrying with mode no-cors...', err);
    try {
      // Fallback: send with no-cors so browser will not block redirect
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payload,
      });
      return {
        success: true,
        message: 'Data terkirim ke Google Apps Script (mode no-cors).',
      };
    } catch (fallbackErr: any) {
      console.error('Error pushing to Apps Script:', fallbackErr);
      return {
        success: false,
        message: fallbackErr.message || 'Gagal mengirim data ke Google Apps Script',
      };
    }
  }
}

/**
 * Test connectivity with Google Apps Script Web App
 */
export async function testAppsScriptConnection(
  scriptUrl: string
): Promise<{ success: boolean; status: 'active' | 'missing_doget' | 'unreachable'; message: string }> {
  if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      status: 'unreachable',
      message: 'Format URL Web App Google Apps Script tidak valid.',
    };
  }

  try {
    const res = await fetch(`${scriptUrl}?action=getAll`, {
      method: 'GET',
    });

    const text = await res.text();

    if (text.includes('doGet') || text.includes('找不到以下指令碼函式') || text.includes('Script function not found')) {
      return {
        success: false,
        status: 'missing_doget',
        message: 'Web App terhubung, namun fungsi doGet belum ditemukan di script editor Anda.',
      };
    }

    try {
      const data = JSON.parse(text);
      if (data.status === 'success') {
        return {
          success: true,
          status: 'active',
          message: `Koneksi Berhasil! API aktif dengan ${data.totalRecords ?? data.records?.length ?? 0} data.`,
        };
      }
    } catch {}

    return {
      success: true,
      status: 'active',
      message: 'Koneksi ke Web App berhasil terjalin.',
    };
  } catch (e: any) {
    return {
      success: false,
      status: 'unreachable',
      message: 'Tidak dapat menjangkau Web App. Periksa izin akses (Anyone/Siapa Saja) pada deployment.',
    };
  }
}
