'use client';

import { HeaderCoins } from '@/components/header-coins';
import { BottomNav } from '@/components/bottom-nav';
import { useUserBetsStore, useMatchStatusStore } from '@/lib/store';
import { User, Settings, Trophy, TrendingUp, Calendar, Award, RotateCcw } from 'lucide-react';

const stats = [
  { icon: Trophy, label: 'Paris gagnés', value: '8', color: 'text-green-400' },
  { icon: TrendingUp, label: 'Taux de réussite', value: '42%', color: 'text-[#2A84FF]' },
  { icon: Calendar, label: 'Jours actifs', value: '23', color: 'text-[#F5C144]' },
  { icon: Award, label: 'Rang', value: '#42', color: 'text-purple-400' },
];

export default function ProfilPage() {
  const betsStore = useUserBetsStore();
  const matchStatusStore = useMatchStatusStore();

  const handleResetAll = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser tous vos paris et l\'historique ? Cette action est irréversible.')) {
      betsStore.clearAllBets();
      matchStatusStore.clearAllStatuses();
      window.location.reload();
    }
  };

  return (
    <>
      <HeaderCoins />
      <div className="min-h-screen pt-20 pb-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-6 mb-6 card-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C1322B] to-[#A02822] flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">Utilisateur</h2>
                <p className="text-white/50">Membre depuis mars 2025</p>
              </div>
              <button className="p-2 hover:bg-[#30363D] rounded-xl transition-colors">
                <Settings className="text-white/50" size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0D1117] rounded-xl p-3 text-center">
                <p className="text-[#F5C144] text-2xl font-bold">1,000</p>
                <p className="text-white/50 text-sm">Jetons</p>
              </div>
              <div className="bg-[#0D1117] rounded-xl p-3 text-center">
                <p className="text-[#2A84FF] text-2xl font-bold">0</p>
                <p className="text-white/50 text-sm">Diamants</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-4">Statistiques</h3>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-4 card-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={20} className={stat.color} />
                    <p className="text-white/50 text-sm">{stat.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          <h3 className="text-xl font-bold text-white mb-4">Réalisations</h3>

          <div className="space-y-3">
            <div className="bg-gradient-to-br from-[#F5C144]/20 to-[#E5B134]/10 border border-[#F5C144]/30 rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F5C144]/20 flex items-center justify-center">
                  <Award className="text-[#F5C144]" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">Premier Pari</h4>
                  <p className="text-white/50 text-sm">Placer votre premier pari</p>
                </div>
                <span className="text-[#F5C144] font-bold">✓</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-4 opacity-50 card-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0D1117] flex items-center justify-center">
                  <Trophy className="text-white/30" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">Série de Victoires</h4>
                  <p className="text-white/50 text-sm">Gagner 5 paris d'affilée</p>
                </div>
                <span className="text-white/30 font-bold">🔒</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-4 opacity-50 card-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0D1117] flex items-center justify-center">
                  <TrendingUp className="text-white/30" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">Expert</h4>
                  <p className="text-white/50 text-sm">Atteindre 100 paris gagnés</p>
                </div>
                <span className="text-white/30 font-bold">🔒</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleResetAll}
              className="w-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg"
            >
              <RotateCcw size={20} />
              Réinitialiser toutes les données
            </button>
            <p className="text-center text-white/40 text-xs mt-2">
              Cela supprimera tous vos paris et l'historique
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
