import React, { useState } from 'react';

export default function ConnectionForm({ apiKey, entity, project, onSave }) {
  const [values, setValues] = useState({ apiKey: apiKey || '', entity: entity || '', project: project || '' });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const testConnection = async () => {
    setBusy(true);
    setStatus('');
    try {
      const res = await fetch(`https://api.wandb.ai/api/v1/projects/${encodeURIComponent(values.entity)}/${encodeURIComponent(values.project)}/runs?per_page=1`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${values.apiKey}` },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setStatus('Connected');
    } catch (e) {
      setStatus('Failed');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    onSave(values);
  };

  return (
    <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <h2 className="text-base font-semibold mb-2">Connect to Weights & Biases</h2>
      <p className="text-sm text-neutral-400 mb-4">Enter your API key and project details. These are stored locally in your browser.</p>
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm">
          <span className="text-neutral-300">API Key</span>
          <input
            type="password"
            name="apiKey"
            value={values.apiKey}
            onChange={handleChange}
            placeholder="wandb_api_key"
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            autoComplete="off"
          />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="text-neutral-300">Entity</span>
            <input
              type="text"
              name="entity"
              value={values.entity}
              onChange={handleChange}
              placeholder="your-team-or-username"
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </label>
          <label className="text-sm">
            <span className="text-neutral-300">Project</span>
            <input
              type="text"
              name="project"
              value={values.project}
              onChange={handleChange}
              placeholder="project-name"
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </label>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={testConnection}
          disabled={busy || !values.apiKey || !values.entity || !values.project}
          className="rounded-md bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 px-3 py-2 text-sm"
        >
          {busy ? 'Testing…' : 'Test Connection'}
        </button>
        <button
          onClick={save}
          disabled={!values.apiKey || !values.entity || !values.project}
          className="rounded-md bg-amber-500 hover:bg-amber-400 text-neutral-900 font-medium px-3 py-2 text-sm"
        >
          Save & Continue
        </button>
        {status && (
          <span className={`text-sm ${status === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}`}>{status}</span>
        )}
      </div>
    </div>
  );
}
