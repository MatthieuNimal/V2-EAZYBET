'use client';

import { BetType } from '@/lib/store';
import { Match } from '@/lib/mock-data';
import { Coins, Diamond } from 'lucide-react';

export type BetTicketStatus = 'pending' | 'won' | 'lost';

export interface BetTicketSelection {
  match: Match;
  betType: BetType;
  odds: number;
}

export interface BetTicketProps {
  id: string;
  type: 'simple' | 'combo';
  selections: BetTicketSelection[];
  totalOdds: number;
  stake: number;
  currency: 'coins' | 'diamonds';
  potentialWin: number;
  potentialDiamonds: number;
  status: BetTicketStatus;
  placedAt: number;
}

export function BetTicket({
  type,
  selections = [],
  totalOdds,
  stake,
  currency,
  potentialWin,
  potentialDiamonds,
  status,
  placedAt,
}: BetTicketProps) {
  if (!selections || selections.length === 0) {
    return null;
  }

  const getBetTypeLabel = (selection: BetTicketSelection) => {
    switch (selection.betType) {
      case 'home':
        return `${selection.match.homeTeam} gagne`;
      case 'draw':
        return 'Match nul';
      case 'away':
        return `${selection.match.awayTeam} gagne`;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="bg-[#F5C144] text-black px-3 py-1 rounded-full text-xs font-bold">
            En cours
          </div>
        );
      case 'won':
        return (
          <div className="bg-[#4ADE80] text-white px-3 py-1 rounded-full text-xs font-bold">
            Gagné
          </div>
        );
      case 'lost':
        return (
          <div className="bg-[#EF4444] text-white px-3 py-1 rounded-full text-xs font-bold">
            Perdu
          </div>
        );
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`bg-[#1A1F27] rounded-2xl p-4 shadow-2xl border border-[#30363D] animate-fade-up ${
      type === 'combo' ? 'ring-1 ring-[#C1322B]/50' : ''
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎟️</span>
          <div>
            <h3 className="text-white font-bold text-base">
              {type === 'combo' ? `Pari combiné (${selections.length} sélections)` : 'Pari simple'}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">{formatDate(placedAt)}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 mb-4">
        {selections.map((selection, index) => (
          <div key={`${selection.match.id}-${index}`}>
            <div className="bg-[#0D1117] rounded-xl p-3 border border-[#21262D]">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'won' ? 'bg-[#4ADE80]' :
                    status === 'lost' ? 'bg-[#EF4444]' :
                    'bg-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-xs mb-1">{selection.match.league}</p>
                  <p className="text-white font-semibold text-sm mb-2">
                    {selection.match.homeTeam} vs {selection.match.awayTeam}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[#F5C144] text-xs font-medium">{getBetTypeLabel(selection)}</p>
                    <p className="text-[#F5C144] font-bold text-base">@{selection.odds.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            {index < selections.length - 1 && (
              <div className="border-t border-[#30363D]/50 my-2" />
            )}
          </div>
        ))}
      </div>

      {type === 'combo' && (
        <div className="bg-gradient-to-r from-[#C1322B]/20 to-[#C1322B]/10 border border-[#C1322B]/40 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between">
            <p className="text-white text-sm font-bold">Cote combinée</p>
            <p className="text-[#C1322B] font-bold text-2xl">{totalOdds.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="bg-[#0D1117]/50 rounded-xl p-3 space-y-2.5 mb-3">
        <div className="flex items-center justify-between py-1">
          <p className="text-gray-400 text-sm font-medium">Mise</p>
          <div className="flex items-center gap-1.5">
            {currency === 'coins' ? (
              <Coins size={18} className="text-[#F5C144]" />
            ) : (
              <Diamond size={18} className="text-[#2A84FF]" />
            )}
            <p className="text-white font-bold text-base">{stake.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-1">
          <p className="text-gray-400 text-sm font-medium">Cote totale</p>
          <p className="text-white font-bold text-base">{totalOdds.toFixed(2)}</p>
        </div>

        <div className="border-t border-[#30363D]/50 pt-2.5">
          <div className="flex items-center justify-between py-1">
            <p className="text-gray-400 text-sm font-medium">
              {status === 'pending' && 'Profit potentiel'}
              {status === 'won' && 'Profit gagné'}
              {status === 'lost' && 'Profit (perdu)'}
            </p>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                {currency === 'coins' ? (
                  <Coins size={18} className="text-[#F5C144]" />
                ) : (
                  <Diamond size={18} className="text-[#2A84FF]" />
                )}
                <p className={`font-bold text-base ${
                  status === 'won' ? 'text-[#4ADE80]' :
                  status === 'lost' ? 'text-gray-400 line-through' :
                  currency === 'coins' ? 'text-[#F5C144]' : 'text-[#2A84FF]'
                }`}>
                  {(potentialWin - stake).toFixed(2)}
                </p>
              </div>
              {potentialDiamonds > 0 && currency === 'coins' && (
                <div className="flex items-center gap-1.5 justify-end mt-1">
                  <Diamond size={16} className="text-[#2A84FF]" />
                  <p className={`text-sm ${
                    status === 'won' ? 'text-[#4ADE80]' :
                    status === 'lost' ? 'text-gray-400 line-through' :
                    'text-[#2A84FF]'
                  }`}>
                    {potentialDiamonds.toFixed(3)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between py-1 mt-2 bg-[#1A1F27]/50 rounded-lg px-2">
            <p className="text-gray-400 text-sm font-medium">
              {status === 'pending' && 'Gains potentiels'}
              {status === 'won' && 'Gains totaux'}
              {status === 'lost' && 'Gains (perdu)'}
            </p>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                {currency === 'coins' ? (
                  <Coins size={18} className="text-[#F5C144]" />
                ) : (
                  <Diamond size={18} className="text-[#2A84FF]" />
                )}
                <p className={`font-bold text-lg ${
                  status === 'won' ? 'text-[#4ADE80]' :
                  status === 'lost' ? 'text-gray-400 line-through' :
                  currency === 'coins' ? 'text-[#F5C144]' : 'text-[#2A84FF]'
                }`}>
                  {potentialWin.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {status === 'pending' && (
        <div className="bg-[#F5C144]/10 border border-[#F5C144]/40 rounded-xl p-3">
          <p className="text-[#F5C144] text-sm text-center font-medium">
            ⏳ En attente du résultat
          </p>
        </div>
      )}

      {status === 'won' && (
        <div className="bg-[#4ADE80]/10 border border-[#4ADE80]/40 rounded-xl p-3">
          <div className="text-center">
            <p className="text-[#4ADE80] text-sm font-bold mb-1">
              🎉 Résultat : GAGNÉ
            </p>
            <p className="text-gray-400 text-xs">
              Vous avez gagné {potentialWin.toFixed(2)} {currency === 'coins' ? 'jetons' : 'diamants'} !
            </p>
          </div>
        </div>
      )}

      {status === 'lost' && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl p-3">
          <div className="text-center">
            <p className="text-[#EF4444] text-sm font-bold mb-1">
              ❌ Résultat : PERDU
            </p>
            <p className="text-gray-400 text-xs">
              Meilleure chance la prochaine fois !
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
