import { DailyRecord, KelurahanId, WasteComposition, PakanCollectorInput, AnorganikDailyRecord, ResiduRecord } from '../types/waste';
import { KELURAHAN_LIST, INITIAL_COLLECTORS } from '../data/initialData';
import { HorekaDailyRecord, HOREKA_BUSINESSES } from '../data/horekaData';

export const DEFAULT_SPREADSHEET_ID = '1tQgk10GLzPEdv60mztUPR8aO_bFX3yWW8yxaoi8b5eU';
export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxgHPesDIemOQxCiqQGP6VXjt1Mucag46FeozgO5rQsvowC9NOGKpp3ONgEjOKTRfjJBQ/exec';

export const FULL_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (Code.gs) - SIPESAT KECAMATAN UJUNG PANDANG
 * Spreadsheet ID Target: 1tQgk10GLzPEdv60mztUPR8aO_bFX3yWW8yxaoi8b5eU
 * =========================================================================
 * 
 * MANAJEMEN DATA INTEGRASI WEB & GOOGLE SHEETS:
 * 1. Membaca data harian Organik, Anorganik, Residu, dan Horeka (doGet)
 * 2. Menambah & Mengedit data harian per tanggal & Kelurahan / Usaha Horeka (doPost)
 * 3. Otomatis menghitung formula total di Google Sheets
 * 
 * TATA CARA PASANG:
 * 1. Buka Google Sheets Anda (ID: 1tQgk10GLzPEdv60mztUPR8aO_bFX3yWW8yxaoi8b5eU)
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script"
 * 3. Hapus seluruh kode lama di Code.gs, lalu Salin & Tempel SEMUA kode di bawah ini.
 * 4. Klik "Simpan" (Ctrl+S)
 * 5. Klik "Terapkan" (Deploy) -> "Penerapan Baru" (New Deployment)
 * 6. Pilih Jenis: "Aplikasi Web" (Web app)
 * 7. Jalankan Sebagai: "Saya" (Me)
 * 8. Siapa yang memiliki akses: "Siapa saja" (Anyone)
 * 9. Klik "Terapkan" (Deploy) lalu berikan izin otorisasi Google.
 * 10. Salin URL Web App yang dihasilkan ke aplikasi Web Anda!
 */

var SPREADSHEET_ID = "1tQgk10GLzPEdv60mztUPR8aO_bFX3yWW8yxaoi8b5eU";

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.length > 5) {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch(e) {
      return SpreadsheetApp.getActiveSpreadsheet();
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var ss = getSpreadsheet();
    var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : "INPUT_HARIAN";
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAll";
    
    if (action === "ping") {
      return jsonResponse({
        status: "success",
        message: "Google Apps Script Active & Connected to Spreadsheet ID " + SPREADSHEET_ID,
        spreadsheetId: SPREADSHEET_ID,
        timestamp: new Date().toISOString()
      });
    }

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({
        status: "success",
        sheetName: sheet.getName(),
        records: [],
        totalRecords: 0
      });
    }

    var headers = data[0];
    var records = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0] && !row[1] && !row[2]) continue;

      var obj = {};
      for (var h = 0; h < headers.length; h++) {
        var headerKey = String(headers[h]).trim();
        var val = row[h];
        if (val instanceof Date) {
          try {
            var tz = (ss && ss.getSpreadsheetTimeZone && ss.getSpreadsheetTimeZone()) || Session.getScriptTimeZone() || "Asia/Makassar";
            val = Utilities.formatDate(val, tz, "yyyy-MM-dd");
          } catch(e) {
            val = Utilities.formatDate(val, "GMT+8", "yyyy-MM-dd");
          }
        }
        obj[headerKey] = val;
      }
      records.push(obj);
    }

    return jsonResponse({
      status: "success",
      sheetName: sheet.getName(),
      totalRecords: records.length,
      records: records
    });

  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var payload = {};
    if (contents) {
      payload = JSON.parse(contents);
    }

    var action = payload.action || "saveRecord";
    var ss = getSpreadsheet();

    if (action === "saveRecord" || action === "saveOrganik") {
      return handleSaveOrganik(ss, payload.data);
    } else if (action === "saveAnorganik") {
      return handleSaveAnorganik(ss, payload.data);
    } else if (action === "saveResidu") {
      return handleSaveResidu(ss, payload.data);
    } else if (action === "saveHoreka") {
      return handleSaveHoreka(ss, payload.data);
    } else if (action === "delete") {
      return handleDeleteRow(ss, payload.sheet || "INPUT_HARIAN", payload.date, payload.idKey);
    } else {
      return handleSaveOrganik(ss, payload.data || payload);
    }

  } catch (err) {
    return jsonResponse({
      status: "error",
      message: "Gagal memproses request POST: " + err.toString()
    });
  }
}

