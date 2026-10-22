import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { KELURAHAN_LIST } from '../data/initialData';
import { KelurahanId, WasteComposition, PakanCollectorInput } from '../types/waste';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  RotateCcw,
  UserCheck,
  Calendar,
  Building2,
  Trash2,
  ArrowRight,
  Info,
  RefreshCw,
  Leaf,
  Recycle,
  Truck,
  Scale,
  Sparkles,
  Store,
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const InputPortalView: React.FC = () => {
  const {
    records,
    collectors,
    residuRecords,
    anorganikRecords,
    anorganikDailyRecords,
    horekaBusinesses,
    horekaDailyRecords,
    saveDailyRecord,
    saveResiduRecord,
    saveAnorganikRecord,
    saveAnorganikDailyRecord,
    saveHorekaDailyRecord,
    addCollector,
    getRecordForDateAndKelurahan,
    getComplianceForDate,
    preselectedInputKelurahan,
    setActiveTab,
    isSavingToSheets,
    activeInputSubTab,
    setActiveInputSubTab,
  } = useWasteData();

  // Selected date and kelurahan
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-22');
  const [selectedKelurahan, setSelectedKelurahan] = useState<KelurahanId>(
    preselectedInputKelurahan || 'BULOGADING'
  );

  // Flags to prevent useEffect from reloading just-saved data into the input form
  const justSavedOrganikRef = useRef<boolean>(false);
  const justSavedAnorganikRef = useRef<boolean>(false);
  const justSavedResiduRef = useRef<boolean>(false);
  const justSavedHorekaRef = useRef<boolean>(false);

  // --- FORM STATE: ORGANIK ---
  const [composition, setComposition] = useState<WasteComposition>({
    makananTpa: 0,
    makananTps3r: 0,
    sisaBuahTpa: 0,
    sisaBuahTps3r: 0,
    sisaSayurTpa: 0,
    sisaSayurTps3r: 0,
    daunTpa: 0,
    daunTps3r: 0,
  });
  const [pakanInputs, setPakanInputs] = useState<PakanCollectorInput[]>([]);
  const [operatorName, setOperatorName] = useState<string>('Petugas Kebersihan Kelurahan');
  const [showAddCollectorModal, setShowAddCollectorModal] = useState<boolean>(false);
  const [newCollectorName, setNewCollectorName] = useState<string>('');
  const [newCollectorPhone, setNewCollectorPhone] = useState<string>('');
  const [isExistingOrganik, setIsExistingOrganik] = useState<boolean>(false);

  // --- FORM STATE: ANORGANIK (Satgas Mobil & Satgas Fukuda) ---
  const [satgasMobilKg, setSatgasMobilKg] = useState<number>(0);
  const [satgasFukudaKg, setSatgasFukudaKg] = useState<number>(0);
  const [anorganikNotes, setAnorganikNotes] = useState<string>('');

  // --- FORM STATE: RESIDU ---
  const [beratResiduKg, setBeratResiduKg] = useState<number>(0);
  const [armadaType, setArmadaType] = useState<string>('Truk Kontainer DLH');
  const [nomorArmada, setNomorArmada] = useState<string>('DD 8001 UP');
  const [jamPengangkutan, setJamPengangkutan] = useState<string>('06:30 - 08:00 WITA');
  const [residuCatatan, setResiduCatatan] = useState<string>('');

  // Sync preselected kelurahan
  useEffect(() => {
    if (preselectedInputKelurahan) {
      setSelectedKelurahan(preselectedInputKelurahan);
    }
  }, [preselectedInputKelurahan]);

  // Load existing ORGANIK data
  useEffect(() => {
    if (justSavedOrganikRef.current) {
      justSavedOrganikRef.current = false;
      return;
    }

    const existing = getRecordForDateAndKelurahan(selectedDate, selectedKelurahan);
    const kelCollectors = collectors.filter(
      (c) => c.kelurahanId === selectedKelurahan && c.active
    );

    if (existing) {
      setIsExistingOrganik(true);
      setComposition(existing.composition);
      setOperatorName(existing.submittedBy || `Petugas ${selectedKelurahan}`);
      const mappedPakan: PakanCollectorInput[] = kelCollectors.map((c) => {
        const found = existing.pakanInputs?.find(
          (p) => p.collectorId === c.id || p.collectorName === c.name
        );
        return {
          collectorId: c.id,
          collectorName: c.name,
          weightKg: found ? found.weightKg : 0,
        };
      });
      setPakanInputs(mappedPakan);
    } else {
      setIsExistingOrganik(false);
      setComposition({
        makananTpa: 0,
        makananTps3r: 0,
        sisaBuahTpa: 0,
        sisaBuahTps3r: 0,
        sisaSayurTpa: 0,
        sisaSayurTps3r: 0,
        daunTpa: 0,
        daunTps3r: 0,
      });
      setPakanInputs(
        kelCollectors.map((c) => ({
          collectorId: c.id,
          collectorName: c.name,
          weightKg: 0,
        }))
      );
    }
  }, [selectedDate, selectedKelurahan, records, collectors]);

  // Load existing ANORGANIK data
  useEffect(() => {
    if (justSavedAnorganikRef.current) {
      justSavedAnorganikRef.current = false;
      return;
    }

    const existing = anorganikDailyRecords.find(
      (r) => r.date === selectedDate && r.kelurahanId === selectedKelurahan
    );
    if (existing) {
      setSatgasMobilKg(existing.satgasMobilKg || 0);
      setSatgasFukudaKg(existing.satgasFukudaKg || 0);
      setAnorganikNotes(existing.catatan || '');
    } else {
      setSatgasMobilKg(0);
      setSatgasFukudaKg(0);
      setAnorganikNotes('');
    }
  }, [selectedDate, selectedKelurahan, anorganikDailyRecords]);

  // Load existing RESIDU data
  useEffect(() => {
    if (justSavedResiduRef.current) {
      justSavedResiduRef.current = false;
      return;
    }

    const existing = residuRecords.find(
      (r) => r.date === selectedDate && r.kelurahanId === selectedKelurahan
    );
    if (existing) {
      setBeratResiduKg(existing.beratKg || 0);
      setArmadaType(existing.armadaType || 'Truk Kontainer DLH');
      setNomorArmada(existing.nomorArmada || 'DD 8001 UP');
      setJamPengangkutan(existing.jamPengangkutan || '06:30 - 08:00 WITA');
      setResiduCatatan(existing.catatan || '');
    } else {
      setBeratResiduKg(0);
      setArmadaType('Truk Kontainer DLH');
      setNomorArmada('DD 8001 UP');
      setJamPengangkutan('06:30 - 08:00 WITA');
      setResiduCatatan('');
    }
  }, [selectedDate, selectedKelurahan, residuRecords]);

  // Handle Save Organik
  const handleSubmitOrganik = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    justSavedOrganikRef.current = true;
    await saveDailyRecord({
      date: selectedDate,
      kelurahanId: selectedKelurahan,
      composition,
      pakanInputs,
      submittedBy: operatorName,
    });

    // Reset formulir kembali kosong/0 seperti awal
    setComposition({
      makananTpa: 0,
      makananTps3r: 0,
      sisaBuahTpa: 0,
      sisaBuahTps3r: 0,
      sisaSayurTpa: 0,
      sisaSayurTps3r: 0,
      daunTpa: 0,
      daunTps3r: 0,
    });
    const kelCollectors = collectors.filter(
      (c) => c.kelurahanId === selectedKelurahan && c.active
    );
    setPakanInputs(
      kelCollectors.map((c) => ({
        collectorId: c.id,
        collectorName: c.name,
        weightKg: 0,
      }))
    );
    setIsExistingOrganik(false);
  };

  // Handle Save Anorganik
  const handleSubmitAnorganik = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    justSavedAnorganikRef.current = true;
    const totalKg = (satgasMobilKg || 0) + (satgasFukudaKg || 0);
    await saveAnorganikDailyRecord({
      date: selectedDate,
      kelurahanId: selectedKelurahan,
      satgasMobilKg,
      satgasFukudaKg,
      totalKg,
      catatan: anorganikNotes,
      submittedBy: operatorName,
    });

    // Reset formulir kembali kosong/0 seperti awal
    setSatgasMobilKg(0);
    setSatgasFukudaKg(0);
    setAnorganikNotes('');
  };

  // Handle Save Residu
  const handleSubmitResidu = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    justSavedResiduRef.current = true;
    await saveResiduRecord({
      date: selectedDate,
      kelurahanId: selectedKelurahan,
      beratKg: beratResiduKg,
      armadaType,
      nomorArmada,
      jamPengangkutan,
      catatan: residuCatatan,
      submittedBy: operatorName,
    });

    // Reset formulir kembali kosong/0 seperti awal
    setBeratResiduKg(0);
    setResiduCatatan('');
  };

  // --- FORM STATE: HOREKA ---
  const [selectedHorekaId, setSelectedHorekaId] = useState<string>('');
  const [horekaOrganikKg, setHorekaOrganikKg] = useState<number>(0);
  const [horekaAnorganikKg, setHorekaAnorganikKg] = useState<number>(0);
  const [horekaResiduKg, setHorekaResiduKg] = useState<number>(0);

  // Filtered Horeka list by selected kelurahan
  const kelurahanHorekaList = useMemo(() => {
    return horekaBusinesses.filter((b: any) => b.kelurahanId === selectedKelurahan);
  }, [horekaBusinesses, selectedKelurahan]);

  // Selected Horeka Business details
  const selectedHorekaBusiness = useMemo(() => {
    return horekaBusinesses.find((b: any) => b.id === selectedHorekaId);
  }, [horekaBusinesses, selectedHorekaId]);

  // Auto select first business when kelurahan changes
  useEffect(() => {
    if (kelurahanHorekaList.length > 0) {
      const exists = kelurahanHorekaList.find((b: any) => b.id === selectedHorekaId);
      if (!exists) {
        setSelectedHorekaId(kelurahanHorekaList[0].id);
      }
    } else {
      setSelectedHorekaId('');
    }
  }, [kelurahanHorekaList, selectedHorekaId]);

  // Load existing HOREKA data
  useEffect(() => {
    if (justSavedHorekaRef.current) {
      justSavedHorekaRef.current = false;
      return;
    }

    if (!selectedHorekaId) return;
    const existing = horekaDailyRecords.find(
      (r) => r.date === selectedDate && r.horekaId === selectedHorekaId
    );
    if (existing) {
      setHorekaOrganikKg(existing.organikKg || 0);
      setHorekaAnorganikKg(existing.anorganikKg || 0);
      setHorekaResiduKg(existing.residuKg || 0);
    } else {
      setHorekaOrganikKg(0);
      setHorekaAnorganikKg(0);
      setHorekaResiduKg(0);
    }
  }, [selectedDate, selectedHorekaId, horekaDailyRecords]);

  // Handle Save Horeka
  const handleSubmitHoreka = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedHorekaId) return;
    justSavedHorekaRef.current = true;
    await saveHorekaDailyRecord({
      date: selectedDate,
      horekaId: selectedHorekaId,
      kelurahanId: selectedKelurahan,
      organikKg: Number(horekaOrganikKg || 0),
      anorganikKg: Number(horekaAnorganikKg || 0),
      residuKg: Number(horekaResiduKg || 0),
      operatorName,
    });

    // Reset formulir kembali kosong/0 seperti awal
    setHorekaOrganikKg(0);
    setHorekaAnorganikKg(0);
    setHorekaResiduKg(0);
  };

  // Add new collector modal submit
  const handleAddNewCollector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectorName.trim()) return;
    addCollector({
      name: newCollectorName.trim(),
      kelurahanId: selectedKelurahan,
      phone: newCollectorPhone.trim() || undefined,
      active: true,
    });
    setNewCollectorName('');
    setNewCollectorPhone('');
    setShowAddCollectorModal(false);
  };

  // Computations for Organik
  const totalTpaOrganik =
    composition.makananTpa + composition.sisaBuahTpa + composition.sisaSayurTpa + composition.daunTpa;
  const totalTps3rOrganik =
    composition.makananTps3r + composition.sisaBuahTps3r + composition.sisaSayurTps3r + composition.daunTps3r;
  const totalPakanOrganik = pakanInputs.reduce((sum, p) => sum + (p.weightKg || 0), 0);
  const grandTotalOrganik = totalTpaOrganik + totalTps3rOrganik + totalPakanOrganik;

  // Computations for Anorganik
  const grandTotalAnorganik = satgasMobilKg + satgasFukudaKg;

  const activeMeta = KELURAHAN_LIST.find((k) => k.id === selectedKelurahan);
  const compliance = getComplianceForDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header Banner & Sub-Menu Switcher */}
      <ScrollReveal delay={0} distance={20} duration={600}>
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <span>Portal Input Data Persampahan</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan timbulan harian Organik, Anorganik Daur Ulang, dan Residu TPA per Kelurahan
              </p>
            </div>

            {/* Quick Selectors for Kelurahan and Date */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <label className="font-semibold text-slate-700">Kelurahan:</label>
                <select
                  value={selectedKelurahan}
                  onChange={(e) => setSelectedKelurahan(e.target.value as KelurahanId)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-hidden cursor-pointer"
                >
                  {KELURAHAN_LIST.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                <Calendar className="w-4 h-4 text-slate-500" />
                <label className="font-semibold text-slate-700">Tanggal:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-mono font-medium text-slate-900 focus:outline-hidden cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Sub-Menu Tabs Switcher */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveInputSubTab('organik')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeInputSubTab === 'organik'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Leaf className="w-4 h-4" />
              <span>Input Data Organik</span>
            </button>

            <button
              onClick={() => setActiveInputSubTab('anorganik')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeInputSubTab === 'anorganik'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Recycle className="w-4 h-4" />
              <span>Input Data Anorganik</span>
            </button>

            <button
              onClick={() => setActiveInputSubTab('residu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeInputSubTab === 'residu'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Input Data Residu</span>
            </button>

            <button
              onClick={() => setActiveInputSubTab('horeka')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeInputSubTab === 'horeka'
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Input Data Horeka</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* SUB TAB 1: FORM INPUT ORGANIK */}
      {activeInputSubTab === 'organik' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmitOrganik} className="lg:col-span-2 space-y-6">
            <ScrollReveal delay={50} distance={20} duration={600}>
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl transition-all">
                <h3 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-700" />
                    <span>Timbulan Sampah Organik (Kg)</span>
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    {activeMeta?.name} — {selectedDate}
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sisa Makanan */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="font-bold text-xs text-slate-900 block">
                      1. Sisa Makanan / Dapur
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">Ke TPA (Bosowa):</span>
                        <input
                          type="number"
                          min="0"
                          value={composition.makananTpa || ''}
                          onChange={(e) =>
                            setComposition({ ...composition, makananTpa: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">Ke TPS3R Karebosi:</span>
                        <input
                          type="number"
                          min="0"
                          value={composition.makananTps3r || ''}
                          onChange={(e) =>
                            setComposition({ ...composition, makananTps3r: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sisa Buah */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="font-bold text-xs text-slate-900 block">
                      2. Sisa Buah-Buahan (Pasar)
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">Ke TPA (Bosowa):</span>
                        <input
                          type="number"
                          min="0"
                          value={composition.sisaBuahTpa || ''}
                          onChange={(e) =>
                            setComposition({ ...composition, sisaBuahTpa: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">Ke TPS3R Karebosi:</span>
                        <input
                          type="number"
                          min="0"
                          value={composition.sisaBuahTps3r || ''}
                          onChange={(e) =>
                            setComposition({ ...composition, sisaBuahTps3r: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sisa Sayur */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="font-bold text-xs text-slate-900 block">
                      3. Sisa Sayur-Sayuran
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">Ke TPA (Bosowa):</span>
                        <input
                          type="number"
                          min="0"
                          value={composition.sisaSayurTpa || ''}
                          onChange={(e) =>
                            setComposition({ ...composition, sisaSayurTpa: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">Ke TPS3R Karebosi:</span>
                        <input
                          type="number"
                          min="0"
                          value={composition.sisaSayurTps3r || ''}
                          onChange={(e) =>
                            setComposition({ ...composition, sisaSayurTps3r: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sampah Daun */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="font-bold text-xs text-slate-900 block">
                      4. Sampah Daun / Ranting
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">Ke TPA (Bosowa):</span>
                        <input
                          type="number"
                          min="0"
                          value={composition.daunTpa || ''}
                          onChange={(e) =>
                            setComposition({ ...composition, daunTpa: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">Ke TPS3R Karebosi:</span>
                        <input
                          type="number"
                          min="0"
                          value={composition.daunTps3r || ''}
                          onChange={(e) =>
                            setComposition({ ...composition, daunTps3r: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Pakan Ternak Input List */}
            <ScrollReveal delay={100} distance={20} duration={600}>
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span>Distribusi Pakan Ternak (Petugas Pengumpul)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddCollectorModal(true)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Petugas</span>
                  </button>
                </div>

                {pakanInputs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    Belum ada petugas pakan terdaftar di Kelurahan {selectedKelurahan}.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pakanInputs.map((item, idx) => (
                      <div
                        key={item.collectorId || idx}
                        className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-200/70 rounded-xl text-xs"
                      >
                        <span className="font-bold text-slate-800">{item.collectorName}</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={item.weightKg || ''}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = [...pakanInputs];
                              updated[idx].weightKg = val;
                              setPakanInputs(updated);
                            }}
                            className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-right font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="text-slate-500 font-semibold">Kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Operator Name */}
            <ScrollReveal delay={120} distance={20} duration={600}>
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700">Nama Petugas Input:</span>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium text-xs focus:outline-hidden"
                  />
                </div>
              </div>
            </ScrollReveal>
          </form>

          {/* Right Column: Live Summary Organik */}
          <div>
            <ScrollReveal delay={150} distance={28} duration={700}>
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-2xl transition-all sticky top-20">
                <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
                  Ringkasan Live Organik
                </h3>

                <div className="my-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 text-slate-600">
                    <span>Kelurahan:</span>
                    <span className="font-bold text-slate-900">{activeMeta?.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-slate-600">
                    <span>Tanggal Laporan:</span>
                    <span className="font-mono font-medium text-slate-900">{selectedDate}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Total TPA (Bosowa):</span>
                      <span className="font-mono font-bold text-sky-800">{totalTpaOrganik.toLocaleString('id-ID')} Kg</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span>Total TPS3R Karebosi:</span>
                      <span className="font-mono font-bold text-emerald-800">{totalTps3rOrganik.toLocaleString('id-ID')} Kg</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span>Total Pakan Ternak:</span>
                      <span className="font-mono font-bold text-amber-800">{totalPakanOrganik.toLocaleString('id-ID')} Kg</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-200">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase">Grand Total Organik:</span>
                      <span className="text-2xl font-extrabold text-emerald-800 font-mono">
                        {grandTotalOrganik.toLocaleString('id-ID')} <span className="text-xs">Kg</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitOrganik}
                  disabled={isSavingToSheets}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-lg shadow-xs transition-colors text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Laporan Organik</span>
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* SUB TAB 2: FORM INPUT ANORGANIK */}
      {activeInputSubTab === 'anorganik' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmitAnorganik} className="lg:col-span-2 space-y-6">
            <ScrollReveal delay={50} distance={20} duration={600}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all space-y-5">
                <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Recycle className="w-4.5 h-4.5 text-teal-700" />
                    <span>Formulir Input Sampah Anorganik Terpilah</span>
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    {activeMeta?.name} — {selectedDate}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* 1. Input Data Satgas Mobil */}
                  <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-sky-950 font-bold">
                      <Truck className="w-4 h-4 text-sky-700" />
                      <span>1. Input Data Satgas Mobil</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Volume sampah anorganik terpilah hasil pengangkutan armada Satgas Mobil
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min="0"
                        value={satgasMobilKg || ''}
                        onChange={(e) => setSatgasMobilKg(Number(e.target.value))}
                        className="w-full bg-white border border-sky-300 rounded-lg px-3 py-2 font-mono font-extrabold text-base text-sky-950 focus:ring-2 focus:ring-sky-500"
                        placeholder="0"
                      />
                      <span className="font-extrabold text-sky-900">Kg</span>
                    </div>
                  </div>

                  {/* 2. Input Data Satgas Fukuda */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-950 font-bold">
                      <Recycle className="w-4 h-4 text-amber-700" />
                      <span>2. Input Data Satgas Fukuda</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Volume sampah anorganik terpilah hasil pengangkutan armada Satgas Fukuda
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min="0"
                        value={satgasFukudaKg || ''}
                        onChange={(e) => setSatgasFukudaKg(Number(e.target.value))}
                        className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 font-mono font-extrabold text-base text-amber-950 focus:ring-2 focus:ring-amber-500"
                        placeholder="0"
                      />
                      <span className="font-extrabold text-amber-900">Kg</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Catatan / Keterangan Penyetoran Anorganik:
                    </label>
                    <textarea
                      value={anorganikNotes}
                      onChange={(e) => setAnorganikNotes(e.target.value)}
                      rows={2}
                      placeholder="Catatan jenis sampah anorganik (plastik, kertas, logam, dll)..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </form>

          {/* Right Column: Live Summary Anorganik */}
          <div>
            <ScrollReveal delay={100} distance={28} duration={700}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-2xl transition-all sticky top-20">
                <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Ringkasan Live Anorganik</span>
                  <span className="text-xs text-teal-700 font-bold">{selectedKelurahan}</span>
                </h3>

                <div className="my-4 space-y-3 text-xs">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Satgas Mobil:</span>
                    <span className="font-mono font-bold text-sky-800">{satgasMobilKg.toLocaleString('id-ID')} Kg</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Satgas Fukuda:</span>
                    <span className="font-mono font-bold text-amber-800">{satgasFukudaKg.toLocaleString('id-ID')} Kg</span>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-200">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase">Total Anorganik:</span>
                      <span className="text-2xl font-extrabold text-teal-800 font-mono">
                        {(satgasMobilKg + satgasFukudaKg).toLocaleString('id-ID')} <span className="text-xs">Kg</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitAnorganik}
                  disabled={isSavingToSheets}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-semibold rounded-lg shadow-xs transition-colors text-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingToSheets ? 'Menyimpan ke Google Sheets...' : 'Simpan Laporan Anorganik'}</span>
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* SUB TAB 3: FORM INPUT RESIDU */}
      {activeInputSubTab === 'residu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmitResidu} className="lg:col-span-2 space-y-6">
            <ScrollReveal delay={50} distance={20} duration={600}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all space-y-4">
                <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Trash2 className="w-4.5 h-4.5 text-rose-700" />
                  <span>Formulir Input Sampah Residu TPA Tamangapa</span>
                </h3>

                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-3">
                  <div>
                    <label className="font-bold text-xs text-rose-950 block mb-1">
                      Berat Sampah Residu Terangkut (Kg):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={beratResiduKg || ''}
                        onChange={(e) => setBeratResiduKg(Number(e.target.value))}
                        className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-lg font-mono font-extrabold text-rose-950 focus:ring-2 focus:ring-rose-500"
                        placeholder="Contoh: 4072"
                      />
                      <span className="font-extrabold text-rose-900 text-sm">Kg</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Jenis Armada Angkutan:</label>
                      <select
                        value={armadaType}
                        onChange={(e) => setArmadaType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-900"
                      >
                        <option value="Truk Kontainer DLH">Truk Kontainer DLH</option>
                        <option value="Truk Kompaktor">Truk Kompaktor</option>
                        <option value="Tossa / Viar Tiga Roda">Tossa / Viar Tiga Roda</option>
                        <option value="Gerobak / Tangkasa">Gerobak / Tangkasa</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nomor Polisi / Kode Armada:</label>
                      <input
                        type="text"
                        value={nomorArmada}
                        onChange={(e) => setNomorArmada(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                        placeholder="DD 8001 UP"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Jam Pengangkutan / Masuk TPA:</label>
                      <input
                        type="text"
                        value={jamPengangkutan}
                        onChange={(e) => setJamPengangkutan(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-900"
                        placeholder="06:30 - 08:00 WITA"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Petugas Input / Sopir Armada:</label>
                      <input
                        type="text"
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-xs">Catatan Lapangan / TPA:</label>
                    <textarea
                      value={residuCatatan}
                      onChange={(e) => setResiduCatatan(e.target.value)}
                      rows={2}
                      placeholder="Catatan volume kontainer, timbangan TPA, dll..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </form>

          {/* Right Column: Live Summary Residu */}
          <div>
            <ScrollReveal delay={100} distance={28} duration={700}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-2xl transition-all sticky top-20">
                <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Ringkasan Residu</span>
                  <span className="text-xs text-rose-700 font-bold">{selectedKelurahan}</span>
                </h3>

                <div className="my-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Tanggal:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Armada:</span>
                    <span className="font-semibold text-slate-900">{armadaType}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>No. Polisi:</span>
                    <span className="font-mono font-bold text-slate-900">{nomorArmada}</span>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-200">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase">Berat Residu:</span>
                      <span className="text-2xl font-extrabold text-rose-800 font-mono">
                        {beratResiduKg.toLocaleString('id-ID')} <span className="text-xs">Kg</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitResidu}
                  disabled={isSavingToSheets}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-700 hover:bg-rose-800 disabled:opacity-60 text-white font-semibold rounded-lg shadow-xs transition-colors text-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingToSheets ? 'Menyimpan ke Google Sheets...' : 'Simpan Laporan Residu'}</span>
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}



      {/* SUB TAB 4: FORM INPUT HOREKA */}
      {activeInputSubTab === 'horeka' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmitHoreka} className="lg:col-span-2 space-y-6">
            <ScrollReveal delay={50} distance={20} duration={600}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-xl transition-all space-y-5">
                <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Store className="w-4.5 h-4.5 text-indigo-700" />
                    <span>Formulir Input Data Horeka (Hotel, Restoran, Kafe, Kios)</span>
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    {selectedKelurahan} — {selectedDate}
                  </span>
                </h3>

                <div className="space-y-4 text-xs">
                  {/* 1. Nama Usaha */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      1. Nama Usaha (Sesuai Data Excel Horeka):
                    </label>
                    {kelurahanHorekaList.length === 0 ? (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                        Tidak ada usaha Horeka terdaftar di Kelurahan {selectedKelurahan}. Silakan pilih kelurahan lain.
                      </p>
                    ) : (
                      <select
                        value={selectedHorekaId}
                        onChange={(e) => setSelectedHorekaId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs"
                      >
                        {kelurahanHorekaList.map((b: any) => (
                          <option key={b.id} value={b.id}>
                            {b.namaUsaha} ({b.alamatUsaha})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* 2. Alamat */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      2. Alamat Usaha (Sesuai Data Excel Horeka):
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={selectedHorekaBusiness?.alamatUsaha || 'JL. KAJAOLALIDO'}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700 text-xs cursor-not-allowed"
                    />
                  </div>

                  {/* 3. Sampah Organik */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                    <label className="font-bold text-emerald-950 block text-xs">
                      3. Sampah Organik (Kg):
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Timbulan sampah organik basah / sisa makanan dapur usaha
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={horekaOrganikKg || ''}
                        onChange={(e) => setHorekaOrganikKg(Number(e.target.value))}
                        className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 font-mono font-extrabold text-base text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                      />
                      <span className="font-extrabold text-emerald-900">Kg</span>
                    </div>
                  </div>

                  {/* 4. Sampah Anorganik */}
                  <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1.5">
                    <label className="font-bold text-teal-950 block text-xs">
                      4. Sampah Anorganik (Kg):
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Timbulan sampah daur ulang (kardus, botol, plastik, kaleng)
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={horekaAnorganikKg || ''}
                        onChange={(e) => setHorekaAnorganikKg(Number(e.target.value))}
                        className="w-full bg-white border border-teal-300 rounded-lg px-3 py-2 font-mono font-extrabold text-base text-teal-950 focus:ring-2 focus:ring-teal-500"
                        placeholder="0"
                      />
                      <span className="font-extrabold text-teal-900">Kg</span>
                    </div>
                  </div>

                  {/* 5. Sampah Residu */}
                  <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5">
                    <label className="font-bold text-rose-950 block text-xs">
                      5. Sampah Residu (Kg):
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Sampah residu tercampur diangkut ke TPA
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={horekaResiduKg || ''}
                        onChange={(e) => setHorekaResiduKg(Number(e.target.value))}
                        className="w-full bg-white border border-rose-300 rounded-lg px-3 py-2 font-mono font-extrabold text-base text-rose-950 focus:ring-2 focus:ring-rose-500"
                        placeholder="0"
                      />
                      <span className="font-extrabold text-rose-900">Kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </form>

          {/* Right Column: Live Summary Horeka */}
          <div>
            <ScrollReveal delay={100} distance={28} duration={700}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-2xl transition-all sticky top-20">
                <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Ringkasan Live Horeka</span>
                  <span className="text-xs text-indigo-700 font-bold">{selectedKelurahan}</span>
                </h3>

                <div className="my-4 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Nama Usaha:</span>
                    <span className="font-bold text-slate-900 text-right truncate max-w-[150px]">
                      {selectedHorekaBusiness?.namaUsaha || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Tanggal:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedDate}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-slate-700">
                      <span>3. Sampah Organik:</span>
                      <span className="font-mono font-bold text-emerald-800">{horekaOrganikKg.toLocaleString('id-ID')} Kg</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>4. Sampah Anorganik:</span>
                      <span className="font-mono font-bold text-teal-800">{horekaAnorganikKg.toLocaleString('id-ID')} Kg</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>5. Sampah Residu:</span>
                      <span className="font-mono font-bold text-rose-800">{horekaResiduKg.toLocaleString('id-ID')} Kg</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-200">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase">Total Horeka:</span>
                      <span className="text-2xl font-extrabold text-indigo-800 font-mono">
                        {(horekaOrganikKg + horekaAnorganikKg + horekaResiduKg).toLocaleString('id-ID')} <span className="text-xs">Kg</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitHoreka}
                  disabled={isSavingToSheets}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white font-semibold rounded-lg shadow-xs transition-colors text-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingToSheets ? 'Menyimpan ke Google Sheets...' : 'Simpan Laporan Horeka'}</span>
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* Add Collector Modal */}
      {showAddCollectorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Tambah Petugas Pengumpul Pakan ({selectedKelurahan})
            </h3>
            <form onSubmit={handleAddNewCollector} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Petugas:</label>
                <input
                  type="text"
                  required
                  value={newCollectorName}
                  onChange={(e) => setNewCollectorName(e.target.value)}
                  placeholder="Contoh: Pak Daeng Sikki"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">No. WhatsApp / HP (Opsional):</label>
                <input
                  type="text"
                  value={newCollectorPhone}
                  onChange={(e) => setNewCollectorPhone(e.target.value)}
                  placeholder="0812..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCollectorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
                >
                  Simpan Petugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
