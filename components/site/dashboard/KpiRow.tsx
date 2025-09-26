import { ProgressTotals } from '@/lib/progress';

interface KpiRowProps {
  totals: ProgressTotals;
  className?: string;
}

export function KpiRow({ totals, className = '' }: KpiRowProps) {
  const { required, logged, approved, pending } = totals;

  const kpiItems = [
    {
      label: 'Required',
      value: required,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      label: 'Logged',
      value: logged,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Approved',
      value: approved,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Pending',
      value: pending,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-4 ${className}`}>
      {kpiItems.map((item) => (
        <div key={item.label} className={`rounded-lg p-4 ${item.bgColor} border border-gray-200`}>
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-sm text-gray-600 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
