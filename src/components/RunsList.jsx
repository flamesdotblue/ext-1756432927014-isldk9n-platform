import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

function StatusPill({ state }) {
  const map = {
    finished: { color: 'bg-emerald-500/15 text-emerald-300', icon: <CheckCircle2 size={14} /> },
    running: { color: 'bg-amber-500/15 text-amber-300', icon: <Clock size={14} /> },
    crashed: { color: 'bg-rose-500/15 text-rose-300', icon: <XCircle size={14} /> },
  };
  const k = (state || '').toLowerCase();
  const style = map[k] || { color: 'bg-neutral-700 text-neutral-300', icon: <Clock size={14} /> };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${style.color}`}>
      {style.icon}
      {state || 'unknown'}
    </span>
  );
}

export default function RunsList({ runs, loading, error, onSelect, selectedId }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent Runs</h2>
        {loading && <span className="text-xs text-neutral-400">Refreshing…</span>}
      </div>
      {error && (
        <div className="p-4 text-sm text-rose-300">{error}</div>
      )}
      <ul className="divide-y divide-neutral-800">
        {runs.length === 0 && !loading ? (
          <li className="p-4 text-sm text-neutral-400">No runs found.</li>
        ) : (
          runs.map((run) => (
            <li key={run.id}>
              <button
                onClick={() => onSelect(run)}
                className={`w-full text-left px-4 py-3 hover:bg-neutral-800/70 focus:bg-neutral-800/70 ${selectedId === run.id ? 'bg-neutral-800/70' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium truncate max-w-[220px] sm:max-w-[320px]">{run.name}</h3>
                      <StatusPill state={run.state} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                      {run.summary && Object.entries(run.summary).slice(0, 3).map(([k, v]) => (
                        <span key={k} className="rounded bg-neutral-800 px-2 py-0.5">
                          {k}: {typeof v === 'number' ? Number(v).toFixed(4) : String(v)}
                        </span>
                      ))}
                      <span className="ml-auto">
                        {run.updatedAt ? new Date(run.updatedAt).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
