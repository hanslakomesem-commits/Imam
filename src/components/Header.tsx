import React from 'react';
import { BookOpen, Sparkles, Clock, MapPin, Database, History, PlusCircle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'order' | 'history' | 'schema';
  setCurrentTab: (tab: 'order' | 'history' | 'schema') => void;
  orderCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, orderCount }) => {
  return (
    <header className="no-print bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-lg sticky top-0 z-30">
      {/* Top Banner Notice */}
      <div className="bg-emerald-950/60 border-b border-emerald-700/40 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              UIN MADURA
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Gedung Percetakan & Layanan Akademik Kampus UIN Madura, Pamekasan
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Layanan: Senin - Sabtu (08.00 - 17.00 WIB)
            </span>
            <span className="hidden sm:inline text-emerald-400">•</span>
            <span className="hidden sm:inline text-emerald-300 font-medium">
              Standar Warna Sampul Resmi Fakultas
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-md text-emerald-950 font-black">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Jilid Skripsi UIN Madura
                  <span className="text-[11px] font-semibold bg-emerald-700/70 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-600/50">
                    Sistem Nota Otomatis
                  </span>
                </h1>
              </div>
              <p className="text-xs text-emerald-200/90">
                Pemesanan Hard Cover Skripsi, Layanan Artikel, CD, SKEK & Pemisahan File Perpus
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setCurrentTab('order')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'order'
                  ? 'bg-amber-400 text-emerald-950 shadow-md font-bold'
                  : 'bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Formulir Pesanan</span>
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                currentTab === 'history'
                  ? 'bg-amber-400 text-emerald-950 shadow-md font-bold'
                  : 'bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Daftar Nota</span>
              {orderCount > 0 && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentTab === 'history' ? 'bg-emerald-900 text-white' : 'bg-amber-400 text-emerald-950'
                }`}>
                  {orderCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('schema')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'schema'
                  ? 'bg-amber-400 text-emerald-950 shadow-md font-bold'
                  : 'bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Skema Database (JSON)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
