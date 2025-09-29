import Link from 'next/link';

const rotations = [
  {
    id: 'icu',
    name: 'ICU',
    description:
      'Intensive Care Unit rotation focusing on critical care procedures and knowledge',
    procedures: 12,
    knowledge: 8,
    completed: 8,
    total: 20,
  },
  {
    id: 'pacu',
    name: 'PACU',
    description: 'Post-Anesthesia Care Unit rotation for recovery management',
    procedures: 10,
    knowledge: 6,
    completed: 5,
    total: 16,
  },
  {
    id: 'or',
    name: 'Operating Room',
    description: 'Main operating room procedures and surgical anesthesia',
    procedures: 15,
    knowledge: 10,
    completed: 12,
    total: 25,
  },
];

export default function RotationsPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Rotations</h1>
          <p className='mt-2 text-gray-600'>
            Select a rotation to view detailed requirements and progress
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {rotations.map(rotation => (
            <Link
              key={rotation.id}
              href={`/rotations/${rotation.id}`}
              className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-semibold text-gray-900'>
                  {rotation.name}
                </h3>
                <div className='text-sm text-gray-500'>
                  {rotation.completed}/{rotation.total}
                </div>
              </div>

              <p className='text-gray-600 mb-4'>{rotation.description}</p>

              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Procedures: {rotation.procedures}</span>
                  <span>Knowledge: {rotation.knowledge}</span>
                </div>

                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-600 h-2 rounded-full'
                    style={{
                      width: `${(rotation.completed / rotation.total) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className='text-xs text-gray-500 text-center'>
                  {Math.round((rotation.completed / rotation.total) * 100)}%
                  Complete
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
