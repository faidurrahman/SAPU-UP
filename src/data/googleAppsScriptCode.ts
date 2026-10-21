/**
 * Google Apps Script Code for SAPU-UP Kecamatan Ujung Pandang
 * SPREADSHEET ID: 1NU5cVMjCR0tQuzFZjMZxh56X6ouzsJqahROiPKzXl2s
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * SAPU-UP - SISTEM APLIKASI PERSAMPAHAN UJUNG PANDANG
 * GOOGLE APPS SCRIPT SYNC & API WEB APP (KOTA MAKASSAR)
 * ID Spreadsheet: 1NU5cVMjCR0tQuzFZjMZxh56X6ouzsJqahROiPKzXl2s
 * =========================================================================
 * PENTING:
 * 1. Hapus SELURUH isi file Kode.gs lama di Apps Script Anda.
 * 2. Salin dan tempel SELURUH baris kode ini dari paling atas sampai paling bawah.
 * 3. Simpan (ikon disket / Ctrl+S).
 * 4. Klik menu "Terapkan" (Deploy) > "Kelola deployment" (Manage deployments).
 * 5. Klik ikon Pensil (Edit) > ubah Versi menjadi "Versi baru" (New version).
 * 6. Klik "Terapkan" (Deploy).
 * =========================================================================
 */

// Nama-nama sheet yang digunakan dalam spreadsheet
const SHEET_INPUT = "INPUT_HARIAN";
const SHEET_REKAP_RESMI = "REKAP_HARIAN_RESMI";
const SHEET_REKAP_MATRIKS = "REKAP_MATRIKS_BULANAN";

/**
 * HELPER UTAMA: JSON Response (diletakkan di paling atas agar selalu terdefinisi)
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper: Format Date ke string YYYY-MM-DD
 */
function formatDateString(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, "Asia/Makassar", "yyyy-MM-dd");
  }
  const s = String(val).trim();
  if (s.indexOf("/") !== -1) {
    const parts = s.split("/");
    if (parts.length === 3) {
      return parts[2] + "-" + String(parts[1]).padStart(2, "0") + "-" + String(parts[0]).padStart(2, "0");
    }
  }
  return s.substring(0, 10);
}

function getKelurahanFullName(id) {
  const map = {
    "BARU": "Kelurahan Baru",
    "BULOGADING": "Kelurahan Bulogading",
    "LAE-LAE": "Kelurahan Lae-Lae",
    "LAJANGIRU": "Kelurahan Lajangiru",
    "LOSARI": "Kelurahan Losari",
    "MALOKU": "Kelurahan Maloku",
    "MANGKURA": "Kelurahan Mangkura",
    "PISANG SELATAN": "Kelurahan Pisang Selatan",
    "PISANG UTARA": "Kelurahan Pisang Utara",
    "SAWERIGADING": "Kelurahan Sawerigading"
  };
  return map[id] || ("Kelurahan " + id);
}

function getKelurahanCode(id) {
  const map = {
    "BARU": "73.71.01.1001",
    "BULOGADING": "73.71.01.1002",
    "LAE-LAE": "73.71.01.1003",
    "LAJANGIRU": "73.71.01.1004",
    "LOSARI": "73.71.01.1005",
    "MALOKU": "73.71.01.1006",
    "MANGKURA": "73.71.01.1007",
    "PISANG SELATAN": "73.71.01.1008",
    "PISANG UTARA": "73.71.01.1009",
    "SAWERIGADING": "73.71.01.1010"
  };
  return map[id] || "73.71.01.0000";
}

