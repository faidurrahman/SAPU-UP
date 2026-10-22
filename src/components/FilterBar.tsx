import React from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { KELURAHAN_LIST } from '../data/initialData';
import { KelurahanId } from '../types/waste';
import { Filter, Calendar, MapPin, Download } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const { filter, setFilter, exportToCsv, filteredRecords, executiveSummary } = useWasteData();

  const todayStr = '2026-10-22';

  const handlePreset = (preset: 'resmi' | 'last7' | 'today' | 'fullMonth') => {
    switch (preset) {
      case 'resmi':
        setFilter({ startDate: '2026-10-01', endDate: todayStr });
        break;
      case 'last7':
        setFilter({ startDate: '2026-10-16', endDate: todayStr });
        break;
      case 'today':
        setFilter({ startDate: todayStr, endDate: todayStr });
        break;
      case 'fullMonth':
        setFilter({ startDate: '2026-10-01', endDate: '2026-10-31' });
        break;
    }
  };

  const isResmi = filter.startDate === '2026-10-01' && filter.endDate === todayStr;
  const isLast7 = filter.startDate === '2026-10-16' && filter.endDate === todayStr;
  const isToday = filter.startDate === todayStr && filter.endDate === todayStr;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs mb-6 no-print">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Filter Form */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mr-1">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Filter Data:</span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => handlePreset('resmi')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                isResmi
                  ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oktober (1–22 Okt)
            </button>
            <button
              onClick={() => handlePreset('last7')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                isLast7
                  ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => handlePreset('today')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                isToday
                  ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hari Ini (22 Okt)
            </button>
          </div>

          {/* Date range pickers */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ startDate: e.target.value })}
              className="bg-transparent text-slate-700 text-xs focus:outline-hidden font-mono"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ endDate: e.target.value })}
              className="bg-transparent text-slate-700 text-xs focus:outline-hidden font-mono"
            />
          </div>

          {/* Kelurahan dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filter.kelurahanId}
              onChange={(e) => setFilter({ kelurahanId: e.target.value as KelurahanId | 'ALL' })}
              className="bg-transparent text-slate-800 text-xs font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Semua Kelurahan (10 Wilayah)</option>
              {KELURAHAN_LIST.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Active Info & Export */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs border-t lg:border-t-0 pt-3 lg:pt-0">
          <div className="text-slate-500">
            <span>Terpilih: </span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">
              {filteredRecords.length}
            </span>{' '}
            laporan (
            <span className="font-semibold text-emerald-700 font-mono tabular-nums">
              {executiveSummary.grandTotal.toLocaleString('id-ID')} Kg
            </span>
            )
          </div>

          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