function handleSaveOrganik(ss, record) {
  if (!record || !record.date || !record.kelurahanId) {
    return jsonResponse({
      status: "error",
      message: "Data tidak valid. Wajib menyertakan date (YYYY-MM-DD) dan kelurahanId."
    });
  }

  var sheet = ss.getSheetByName("INPUT_HARIAN");
  if (!sheet) {
    return jsonResponse({ status: "error", message: "Sheet INPUT_HARIAN tidak ditemukan." });
  }

  var data = sheet.getDataRange().getValues();
  var targetRowIndex = -1;

  var dateStr = String(record.date).trim();
  var kelStr = String(record.kelurahanId).trim().toUpperCase();

  for (var i = 1; i < data.length; i++) {
    var rDate = data[i][1];
    if (rDate instanceof Date) {
      try {
        var tz = (ss && ss.getSpreadsheetTimeZone && ss.getSpreadsheetTimeZone()) || Session.getScriptTimeZone() || "Asia/Makassar";
        rDate = Utilities.formatDate(rDate, tz, "yyyy-MM-dd");
      } catch(e) {
        rDate = Utilities.formatDate(rDate, "GMT+8", "yyyy-MM-dd");
      }
    } else {
      rDate = String(rDate).trim();
    }

    var rKel = (String(data[i][2] || '') + " " + String(data[i][3] || '')).trim().toUpperCase();

    if (rDate === dateStr && (rKel.indexOf(kelStr) !== -1 || kelStr.indexOf(rKel) !== -1)) {
      targetRowIndex = i + 1;
      break;
    }
  }

  var comp = record.composition || {};
  var pakanArr = record.pakanInputs || [];
  var pakanWeight = 0;
  var pakanNames = [];

  for (var p = 0; p < pakanArr.length; p++) {
    if (pakanArr[p].weightKg) {
      pakanWeight += Number(pakanArr[p].weightKg);
      if (pakanArr[p].collectorName) {
        pakanNames.push(pakanArr[p].collectorName + " (" + pakanArr[p].weightKg + "Kg)");
      }
    }
  }

  var collectorStr = pakanNames.length > 0 ? pakanNames.join(", ") : "-";

  if (targetRowIndex > 0) {
    sheet.getRange(targetRowIndex, 5).setValue(comp.makananTpa || 0);
    sheet.getRange(targetRowIndex, 6).setValue(comp.makananTps3r || 0);
    sheet.getRange(targetRowIndex, 7).setValue(comp.sisaBuahTpa || 0);
    sheet.getRange(targetRowIndex, 8).setValue(comp.sisaBuahTps3r || 0);
    sheet.getRange(targetRowIndex, 9).setValue(comp.sisaSayurTpa || 0);
    sheet.getRange(targetRowIndex, 10).setValue(comp.sisaSayurTps3r || 0);
    sheet.getRange(targetRowIndex, 11).setValue(comp.daunTpa || 0);
    sheet.getRange(targetRowIndex, 12).setValue(comp.daunTps3r || 0);
    sheet.getRange(targetRowIndex, 13).setValue(collectorStr);
    sheet.getRange(targetRowIndex, 14).setValue(pakanWeight);
    sheet.getRange(targetRowIndex, 19).setValue(record.submittedBy || "Web Admin");

    sheet.getRange(targetRowIndex, 15).setFormula("=E" + targetRowIndex + "+G" + targetRowIndex + "+I" + targetRowIndex + "+K" + targetRowIndex);
    sheet.getRange(targetRowIndex, 16).setFormula("=F" + targetRowIndex + "+H" + targetRowIndex + "+J" + targetRowIndex + "+L" + targetRowIndex);
    sheet.getRange(targetRowIndex, 17).setFormula("=N" + targetRowIndex);
    sheet.getRange(targetRowIndex, 18).setFormula("=O" + targetRowIndex + "+P" + targetRowIndex + "+Q" + targetRowIndex);

    return jsonResponse({
      status: "success",
      message: "Berhasil memperbarui data Organik Kelurahan " + kelStr + " tanggal " + dateStr + " di Google Sheets!",
      rowIndex: targetRowIndex
    });
  } else {
    var newNo = data.length;
    var rowNum = data.length + 1;

    sheet.appendRow([
      newNo,
      dateStr,
      kelStr,
      "Kelurahan " + kelStr,
      comp.makananTpa || 0,
      comp.makananTps3r || 0,
      comp.sisaBuahTpa || 0,
      comp.sisaBuahTps3r || 0,
      comp.sisaSayurTpa || 0,
      comp.sisaSayurTps3r || 0,
      comp.daunTpa || 0,
      comp.daunTps3r || 0,
      collectorStr,
      pakanWeight,
      "=E" + rowNum + "+G" + rowNum + "+I" + rowNum + "+K" + rowNum,
      "=F" + rowNum + "+H" + rowNum + "+J" + rowNum + "+L" + rowNum,
      "=N" + rowNum,
      "=O" + rowNum + "+P" + rowNum + "+Q" + rowNum,
      record.submittedBy || "Web Admin",
      "Diinput via Web App SIPESAT"
    ]);

    return jsonResponse({
      status: "success",
      message: "Berhasil menambahkan baris Organik baru untuk Kelurahan " + kelStr + " di Google Sheets!",
      rowIndex: rowNum
    });
  }
}

function handleSaveAnorganik(ss, record) {
  if (!record || !record.date || !record.kelurahanId) {
    return jsonResponse({ status: "error", message: "Parameter date & kelurahanId wajib diisi." });
  }

  var sheet = ss.getSheetByName("REKAP_ANORGANIK");
  if (!sheet) {
    sheet = ss.insertSheet("REKAP_ANORGANIK");
    sheet.appendRow(["Tanggal", "Kelurahan", "Satgas_Mobil_Kg", "Satgas_Fukuda_Kg", "Total_Anorganik_Kg"]);
  }

  var data = sheet.getDataRange().getValues();
  var dateStr = String(record.date).trim();
  var kelStr = String(record.kelurahanId).trim().toUpperCase();
  var mobil = Number(record.satgasMobilKg || 0);
  var fukuda = Number(record.satgasFukudaKg || 0);
  var total = mobil + fukuda;

  var targetRowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    var rDate = data[i][0];
    if (rDate instanceof Date) {
      rDate = Utilities.formatDate(rDate, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    } else {
      rDate = String(rDate).trim();
    }
    var rKel = String(data[i][1]).trim().toUpperCase();

    if (rDate === dateStr && rKel === kelStr) {
      targetRowIndex = i + 1;
      break;
    }
  }

  if (targetRowIndex > 0) {
    sheet.getRange(targetRowIndex, 3).setValue(mobil);
    sheet.getRange(targetRowIndex, 4).setValue(fukuda);
    sheet.getRange(targetRowIndex, 5).setValue(total);
    return jsonResponse({ status: "success", message: "Data Anorganik Kelurahan " + kelStr + " diperbarui!" });
  } else {
    sheet.appendRow([dateStr, kelStr, mobil, fukuda, total]);
    return jsonResponse({ status: "success", message: "Data Anorganik Kelurahan " + kelStr + " ditambahkan!" });
  }
}