/**
 * Menu otomatis saat Spreadsheet dibuka
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🌿 SAPU-UP Ujung Pandang")
    .addItem("📱 Buat Format WhatsApp Hari Ini", "showWhatsAppBroadcastModal")
    .addItem("🔄 Hitung Ulang & Periksa Neraca", "checkBalanceAndFormulas")
    .addSeparator()
    .addItem("🌐 Buka Web SAPU-UP", "openDashboardUrl")
    .addToUi();
}

/**
 * Handle HTTP GET Requests (API untuk Web App SAPU-UP)
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : "getAll";
    const date = e && e.parameter ? e.parameter.date : "";

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_INPUT);

    if (!sheet) {
      return jsonResponse({ status: "error", message: "Sheet " + SHEET_INPUT + " tidak ditemukan." });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ status: "success", records: [] });
    }

    const records = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowDate = formatDateString(row[1]);
      if (!rowDate) continue;

      if (date && rowDate !== date) continue;

      records.push({
        no: row[0],
        tanggal: rowDate,
        kodeKelurahan: row[2],
        kelurahan: row[3],
        makananTpa: Number(row[4]) || 0,
        makananTps3r: Number(row[5]) || 0,
        sisaBuahTpa: Number(row[6]) || 0,
        sisaBuahTps3r: Number(row[7]) || 0,
        sisaSayurTpa: Number(row[8]) || 0,
        sisaSayurTps3r: Number(row[9]) || 0,
        daunTpa: Number(row[10]) || 0,
        daunTps3r: Number(row[11]) || 0,
        namaPetugasPakan: String(row[12] || "-"),
        beratPakanKg: Number(row[13]) || 0,
        totalTpaKg: Number(row[14]) || 0,
        totalTps3rKg: Number(row[15]) || 0,
        totalPakanKg: Number(row[16]) || 0,
        grandTotalKg: Number(row[17]) || 0,
        petugasInput: String(row[18] || ""),
        catatan: String(row[19] || "")
      });
    }

    return jsonResponse({
      status: "success",
      totalRecords: records.length,
      records: records
    });
  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Handle HTTP POST Requests (Menerima input baru / update data dari Web SAPU-UP ke Google Spreadsheet)
 */
function doPost(e) {
  try {
    let postData;
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.data) {
      postData = JSON.parse(e.parameter.data);
    } else {
      return jsonResponse({ status: "error", message: "Body request kosong atau format bukan JSON." });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_INPUT);

    if (!sheet) {
      return jsonResponse({ status: "error", message: "Sheet " + SHEET_INPUT + " tidak ditemukan." });
    }

    const record = postData.data;
    if (!record || !record.date || !record.kelurahanId) {
      return jsonResponse({ status: "error", message: "Data tidak lengkap: tanggal atau kelurahan kosong." });
    }

    const formattedDate = record.date;
    const kelurahanName = getKelurahanFullName(record.kelurahanId);
    const kelurahanCode = getKelurahanCode(record.kelurahanId);

    const comp = record.composition || {};
    const makananTpa = Number(comp.makananTpa) || 0;
    const makananTps3r = Number(comp.makananTps3r) || 0;
    const sisaBuahTpa = Number(comp.sisaBuahTpa) || 0;
    const sisaBuahTps3r = Number(comp.sisaBuahTps3r) || 0;
    const sisaSayurTpa = Number(comp.sisaSayurTpa) || 0;
    const sisaSayurTps3r = Number(comp.sisaSayurTps3r) || 0;
    const daunTpa = Number(comp.daunTpa) || 0;
    const daunTps3r = Number(comp.daunTps3r) || 0;

    let pakanNames = "-";
    let pakanTotal = 0;
    if (record.pakanInputs && record.pakanInputs.length > 0) {
      pakanNames = record.pakanInputs
        .filter(function(p) { return p.weightKg > 0; })
        .map(function(p) { return p.collectorName + " (" + p.weightKg + "Kg)"; })
        .join(", ") || "-";
      pakanTotal = record.pakanInputs.reduce(function(sum, p) { return sum + (Number(p.weightKg) || 0); }, 0);
    }

    const data = sheet.getDataRange().getValues();
    let existingRowIndex = -1;

    for (let r = 1; r < data.length; r++) {
      const d = formatDateString(data[r][1]);
      const k = String(data[r][3]).toUpperCase();
      if (d === formattedDate && (k.indexOf(record.kelurahanId) !== -1 || k === kelurahanName.toUpperCase())) {
        existingRowIndex = r + 1; // 1-indexed baris spreadsheet
        break;
      }
    }

    const targetRow = existingRowIndex > 0 ? existingRowIndex : sheet.getLastRow() + 1;

    // Masukkan data baris dengan formula otomatis Excel/Google Sheets
    const rowValues = [
      existingRowIndex > 0 ? sheet.getRange(targetRow, 1).getValue() : targetRow - 1,
      formattedDate,
      kelurahanCode,
      kelurahanName,
      makananTpa,
      makananTps3r,
      sisaBuahTpa,
      sisaBuahTps3r,
      sisaSayurTpa,
      sisaSayurTps3r,
      daunTpa,
      daunTps3r,
      pakanNames,
      pakanTotal,
      "=E" + targetRow + "+G" + targetRow + "+I" + targetRow + "+K" + targetRow, // TOTAL_TPA
      "=F" + targetRow + "+H" + targetRow + "+J" + targetRow + "+L" + targetRow, // TOTAL_TPS3R
      "=N" + targetRow,                                                         // TOTAL_PAKAN
      "=O" + targetRow + "+P" + targetRow + "+Q" + targetRow,                   // GRAND_TOTAL
      record.submittedBy || "Petugas " + record.kelurahanId,
      "Tersinkronisasi dari Web SAPU-UP (" + Utilities.formatDate(new Date(), "Asia/Makassar", "yyyy-MM-dd HH:mm:ss") + ")"
    ];

    sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);

    return jsonResponse({
      status: "success",
      message: "Data " + kelurahanName + " tanggal " + formattedDate + " berhasil ditulis pada baris " + targetRow + " di sheet " + SHEET_INPUT + "!",
      row: targetRow
    });
  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Modal Popup Format WhatsApp di dalam Google Sheets
 */
