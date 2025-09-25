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
      <div
        className={cn('rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6', className)}
      >
        <h3 className="text-lg font-semibold mb-4">Pending Verifications</h3>
        <p className="text-zinc-500 text-sm">No pending verifications</p>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6', className)}
    >
      <h3 className="text-lg font-semibold mb-4">Pending Verifications</h3>
      <div className="space-y-3">
        {verifications.map((verification) => (
          <div
            key={verification.id}
            className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {verification.procedureName}
                </span>
                <span className="text-sm text-zinc-500">
                  ({verification.count} {verification.count === 1 ? 'procedure' : 'procedures'})
                </span>
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {formatDateForDisplay(verification.date)}
              </div>
              {verification.notes && (
                <div className="text-sm text-zinc-500 mt-1 truncate">{verification.notes}</div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Pending
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
