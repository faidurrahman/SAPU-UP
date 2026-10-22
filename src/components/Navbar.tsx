import React from 'react';
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
  User,
  ShieldCheck,
  Building2,
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

  const allNavItems: { id: ActiveTab; label: string; icon: React.ReactNode; roles: ('admin' | 'kelurahan')[] }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['admin', 'kelurahan'],
    },
    {
      id: 'input',
      label: 'Input Data',
      icon: <PlusCircle className="w-4 h-4" />,
      roles: ['admin', 'kelurahan'],
    },
    {
      id: 'table',
      label: 'Rekapitulasi',
      icon: <TableProperties className="w-4 h-4" />,
      roles: ['admin', 'kelurahan'],
    },
    {
      id: 'official-format',
      label: 'Laporan WA',
      icon: <FileText className="w-4 h-4" />,
      roles: ['admin'], // Khusus admin kecamatan
    },
  ];

  // Filter based on active role
  const navItems = allNavItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.role) : true
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Zone 1: Wordmark */}
          <div
            className="flex items-center gap-3 shrink-0 group cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
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

          {/* Zone 2: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
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

          {/* Zone 3: User Badge & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* User Session Badge */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 text-xs">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
                )}
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-slate-900 leading-tight text-[11px] flex items-center gap-1">
                    <span>{currentUser.displayName}</span>
                    <span
                      className={`text-[9px] uppercase px-1 py-0.2 rounded font-extrabold ${
                        currentUser.role === 'admin'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {currentUser.role === 'admin' ? 'Akses Penuh' : 'Khusus Kelurahan'}
                  </div>
                </div>
              </div>
            )}

            {/* Reset Button (Admin only or all) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={resetToDefaultData}
                title="Reset ke data awal resmi"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/60"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Logout Button */}
            {currentUser && (
              <button
                onClick={logout}
                title="Keluar dari sistem"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-lg transition-colors border border-rose-200/80 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          <div className="flex items-center gap-1">
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

          {currentUser && (
            <div className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded shrink-0">
              {currentUser.username}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
