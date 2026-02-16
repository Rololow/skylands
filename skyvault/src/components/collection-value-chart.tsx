"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ChartDataPoint = {
  date: string;
  value: number;
};

type CollectionValueChartProps = {
  data: ChartDataPoint[];
};

export default function CollectionValueChart({ data }: CollectionValueChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-md border border-zinc-800 p-6">
        <h2 className="mb-2 text-lg font-semibold">Évolution de la valeur</h2>
        <p className="text-sm text-zinc-600">Pas encore de données historiques disponibles.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-zinc-800 p-4">
      <h2 className="mb-4 text-lg font-semibold">Évolution de la valeur de ta collection</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            dataKey="date" 
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
          />
          <YAxis 
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#18181b', 
              border: '1px solid #3f3f46',
              borderRadius: '0.375rem',
              color: '#fafafa'
            }}
            formatter={(value: number | undefined) => {
              if (value === undefined) return ['0€', 'Valeur'];
              return [`${value.toFixed(2)}€`, 'Valeur'];
            }}
            labelStyle={{ color: '#a1a1aa' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
