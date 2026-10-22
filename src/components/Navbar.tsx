import React from 'react';
import { useWasteData, ActiveTab } from '../context/WasteDataContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  TableProperties,
  PlusCircle,
  RotateCcw,
  Leaf,
  FileText,
} from 'lucide-react';

interface NavbarProps {
  onOpenSpreadsheetGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const {
    activeTab,
    setActiveTab,
    resetToDefaultData,
    setPreselectedInputKelurahan,
  } = useWasteData();

  const handleQuickInput = () => {
    setPreselectedInputKelurahan(null);
    setActiveTab('input');
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'input',
      label: 'Input Data',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      id: 'table',
      label: 'Rekapitulasi',
      icon: <TableProperties className="w-4 h-4" />,
    },
    {
      id: 'official-format',
      label: 'Laporan WA',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 group-hover:bg-emerald-800 transition-all duration-200">
              <Leaf className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 whitespace-nowrap group-hover:text-emerald-800 transition-colors">
                  SAPU-UP
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded tracking-wide uppercase">
                  Kota Makassar
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Sistem Aplikasi Persampahan Ujung Pandang · 10 Kelurahan
              </p>
            </div>
          </div>

          {/* Zone 2: Clean Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-700' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Quick Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={resetToDefaultData}
              title="Reset ke data resmi Oktober 2026 (40.896 Kg)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
