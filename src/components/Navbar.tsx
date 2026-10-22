import React, { useState } from 'react';
import { useWasteData, ActiveTab } from '../context/WasteDataContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  TableProperties,
  PlusCircle,
  RotateCcw,
  Leaf,
  FileText,
  LogOut,
  ShieldCheck,
  Building2,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  onOpenSpreadsheetGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const {
    activeTab,
    setActiveTab,
    resetToDefaultData,
  } = useWasteData();

  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const allNavItems: {
    id: ActiveTab;
    label: string;
    description: string;
    icon: React.ReactNode;
    roles: ('admin' | 'kelurahan')[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Ringkasan & visualisasi statistik sampah',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      roles: ['admin', 'kelurahan'],
    },
    {
      id: 'input',
      label: 'Input Data',
      description: 'Form input harian & sektor horeka',
      icon: <PlusCircle className="w-4 h-4 shrink-0" />,
      roles: ['admin', 'kelurahan'],
    },
    {
      id: 'table',
      label: 'Rekapitulasi',
      description: 'Tabel data agregat 10 kelurahan',
      icon: <TableProperties className="w-4 h-4 shrink-0" />,
      roles: ['admin', 'kelurahan'],
    },
    {
      id: 'official-format',
      label: 'Laporan WA',
      description: 'Format laporan harian pimpinan',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      roles: ['admin'], // Khusus admin kecamatan
    },
  ];

  // Filter based on active role
  const navItems = allNavItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.role) : true
  );

  const handleSelectTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 min-w-0">
          {/* Zone 1: Wordmark & Logo */}
          <div
            className="flex items-center gap-2 sm:gap-3 min-w-0 shrink group cursor-pointer"
            onClick={() => handleSelectTab('dashboard')}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 group-hover:bg-emerald-800 transition-all duration-200 shrink-0">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 whitespace-nowrap group-hover:text-emerald-800 transition-colors">
                  SAPU-UP
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded tracking-wide uppercase shrink-0 hidden xs:inline-block">
                  Kota Makassar
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden lg:block truncate">
                Sistem Aplikasi Persampahan Ujung Pandang · 10 Kelurahan
              </p>
            </div>
          </div>

          {/* Zone 2: Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 whitespace-nowrap ${
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

          {/* Zone 3: User Badge & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            {/* User Session Badge with proper truncate to never overflow */}
            {currentUser && (
              <div
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200/90 rounded-lg px-2 sm:px-2.5 py-1 text-xs max-w-[110px] xs:max-w-[150px] sm:max-w-[210px] md:max-w-[260px] min-w-0"
                title={`${currentUser.displayName} (${currentUser.role === 'admin' ? 'Administrator Kecamatan' : 'Kelurahan'})`}
              >
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-700 shrink-0" />
                )}
                <div className="text-left min-w-0 flex-1">
                  <div className="font-bold text-slate-900 leading-tight text-[10px] sm:text-[11px] flex items-center gap-1 min-w-0">
                    <span className="truncate">{currentUser.displayName}</span>
                    <span
                      className={`text-[8px] sm:text-[9px] uppercase px-1 py-0.2 rounded font-extrabold shrink-0 hidden sm:inline-block ${
                        currentUser.role === 'admin'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 leading-tight truncate hidden md:block">
                    {currentUser.role === 'admin' ? 'Akses Penuh' : 'Khusus Kelurahan'}
                  </div>
                </div>
              </div>
            )}

            {/* Reset Button (Admin only - Desktop) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={resetToDefaultData}
                title="Reset ke data awal resmi"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/60 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Reset</span>
              </button>
            )}

            {/* Logout Button (Quick access - compact on mobile) */}
            {currentUser && (
              <button
                onClick={handleLogout}
                title="Keluar dari sistem"
                className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-lg transition-colors border border-rose-200/80 font-medium shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            )}

            {/* Hamburger Button (Mobile < md) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors shrink-0"
              aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu navigasi'}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-slate-700" />
              ) : (
                <Menu className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Quick mobile horizontal tabs bar (when hamburger is closed) */}
        {!isMobileMenuOpen && (
          <div className="md:hidden flex items-center justify-between gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {currentUser && (
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0 uppercase">
                {currentUser.role}
              </span>
            )}
          </div>
        )}

        {/* Expanded Hamburger Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 py-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Full Profile Card in Mobile Menu */}
            {currentUser && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                      currentUser.role === 'admin'
                        ? 'bg-emerald-600 shadow-xs'
                        : 'bg-teal-600 shadow-xs'
                    }`}
                  >
                    {currentUser.role === 'admin' ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">
                        {currentUser.displayName}
                      </span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-extrabold ${
                          currentUser.role === 'admin'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {currentUser.role === 'admin'
                        ? 'Administrator Kecamatan · Akses Penuh Semua Menu'
                        : `Akun Resmi Kelurahan ${currentUser.kelurahanName || currentUser.displayName}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Navigation Links */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Navigasi Menu
              </div>
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isActive
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-700' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Action buttons inside mobile menu */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    resetToDefaultData();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-colors font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Data Awal Resmi</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
