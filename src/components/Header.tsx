import React from 'react';
import { BookOpen, Clock, MapPin, Database, History, PlusCircle, Download } from 'lucide-react';
import { PERCETAKAN_NAME, PERCETAKAN_ADDRESS } from '../data/uinMaduraData';

interface HeaderProps {
  currentTab: 'order' | 'history' | 'schema';
  setCurrentTab: (tab: 'order' | 'history' | 'schema') => void;
  orderCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, orderCount }) => {
  return (
    <header className="no-print bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-900 text-white shadow-lg sticky top-0 z-30">
      <div className="bg-indigo-950/60 border-b border-indigo-700 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-indigo-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-violet-400 text-indigo-950">
              {PERCETAKAN_NAME}
            </span>
            <span className="flex items-center gap-1 text-[11px] sm:text-xs">
              <MapPin className="w-3.5 h-3.5 text-violet-300 shrink-0" />
              {PERCETAKAN_ADDRESS}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-300" />
              Layanan: Senin - Sabtu (08.00 - 17.00 WIB)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-md text-white font-black">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex flex-wrap items-center gap-2">
                  <span>{PERCETAKAN_NAME}</span>
                  <span className="text-xs sm:text-sm font-semibold text-indigo-200">
                    &bull; Jilid Skripsi UIN Madura
                  </span>
                  <span className="text-[11px] font-semibold bg-indigo-700/70 text-indigo-100 px-2 py-0.5 rounded-full border border-indigo-600/50">
                    Sistem Nota Otomatis
                  </span>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setCurrentTab('order')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'order'
                  ? 'bg-violet-500 text-white shadow-md font-bold'
                  : 'bg-indigo-900/60 hover:bg-indigo-800/60 text-indigo-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Formulir Pesanan</span>
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                currentTab === 'history'
                  ? 'bg-violet-500 text-white shadow-md font-bold'
                  : 'bg-indigo-900/60 hover:bg-indigo-800/60 text-indigo-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Daftar Nota</span>
              {orderCount > 0 && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentTab === 'history' ? 'bg-indigo-950 text-white' : 'bg-violet-500 text-white'
                }`}>
                  {orderCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('schema')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'schema'
                  ? 'bg-violet-500 text-white shadow-md font-bold'
                  : 'bg-indigo-900/60 hover:bg-indigo-800/60 text-indigo-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Skema</span>
            </button>
            
            <a
              href="/zain_net_source_code.zip"
              download="zain_net_source_code.zip"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-violet-500 hover:bg-violet-600 text-white shadow-md transition-all shrink-0 cursor-pointer"
              title="Unduh seluruh source code website (.ZIP)"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Source</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
