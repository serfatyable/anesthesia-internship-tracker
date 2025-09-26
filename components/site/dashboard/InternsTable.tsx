import { InternSummary } from '@/lib/domain/progress';
import { cn } from '@/lib/ui/cn';
import Link from 'next/link';

interface InternsTableProps {
  interns: InternSummary[];
  className?: string;
}

export function InternsTable({ interns, className }: InternsTableProps) {
  if (interns.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-zinc-200/60 p-6', className)}>
        <h3 className="text-lg font-semibold mb-4">Interns</h3>
        <p className="text-zinc-500 text-sm">No interns found</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-zinc-200/60 p-6', className)}>
      <h3 className="text-lg font-semibold mb-4">Interns</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 ">
              <th className="text-left py-3 px-2 font-medium text-zinc-900 ">Name</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-900 ">Email</th>
              <th className="text-center py-3 px-2 font-medium text-zinc-900 ">Verified</th>
              <th className="text-center py-3 px-2 font-medium text-zinc-900 ">Pending</th>
              <th className="text-center py-3 px-2 font-medium text-zinc-900 ">Progress</th>
              <th className="text-center py-3 px-2 font-medium text-zinc-900 ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {interns.map((intern) => (
              <tr key={intern.id} className="border-b border-zinc-100  hover:bg-zinc-50 ">
                <td className="py-3 px-2">
                  <div className="font-medium text-zinc-900 ">{intern.name}</div>
                </td>
                <td className="py-3 px-2">
                  <div className="text-sm text-zinc-600 ">{intern.email}</div>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ">
                    {intern.totalVerified}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 ">
                    {intern.totalPending}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-16 bg-zinc-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${intern.completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-zinc-600 ">{intern.completionPercentage}%</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <Link
                    href={`/dashboard?userId=${intern.id}&tab=intern`}
                    className="text-blue-600 hover:text-blue-800  text-sm font-medium"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
