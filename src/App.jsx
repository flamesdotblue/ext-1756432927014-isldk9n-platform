import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Header from './components/Header';
import ConnectionForm from './components/ConnectionForm';
import RunsList from './components/RunsList';
import RunDetails from './components/RunDetails';

const WANDb_BASE = 'https://api.wandb.ai';

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('wandbApiKey') || '');
  const [entity, setEntity] = useState(localStorage.getItem('wandbEntity') || '');
  const [project, setProject] = useState(localStorage.getItem('wandbProject') || '');

  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRun, setSelectedRun] = useState(null);
  const [polling, setPolling] = useState(true);

  const isConfigured = useMemo(() => apiKey && entity && project, [apiKey, entity, project]);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }), [apiKey]);

  const fetchRuns = useCallback(async () => {
    if (!isConfigured) return;
    setLoading(true);
    setError('');
    try {
      const url = `${WANDb_BASE}/api/v1/projects/${encodeURIComponent(entity)}/${encodeURIComponent(project)}/runs?per_page=50`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch runs: ${res.status}`);
      }
      const data = await res.json();
      // Normalize and sort by updated time if available
      const normalized = (Array.isArray(data) ? data : []).map((r) => ({
        id: r.id,
        name: r.display_name || r.name || r.id,
        state: r.state,
        createdAt: r.createdAt || r.created_at,
        updatedAt: r.updatedAt || r.updated_at || r.heartbeatAt || r.heartbeat_at,
        user: r.user || r.username,
        summary: r.summary_metrics || r.summary || {},
        tags: r.tags || [],
        notes: r.notes || '',
        config: r.config || {},
      }));
      normalized.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      setRuns(normalized);
      // Ensure selected run is refreshed if still exists
      if (selectedRun) {
        const updated = normalized.find((r) => r.id === selectedRun.id);
        if (updated) setSelectedRun(updated);
      }
    } catch (e) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [entity, project, headers, isConfigured, selectedRun]);

  useEffect(() => {
    if (!isConfigured) return;
    fetchRuns();
  }, [isConfigured, fetchRuns]);

  useEffect(() => {
    if (!isConfigured || !polling) return;
    const id = setInterval(fetchRuns, 15000);
    return () => clearInterval(id);
  }, [isConfigured, polling, fetchRuns]);

  const onSaveConnection = (next) => {
    setApiKey(next.apiKey);
    setEntity(next.entity);
    setProject(next.project);
    localStorage.setItem('wandbApiKey', next.apiKey);
    localStorage.setItem('wandbEntity', next.entity);
    localStorage.setItem('wandbProject', next.project);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Header polling={polling} setPolling={setPolling} onRefresh={fetchRuns} configured={isConfigured} />

      <main className="mx-auto max-w-6xl px-4 pb-24">
        {!isConfigured ? (
          <div className="pt-6">
            <ConnectionForm
              apiKey={apiKey}
              entity={entity}
              project={project}
              onSave={onSaveConnection}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4">
            <section className="md:col-span-1">
              <RunsList
                runs={runs}
                loading={loading}
                error={error}
                onSelect={(run) => setSelectedRun(run)}
                selectedId={selectedRun?.id}
              />
            </section>
            <section className="md:col-span-1">
              <RunDetails
                apiKey={apiKey}
                entity={entity}
                project={project}
                run={selectedRun}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
