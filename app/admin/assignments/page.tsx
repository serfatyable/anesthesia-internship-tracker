'use client';
import BackButton from '@/components/ui/BackButton';

export default function AdminAssignmentsPage() {
  return (
    <main className='max-w-3xl mx-auto p-8'>
      <BackButton className='mb-6' />
      <h1 className='text-2xl font-bold mb-4'>Assignments</h1>
      <p className='text-gray-600'>
        This is the admin Assignments page. Add assignment management features
        here.
      </p>
    </main>
  );
}
