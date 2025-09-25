'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateLogInput } from '@/lib/validators/logs';
import { CreateLogSchema } from '@/lib/validators/logs';

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
      <h1 className="text-2xl font-semibold mb-4">New Procedure Log</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Procedure</label>
          <select {...register('procedureId')} className="w-full border rounded px-3 py-2">
            <option value="">Select…</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.procedureId && (
            <p className="text-red-600 text-sm">{errors.procedureId.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Date/Time (local)</label>
          <input
            type="datetime-local"
            className="w-full border rounded px-3 py-2"
            {...register('date')}
          />
          {errors.date && <p className="text-red-600 text-sm">{errors.date.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Count</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded px-3 py-2"
            {...register('count', { valueAsNumber: true })}
          />
          {errors.count && <p className="text-red-600 text-sm">{errors.count.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Notes</label>
          <textarea rows={3} className="w-full border rounded px-3 py-2" {...register('notes')} />
          {errors.notes && <p className="text-red-600 text-sm">{errors.notes.message}</p>}
        </div>
        <button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded">
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
