import { PendingVerification } from '@/lib/domain/progress';
import { formatDateForDisplay } from '@/lib/domain/progress';
import { cn } from '@/lib/ui/cn';

interface PendingVerificationsProps {
  verifications: PendingVerification[];
  className?: string;
}

export function PendingVerifications({ verifications, className }: PendingVerificationsProps) {
  if (verifications.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-gray-200 p-6 bg-white', className)}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Pending Verifications</h3>
        <p className="text-gray-500 text-sm">No pending verifications</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-gray-200 p-6 bg-white', className)}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Pending Verifications</h3>
      <div className="space-y-3">
        {verifications.map((verification) => (
          <div
            key={verification.id}
            className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{verification.procedureName}</span>
                <span className="text-sm text-gray-500">
                  ({verification.count} {verification.count === 1 ? 'procedure' : 'procedures'})
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatDateForDisplay(verification.date)}
              </div>
              {verification.notes && (
                <div className="text-sm text-gray-500 mt-1 truncate">{verification.notes}</div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Pending
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
