/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WasteDataProvider, useWasteData } from './context/WasteDataContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InputPortalView } from './components/InputPortalView';
import { RecapTableView } from './components/RecapTableView';
import { ComplianceView } from './components/ComplianceView';
import { OfficialReportView } from './components/OfficialReportView';
import { PrintReportModal } from './components/PrintReportModal';
import { SpreadsheetGuideModal } from './components/SpreadsheetGuideModal';
import { CheckCircle2, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, toastMessage, setToastMessage } = useWasteData();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isSpreadsheetGuideOpen, setIsSpreadsheetGuideOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenSpreadsheetGuide={() => setIsSpreadsheetGuideOpen(true)} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'official-format' && <OfficialReportView />}
        {activeTab === 'input' && <InputPortalView />}
        {activeTab === 'table' && (
          <RecapTableView
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            onOpenSpreadsheetGuide={() => setIsSpreadsheetGuideOpen(true)}
          />
        )}
        {activeTab === 'compliance' && <ComplianceView />}
      </main>

      {/* Printable Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Spreadsheet Structure & Formula Guide Modal */}
      <SpreadsheetGuideModal
        isOpen={isSpreadsheetGuideOpen}
        onClose={() => setIsSpreadsheetGuideOpen(false)}
      />

      {/* Clean GovTech Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Kecamatan Ujung Pandang
            </span>
            <span>·</span>
            <span>Kota Makassar, Sulawesi Selatan</span>
          </div>
          <div className="text-[11px] text-slate-400">
            SAPU-UP (Sistem Aplikasi Persampahan Ujung Pandang) · Kota Makassar
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <WasteDataProvider>
      <AppContent />
    </WasteDataProvider>
  );
}
