
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isUp: boolean;
  };
  icon: React.ReactNode;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, color }) => {
  // Extracting tailwind color base for dynamics
  const colorClass = color.split('-')[1]; // e.g., 'emerald' from 'bg-emerald-600'

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-700 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 text-${colorClass}-700 dark:text-${colorClass}-400 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-xl ${trend.isUp ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
};
