'use client';

import { useState } from 'react';

interface TabsMatchsProps {
  activeTab: 'upcoming' | 'played' | 'finished';
  onTabChange: (tab: 'upcoming' | 'played' | 'finished') => void;
}

export function TabsMatchs({ activeTab, onTabChange }: TabsMatchsProps) {
  return (
    <div className="flex items-center gap-2 bg-[#1C2128] rounded-2xl p-1 border border-[#30363D]">
      <button
        onClick={() => onTabChange('upcoming')}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ease-in-out ${
          activeTab === 'upcoming'
            ? 'bg-gradient-to-r from-[#C1322B] to-[#A02822] text-white shadow-lg glow-red'
            : 'text-white/60 hover:text-white hover:bg-[#30363D]/30'
        }`}
      >
        À venir
      </button>

      <button
        onClick={() => onTabChange('played')}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ease-in-out ${
          activeTab === 'played'
            ? 'bg-gradient-to-r from-[#C1322B] to-[#A02822] text-white shadow-lg glow-red'
            : 'text-white/60 hover:text-white hover:bg-[#30363D]/30'
        }`}
      >
        Joués
      </button>

      <button
        onClick={() => onTabChange('finished')}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ease-in-out ${
          activeTab === 'finished'
            ? 'bg-gradient-to-r from-[#C1322B] to-[#A02822] text-white shadow-lg glow-red'
            : 'text-white/60 hover:text-white hover:bg-[#30363D]/30'
        }`}
      >
        Résultats
      </button>
    </div>
  );
}
