import { supabase } from './supabase-client';

let syncInterval: NodeJS.Timeout | null = null;
let lastSyncTime: Date | null = null;

export interface SyncStats {
  competitions: number;
  synced: number;
  updated: number;
  skipped: number;
  errors: number;
}

export interface SyncResponse {
  success: boolean;
  message?: string;
  stats?: SyncStats;
  error?: string;
}

async function addDemoMatchesIfNeeded(): Promise<boolean> {
  try {
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('id')
      .limit(1);

    if (existingMatches && existingMatches.length > 0) {
      return false;
    }

    console.log('⚠️ Aucun match trouvé, ajout de matchs de démo...');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.error('No session token for demo matches');
      return false;
    }

    const response = await fetch('/api/matches/add-demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (response.ok) {
      console.log('✅ Matchs de démo ajoutés automatiquement');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error adding demo matches:', error);
    return false;
  }
}

export async function syncMatches(): Promise<SyncResponse> {
  try {
    console.log('🌀 Synchronisation Odds API...');

    const { data: functionData, error: functionError } = await supabase.functions.invoke('sync-matches', {
      method: 'POST',
    });

    if (functionError) {
      console.error('⚠️ Erreur lors de la synchronisation:', functionError);

      const demoAdded = await addDemoMatchesIfNeeded();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('matches-synced', { detail: { demo: demoAdded } }));
      }

      return {
        success: demoAdded,
        error: functionError.message,
        stats: {
          competitions: 0,
          synced: demoAdded ? 5 : 0,
          updated: 0,
          skipped: 0,
          errors: demoAdded ? 0 : 1,
        },
      };
    }

    const response = functionData as SyncResponse;

    if (response.success) {
      lastSyncTime = new Date();
      console.log('✅ Matchs mis à jour', response.stats);

      if (response.stats && (response.stats.synced === 0 && response.stats.updated === 0)) {
        console.log('⚠️ Aucun match trouvé');
        await addDemoMatchesIfNeeded();
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('matches-synced', { detail: response.stats }));
      }
    } else {
      console.error('⚠️ Échec de la synchronisation:', response.error);
    }

    return response;
  } catch (error) {
    console.error('⚠️ Erreur lors de la synchronisation:', error);

    const demoAdded = await addDemoMatchesIfNeeded();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('matches-synced', { detail: { demo: demoAdded } }));
    }

    return {
      success: demoAdded,
      error: error instanceof Error ? error.message : 'Unknown error',
      stats: {
        competitions: 0,
        synced: demoAdded ? 5 : 0,
        updated: 0,
        skipped: 0,
        errors: demoAdded ? 0 : 1,
      },
    };
  }
}

export function startAutoSync(intervalMs: number = 60 * 60 * 1000) {
  if (syncInterval) {
    console.log('Auto-sync already running');
    return;
  }

  console.log(`Starting auto-sync every ${intervalMs / 1000 / 60} minutes`);

  syncMatches();

  syncInterval = setInterval(() => {
    syncMatches();
  }, intervalMs);
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('Auto-sync stopped');
  }
}

export function getLastSyncTime(): Date | null {
  return lastSyncTime;
}

export function isAutoSyncRunning(): boolean {
  return syncInterval !== null;
}
