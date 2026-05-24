import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number | string;
  change: string;
  changeType: 'up' | 'down';
  icon: LucideIcon;
  color: string;
}

export default function StatsCard({
  label,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="flex items-center gap-1">
        {changeType === 'up' ? (
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600" />
        )}
        <span
          className={`text-sm font-semibold ${
            changeType === 'up' ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {change}
        </span>
        <span className="text-gray-600 text-sm">from yesterday</span>
      </div>
    </div>
  );
}
