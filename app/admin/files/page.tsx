'use client';
import FileExplorer from '@/components/FileExplorer';
import BackButton from '@/components/ui/BackButton';

export default function AdminFilesPage() {
  return (
    <main className='max-w-3xl mx-auto p-8'>
      <BackButton className='mb-6' />
      <h1 className='text-2xl font-bold mb-6'>File Management</h1>
      <FileExplorer />
    </main>
  );
}