function handleSaveResidu(ss, record) {
  if (!record || !record.date || !record.kelurahanId) {
    return jsonResponse({ status: "error", message: "Parameter date & kelurahanId wajib diisi." });
  }

  var sheet = ss.getSheetByName("REKAP_RESIDU");
  if (!sheet) {
    sheet = ss.insertSheet("REKAP_RESIDU");
    sheet.appendRow(["Tanggal", "Kelurahan", "Berat_Residu_Kg", "Lokasi_TPA"]);
  }

  var data = sheet.getDataRange().getValues();
  var dateStr = String(record.date).trim();
  var kelStr = String(record.kelurahanId).trim().toUpperCase();
  var berat = Number(record.beratKg || 0);

  var targetRowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    var rDate = data[i][0];
    if (rDate instanceof Date) {
      rDate = Utilities.formatDate(rDate, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    } else {
      rDate = String(rDate).trim();
    }
    var rKel = String(data[i][1]).trim().toUpperCase();

    if (rDate === dateStr && rKel === kelStr) {
      targetRowIndex = i + 1;
      break;
    }
  }

  if (targetRowIndex > 0) {
    sheet.getRange(targetRowIndex, 3).setValue(berat);
    return jsonResponse({ status: "success", message: "Data Residu Kelurahan " + kelStr + " diperbarui!" });
  } else {
    sheet.appendRow([dateStr, kelStr, berat, record.catatan || "TPA Tamangapa Antang"]);
    return jsonResponse({ status: "success", message: "Data Residu Kelurahan " + kelStr + " ditambahkan!" });
  }
}

function handleSaveHoreka(ss, record) {
  if (!record || !record.date || (!record.horekaId && !record.namaUsaha)) {
    return jsonResponse({ status: "error", message: "Parameter date & horekaId/namaUsaha wajib diisi." });
  }

  var sheet = ss.getSheetByName("DATA_HOREKA_147");
  if (!sheet) {
    sheet = ss.insertSheet("DATA_HOREKA_147");
    sheet.appendRow(["No", "Tanggal", "Nama_Usaha", "Kelurahan", "Alamat", "Organik_Kg", "Anorganik_Kg", "Residu_Kg", "Total_Kg"]);
  }

  var data = sheet.getDataRange().getValues();
  var dateStr = String(record.date).trim();
  var namaUsahaStr = String(record.namaUsaha || record.horekaId).trim().toUpperCase();

  var org = Number(record.organikKg || 0);
  var anorg = Number(record.anorganikKg || 0);
  var res = Number(record.residuKg || 0);
  var total = org + anorg + res;

  var targetRowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    var rDate = data[i][1];
    if (rDate instanceof Date) {
      rDate = Utilities.formatDate(rDate, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    } else {
      rDate = String(rDate).trim();
    }
    var rNama = String(data[i][2]).trim().toUpperCase();

    if (rDate === dateStr && (rNama === namaUsahaStr || rNama.indexOf(namaUsahaStr) !== -1)) {
      targetRowIndex = i + 1;
      break;
    }
  }

  if (targetRowIndex > 0) {
    sheet.getRange(targetRowIndex, 6).setValue(org);
    sheet.getRange(targetRowIndex, 7).setValue(anorg);
    sheet.getRange(targetRowIndex, 8).setValue(res);
    sheet.getRange(targetRowIndex, 9).setValue(total);
    return jsonResponse({ status: "success", message: "Data Horeka " + namaUsahaStr + " diperbarui!" });
  } else {
    var newNo = data.length;
    sheet.appendRow([
      newNo,
      dateStr,
      record.namaUsaha || record.horekaId,
      record.kelurahanId || "UJUNG PANDANG",
      record.alamat || "-",
      org,
      anorg,
      res,
      total
    ]);
    return jsonResponse({ status: "success", message: "Data Horeka " + namaUsahaStr + " ditambahkan!" });
  }
}

function handleDeleteRow(ss, sheetName, dateStr, idKey) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return jsonResponse({ status: "error", message: "Sheet tidak ditemukan." });

  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    var rDate = data[i][0] || data[i][1];
    if (rDate instanceof Date) {
      rDate = Utilities.formatDate(rDate, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    } else {
      rDate = String(rDate).trim();
    }

    var rKey = String(data[i][1] || data[i][2] || data[i][3]).trim().toUpperCase();

    if (rDate === String(dateStr).trim() && (rKey === String(idKey).trim().toUpperCase() || idKey === "ALL")) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ status: "success", message: "Baris data berhasil dihapus dari Google Sheets." });
    }
  }

  return jsonResponse({ status: "error", message: "Data tidak ditemukan untuk dihapus." });
}
`;

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
 * Normalize date strings into YYYY-MM-DD
 */
export function normalizeDateString(rawDate: string): string {
  if (!rawDate) return '';
  const cleaned = rawDate.replace(/['"]/g, '').trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(cleaned)) {
    const parts = cleaned.split('-');
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }

  // If DD/MM/YYYY or MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
    const parts = cleaned.split('/');
    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);
    // If first > 12, it must be DD/MM/YYYY
    if (first > 12) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    // If second > 12, it must be MM/DD/YYYY
    if (second > 12) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    // Default Indonesian format DD/MM/YYYY
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }

  // If DD-MM-YYYY or MM-DD-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleaned)) {
    const parts = cleaned.split('-');
    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);
    if (first > 12) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    if (second > 12) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }

  return cleaned;
}

/**
 * Helper to parse pakan collector inputs from string and distribute weight
 */
export function parsePakanInputs(rawCollector: string, totalWeight: number, kelurahanId: KelurahanId): PakanCollectorInput[] {
  if (totalWeight <= 0) return [];
  const inputs: PakanCollectorInput[] = [];

  // Check if formatted like "Ansu (47Kg), Awal Wahid (36Kg)"
  const withWeights = rawCollector.match(/([A-Za-z\s.]+)\s*\(([0-9.,]+)\s*Kg\)/gi);
  if (withWeights && withWeights.length > 0) {
    for (const match of withWeights) {
      const parts = match.match(/([A-Za-z\s.]+)\s*\(([0-9.,]+)\s*Kg\)/i);
      if (parts) {
        const name = parts[1].trim();
        const weight = parseIndonesianNumber(parts[2]);
        inputs.push({
          collectorId: `col-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          collectorName: name,
          weightKg: weight,
        });
      }
    }
    if (inputs.length > 0) return inputs;
  }

  const kelCollectors = INITIAL_COLLECTORS.filter((c) => c.kelurahanId === kelurahanId);
  const names = rawCollector.split(',').map((s) => s.trim()).filter((s) => s.length > 0 && s !== '-');

  if (names.length > 1 && kelCollectors.length > 0) {
    const matched = names.map((n) =>
      kelCollectors.find((c) => c.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(c.name.toLowerCase()))
    );
    const validCount = matched.filter(Boolean).length || names.length;
    const baseShare = Math.floor(totalWeight / validCount);
    let remainder = totalWeight - baseShare * validCount;

    for (let i = 0; i < names.length; i++) {
      const colObj = matched[i];
      const colName = colObj ? colObj.name : names[i];
      const colId = colObj ? colObj.id : `col-${colName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const weight = baseShare + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      inputs.push({
        collectorId: colId,
        collectorName: colName,
        weightKg: weight,
      });
    }
    return inputs;
  }

  const singleName = names.length === 1 ? names[0] : (kelCollectors[0]?.name || (rawCollector !== '-' ? rawCollector : 'Petugas Pakan'));
  const matchedSingle = kelCollectors.find((c) => c.name.toLowerCase().includes(singleName.toLowerCase()));

  inputs.push({
    collectorId: matchedSingle ? matchedSingle.id : `col-${singleName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    collectorName: matchedSingle ? matchedSingle.name : singleName,
    weightKg: totalWeight,
  });

  return inputs;
}

