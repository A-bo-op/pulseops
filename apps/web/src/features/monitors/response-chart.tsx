'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CheckResult } from '@/types';

export function ResponseChart({ results }: { results: CheckResult[] }) {
  const data = [...results].reverse().map((result) => ({
    time: new Date(result.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: result.responseTimeMs,
    success: result.isUp,
  }));

  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid stroke="#1b2b25" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="time" stroke="#8ba39a" tickLine={false} axisLine={false} fontSize={11} /><YAxis stroke="#8ba39a" tickLine={false} axisLine={false} fontSize={11} unit="ms" /><Tooltip contentStyle={{ background: '#0c1713', border: '1px solid #1b2b25', borderRadius: '12px', fontSize: '12px' }} /><Line type="monotone" dataKey="latency" stroke="#61f2a7" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#61f2a7' }} /></LineChart></ResponsiveContainer></div>;
}
