'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import BackButton from '@/components/ui/BackButton';

const BarChart = dynamic(() => import('./BarChart'), {
  loading: () => (
    <div className='h-20 flex items-center justify-center'>
      Loading chart...
    </div>
  ),
  ssr: false,
});

const rotations = ['Cardiology', 'Surgery', 'Anesthesiology'];
const PAGE_SIZE = 2;

function mockFetchTutors(page: number, limit: number) {
  const all = [
    { id: 't1', name: 'Dr. Alice Smith', interns: 3, feedbackGiven: 12 },
    { id: 't2', name: 'Dr. Bob Lee', interns: 2, feedbackGiven: 7 },
    { id: 't3', name: 'Dr. Carol Kim', interns: 1, feedbackGiven: 3 },
  ];
  const start = (page - 1) * limit;
  return new Promise<{ tutors: typeof all; total: number }>(resolve => {
    setTimeout(
      () =>
        resolve({ tutors: all.slice(start, start + limit), total: all.length }),
      500
    );
  });
}

export default function AnalyticsDashboard() {
  const [tab, setTab] = useState<'progress' | 'tutors'>('progress');
  const [interns, setInterns] = useState<
    Array<{ id: string; name: string; progress: Record<string, number> }>
  >([]);
  const [tutors, setTutors] = useState<
    Array<{ id: string; name: string; interns: number; feedbackGiven: number }>
  >([]);
  const [internPage, setInternPage] = useState(1);
  const [tutorPage, setTutorPage] = useState(1);
  const [internTotal, setInternTotal] = useState(0);
  const [tutorTotal, setTutorTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'progress') {
      setLoading(true);
      fetch(`/api/analytics/interns?page=${internPage}&limit=${PAGE_SIZE}`)
        .then(res => res.json())
        .then(res => {
          setInterns(res.interns);
          setInternTotal(res.total);
          setLoading(false);
        });
    } else {
      setLoading(true);
      mockFetchTutors(tutorPage, PAGE_SIZE).then(res => {
        setTutors(res.tutors);
        setTutorTotal(res.total);
        setLoading(false);
      });
    }
  }, [tab, internPage, tutorPage]);

  // At-risk interns (any progress < 50%)
  const atRisk = interns.filter(i =>
    rotations.some(r => (i.progress[r] || 0) < 50)
  );

  return (
    <main className='p-6'>
      <BackButton className='mb-6' />
      <h1 className='text-2xl font-bold mb-6'>Analytics Dashboard</h1>
      <div className='mb-6 flex gap-2'>
        <button
          onClick={() => setTab('progress')}
          className={`px-3 py-1 rounded ${tab === 'progress' ? 'bg-blue-600 text-white' : 'bg-zinc-200'}`}
        >
          Intern Progress
        </button>
        <button
          onClick={() => setTab('tutors')}
          className={`px-3 py-1 rounded ${tab === 'tutors' ? 'bg-blue-600 text-white' : 'bg-zinc-200'}`}
        >
          Tutor Activity
        </button>
      </div>
      {tab === 'progress' && (
        <section>
          <div className='mb-4 flex justify-end items-center gap-2'>
            <button
              onClick={() => setInternPage(p => Math.max(1, p - 1))}
              disabled={internPage === 1}
              className='px-2 py-1 rounded bg-zinc-200 disabled:opacity-50'
            >
              Prev
            </button>
            <span className='text-sm'>
              Page {internPage} of {Math.ceil(internTotal / PAGE_SIZE)}
            </span>
            <button
              onClick={() => setInternPage(p => p + 1)}
              disabled={internPage * PAGE_SIZE >= internTotal}
              className='px-2 py-1 rounded bg-zinc-200 disabled:opacity-50'
            >
              Next
            </button>
          </div>
          {loading ? (
            <div className='h-32 flex items-center justify-center'>
              Loading...
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <div className='bg-white border rounded-lg p-4'>
                  <div className='text-sm text-zinc-500 mb-1'>
                    Total Interns
                  </div>
                  <div className='text-2xl font-bold'>{internTotal}</div>
                </div>
                <div className='bg-white border rounded-lg p-4'>
                  <div className='text-sm text-zinc-500 mb-1'>
                    Fully Completed
                  </div>
                  <div className='text-2xl font-bold'>
                    {
                      interns.filter(i =>
                        rotations.every(r => (i.progress[r] || 0) === 100)
                      ).length
                    }
                  </div>
                </div>
                <div className='bg-white border rounded-lg p-4'>
                  <div className='text-sm text-zinc-500 mb-1'>
                    At-Risk Interns
                  </div>
                  <div className='text-2xl font-bold text-red-600'>
                    {atRisk.length}
                  </div>
                </div>
              </div>
              <div className='bg-white border rounded-lg p-4 mb-8'>
                <div className='font-semibold mb-2'>Progress by Rotation</div>
                <div className='flex gap-6'>
                  {rotations.map(rot => (
                    <div key={rot} className='flex-1'>
                      <div className='text-sm font-bold mb-1'>{rot}</div>
                      <BarChart
                        data={interns.map(i => i.progress[rot] || 0)}
                        labels={interns.map(i => i.name)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className='bg-white border rounded-lg p-4'>
                <div className='font-semibold mb-2'>At-Risk Interns</div>
                {atRisk.length === 0 ? (
                  <div className='text-zinc-400'>No at-risk interns.</div>
                ) : (
                  <ul className='list-disc ml-6'>
                    {atRisk.map(i => (
                      <li key={i.id}>{i.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      )}
      {tab === 'tutors' && (
        <section>
          <div className='mb-4 flex justify-end items-center gap-2'>
            <button
              onClick={() => setTutorPage(p => Math.max(1, p - 1))}
              disabled={tutorPage === 1}
              className='px-2 py-1 rounded bg-zinc-200 disabled:opacity-50'
            >
              Prev
            </button>
            <span className='text-sm'>
              Page {tutorPage} of {Math.ceil(tutorTotal / PAGE_SIZE)}
            </span>
            <button
              onClick={() => setTutorPage(p => p + 1)}
              disabled={tutorPage * PAGE_SIZE >= tutorTotal}
              className='px-2 py-1 rounded bg-zinc-200 disabled:opacity-50'
            >
              Next
            </button>
          </div>
          {loading ? (
            <div className='h-32 flex items-center justify-center'>
              Loading...
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-white border rounded-lg p-4'>
                  <div className='text-sm text-zinc-500 mb-1'>Total Tutors</div>
                  <div className='text-2xl font-bold'>{tutorTotal}</div>
                </div>
                <div className='bg-white border rounded-lg p-4'>
                  <div className='text-sm text-zinc-500 mb-1'>
                    Total Intern Assignments
                  </div>
                  <div className='text-2xl font-bold'>
                    {tutors.reduce((sum, t) => sum + t.interns, 0)}
                  </div>
                </div>
              </div>
              <div className='bg-white border rounded-lg p-4 mb-8'>
                <div className='font-semibold mb-2'>Interns per Tutor</div>
                <BarChart
                  data={tutors.map(t => t.interns)}
                  labels={tutors.map(t => t.name)}
                />
              </div>
              <div className='bg-white border rounded-lg p-4'>
                <div className='font-semibold mb-2'>
                  Feedback Given per Tutor
                </div>
                <BarChart
                  data={tutors.map(t => t.feedbackGiven)}
                  labels={tutors.map(t => t.name)}
                />
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
