import React, { useEffect, useMemo, useState } from 'react';
import Sparkline from './Sparkline';

const WANDb_BASE = 'https://api.wandb.ai';

export default function RunDetails({ apiKey, entity, project, run }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasRun = !!run?.id;
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }), [apiKey]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!hasRun) return;
      setLoading(true);
      setError('');
      try {
        const keys = encodeURIComponent('train/loss,train/accuracy,eval/loss,eval/accuracy,_step');
        const url = `${WANDb_BASE}/api/v1/runs/${encodeURIComponent(entity)}/${encodeURIComponent(project)}/${encodeURIComponent(run.id)}/history?keys=${keys}&per_page=1000`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [run?.id, entity, project, headers, hasRun]);

  const steps = history.map((d) => d._step ?? d.step).filter((x) => typeof x === 'number');
  const trainLoss = history.map((d) => d['train/loss']).filter((x) => typeof x === 'number');
  const evalLoss = history.map((d) => d['eval/loss']).filter((x) => typeof x === 'number');
  const trainAcc = history.map((d) => d['train/accuracy']).filter((x) => typeof x === 'number');
  const evalAcc = history.map((d) => d['eval/accuracy']).filter((x) => typeof x === 'number');

  if (!hasRun) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 min-h-[220px] flex items-center justify-center text-neutral-400 text-sm">
        Select a run to view details
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800">
        <h2 className="text-base font-semibold">{run.name}</h2>
        <p className="text-xs text-neutral-400">Run ID: {run.id}</p>
      </div>
      <div className="p-4 space-y-4">
        {loading && <div className="text-sm text-neutral-400">Loading history…</div>}
        {error && <div className="text-sm text-rose-300">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(run.summary || {}).slice(0, 6).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-neutral-800/70 p-3">
              <div className="text-[11px] uppercase tracking-wide text-neutral-400">{k}</div>
              <div className="text-sm font-medium truncate">{typeof v === 'number' ? Number(v).toFixed(5) : String(v)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ChartCard title="Train Loss" series={trainLoss} color="#f59e0b" />
          <ChartCard title="Eval Loss" series={evalLoss} color="#22c55e" />
          <ChartCard title="Train Accuracy" series={trainAcc} color="#60a5fa" />
          <ChartCard title="Eval Accuracy" series={evalAcc} color="#f472b6" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, series, color }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-neutral-300 font-medium">{title}</div>
        {series && series.length > 0 && (
          <div className="text-[10px] text-neutral-400">Last: {Number(series[series.length - 1]).toFixed(5)}</div>
        )}
      </div>
      {series && series.length > 1 ? (
        <div className="h-24">
          <Sparkline data={series} stroke={color} />
        </div>
      ) : (
        <div className="h-24 flex items-center justify-center text-xs text-neutral-500">No data</div>
      )}
    </div>
  );
}
