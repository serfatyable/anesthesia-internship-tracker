'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateLogInput } from '@/lib/validators/logs';
import { CreateLogSchema } from '@/lib/validators/logs';
import BackButton from '@/components/ui/BackButton';

type ProcedureOption = { id: string; name: string };

export default function NewLogPage() {
  const router = useRouter();
  const [procedures, setProcedures] = useState<ProcedureOption[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(CreateLogSchema),
    defaultValues: {
      date: new Date().toISOString(),
      count: 1,
      notes: '',
    },
  });

  useEffect(() => {
    fetch('/api/procedures')
      .then((r) => r.json())
      .then((d) => setProcedures(d.procedures || []))
      .catch(() => setProcedures([]));
  }, []);

  const onSubmit: SubmitHandler<CreateLogInput> = async (values) => {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      reset();
      router.push('/logs');
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j?.error ? JSON.stringify(j.error) : 'Failed to create log');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <BackButton className="mb-4" />
      <h1 className="text-2xl font-semibold mb-4">New Procedure Log</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="procedureId" className="block text-sm font-medium text-gray-700 mb-1">
            Procedure *
          </label>
          <select
            id="procedureId"
            {...register('procedureId')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            aria-describedby={errors.procedureId ? 'procedureId-error' : undefined}
          >
            <option value="">Select a procedure…</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.procedureId && (
            <p id="procedureId-error" className="text-red-600 text-sm mt-1" role="alert">
              {errors.procedureId.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date/Time (local) *
          </label>
          <input
            id="date"
            type="datetime-local"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            {...register('date')}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
          {errors.date && (
            <p id="date-error" className="text-red-600 text-sm mt-1" role="alert">
              {errors.date.message as string}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
            Count *
          </label>
          <input
            id="count"
            type="number"
            min={1}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            {...register('count', { valueAsNumber: true })}
            aria-describedby={errors.count ? 'count-error' : undefined}
          />
          {errors.count && (
            <p id="count-error" className="text-red-600 text-sm mt-1" role="alert">
              {errors.count.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            {...register('notes')}
            aria-describedby={errors.notes ? 'notes-error' : undefined}
          />
          {errors.notes && (
            <p id="notes-error" className="text-red-600 text-sm mt-1" role="alert">
              {errors.notes.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-describedby={isSubmitting ? 'saving-status' : undefined}
        >
          {isSubmitting ? 'Saving…' : 'Save Log Entry'}
        </button>
        {isSubmitting && (
          <p id="saving-status" className="text-sm text-gray-600 text-center" role="status">
            Saving your procedure log...
          </p>
        )}
      </form>
    </div>
  );
}
