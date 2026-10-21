import * as XLSX from 'xlsx';
import { DailyRecord, PetugasCollector, Tps3rProcessing } from '../types/waste';
import { KELURAHAN_LIST } from '../data/initialData';

export function generateAndDownloadExcel(
  records: DailyRecord[],
  collectors: PetugasCollector[],
  tps3rProcessing: Tps3rProcessing[],
  filename = 'Template_Pengelolaan_Sampah_Kecamatan_Ujung_Pandang.xlsx'
) {
  const wb = createFullWasteWorkbook(records, collectors, tps3rProcessing);
  XLSX.writeFile(wb, filename);
}

export function createFullWasteWorkbook(
  records: DailyRecord[],
  collectors: PetugasCollector[],
  tps3rProcessing: Tps3rProcessing[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: PANDUAN_IMPORT
  // ==========================================
  const panduanData = [
    ['PANDUAN PENGGUNAAN SPREADSHEET PENGELOLAAN SAMPAH KECAMATAN UJUNG PANDANG'],
    ['Pemerintah Kota Makassar - Dinas Lingkungan Hidup (DLH) & Kecamatan Ujung Pandang'],
    [''],
    ['CARA IMPORT KE GOOGLE SPREADSHEET (GOOGLE SHEETS):'],
    ['1.', 'Buka browser dan masuk ke https://drive.google.com atau https://sheets.google.com'],
    ['2.', 'Klik tombol "+ Baru" (+ New) di pojok kiri atas, lalu pilih "Upload file"'],
    ['3.', 'Pilih file .xlsx ini yang telah diunduh'],
    ['4.', 'Setelah selesai diunggah, klik ganda file tersebut untuk membukanya'],
    ['5.', 'Klik menu "File" di pojok kiri atas Google Sheets -> pilih "Simpan sebagai Google Spreadsheet"'],
    ['6.', 'Spreadsheet sekarang 100% online, siap dibagikan ke staf 10 Kelurahan untuk input harian!'],
    [''],
    ['CARA MENGGUNAKAN UNTUK INPUT HARIAN:'],
    ['* Buka Sheet "INPUT_HARIAN"'],
    ['* Untuk setiap hari dan setiap Kelurahan, isi kolom Makanan, Sisa Buah, Sisa Sayur, Daun, dan Pakan Ternak.'],
    ['* Kolom Total TPA, Total TPS3R, Total Pakan, dan Grand Total sudah dilengkapi RUMUS OTOMATIS (=SUM) sehingga Anda tidak perlu menghitung manual.'],
    ['* Tersedia 210 baris data resmi 1-21 Oktober 2026 sebagai acuan, serta baris kosong di bawahnya siap pakai.'],
    [''],
    ['DAFTAR SHEET DALAM FILE INI:'],
    ['1.', 'PANDUAN_IMPORT', 'Panduan tata cara import ke Google Sheets & pengisian data harian'],
    ['2.', 'INPUT_HARIAN', 'Formulir database input harian per Kelurahan dengan rumus otomatis'],
    ['3.', 'REKAP_HARIAN_RESMI', 'Format broadcast pesan WhatsApp resmi Kecamatan Ujung Pandang'],
    ['4.', 'REKAP_MATRIKS_BULANAN', 'Tabel matriks 10 Kelurahan tanggal 1 s/d 31 beserta persentase kontribusi'],
    ['5.', 'PENGOLAHAN_TPS3R', 'Catatan harian biokonversi Maggot BSF dan komposting Open Windrow'],
    ['6.', 'MASTER_DATA', 'Data referensi resmi 10 Kelurahan, Lurah, dan Petugas Pakan'],
  ];

  const wsPanduan = XLSX.utils.aoa_to_sheet(panduanData);
  wsPanduan['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'PANDUAN_IMPORT');

  // ==========================================
  // SHEET 2: INPUT_HARIAN (Database & Template Input)
  // ==========================================
  // Header row
  const sheet1Headers = [
    'No',
    'Tanggal',
    'Kode_Kelurahan',
    'Nama_Kelurahan',
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
    'TOTAL_TPA_KG',
    'TOTAL_TPS3R_KG',
    'TOTAL_PAKAN_KG',
    'GRAND_TOTAL_KG',
    'Petugas_Input',
    'Catatan',
  ];

  // Sort records by date ascending, then kelurahan
  const sortedRecords = [...records].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.kelurahanId.localeCompare(b.kelurahanId);
  });

  const sheet1Rows: any[][] = [sheet1Headers];

  let rowIdx = 2; // Excel 1-based, header is row 1
  for (const r of sortedRecords) {
    const c = r.composition;
    const kelMeta = KELURAHAN_LIST.find((k) => k.id === r.kelurahanId);
    const collectorsNames = r.pakanInputs?.filter(p => p.weightKg > 0).map((p) => `${p.collectorName} (${p.weightKg}Kg)`).join(', ') || '-';
    const pakanTotal = r.pakanInputs?.reduce((s, p) => s + (p.weightKg || 0), 0) || 0;

    sheet1Rows.push([
      rowIdx - 1,
      r.date,
      kelMeta?.code || r.kelurahanId,
      kelMeta?.name || r.kelurahanId,
      c.makananTpa || 0,
      c.makananTps3r || 0,
      c.sisaBuahTpa || 0,
      c.sisaBuahTps3r || 0,
      c.sisaSayurTpa || 0,
      c.sisaSayurTps3r || 0,
      c.daunTpa || 0,
      c.daunTps3r || 0,
      collectorsNames,
      pakanTotal,
      // Formulas for totals
      { t: 'n', f: `E${rowIdx}+G${rowIdx}+I${rowIdx}+K${rowIdx}` }, // TOTAL_TPA_KG
      { t: 'n', f: `F${rowIdx}+H${rowIdx}+J${rowIdx}+L${rowIdx}` }, // TOTAL_TPS3R_KG
      { t: 'n', f: `N${rowIdx}` },                                  // TOTAL_PAKAN_KG
      { t: 'n', f: `O${rowIdx}+P${rowIdx}+Q${rowIdx}` },           // GRAND_TOTAL_KG
      r.submittedBy || `Staf ${r.kelurahanId}`,
      'Data Resmi Oktober 2026',
    ]);
    rowIdx++;
  }

  // Add 40 blank template rows with pre-programmed formulas ready for new days
  const futureDates = ['2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25'];
  for (const fDate of futureDates) {
    for (const k of KELURAHAN_LIST) {
      sheet1Rows.push([
        rowIdx - 1,
        fDate,
        k.code,
        k.name,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        k.defaultCollectors.join(', ') || '-',
        0,
        { t: 'n', f: `E${rowIdx}+G${rowIdx}+I${rowIdx}+K${rowIdx}` },
        { t: 'n', f: `F${rowIdx}+H${rowIdx}+J${rowIdx}+L${rowIdx}` },
        { t: 'n', f: `N${rowIdx}` },
        { t: 'n', f: `O${rowIdx}+P${rowIdx}+Q${rowIdx}` },
        `Staf ${k.name}`,
        'Siap Diisi',
      ]);
      rowIdx++;
    }
  }

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Rows);
  ws1['!cols'] = [
    { wch: 6 },  // No
    { wch: 12 }, // Tanggal
    { wch: 16 }, // Kode_Kelurahan
    { wch: 22 }, // Nama_Kelurahan
    { wch: 16 }, // Makanan_TPA
    { wch: 16 }, // Makanan_TPS3R
    { wch: 16 }, // Sisa_Buah_TPA
    { wch: 16 }, // Sisa_Buah_TPS3R
    { wch: 16 }, // Sisa_Sayur_TPA
    { wch: 16 }, // Sisa_Sayur_TPS3R
    { wch: 14 }, // Daun_TPA
    { wch: 14 }, // Daun_TPS3R
    { wch: 28 }, // Nama_Petugas_Pakan
    { wch: 16 }, // Berat_Pakan_Kg
    { wch: 16 }, // TOTAL_TPA_KG
    { wch: 16 }, // TOTAL_TPS3R_KG
    { wch: 16 }, // TOTAL_PAKAN_KG
    { wch: 18 }, // GRAND_TOTAL_KG
    { wch: 25 }, // Petugas_Input
    { wch: 25 }, // Catatan
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'INPUT_HARIAN');

  // ==========================================
  // SHEET 3: REKAP_HARIAN_RESMI (Format WA Broadcast)
  // ==========================================
  const rekapWaRows: any[][] = [
    ['REKAP SAMPAH ORGANIK KECAMATAN UJUNG PANDANG'],
    ['Pemerintah Kota Makassar - Rekapitulasi Harian'],
    [''],
    ['Parameter Tanggal:', '2026-10-20', '(Ubah tanggal di sini untuk merekap hari lain)'],
    ['Hari/Tanggal Terpilih:', 'Hari Selasa, 20 Oktober 2026'],
    [''],
    ['No', 'Kelurahan', 'Total Sampah Organik (Kg)', 'Keterangan'],
  ];

  let waStartRow = 8;
  KELURAHAN_LIST.forEach((kel, idx) => {
    // Formula using SUMIFS from INPUT_HARIAN:
    // SUMIFS(INPUT_HARIAN!R:R, INPUT_HARIAN!B:B, $B$4, INPUT_HARIAN!D:D, kel.name)
    rekapWaRows.push([
      idx + 1,
      kel.name,
      {
        t: 'n',
        f: `SUMIFS(INPUT_HARIAN!R:R, INPUT_HARIAN!B:B, $B$4, INPUT_HARIAN!D:D, "${kel.name}")`,
      },
      'Kg',
    ]);
    waStartRow++;
  });

  const totalSampahRow = waStartRow;
  rekapWaRows.push([
    '',
    'TOTAL SAMPAH ORGANIK',
    { t: 'n', f: `SUM(C8:C${totalSampahRow - 1})` },
    'Kg',
  ]);
  rekapWaRows.push(['']);
  rekapWaRows.push(['PENGELOLAAN SAMPAH ORGANIK']);
  rekapWaRows.push(['*', 'Kapasa (Bosowa)', 0, 'Kg']);
  rekapWaRows.push(['*', 'Bintang 5', 1108, 'Kg']);
  rekapWaRows.push(['*', 'Pengelolaan Teba', 0, 'Kg']);
  rekapWaRows.push([
    '*',
    'Pakan Ternak',
    { t: 'n', f: `SUMIFS(INPUT_HARIAN!Q:Q, INPUT_HARIAN!B:B, $B$4)` },
    'Kg',
  ]);
  rekapWaRows.push(['*', 'Pengelolaan Biopori', 0, 'Kg']);
  rekapWaRows.push(['*', 'TPS3R KAREBOSI', 780, 'Kg']);
  rekapWaRows.push(['', "'-Maggot", 780, 'Kg']);
  rekapWaRows.push(['', "'-Open Windrow", 0, 'Kg']);
  rekapWaRows.push(['*', 'Raised bed', 0, 'Kg']);
  rekapWaRows.push(['']);
  rekapWaRows.push([
    '',
    'TOTAL PENGELOLAAN',
    { t: 'n', f: `C${totalSampahRow + 3}+C${totalSampahRow + 4}+C${totalSampahRow + 5}+C${totalSampahRow + 6}+C${totalSampahRow + 7}+C${totalSampahRow + 8}+C${totalSampahRow + 11}` },
    'Kg',
  ]);

  const wsWa = XLSX.utils.aoa_to_sheet(rekapWaRows);
  wsWa['!cols'] = [{ wch: 6 }, { wch: 35 }, { wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsWa, 'REKAP_HARIAN_RESMI');

  // ==========================================
  // SHEET 4: REKAP_MATRIKS_BULANAN
  // ==========================================
  const uniqueDates = Array.from(new Set(records.map((r) => r.date))).sort();
  const recordMap = new Map<string, DailyRecord>();
  for (const r of records) {
    recordMap.set(`${r.date}_${r.kelurahanId}`, r);
  }

  const sheet4Data: any[] = [];
  let kecamatanGrandTotal = 0;
  for (const r of records) {
    const c = r.composition;
    const t = (c.makananTpa || 0) + (c.sisaBuahTpa || 0) + (c.sisaSayurTpa || 0) + (c.daunTpa || 0);
    const tp = (c.makananTps3r || 0) + (c.sisaBuahTps3r || 0) + (c.sisaSayurTps3r || 0) + (c.daunTps3r || 0);
    const pk = r.pakanInputs?.reduce((s, p) => s + (p.weightKg || 0), 0) || 0;
    kecamatanGrandTotal += t + tp + pk;
  }

  for (const k of KELURAHAN_LIST) {
    const rowKel: any = {
      'Kelurahan / Sub-Kategori': k.name.toUpperCase(),
      Alur_Tujuan: 'JUMLAH TOTAL',
    };
    let kelSum = 0;
    for (const d of uniqueDates) {
      const dayNum = parseInt(d.split('-')[2], 10);
      const colName = `Tgl_${String(dayNum).padStart(2, '0')}`;
      const r = recordMap.get(`${d}_${k.id}`);
      let dayTotal = 0;
      if (r) {
        const c = r.composition;
        const t = (c.makananTpa || 0) + (c.sisaBuahTpa || 0) + (c.sisaSayurTpa || 0) + (c.daunTpa || 0);
        const tp = (c.makananTps3r || 0) + (c.sisaBuahTps3r || 0) + (c.sisaSayurTps3r || 0) + (c.daunTps3r || 0);
        const pk = r.pakanInputs?.reduce((s, p) => s + (p.weightKg || 0), 0) || 0;
        dayTotal = t + tp + pk;
      }
      rowKel[colName] = dayTotal;
      kelSum += dayTotal;
    }
    rowKel['TOTAL_AKUMULASI_KG'] = kelSum;
    rowKel['PORSI_PERSEN'] =
      kecamatanGrandTotal > 0 ? ((kelSum / kecamatanGrandTotal) * 100).toFixed(1) + '%' : '0%';
    sheet4Data.push(rowKel);

    // Sub-row Makanan
    const rowMakanan: any = {
      'Kelurahan / Sub-Kategori': '  - Makanan (Organik Basah)',
      Alur_Tujuan: 'Campur (TPA+TPS3R)',
    };
    let makananSum = 0;
    for (const d of uniqueDates) {
      const dayNum = parseInt(d.split('-')[2], 10);
      const colName = `Tgl_${String(dayNum).padStart(2, '0')}`;
      const r = recordMap.get(`${d}_${k.id}`);
      const val = r ? (r.composition.makananTpa || 0) + (r.composition.makananTps3r || 0) : 0;
      rowMakanan[colName] = val;
      makananSum += val;
    }
    rowMakanan['TOTAL_AKUMULASI_KG'] = makananSum;
    rowMakanan['PORSI_PERSEN'] = '';
    sheet4Data.push(rowMakanan);

    // Sub-row Daun
    const rowDaun: any = {
      'Kelurahan / Sub-Kategori': '  - Daun (Sapuan Jalan & Taman)',
      Alur_Tujuan: 'Campur (TPA+TPS3R)',
    };
    let daunSum = 0;
    for (const d of uniqueDates) {
      const dayNum = parseInt(d.split('-')[2], 10);
      const colName = `Tgl_${String(dayNum).padStart(2, '0')}`;
      const r = recordMap.get(`${d}_${k.id}`);
      const val = r ? (r.composition.daunTpa || 0) + (r.composition.daunTps3r || 0) : 0;
      rowDaun[colName] = val;
      daunSum += val;
    }
    rowDaun['TOTAL_AKUMULASI_KG'] = daunSum;
    rowDaun['PORSI_PERSEN'] = '';
    sheet4Data.push(rowDaun);

    // Sub-rows for Collectors in that Kelurahan
    const kelCollectors = collectors.filter((c) => c.kelurahanId === k.id);
    for (const col of kelCollectors) {
      const rowCol: any = {
        'Kelurahan / Sub-Kategori': `  ↳ Pakan: ${col.name}`,
        Alur_Tujuan: 'Pakan Ternak',
      };
      let colSum = 0;
      for (const d of uniqueDates) {
        const dayNum = parseInt(d.split('-')[2], 10);
        const colName = `Tgl_${String(dayNum).padStart(2, '0')}`;
        const r = recordMap.get(`${d}_${k.id}`);
        const pakanItem = r?.pakanInputs?.find(
          (p) => p.collectorId === col.id || p.collectorName === col.name
        );
        const val = pakanItem?.weightKg || 0;
        rowCol[colName] = val;
        colSum += val;
      }
      rowCol['TOTAL_AKUMULASI_KG'] = colSum;
      rowCol['PORSI_PERSEN'] = '';
      sheet4Data.push(rowCol);
    }
  }

  // BOTTOM ROW: REKAP KECAMATAN UJUNG PANDANG
  const rowKecamatan: any = {
    'Kelurahan / Sub-Kategori': 'REKAP TOTAL KECAMATAN UJUNG PANDANG',
    Alur_Tujuan: 'GRAND TOTAL',
  };
  let overallSum = 0;
  for (const d of uniqueDates) {
    const dayNum = parseInt(d.split('-')[2], 10);
    const colName = `Tgl_${String(dayNum).padStart(2, '0')}`;
    let dayAll = 0;
    for (const k of KELURAHAN_LIST) {
      const r = recordMap.get(`${d}_${k.id}`);
      if (r) {
        const c = r.composition;
        const t = (c.makananTpa || 0) + (c.sisaBuahTpa || 0) + (c.sisaSayurTpa || 0) + (c.daunTpa || 0);
        const tp = (c.makananTps3r || 0) + (c.sisaBuahTps3r || 0) + (c.sisaSayurTps3r || 0) + (c.daunTps3r || 0);
        const pk = r.pakanInputs?.reduce((s, p) => s + (p.weightKg || 0), 0) || 0;
        dayAll += t + tp + pk;
      }
    }
    rowKecamatan[colName] = dayAll;
    overallSum += dayAll;
  }
  rowKecamatan['TOTAL_AKUMULASI_KG'] = overallSum;
  rowKecamatan['PORSI_PERSEN'] = '100.0%';
  sheet4Data.push(rowKecamatan);

  const ws4 = XLSX.utils.json_to_sheet(sheet4Data);
  ws4['!cols'] = [
    { wch: 35 },
    { wch: 22 },
    ...uniqueDates.map(() => ({ wch: 10 })),
    { wch: 22 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws4, 'REKAP_MATRIKS_BULANAN');

  // ==========================================
  // SHEET 5: PENGOLAHAN_TPS3R
  // ==========================================
  const sheet5Data = tps3rProcessing.map((proc) => {
    let inputTps3r = 0;
    for (const k of KELURAHAN_LIST) {
      const r = recordMap.get(`${proc.date}_${k.id}`);
      if (r) {
        const c = r.composition;
        inputTps3r += (c.makananTps3r || 0) + (c.sisaBuahTps3r || 0) + (c.sisaSayurTps3r || 0) + (c.daunTps3r || 0);
      }
    }
    const processed = (proc.maggotKg || 0) + (proc.openWindrowKg || 0);
    const reductionPercent =
      inputTps3r > 0 ? ((processed / inputTps3r) * 100).toFixed(1) + '%' : '100%';

    return {
      Tanggal: proc.date,
      Sampah_Masuk_TPS3R_Kg: inputTps3r,
      Biokonversi_Maggot_BSF_Kg: proc.maggotKg || 0,
      Open_Windrow_WDR_Kg: proc.openWindrowKg || 0,
      Total_Terolah_Kg: processed,
      Persen_Tingkat_Olah: reductionPercent,
      Status_Operasional: 'Normal & Aktif',
      Operator_TPS3R: 'Mansyur Daeng Bella (Koordinator)',
    };
  });

  const ws5 = XLSX.utils.json_to_sheet(sheet5Data);
  ws5['!cols'] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 26 },
    { wch: 24 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 32 },
  ];
  XLSX.utils.book_append_sheet(wb, ws5, 'PENGOLAHAN_TPS3R');

  // ==========================================
  // SHEET 6: MASTER_DATA
  // ==========================================
  const masterKelurahan = KELURAHAN_LIST.map((k) => ({
    Kategori: 'MASTER KELURAHAN',
    Kode_Wilayah: k.code,
    Nama: k.name,
    Keterangan_Alamat: k.address,
    Penanggung_Jawab: k.lurah,
    Kontak: k.contact,
  }));

  const masterPetugas = collectors.map((c) => ({
    Kategori: 'PETUGAS PAKAN TERDAFTAR',
    Kode_Wilayah: c.id,
    Nama: c.name,
    Keterangan_Alamat: `Kelurahan ${c.kelurahanId}`,
    Penanggung_Jawab: 'Mitra Pengumpul Ternak',
    Kontak: c.phone || '0812-xxxx-xxxx',
  }));

  const sheet6Data = [...masterKelurahan, ...masterPetugas];
  const ws6 = XLSX.utils.json_to_sheet(sheet6Data);
  ws6['!cols'] = [
    { wch: 26 },
    { wch: 18 },
    { wch: 25 },
    { wch: 35 },
    { wch: 28 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, ws6, 'MASTER_DATA');

  return wb;
}
