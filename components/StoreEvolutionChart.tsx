import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DailySalesData } from '../types';
import { formatCurrency, formatDateBR } from '../utils';

interface Props {
  data: DailySalesData[];
}

export const StoreEvolutionChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorLiquido" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorNotas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="data" 
            tickFormatter={formatDateBR} 
            stroke="#64748b"
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            tickFormatter={(val) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(val)} 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), '']}
            labelFormatter={(label) => formatDateBR(label)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Area 
            type="monotone" 
            dataKey="total_notas" 
            name="Total Notas" 
            stroke="#94a3b8" 
            fillOpacity={1} 
            fill="url(#colorNotas)" 
          />
          <Area 
            type="monotone" 
            dataKey="total_liquido" 
            name="Total Líquido" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorLiquido)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
