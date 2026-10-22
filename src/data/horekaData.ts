import { KelurahanId } from '../types/waste';

export interface HorekaBusiness {
  id: string;
  kelurahanId: KelurahanId;
  namaUsaha: string;
  alamatUsaha: string;
}

export interface HorekaDailyRecord {
  date: string;
  horekaId: string;
  kelurahanId: KelurahanId;
  organikKg: number;
  anorganikKg: number;
  residuKg: number;
  operatorName?: string;
  updatedAt?: string;
}

export const HOREKA_BUSINESSES: HorekaBusiness[] = [
  // BARU
  { id: 'horeka-baru-1', kelurahanId: 'BARU', namaUsaha: 'CAFÉ BENZ', alamatUsaha: 'JL. KAJAOLALIDO' },
  { id: 'horeka-baru-2', kelurahanId: 'BARU', namaUsaha: 'CAFE PELANGI', alamatUsaha: 'JL. BOTOLEMPANGAN' },
  { id: 'horeka-baru-3', kelurahanId: 'BARU', namaUsaha: 'HOTEL ASTON', alamatUsaha: 'JL. ST. HASANUDDIN' },
  { id: 'horeka-baru-4', kelurahanId: 'BARU', namaUsaha: 'HOTEL ROYAL BAY', alamatUsaha: 'JL. ST. HASANUDDIN' },
  { id: 'horeka-baru-5', kelurahanId: 'BARU', namaUsaha: 'FIREFLIES', alamatUsaha: 'JL. PATTIMURA' },
  { id: 'horeka-baru-6', kelurahanId: 'BARU', namaUsaha: "HOTEL D'PRIMA", alamatUsaha: 'JL. PATTIMURA' },
  { id: 'horeka-baru-7', kelurahanId: 'BARU', namaUsaha: 'GOLDEN ZUKI', alamatUsaha: 'JL. HASANUDDIN' },
  { id: 'horeka-baru-8', kelurahanId: 'BARU', namaUsaha: 'JJ STEAK', alamatUsaha: 'JL. PATTIMURA' },
  { id: 'horeka-baru-9', kelurahanId: 'BARU', namaUsaha: 'KOPI TEORI', alamatUsaha: 'JL. USMAN JAFAR' },
  { id: 'horeka-baru-10', kelurahanId: 'BARU', namaUsaha: 'KIOS LB', alamatUsaha: 'JL. RANGGONG' },
  { id: 'horeka-baru-11', kelurahanId: 'BARU', namaUsaha: 'HOTEL WHITZ PRIME', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-baru-12', kelurahanId: 'BARU', namaUsaha: 'BURGER KING', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-baru-13', kelurahanId: 'BARU', namaUsaha: 'BISTROPOLIS', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-baru-14', kelurahanId: 'BARU', namaUsaha: 'HOTEL CELEBES', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-baru-15', kelurahanId: 'BARU', namaUsaha: 'RICHESECE FACTORY', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-baru-16', kelurahanId: 'BARU', namaUsaha: 'MIE GACOAN', alamatUsaha: 'JL. A.YANI' },

  // BULOGADING
  { id: 'horeka-bulo-1', kelurahanId: 'BULOGADING', namaUsaha: 'HOTEL LOSARI BEACH', alamatUsaha: 'JL PASAR IKAN' },
  { id: 'horeka-bulo-2', kelurahanId: 'BULOGADING', namaUsaha: 'HOTEL EXPRESSIA', alamatUsaha: 'JL PASAR IKAN' },
  { id: 'horeka-bulo-3', kelurahanId: 'BULOGADING', namaUsaha: 'MAKASSAR GOLDEN HOTEL', alamatUsaha: 'JL PASAR IKAN' },
  { id: 'horeka-bulo-4', kelurahanId: 'BULOGADING', namaUsaha: 'HOTEL SWISSBELL', alamatUsaha: 'JL UJUNG PANDANG' },
  { id: 'horeka-bulo-5', kelurahanId: 'BULOGADING', namaUsaha: 'RM AYAM GORENG SULAWESI', alamatUsaha: 'JL PATTIMURA' },
  { id: 'horeka-bulo-6', kelurahanId: 'BULOGADING', namaUsaha: 'RM ULU JUKU', alamatUsaha: 'JL UJUNG PANDANG' },
  { id: 'horeka-bulo-7', kelurahanId: 'BULOGADING', namaUsaha: 'ATI RAJA', alamatUsaha: 'JL PATTIMURA' },
  { id: 'horeka-bulo-8', kelurahanId: 'BULOGADING', namaUsaha: 'SARI LAUT MBAK ATUN', alamatUsaha: 'JL UJUNG PANDANG' },
  { id: 'horeka-bulo-9', kelurahanId: 'BULOGADING', namaUsaha: 'SARI LAUT MBAK ATUN 2', alamatUsaha: 'JL UJUNG PANDANG' },
  { id: 'horeka-bulo-10', kelurahanId: 'BULOGADING', namaUsaha: 'NOICE CAFE', alamatUsaha: 'JL PASAR IKAN' },
  { id: 'horeka-bulo-11', kelurahanId: 'BULOGADING', namaUsaha: 'CAFE OMBAK', alamatUsaha: 'JL UJUNG PANDANG' },
  { id: 'horeka-bulo-12', kelurahanId: 'BULOGADING', namaUsaha: 'DAPUR SULAWESI', alamatUsaha: 'JL UJUNG PANDANG' },
  { id: 'horeka-bulo-13', kelurahanId: 'BULOGADING', namaUsaha: 'POPSA DISTRIK', alamatUsaha: 'JL UJUNG PANDANG' },
  { id: 'horeka-bulo-14', kelurahanId: 'BULOGADING', namaUsaha: 'KIOS SEMARANG', alamatUsaha: 'JL PENGHIBUR' },

  // LAJANGIRU
  { id: 'horeka-laj-1', kelurahanId: 'LAJANGIRU', namaUsaha: 'RM. CILIK', alamatUsaha: 'JL. S. PAREMAN' },
  { id: 'horeka-laj-2', kelurahanId: 'LAJANGIRU', namaUsaha: 'COTO MAKASSAR', alamatUsaha: 'JL. G. TINGGIMAE' },
  { id: 'horeka-laj-3', kelurahanId: 'LAJANGIRU', namaUsaha: 'DANGKOT 55', alamatUsaha: 'JL. S. LIMBOTO' },
  { id: 'horeka-laj-4', kelurahanId: 'LAJANGIRU', namaUsaha: 'PAK JANGGUT', alamatUsaha: 'JL. G. MERAPI' },
  { id: 'horeka-laj-5', kelurahanId: 'LAJANGIRU', namaUsaha: 'RM. WENANG', alamatUsaha: 'JL. G. LOKON' },
  { id: 'horeka-laj-6', kelurahanId: 'LAJANGIRU', namaUsaha: 'GADO-GADO INTISARI', alamatUsaha: 'JL. G. TINGGIMAE' },
  { id: 'horeka-laj-7', kelurahanId: 'LAJANGIRU', namaUsaha: 'WARUNG 99', alamatUsaha: 'JL. G. TINGGIMAE' },
  { id: 'horeka-laj-8', kelurahanId: 'LAJANGIRU', namaUsaha: 'AYAM LALAPAN', alamatUsaha: 'JL. G. LATIMOJONG' },
  { id: 'horeka-laj-9', kelurahanId: 'LAJANGIRU', namaUsaha: 'BAKSO YUNUS', alamatUsaha: 'JL. S. POSO' },

  // LOSARI
  { id: 'horeka-los-1', kelurahanId: 'LOSARI', namaUsaha: 'MANDALA PRIMA PERKASA / HOTEL IBIS', alamatUsaha: 'JL. MAIPA NO. 8' },
  { id: 'horeka-los-2', kelurahanId: 'LOSARI', namaUsaha: 'ANDREAS GO / RM. LOSARI', alamatUsaha: 'JL. LAMADUKELLENG' },
  { id: 'horeka-los-3', kelurahanId: 'LOSARI', namaUsaha: 'OEI WIJAYA / RM. ISTANA LAUT', alamatUsaha: 'JL. DATUMUSENG NO. 1' },
  { id: 'horeka-los-4', kelurahanId: 'LOSARI', namaUsaha: 'MIE TITI', alamatUsaha: 'JL. DATUMUSENG 21' },
  { id: 'horeka-los-5', kelurahanId: 'LOSARI', namaUsaha: 'HOTEL KENARI', alamatUsaha: 'JL. YOSEF LATUMAHINA' },
  { id: 'horeka-los-6', kelurahanId: 'LOSARI', namaUsaha: 'HOTEL ARYA DUTA', alamatUsaha: 'JL. SOMBA OPU NO. 297' },
  { id: 'horeka-los-7', kelurahanId: 'LOSARI', namaUsaha: 'EDWARD HORAS / RM. DINAR', alamatUsaha: 'JL. LAMADUKELLENG 68' },
  { id: 'horeka-los-8', kelurahanId: 'LOSARI', namaUsaha: 'HOTEL ARTHAMA', alamatUsaha: 'JL. H. BAU NO 3 & 5' },
  { id: 'horeka-los-9', kelurahanId: 'LOSARI', namaUsaha: 'RM SAUDARA', alamatUsaha: 'JL. LAMADUKELLENG' },
  { id: 'horeka-los-10', kelurahanId: 'LOSARI', namaUsaha: 'RM LAOTA', alamatUsaha: 'JL. LAMADUKELLENG' },
  { id: 'horeka-los-11', kelurahanId: 'LOSARI', namaUsaha: 'SOTO AYAM LAMONGAN CAK HAR', alamatUsaha: 'JL. LAMADUKELLENG' },
  { id: 'horeka-los-12', kelurahanId: 'LOSARI', namaUsaha: 'RM. RATU GURIH', alamatUsaha: 'JL. LAMADUKELLENG 13' },
  { id: 'horeka-los-13', kelurahanId: 'LOSARI', namaUsaha: 'HOTEL KYRIAD', alamatUsaha: 'JL. H.I.A SALEH 12' },
  { id: 'horeka-los-14', kelurahanId: 'LOSARI', namaUsaha: 'KIOS LAGA LIGO', alamatUsaha: 'JL. ARIEF RATE 6B' },
  { id: 'horeka-los-15', kelurahanId: 'LOSARI', namaUsaha: 'KIOS 88', alamatUsaha: 'JL. YOSEF LATUMAHINA 6' },
  { id: 'horeka-los-16', kelurahanId: 'LOSARI', namaUsaha: 'EDO SAPUTRA / RM. BAHARI', alamatUsaha: 'JL. YOSEF LATUMAHINA 18' },
  { id: 'horeka-los-17', kelurahanId: 'LOSARI', namaUsaha: 'MBG LOSARI', alamatUsaha: 'JL. H.I.A SALEH' },
  { id: 'horeka-los-18', kelurahanId: 'LOSARI', namaUsaha: 'REPUBLIC COFFIE', alamatUsaha: 'JL. LAMADUKELLENG NO. 22' },
  { id: 'horeka-los-19', kelurahanId: 'LOSARI', namaUsaha: 'CAFE HIMO', alamatUsaha: 'JL. JAMBU NO. 8' },

  // MALOKU
  { id: 'horeka-mal-1', kelurahanId: 'MALOKU', namaUsaha: 'HOTEL SANTIKA', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-mal-2', kelurahanId: 'MALOKU', namaUsaha: 'COTO HASANUDDIN', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-mal-3', kelurahanId: 'MALOKU', namaUsaha: 'CYLON COFY', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-mal-4', kelurahanId: 'MALOKU', namaUsaha: 'HOTEL GRAND WISATA', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-mal-5', kelurahanId: 'MALOKU', namaUsaha: 'TERIMA KASIH KOPI', alamatUsaha: 'JL. MUCHTAR LUTFI' },
  { id: 'horeka-mal-6', kelurahanId: 'MALOKU', namaUsaha: 'RUMAH MAKAN SERENG SRENG', alamatUsaha: 'JL. MUCHTAR LUTFI' },
  { id: 'horeka-mal-7', kelurahanId: 'MALOKU', namaUsaha: 'HOTEL SMILE', alamatUsaha: 'JL. MUCHTAR LUTFI' },
  { id: 'horeka-mal-8', kelurahanId: 'MALOKU', namaUsaha: 'RUMAH MAKAN COBE-COBE', alamatUsaha: 'JL. MUCHTAR LUTFI' },
  { id: 'horeka-mal-9', kelurahanId: 'MALOKU', namaUsaha: 'HOTEL FAVE', alamatUsaha: 'JL. DAENG TOMPO' },
  { id: 'horeka-mal-10', kelurahanId: 'MALOKU', namaUsaha: 'IKAN BAKAR RICA ALA', alamatUsaha: 'JL. DAENG TOMPO' },
  { id: 'horeka-mal-11', kelurahanId: 'MALOKU', namaUsaha: 'RUMAH MAKAN PANTAI INDAH', alamatUsaha: 'JL. PENGHIBUR' },
  { id: 'horeka-mal-12', kelurahanId: 'MALOKU', namaUsaha: 'RUMAH MAKAN SENTOSA', alamatUsaha: 'JL. PENGHIBUR' },
  { id: 'horeka-mal-13', kelurahanId: 'MALOKU', namaUsaha: 'BUBUR AYAM', alamatUsaha: 'JL. PENGHIBUR' },
  { id: 'horeka-mal-14', kelurahanId: 'MALOKU', namaUsaha: 'BUBUR BRUDAK', alamatUsaha: 'JL. PENGHIBUR' },
  { id: 'horeka-mal-15', kelurahanId: 'MALOKU', namaUsaha: 'RUMAH MAKAN LAE- LAE', alamatUsaha: 'JL. DATUMUSENG' },
  { id: 'horeka-mal-16', kelurahanId: 'MALOKU', namaUsaha: 'MBG', alamatUsaha: 'JL. DATUMUSENG' },
  { id: 'horeka-mal-17', kelurahanId: 'MALOKU', namaUsaha: 'PALLUBASA DATUMUSENG', alamatUsaha: 'JL. DATUMUSENG' },
  { id: 'horeka-mal-18', kelurahanId: 'MALOKU', namaUsaha: 'GADO GADO', alamatUsaha: 'JL. RANGGONG' },
  { id: 'horeka-mal-19', kelurahanId: 'MALOKU', namaUsaha: 'GADO -GADO RATNA JUEITA', alamatUsaha: 'JL. RANGGONG' },
  { id: 'horeka-mal-20', kelurahanId: 'MALOKU', namaUsaha: "HOTEL D' BUGIS", alamatUsaha: 'JL. PENGHIBUR' },
  { id: 'horeka-mal-21', kelurahanId: 'MALOKU', namaUsaha: 'CAFÉ PSM', alamatUsaha: 'JL. SOMBA OPU' },
  { id: 'horeka-mal-22', kelurahanId: 'MALOKU', namaUsaha: 'HOTEL ALMADERA', alamatUsaha: 'JL. SOMBA OPU' },
  { id: 'horeka-mal-23', kelurahanId: 'MALOKU', namaUsaha: 'CAFÉ PALOS', alamatUsaha: 'JL. SOMBA OPU' },
  { id: 'horeka-mal-24', kelurahanId: 'MALOKU', namaUsaha: 'RUMAH MAKAN PAK TJOMOT', alamatUsaha: 'JL. SOMBA OPU' },
  { id: 'horeka-mal-25', kelurahanId: 'MALOKU', namaUsaha: 'RUMAH MAKAN 999', alamatUsaha: 'JL. SOMBA OPU' },
  { id: 'horeka-mal-26', kelurahanId: 'MALOKU', namaUsaha: 'RUMAH MAKAN NELAYAN', alamatUsaha: 'JL. ALIMALAKA' },

  // MANGKURA
  { id: 'horeka-mangk-1', kelurahanId: 'MANGKURA', namaUsaha: 'Sop Saudara Assauna', alamatUsaha: 'Jl. Arif Rate' },
  { id: 'horeka-mangk-2', kelurahanId: 'MANGKURA', namaUsaha: 'RM. New Seafood', alamatUsaha: 'Jl. Arif Rate' },
  { id: 'horeka-mangk-3', kelurahanId: 'MANGKURA', namaUsaha: 'RM. Kios Niagara', alamatUsaha: 'Jl. Arif Rate' },
  { id: 'horeka-mangk-4', kelurahanId: 'MANGKURA', namaUsaha: 'Akira Grill Dragon', alamatUsaha: 'Jl. Arif Rate' },
  { id: 'horeka-mangk-5', kelurahanId: 'MANGKURA', namaUsaha: 'Mas Daeng', alamatUsaha: 'Jl. Arif Rate' },
  { id: 'horeka-mangk-6', kelurahanId: 'MANGKURA', namaUsaha: 'RM. Yammie', alamatUsaha: 'Jl. Arif Rate' },
  { id: 'horeka-mangk-7', kelurahanId: 'MANGKURA', namaUsaha: 'Hotel Prima', alamatUsaha: 'Jl. Ratulangi' },
  { id: 'horeka-mangk-8', kelurahanId: 'MANGKURA', namaUsaha: 'Pizza Hut', alamatUsaha: 'Jl. Ratulangi' },
  { id: 'horeka-mangk-9', kelurahanId: 'MANGKURA', namaUsaha: 'KFC Ratulangi', alamatUsaha: 'Jl. Ratulangi' },
  { id: 'horeka-mangk-10', kelurahanId: 'MANGKURA', namaUsaha: 'Hotel Ibis Style', alamatUsaha: 'Jl. Ratulangi' },
  { id: 'horeka-mangk-11', kelurahanId: 'MANGKURA', namaUsaha: 'Starbucks', alamatUsaha: 'Jl. Karunrung' },
  { id: 'horeka-mangk-12', kelurahanId: 'MANGKURA', namaUsaha: 'Hotel Lariz', alamatUsaha: 'Jl. Lagaligo' },
  { id: 'horeka-mangk-13', kelurahanId: 'MANGKURA', namaUsaha: 'Hotel Favor', alamatUsaha: 'Jl. Lasinrang' },
  { id: 'horeka-mangk-14', kelurahanId: 'MANGKURA', namaUsaha: 'Sariwangi', alamatUsaha: 'Jl. Lasinrang' },
  { id: 'horeka-mangk-15', kelurahanId: 'MANGKURA', namaUsaha: 'Hotel Astra Novilia', alamatUsaha: 'Jl. Monginsidi' },
  { id: 'horeka-mangk-16', kelurahanId: 'MANGKURA', namaUsaha: 'Apartemen 31', alamatUsaha: 'Jl. Sudirman' },
  { id: 'horeka-mangk-17', kelurahanId: 'MANGKURA', namaUsaha: 'Hyatt Place Hotel', alamatUsaha: 'Jl. Sudirman' },
  { id: 'horeka-mangk-18', kelurahanId: 'MANGKURA', namaUsaha: 'MBG H. BAU', alamatUsaha: 'JL. H BAU' },
  { id: 'horeka-mangk-19', kelurahanId: 'MANGKURA', namaUsaha: 'MBG KOMP.PDAM', alamatUsaha: 'KOMP. PDAM' },

  // PISANG SELATAN
  { id: 'horeka-psel-1', kelurahanId: 'PISANG SELATAN', namaUsaha: 'PANBAKERS', alamatUsaha: 'JL.G.LATIMOJONG' },
  { id: 'horeka-psel-2', kelurahanId: 'PISANG SELATAN', namaUsaha: 'RM DINAR', alamatUsaha: 'JL.G.LATIMOJONG' },
  { id: 'horeka-psel-3', kelurahanId: 'PISANG SELATAN', namaUsaha: 'YANMIE', alamatUsaha: 'JL.G.NONA NO 37' },
  { id: 'horeka-psel-4', kelurahanId: 'PISANG SELATAN', namaUsaha: 'RM ATIRAJA', alamatUsaha: 'JL.G.MERAPI' },
  { id: 'horeka-psel-5', kelurahanId: 'PISANG SELATAN', namaUsaha: 'RM ATIRAJA (G. NONA)', alamatUsaha: 'JL.G.NONA' },
  { id: 'horeka-psel-6', kelurahanId: 'PISANG SELATAN', namaUsaha: 'DUNIA KULINER', alamatUsaha: 'JL.G.MERAPI NO 203' },
  { id: 'horeka-psel-7', kelurahanId: 'PISANG SELATAN', namaUsaha: 'CAFE NAI NAI', alamatUsaha: 'JL.S LIMBOTO NO 16' },
  { id: 'horeka-psel-8', kelurahanId: 'PISANG SELATAN', namaUsaha: 'HOTEL ASWIN', alamatUsaha: 'JL.G LATIMOJONG' },
  { id: 'horeka-psel-9', kelurahanId: 'PISANG SELATAN', namaUsaha: 'HOTEL VINDIKA', alamatUsaha: 'JL.G MERAPI' },
  { id: 'horeka-psel-10', kelurahanId: 'PISANG SELATAN', namaUsaha: 'IKAN BAKAR', alamatUsaha: 'JL.G NONA' },
  { id: 'horeka-psel-11', kelurahanId: 'PISANG SELATAN', namaUsaha: 'DAPUR MBG', alamatUsaha: 'JL.G LATIMOJONG' },

  // PISANG UTARA
  { id: 'horeka-put-1', kelurahanId: 'PISANG UTARA', namaUsaha: 'AYAM GORENG SULAWESI', alamatUsaha: 'JL. GUNUNG LOMPOBATTANG NO. 11' },
  { id: 'horeka-put-2', kelurahanId: 'PISANG UTARA', namaUsaha: 'SOP KONRO KAREBOSI', alamatUsaha: 'JL. GUNUNG LOMPOBATTANG' },
  { id: 'horeka-put-3', kelurahanId: 'PISANG UTARA', namaUsaha: 'CAFE DRAGON', alamatUsaha: 'Jl.G. Bawakaraeng' },
  { id: 'horeka-put-4', kelurahanId: 'PISANG UTARA', namaUsaha: 'HOTEL MIRA', alamatUsaha: 'Jl.S.Cerekang No.31' },
  { id: 'horeka-put-5', kelurahanId: 'PISANG UTARA', namaUsaha: 'HOTEL SWISS BELL', alamatUsaha: 'Jl.G.Bawakaraeng' },
  { id: 'horeka-put-6', kelurahanId: 'PISANG UTARA', namaUsaha: 'RM MARLIN', alamatUsaha: 'Jl G. Bawakaraeng' },
  { id: 'horeka-put-7', kelurahanId: 'PISANG UTARA', namaUsaha: 'AYAM GEDEBUK', alamatUsaha: 'JL G BULUSARAUNG' },

  // SAWERIGADING
  { id: 'horeka-saw-1', kelurahanId: 'SAWERIGADING', namaUsaha: 'BEST WESTERN HOTEL', alamatUsaha: 'JL. BOTOLEMPANGAN' },
  { id: 'horeka-saw-2', kelurahanId: 'SAWERIGADING', namaUsaha: 'HOTEL SUTOMO', alamatUsaha: 'JL. DR. SUTOMO' },
  { id: 'horeka-saw-3', kelurahanId: 'SAWERIGADING', namaUsaha: 'WHIZ PRIME HOTEL', alamatUsaha: 'JL. JEND. SUDIRMAN NO. 30' },
  { id: 'horeka-saw-4', kelurahanId: 'SAWERIGADING', namaUsaha: 'HOTEL HORISON ULTIMA', alamatUsaha: 'JL. JEND. SUDIRMAN NO. 24' },
  { id: 'horeka-saw-5', kelurahanId: 'SAWERIGADING', namaUsaha: 'HOTEL GOLDEN TULIP', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-saw-6', kelurahanId: 'SAWERIGADING', namaUsaha: 'HOTEL EMPRESS', alamatUsaha: 'JL. BOTOLEMPANGAN' },
  { id: 'horeka-saw-7', kelurahanId: 'SAWERIGADING', namaUsaha: 'NOVOTEL HOTEL', alamatUsaha: 'JL. CHAIRIL ANWAR' },
  { id: 'horeka-saw-8', kelurahanId: 'SAWERIGADING', namaUsaha: 'HOTEL CITRA', alamatUsaha: 'JL. BOTOLEMPANGAN' },
  { id: 'horeka-saw-9', kelurahanId: 'SAWERIGADING', namaUsaha: 'TEMPONG PATTIMURA', alamatUsaha: 'JL. BOTOLEMPANGAN' },
  { id: 'horeka-saw-10', kelurahanId: 'SAWERIGADING', namaUsaha: 'LIU YI SHOU CHONG QING HOT POT', alamatUsaha: 'JL. BOTOLEMPANGAN' },
  { id: 'horeka-saw-11', kelurahanId: 'SAWERIGADING', namaUsaha: 'GOODFIELDS', alamatUsaha: 'JL. BOTOLEMPANGAN' },
  { id: 'horeka-saw-12', kelurahanId: 'SAWERIGADING', namaUsaha: 'MISHO JAPAN', alamatUsaha: 'JL. BOTOLEMPANGAN' },
  { id: 'horeka-saw-13', kelurahanId: 'SAWERIGADING', namaUsaha: "MCDONAL'S HASANUDDIN", alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-saw-14', kelurahanId: 'SAWERIGADING', namaUsaha: 'FORE COFFE', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-saw-15', kelurahanId: 'SAWERIGADING', namaUsaha: 'ONKEL JOHNS COFFEE', alamatUsaha: 'JL. SULTAN HASANUDDIN' },
  { id: 'horeka-saw-16', kelurahanId: 'SAWERIGADING', namaUsaha: 'DEE KOPI SAWERIGADING', alamatUsaha: 'JL. SAWERIGADING' },
  { id: 'horeka-saw-17', kelurahanId: 'SAWERIGADING', namaUsaha: 'ALFRED', alamatUsaha: 'JL. BOTOLEMPANGAN NO. 53' },
  { id: 'horeka-saw-18', kelurahanId: 'SAWERIGADING', namaUsaha: 'NUMERICA 29', alamatUsaha: 'JL. SAWERIGADING NO. 29' },
  { id: 'horeka-saw-19', kelurahanId: 'SAWERIGADING', namaUsaha: 'AYAM GORENG SULAWESI', alamatUsaha: 'JL. INCE NURDIN NO. 02' },
  { id: 'horeka-saw-20', kelurahanId: 'SAWERIGADING', namaUsaha: 'PAPERCUP CAFÉ', alamatUsaha: 'JL. CHAIRIL ANWAR' },
  { id: 'horeka-saw-21', kelurahanId: 'SAWERIGADING', namaUsaha: 'RM. AROMA LABAKKANG', alamatUsaha: 'JL. CHAIRIL ANWAR' },
  { id: 'horeka-saw-22', kelurahanId: 'SAWERIGADING', namaUsaha: 'DONAL BAKERY', alamatUsaha: 'JL. KARUNRUNG' },
  { id: 'horeka-saw-23', "kelurahanId": 'SAWERIGADING', namaUsaha: 'ABON GULUNG', alamatUsaha: 'JL. BOTOLEMPANGAN' },
  { id: 'horeka-saw-24', "kelurahanId": 'SAWERIGADING', namaUsaha: 'BOTHLEM SPACE', alamatUsaha: 'JL. BOTOLEMPANGAN' },

  // LAE-LAE
  { id: 'horeka-lae-1', kelurahanId: 'LAE-LAE', namaUsaha: 'WARUNG LAE-LAE', alamatUsaha: 'JL. LAE-LAE NO. 1' },
  { id: 'horeka-lae-2', kelurahanId: 'LAE-LAE', namaUsaha: 'RESTO PULAU LAE-LAE', alamatUsaha: 'KAWASAN DERMAGA LAE-LAE' },
];

// Seed generator for Horeka daily records (Tgl 1 - 21)
export const generateInitialHorekaRecords = (): HorekaDailyRecord[] => {
  const records: HorekaDailyRecord[] = [];
  const prefix = '2026-10-';

  HOREKA_BUSINESSES.forEach((b, idx) => {
    // Generate realistic daily values based on business index
    const baseOrganik = (idx % 5 + 1) * 8.5;
    const baseAnorganik = (idx % 4 + 1) * 2.8;
    const baseResidu = (idx % 6 + 1) * 18.2;

    for (let day = 1; day <= 21; day++) {
      const dStr = day < 10 ? `0${day}` : `${day}`;
      const date = `${prefix}${dStr}`;
      
      // Slight day variance
      const dayFactor = (day % 3 === 0) ? 1.2 : (day % 2 === 0) ? 0.9 : 1.05;
      
      records.push({
        date,
        horekaId: b.id,
        kelurahanId: b.kelurahanId,
        organikKg: Math.round(baseOrganik * dayFactor * 10) / 10,
        anorganikKg: Math.round(baseAnorganik * dayFactor * 10) / 10,
        residuKg: Math.round(baseResidu * dayFactor * 10) / 10,
        operatorName: 'Petugas Pengawas Horeka',
      });
    }
  });

  return records;
};