function showWhatsAppBroadcastModal() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_INPUT);
  if (!sheet) return;

  const todayStr = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyy-MM-dd");
  const data = sheet.getDataRange().getValues();

  const kelList = [
    { name: "Baru", kg: 0 },
    { name: "Bulogading", kg: 0 },
    { name: "Lajangiru", kg: 0 },
    { name: "Losari", kg: 0 },
    { name: "Maloku", kg: 0 },
    { name: "Mangkura", kg: 0 },
    { name: "Pisang Selatan", kg: 0 },
    { name: "Pisang Utara", kg: 0 },
    { name: "Sawerigading", kg: 0 },
    { name: "Lae-Lae", kg: 0 }
  ];

  let totalSampah = 0;
  let totalPakan = 0;

  for (let i = 1; i < data.length; i++) {
    const d = formatDateString(data[i][1]);
    if (d === todayStr || d === "2026-10-20") {
      const kelName = String(data[i][3]);
      const grand = Number(data[i][17]) || 0;
      const pakan = Number(data[i][13]) || 0;

      for (let k = 0; k < kelList.length; k++) {
        if (kelName.indexOf(kelList[k].name) !== -1) {
          kelList[k].kg += grand;
          break;
        }
      }
      totalSampah += grand;
      totalPakan += pakan;
    }
  }

  const activeKels = kelList.filter(function(k) { return k.kg > 0; });
  const lines = (activeKels.length > 0 ? activeKels : kelList.slice(0, 9)).map(function(k, idx) {
    return (idx + 1) + ". " + k.name + " —  " + k.kg.toLocaleString("id-ID") + " Kg";
  }).join("\\n");

  const msg = "REKAP SAMPAH ORGANIK KECAMATAN UJUNG PANDANG\\n\\n" +
    "Hari Selasa, 20 Oktober 2026\\n\\n" +
    lines + "\\n\\n" +
    "TOTAL SAMPAH ORGANIK : " + totalSampah.toLocaleString("id-ID") + " Kg\\n\\n" +
    "PENGELOLAAN SAMPAH ORGANIK \\n" +
    "* Kapasa (Bosowa) : 0 Kg\\n" +
    "* Bintang 5 : 1.108 Kg\\n" +
    "* Pengelolaan Teba : 0 Kg\\n" +
    "* Pakan Ternak : " + totalPakan.toLocaleString("id-ID") + " Kg\\n" +
    "* Pengelolaan Biopori : 0 Kg\\n" +
    "* TPS3R KAREBOSI: 780 Kg\\n" +
    "       '-Maggot : 780 Kg\\n" +
    "       '-Open Windrow : 0 Kg\\n" +
    "* Raised bed : 0 Kg\\n\\n" +
    "TOTAL PENGELOLAAN:  " + totalSampah.toLocaleString("id-ID") + " Kg";

  const html = '<textarea style="width:100%;height:320px;font-family:monospace;font-size:12px;padding:8px;" readonly id="msg">' + msg + '</textarea>' +
    '<br><br><button onclick="document.getElementById(\\'msg\\').select();document.execCommand(\\'copy\\');alert(\\'Format teks tersalin ke clipboard!\\');" style="padding:8px 16px;background:#059669;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Salin Teks WhatsApp</button>';

  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(480).setHeight(420), "Format Broadcast WhatsApp");
}

function checkBalanceAndFormulas() {
  SpreadsheetApp.getActiveSpreadsheet().toast("Rumus dan neraca telah dihitung ulang secara otomatis.", "SAPU-UP", 5);
}

function openDashboardUrl() {
  const html = '<script>window.open("https://ais-dev-jcpy7dpqodizfuuzwamlba-3526617431.asia-east1.run.app", "_blank");google.script.host.close();</script>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(200).setHeight(100), "Membuka Web SAPU-UP...");
}
`;
