import React, { useMemo } from 'react';

export default function Sparkline({ data = [], stroke = '#f59e0b', strokeWidth = 2 }) {
  const { path, min, max } = useMemo(() => {
    if (!data || data.length === 0) return { path: '', min: 0, max: 0 };
    const w = 300; // viewBox width
    const h = 80;  // viewBox height
    const n = data.length;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((y, i) => {
      const x = (i / (n - 1)) * (w - 8) + 4; // 4px padding
      const yy = h - ((y - min) / range) * (h - 8) - 4; // 4px padding
      return [x, yy];
    });
    const d = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
    return { path: d, min, max };
  }, [data]);

  return (
    <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="w-full h-full">
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