/**
 * Helper to parse numbers in Indonesian format (e.g. "1.170", "1,099", "518", "1.099,50")
 */
export function parseIndonesianNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  if (!str || str === '-') return 0;

  const cleaned = str.replace(/['"]/g, '').trim();

  // If thousand separator dot, e.g. "1.170" or "16.063" or "1.099"
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return Number(cleaned.replace(/\./g, ''));
  }

  // If thousand separator dot with comma decimal, e.g. "1.170,50"
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(cleaned)) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.'));
  }

  // If comma used as thousand separator or decimal, e.g. "1,099" or "5,5"
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) {
      return Number(cleaned.replace(/,/g, ''));
    }
    return Number(cleaned.replace(',', '.'));
  }

  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Flexible Kelurahan ID matching supporting codes, full names, short names, and fuzzy variants
 */
export function findKelurahanId(rawStr: string): KelurahanId | undefined {
  if (!rawStr) return undefined;
  const upper = rawStr.toUpperCase().trim();
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

  for (const id of validKelurahanIds) {
    if (upper === id || upper.includes(id)) {
      return id;
    }
  }

  for (const id of validKelurahanIds) {
    const meta = KELURAHAN_LIST.find((k) => k.id === id);
    if (meta) {
      const nameUpper = meta.name.toUpperCase();
      const shortName = nameUpper.replace('KELURAHAN ', '').trim();
      if (upper.includes(nameUpper) || upper.includes(shortName)) {
        return id;
      }
      if (meta.code && upper.includes(meta.code)) {
        return id;
      }
    }
  }

  if (upper.includes('BULO') || upper.includes('GADING')) return 'BULOGADING';
  if (upper.includes('LAE')) return 'LAE-LAE';
  if (upper.includes('LAJANG') || upper.includes('IRU')) return 'LAJANGIRU';
  if (upper.includes('LOSARI')) return 'LOSARI';
  if (upper.includes('MALOKU')) return 'MALOKU';
  if (upper.includes('MANGKURA')) return 'MANGKURA';
  if (upper.includes('PISANG') && upper.includes('SEL')) return 'PISANG SELATAN';
  if (upper.includes('PISANG') && upper.includes('UT')) return 'PISANG UTARA';
  if (upper.includes('SAWERI')) return 'SAWERIGADING';
  if (upper.includes('BARU')) return 'BARU';

  return undefined;
}

/**
 * Fetch and parse data from Google Sheets INPUT_HARIAN
 */
