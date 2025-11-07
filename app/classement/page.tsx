'use client';

import { Trophy } from 'lucide-react';
import { LeaderboardList } from '@/components/leaderboard-list';

export default function ClassementPage() {
  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
          <Trophy className="w-8 h-8 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Classement</h1>
          <p className="text-sm text-white/50">Top joueurs par diamants</p>
        </div>
      </div>

      <LeaderboardList />

      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#C1322B]/10 to-purple-500/10 border border-[#C1322B]/20">
        <div className="flex items-start gap-3">
          <Trophy className="w-5 h-5 text-[#C1322B] mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-semibold mb-1">Comment gagner des diamants?</p>
            <p className="text-sm text-white/70">
              Gagnez des paris pour accumuler des diamants et grimper dans le classement!
              Plus votre cote est élevée, plus vous gagnez de diamants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
