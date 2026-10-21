import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { generateInitialDailyRecords, INITIAL_COLLECTORS, generateInitialTps3rProcessing } from '../src/data/initialData';
import { createFullWasteWorkbook } from '../src/utils/exportExcel';

const records = generateInitialDailyRecords();
const collectors = INITIAL_COLLECTORS;
const tps3rProcessing = generateInitialTps3rProcessing();

const wb = createFullWasteWorkbook(records, collectors, tps3rProcessing);
const outDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const filePath = path.join(outDir, 'Template_Pengelolaan_Sampah_Kecamatan_Ujung_Pandang.xlsx');
XLSX.writeFile(wb, filePath);
console.log('Successfully generated Excel file at:', filePath);