export async function fetchGoogleSheetsRecords(
  spreadsheetId = DEFAULT_SPREADSHEET_ID,
  appsScriptUrl = DEFAULT_APPS_SCRIPT_URL
): Promise<{ success: boolean; records: DailyRecord[]; totalRows: number; error?: string }> {
  // Try Apps Script API first (bypasses Google Account login redirects in external Chrome)
  if (appsScriptUrl) {
    try {
      const apiUrl = `${appsScriptUrl}?action=getAll&sheet=INPUT_HARIAN`;
      const res = await fetch(apiUrl, { mode: 'cors' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.status === 'success' && Array.isArray(json.records) && json.records.length > 0) {
          const records: DailyRecord[] = [];

          for (const item of json.records) {
            const rawDate = item['Tanggal'] || item['tanggal'] || item['Date'] || item['TANGGAL'] || item['Tgl'] || '';
            const date = normalizeDateString(String(rawDate));
            const rawKel = String(
              item['Nama_Kelurahan'] ||
              item['Nama Kelurahan'] ||
              item['NAMA KELURAHAN'] ||
              item['Kelurahan'] ||
              item['kelurahan'] ||
              item['KELURAHAN'] ||
              item['Kelurahan_ID'] ||
              item['Kelurahan ID'] ||
              item['Kode_Kelurahan'] ||
              ''
            ).trim();

            if (!date || !rawKel) continue;

            const matchedKel = findKelurahanId(rawKel);
            if (!matchedKel) continue;

            const makananTpa = parseIndonesianNumber(item['Makanan_TPA_Kg'] ?? item['Makanan_TPA'] ?? item['Makanan TPA'] ?? item['makanan_tpa'] ?? item['Makanan (TPA)']);
            const makananTps3r = parseIndonesianNumber(item['Makanan_TPS3R_Kg'] ?? item['Makanan_TPS3R'] ?? item['Makanan TPS3R'] ?? item['makanan_tps3r'] ?? item['Makanan (TPS3R)']);
            const sisaBuahTpa = parseIndonesianNumber(item['Sisa_Buah_TPA_Kg'] ?? item['Buah_TPA'] ?? item['Buah TPA'] ?? item['Sisa_Buah_TPA'] ?? item['Sisa Buah TPA'] ?? item['Sisa Buah (TPA)']);
            const sisaBuahTps3r = parseIndonesianNumber(item['Sisa_Buah_TPS3R_Kg'] ?? item['Buah_TPS3R'] ?? item['Buah TPS3R'] ?? item['Sisa_Buah_TPS3R'] ?? item['Sisa Buah TPS3R'] ?? item['Sisa Buah (TPS3R)']);
            const sisaSayurTpa = parseIndonesianNumber(item['Sisa_Sayur_TPA_Kg'] ?? item['Sayur_TPA'] ?? item['Sayur TPA'] ?? item['Sisa_Sayur_TPA'] ?? item['Sisa Sayur TPA'] ?? item['Sisa Sayur (TPA)']);
            const sisaSayurTps3r = parseIndonesianNumber(item['Sisa_Sayur_TPS3R_Kg'] ?? item['Sayur_TPS3R'] ?? item['Sayur TPS3R'] ?? item['Sisa_Sayur_TPS3R'] ?? item['Sisa Sayur TPS3R'] ?? item['Sisa Sayur (TPS3R)']);
            const daunTpa = parseIndonesianNumber(item['Daun_TPA_Kg'] ?? item['Daun_TPA'] ?? item['Daun TPA'] ?? item['daun_tpa'] ?? item['Daun (TPA)']);
            const daunTps3r = parseIndonesianNumber(item['Daun_TPS3R_Kg'] ?? item['Daun_TPS3R'] ?? item['Daun TPS3R'] ?? item['daun_tps3r'] ?? item['Daun (TPS3R)']);

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

            const rawCollector = String(item['Nama_Petugas_Pakan'] || item['Petugas_Pakan'] || item['Petugas Pakan'] || item['Petugas_Kebersihan'] || '-').trim();
            const pakanWeight = parseIndonesianNumber(item['Berat_Pakan_Kg'] ?? item['Berat Pakan Kg'] ?? item['Berat_Pakan'] ?? item['Pakan_Kg'] ?? item['Pakan (Kg)']);
            const pakanInputs: PakanCollectorInput[] = parsePakanInputs(rawCollector, pakanWeight, matchedKel);

            const totalWeight = makananTpa + makananTps3r + sisaBuahTpa + sisaBuahTps3r + sisaSayurTpa + sisaSayurTps3r + daunTpa + daunTps3r + pakanWeight;
            const id = `${date}_${matchedKel}`;
            const existingIdx = records.findIndex((r) => r.id === id);

            const newRecord: DailyRecord = {
              id,
              date,
              kelurahanId: matchedKel,
              composition,
              pakanInputs,
              updatedAt: new Date().toISOString(),
              submittedBy: String(item['Petugas_Input'] || item['Petugas Input'] || `Petugas ${matchedKel}`).trim(),
            };

            if (existingIdx >= 0) {
              const existing = records[existingIdx];
              const existingTotal =
                (existing.composition.makananTpa || 0) +
                (existing.composition.makananTps3r || 0) +
                (existing.composition.sisaBuahTpa || 0) +
                (existing.composition.sisaBuahTps3r || 0) +
                (existing.composition.sisaSayurTpa || 0) +
                (existing.composition.sisaSayurTps3r || 0) +
                (existing.composition.daunTpa || 0) +
                (existing.composition.daunTps3r || 0) +
                (existing.pakanInputs?.reduce((s, p) => s + (p.weightKg || 0), 0) || 0);

              if (totalWeight > 0 || existingTotal === 0) {
                records[existingIdx] = newRecord;
              }
            } else {
              records.push(newRecord);
            }
          }

          if (records.length > 0) {
            return { success: true, records, totalRows: records.length };
          }
        }
      }
    } catch (e) {
      // Continue to fallback CSV fetch
    }
  }

  // Fallback to Google Sheets CSV export
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

    const records: DailyRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length < 4) continue;

      const rawDate = cols[1]?.replace(/['"]/g, '').trim();
      const date = normalizeDateString(rawDate);
      const rawKel = (cols[3] || cols[2])?.replace(/['"]/g, '').trim();

      if (!date || !rawKel) continue;

      const matchedKel = findKelurahanId(rawKel);
      if (!matchedKel) continue;

      const makananTpa = parseIndonesianNumber(cols[4]);
      const makananTps3r = parseIndonesianNumber(cols[5]);
      const sisaBuahTpa = parseIndonesianNumber(cols[6]);
      const sisaBuahTps3r = parseIndonesianNumber(cols[7]);
      const sisaSayurTpa = parseIndonesianNumber(cols[8]);
      const sisaSayurTps3r = parseIndonesianNumber(cols[9]);
      const daunTpa = parseIndonesianNumber(cols[10]);
      const daunTps3r = parseIndonesianNumber(cols[11]);
      const rawCollector = cols[12]?.replace(/['"]/g, '').trim() || '-';
      const pakanWeight = parseIndonesianNumber(cols[13]);
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

      const pakanInputs: PakanCollectorInput[] = parsePakanInputs(rawCollector, pakanWeight, matchedKel);
      const totalWeight = makananTpa + makananTps3r + sisaBuahTpa + sisaBuahTps3r + sisaSayurTpa + sisaSayurTps3r + daunTpa + daunTps3r + pakanWeight;
      const id = `${date}_${matchedKel}`;
      const existingIdx = records.findIndex((r) => r.id === id);

      const newRecord: DailyRecord = {
        id,
        date,
        kelurahanId: matchedKel,
        composition,
        pakanInputs,
        updatedAt: new Date().toISOString(),
        submittedBy,
      };

      if (existingIdx >= 0) {
        const existing = records[existingIdx];
        const existingTotal =
          (existing.composition.makananTpa || 0) +
          (existing.composition.makananTps3r || 0) +
          (existing.composition.sisaBuahTpa || 0) +
          (existing.composition.sisaBuahTps3r || 0) +
          (existing.composition.sisaSayurTpa || 0) +
          (existing.composition.sisaSayurTps3r || 0) +
          (existing.composition.daunTpa || 0) +
          (existing.composition.daunTps3r || 0) +
          (existing.pakanInputs?.reduce((s, p) => s + (p.weightKg || 0), 0) || 0);

        if (totalWeight > 0 || existingTotal === 0) {
          records[existingIdx] = newRecord;
        }
      } else {
        records.push(newRecord);
      }
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
 * Fetch Anorganik records from Google Sheets REKAP_ANORGANIK
 */
export async function fetchAnorganikSheetsRecords(
  spreadsheetId = DEFAULT_SPREADSHEET_ID,
  appsScriptUrl = DEFAULT_APPS_SCRIPT_URL
): Promise<{ success: boolean; records: AnorganikDailyRecord[]; error?: string }> {
  // Try Apps Script API first
  if (appsScriptUrl) {
    try {
      const apiUrl = `${appsScriptUrl}?action=getAll&sheet=REKAP_ANORGANIK`;
      const res = await fetch(apiUrl, { mode: 'cors' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.status === 'success' && Array.isArray(json.records) && json.records.length > 0) {
          const records: AnorganikDailyRecord[] = [];
          const validKelurahanIds: KelurahanId[] = [
            'BARU', 'BULOGADING', 'LAE-LAE', 'LAJANGIRU', 'LOSARI',
            'MALOKU', 'MANGKURA', 'PISANG SELATAN', 'PISANG UTARA', 'SAWERIGADING',
          ];

          for (const item of json.records) {
            const rawDate = item['Tanggal'] || item['tanggal'] || '';
            const date = normalizeDateString(String(rawDate));
            const rawKel = String(item['Kelurahan'] || item['kelurahan'] || '').trim();
            if (!date || !rawKel) continue;

            const matchedKel = findKelurahanId(rawKel);
            if (!matchedKel) continue;

            const satgasMobilKg = parseIndonesianNumber(item['Satgas_Mobil_Kg'] ?? item['Satgas Mobil Kg'] ?? item['Mobil_Kg'] ?? item['Satgas Mobil']);
            const satgasFukudaKg = parseIndonesianNumber(item['Satgas_Fukuda_Kg'] ?? item['Satgas Fukuda Kg'] ?? item['Fukuda_Kg'] ?? item['Satgas Fukuda']);
            const totalKg = parseIndonesianNumber(item['Total_Kg'] ?? item['Total Kg']) || (satgasMobilKg + satgasFukudaKg);

            records.push({
              id: `${date}_${matchedKel}`,
              date,
              kelurahanId: matchedKel,
              satgasMobilKg,
              satgasFukudaKg,
              totalKg,
              updatedAt: new Date().toISOString(),
            });
          }

          if (records.length > 0) return { success: true, records };
        }
      }
    } catch (e) {}
  }

  // Fallback to Google Sheets CSV export
  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=REKAP_ANORGANIK`;
    const response = await fetch(url);
    if (!response.ok) return { success: false, records: [] };
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return { success: true, records: [] };

    const records: AnorganikDailyRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length < 2) continue;
      const rawDate = cols[0]?.replace(/['"]/g, '').trim();
      const date = normalizeDateString(rawDate);
      const rawKel = cols[1]?.replace(/['"]/g, '').trim();
      if (!date || !rawKel) continue;

      const satgasMobilKg = parseIndonesianNumber(cols[2]);
      const satgasFukudaKg = parseIndonesianNumber(cols[3]);
      const totalKg = parseIndonesianNumber(cols[4]) || (satgasMobilKg + satgasFukudaKg);

      const matchedKel = findKelurahanId(rawKel);
      if (!matchedKel) continue;

      records.push({
        id: `${date}_${matchedKel}`,
        date,
        kelurahanId: matchedKel,
        satgasMobilKg,
        satgasFukudaKg,
        totalKg,
        updatedAt: new Date().toISOString(),
      });
    }
    return { success: true, records };
  } catch (err: any) {
    return { success: false, records: [], error: err?.message };
  }
}

/**
 * Fetch Residu records from Google Sheets REKAP_RESIDU
 */
export async function fetchResiduSheetsRecords(
  spreadsheetId = DEFAULT_SPREADSHEET_ID,
  appsScriptUrl = DEFAULT_APPS_SCRIPT_URL
): Promise<{ success: boolean; records: ResiduRecord[]; error?: string }> {
  // Try Apps Script API first
  if (appsScriptUrl) {
    try {
      const apiUrl = `${appsScriptUrl}?action=getAll&sheet=REKAP_RESIDU`;
      const res = await fetch(apiUrl, { mode: 'cors' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.status === 'success' && Array.isArray(json.records) && json.records.length > 0) {
          const records: ResiduRecord[] = [];

          for (const item of json.records) {
            const rawDate = item['Tanggal'] || item['tanggal'] || '';
            const date = normalizeDateString(String(rawDate));
            const rawKel = String(item['Kelurahan'] || item['kelurahan'] || '').trim();
            if (!date || !rawKel) continue;

            const matchedKel = findKelurahanId(rawKel);
            if (!matchedKel) continue;

            const beratKg = parseIndonesianNumber(item['Berat_Residu_Kg'] ?? item['Berat Residu Kg'] ?? item['Berat_Kg'] ?? item['Berat (Kg)']);
            const catatan = String(item['Lokasi_TPA'] || item['Catatan'] || '').trim();

            records.push({
              id: `${date}_${matchedKel}`,
              date,
              kelurahanId: matchedKel,
              beratKg,
              catatan,
              updatedAt: new Date().toISOString(),
            });
          }

          if (records.length > 0) return { success: true, records };
        }
      }
    } catch (e) {}
  }

  // Fallback to Google Sheets CSV export
  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=REKAP_RESIDU`;
    const response = await fetch(url);
    if (!response.ok) return { success: false, records: [] };
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return { success: true, records: [] };

    const records: ResiduRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length < 2) continue;
      const rawDate = cols[0]?.replace(/['"]/g, '').trim();
      const date = normalizeDateString(rawDate);
      const rawKel = cols[1]?.replace(/['"]/g, '').trim();
      if (!date || !rawKel) continue;

      const beratKg = parseIndonesianNumber(cols[2]);
      const catatan = cols[3]?.replace(/['"]/g, '').trim() || '';

      const matchedKel = findKelurahanId(rawKel);
      if (!matchedKel) continue;

      records.push({
        id: `${date}_${matchedKel}`,
        date,
        kelurahanId: matchedKel,
        beratKg,
        catatan,
        updatedAt: new Date().toISOString(),
      });
    }
    return { success: true, records };
  } catch (err: any) {
    return { success: false, records: [], error: err?.message };
  }
}

/**
 * Fetch Horeka records from Google Sheets DATA_HOREKA_147
 * Supports both Google Apps Script JSON API and Google Sheets CSV export
 */
export async function fetchHorekaSheetsRecords(
  spreadsheetId = DEFAULT_SPREADSHEET_ID,
  appsScriptUrl = DEFAULT_APPS_SCRIPT_URL
): Promise<{ success: boolean; records: HorekaDailyRecord[]; error?: string }> {
  // Strategy 1: Fetch via Google Apps Script Web App
  if (appsScriptUrl) {
    try {
      const apiUrl = `${appsScriptUrl}?action=getAll&sheet=DATA_HOREKA_147`;
      const res = await fetch(apiUrl, { mode: 'cors' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.status === 'success' && Array.isArray(json.records) && json.records.length > 0) {
          const records: HorekaDailyRecord[] = [];

          for (const item of json.records) {
            const rawDate = item['Tanggal'] || item['tanggal'] || item['Date'] || '';
            const date = normalizeDateString(String(rawDate));
            const namaUsaha = String(item['Nama_Usaha'] || item['nama_usaha'] || item['Nama Usaha'] || item['Nama'] || '').trim();
            const kelurahanStr = String(item['Kelurahan'] || item['kelurahan'] || '').trim();
            if (!date || !namaUsaha) continue;

            const organikKg = parseIndonesianNumber(item['Organik_Kg'] ?? item['Organik Kg'] ?? item['Organik']);
            const anorganikKg = parseIndonesianNumber(item['Anorganik_Kg'] ?? item['Anorganik Kg'] ?? item['Anorganik']);
            const residuKg = parseIndonesianNumber(item['Residu_Kg'] ?? item['Residu Kg'] ?? item['Residu']);

            const matchedKel = findKelurahanId(kelurahanStr) || 'LOSARI';

            const cleanTarget = namaUsaha.toLowerCase().replace(/[^a-z0-9]/g, '');
            const business = HOREKA_BUSINESSES.find((b) => {
              const cleanB = b.namaUsaha.toLowerCase().replace(/[^a-z0-9]/g, '');
              return cleanB === cleanTarget || cleanTarget.includes(cleanB) || cleanB.includes(cleanTarget);
            });

            const horekaId = business ? business.id : `hor-${namaUsaha.toLowerCase().replace(/\s+/g, '-')}`;

            records.push({
              date,
              horekaId,
              kelurahanId: matchedKel,
              organikKg,
              anorganikKg,
              residuKg,
              updatedAt: new Date().toISOString(),
            });
          }

          if (records.length > 0) {
            return { success: true, records };
          }
        }
      }
    } catch (e) {
      // Continue to fallback CSV
    }
  }

  // Strategy 2: Fallback to Google Sheets CSV export
  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=DATA_HOREKA_147`;
    const response = await fetch(url);
    if (!response.ok) return { success: false, records: [] };
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return { success: true, records: [] };

    const records: HorekaDailyRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length < 4) continue;
      const rawDate = cols[1]?.replace(/['"]/g, '').trim();
      const date = normalizeDateString(rawDate);
      const namaUsaha = cols[2]?.replace(/['"]/g, '').trim();
      const kelurahanStr = cols[3]?.replace(/['"]/g, '').trim();
      if (!date || !namaUsaha) continue;

      const organikKg = parseIndonesianNumber(cols[5]);
      const anorganikKg = parseIndonesianNumber(cols[6]);
      const residuKg = parseIndonesianNumber(cols[7]);

      const matchedKel = findKelurahanId(kelurahanStr) || 'LOSARI';

      const cleanTarget = namaUsaha.toLowerCase().replace(/[^a-z0-9]/g, '');
      const business = HOREKA_BUSINESSES.find((b) => {
        const cleanB = b.namaUsaha.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanB === cleanTarget || cleanTarget.includes(cleanB) || cleanB.includes(cleanTarget);
      });
      const horekaId = business ? business.id : `hor-${namaUsaha.toLowerCase().replace(/\s+/g, '-')}`;

      records.push({
        date,
        horekaId,
        kelurahanId: matchedKel,
        organikKg,
        anorganikKg,
        residuKg,
        updatedAt: new Date().toISOString(),
      });
    }
    return { success: true, records };
  } catch (err: any) {
    return { success: false, records: [], error: err?.message };
  }
}

/**
 * Push Organik record to Google Apps Script
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
): Promise<{ success: boolean; message: string; isScriptError?: boolean; details?: string }> {
  if (!scriptUrl || scriptUrl.trim().length === 0) {
    return {
      success: false,
      message: 'URL Google Apps Script belum disetel.',
    };
  }

  const payload = JSON.stringify({
    action: 'saveOrganik',
    data: record,
  });

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
    });

    const responseText = await response.text();

    if (
      responseText.includes('ReferenceError') ||
      responseText.includes('jsonResponse is not defined') ||
      responseText.includes('Script function not found') ||
      responseText.includes('Exception:')
    ) {
      return {
        success: false,
        isScriptError: true,
        message: 'Google Apps Script mengembalikan pesan error saat memproses penyimpanan.',
      };
    }

    try {
      const result = JSON.parse(responseText);
      if (result.status === 'success' || result.success === true) {
        return {
          success: true,
          message: result.message || 'Data Organik berhasil tersimpan di Google Spreadsheet!',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Google Apps Script menolak penulisan data.',
        };
      }
    } catch {
      return {
        success: true,
        message: 'Data Organik berhasil terkirim ke Google Apps Script.',
      };
    }
  } catch (err: any) {
    console.error('Error pushing to Apps Script:', err);
    return {
      success: false,
      message: err?.message || 'Gagal menghubungi Google Apps Script.',
    };
  }
}

/**
 * Push Anorganik record to Google Apps Script
 */
export async function pushAnorganikToGoogleAppsScript(
  scriptUrl: string,
  record: {
    date: string;
    kelurahanId: KelurahanId;
    satgasMobilKg: number;
    satgasFukudaKg: number;
    catatan?: string;
    submittedBy?: string;
  }
): Promise<{ success: boolean; message: string; isScriptError?: boolean }> {
  if (!scriptUrl || scriptUrl.trim().length === 0) {
    return { success: false, message: 'URL Google Apps Script belum disetel.' };
  }
  const payload = JSON.stringify({
    action: 'saveAnorganik',
    data: record,
  });

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
    });
    const responseText = await response.text();
    try {
      const result = JSON.parse(responseText);
      if (result.status === 'success' || result.success === true) {
        return { success: true, message: result.message || 'Data Anorganik tersimpan di Google Spreadsheet!' };
      } else {
        return { success: false, message: result.message || 'Gagal menyimpan Anorganik di Google Sheets.' };
      }
    } catch {
      return { success: true, message: 'Data Anorganik dikirim ke Google Apps Script.' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal menghubungi Google Apps Script.' };
  }
}

/**
 * Push Residu record to Google Apps Script
 */
export async function pushResiduToGoogleAppsScript(
  scriptUrl: string,
  record: {
    date: string;
    kelurahanId: KelurahanId;
    beratKg: number;
    catatan?: string;
    submittedBy?: string;
  }
): Promise<{ success: boolean; message: string; isScriptError?: boolean }> {
  if (!scriptUrl || scriptUrl.trim().length === 0) {
    return { success: false, message: 'URL Google Apps Script belum disetel.' };
  }
  const payload = JSON.stringify({
    action: 'saveResidu',
    data: record,
  });

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
    });
    const responseText = await response.text();
    try {
      const result = JSON.parse(responseText);
      if (result.status === 'success' || result.success === true) {
        return { success: true, message: result.message || 'Data Residu tersimpan di Google Spreadsheet!' };
      } else {
        return { success: false, message: result.message || 'Gagal menyimpan Residu di Google Sheets.' };
      }
    } catch {
      return { success: true, message: 'Data Residu dikirim ke Google Apps Script.' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal menghubungi Google Apps Script.' };
  }
}

/**
 * Push Horeka record to Google Apps Script
 */
export async function pushHorekaToGoogleAppsScript(
  scriptUrl: string,
  record: {
    date: string;
    horekaId: string;
    namaUsaha: string;
    kelurahanId: string;
    alamat: string;
    organikKg: number;
    anorganikKg: number;
    residuKg: number;
    operatorName?: string;
  }
): Promise<{ success: boolean; message: string; isScriptError?: boolean }> {
  if (!scriptUrl || scriptUrl.trim().length === 0) {
    return { success: false, message: 'URL Google Apps Script belum disetel.' };
  }
  const payload = JSON.stringify({
    action: 'saveHoreka',
    data: record,
  });

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
    });
    const responseText = await response.text();
    try {
      const result = JSON.parse(responseText);
      if (result.status === 'success' || result.success === true) {
        return { success: true, message: result.message || 'Data Horeka tersimpan di Google Spreadsheet!' };
      } else {
        return { success: false, message: result.message || 'Gagal menyimpan Horeka di Google Sheets.' };
      }
    } catch {
      return { success: true, message: 'Data Horeka dikirim ke Google Apps Script.' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal menghubungi Google Apps Script.' };
  }
}

/**
 * Test connectivity with Google Apps Script Web App
 */
export async function testAppsScriptConnection(
  scriptUrl: string
): Promise<{
  success: boolean;
  status: 'active' | 'reference_error' | 'missing_doget' | 'unreachable';
  message: string;
}> {
  if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      status: 'unreachable',
      message: 'Format URL Web App Google Apps Script tidak valid.',
    };
  }

  try {
    const res = await fetch(`${scriptUrl}?action=getAll`, { method: 'GET' });
    const text = await res.text();

    if (text.includes('ReferenceError') || text.includes('jsonResponse is not defined')) {
      return {
        success: false,
        status: 'reference_error',
        message: 'Kode di Google Sheets Anda menghasilkan ReferenceError.',
      };
    }

    try {
      const data = JSON.parse(text);
      if (data.status === 'success') {
        return {
          success: true,
          status: 'active',
          message: `Koneksi Sempurna! Web App aktif (${data.totalRecords ?? 0} data terbaca).`,
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
      message: 'Tidak dapat menjangkau Web App. Periksa izin akses (Anyone / Siapa Saja) pada Google Apps Script Anda.',
    };
  }
}

export async function sendTestRecordToGoogleSheets(scriptUrl: string) {
  return pushRecordToGoogleAppsScript(scriptUrl, {
    date: '2026-10-21',
    kelurahanId: 'BARU',
    composition: {
      makananTpa: 170,
      makananTps3r: 760,
      sisaBuahTpa: 0,
      sisaBuahTps3r: 0,
      sisaSayurTpa: 0,
      sisaSayurTps3r: 0,
      daunTpa: 0,
      daunTps3r: 0,
    },
    pakanInputs: [
      {
        collectorId: 'col-test',
        collectorName: 'Uji Coba Sistem',
        weightKg: 45,
      },
    ],
    submittedBy: 'Uji Coba Web SAPU-UP',
  });
}

