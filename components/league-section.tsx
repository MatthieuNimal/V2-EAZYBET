'use client';

import { LeagueGroup } from '@/lib/mock-data';
import { MatchCard } from './match-card';

interface LeagueSectionProps {
  leagueGroup: LeagueGroup;
}

export function LeagueSection({ leagueGroup }: LeagueSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4 px-4">{leagueGroup.league}</h2>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0D1117] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0D1117] to-transparent z-10 pointer-events-none" />

        <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4">
          <div className="flex gap-4 pb-2">
            {leagueGroup.matches.map((match) => (
              <div key={match.id} className="flex-shrink-0 w-[300px] snap-center">
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
