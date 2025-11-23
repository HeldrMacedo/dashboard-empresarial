import React from 'react';
import { formatCurrency } from '../utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
  subValue?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, colorClass, subValue }) => {
  // Extract just the color part (e.g., 'blue-600' from 'bg-blue-600') to use for text/border logic if needed,
  // but sticking to the passed class for simplicity of the prompt background.
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden">
      {/* Decorative top border line */}
      <div className={`absolute top-0 left-0 w-full h-1 ${colorClass}`}></div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800 tracking-tight">{formatCurrency(value)}</div>
        {subValue && <div className="text-xs text-slate-400 mt-1">{subValue}</div>}
      </div>
    </div>
  );
};