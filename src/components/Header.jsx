import React from 'react';
import { RefreshCw, Play, Pause } from 'lucide-react';

export default function Header({ polling, setPolling, onRefresh, configured }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70 bg-neutral-950/90 border-b border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-pink-500" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">W&B Mobile Monitor</h1>
            <p className="text-xs text-neutral-400">Quickly check fine-tuning and training progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPolling((p) => !p)}
            className="inline-flex items-center gap-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-3 py-1.5 text-sm"
            title={polling ? 'Pause auto-refresh' : 'Resume auto-refresh'}
          >
            {polling ? <Pause size={16} /> : <Play size={16} />}
            <span className="hidden sm:inline">{polling ? 'Auto' : 'Paused'}</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={!configured}
            className="inline-flex items-center gap-2 rounded-md bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:hover:bg-neutral-800 text-neutral-100 px-3 py-1.5 text-sm"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
}
