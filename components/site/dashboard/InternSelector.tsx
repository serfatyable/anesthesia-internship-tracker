'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Intern {
  id: string;
  name: string | null;
  email: string;
}

interface InternSelectorProps {
  interns: Intern[];
  selectedInternId?: string | undefined;
  className?: string;
}

export const InternSelector = memo(function InternSelector({
  interns,
  selectedInternId,
  className = '',
}: InternSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const selectedIntern = useMemo(
    () => interns.find(intern => intern.id === selectedInternId),
    [interns, selectedInternId]
  );

  const handleInternChange = useCallback(
    (internId: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('internId', internId);
      router.push(`/dashboard?${params.toString()}`);
      setIsOpen(false);
    },
    [router, searchParams]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-intern-selector]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (interns.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No interns available
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} data-intern-selector>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full sm:w-auto min-w-[200px] flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        aria-label='Select intern'
      >
        <span className='truncate'>
          {selectedIntern
            ? selectedIntern.name || selectedIntern.email
            : 'Select an intern...'}
        </span>
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'>
          <ul role='listbox' className='py-1'>
            {interns.map(intern => (
              <li
                key={intern.id}
                role='option'
                aria-selected={intern.id === selectedInternId}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                  intern.id === selectedInternId
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-900'
                }`}
                onClick={() => handleInternChange(intern.id)}
              >
                <div className='font-medium'>{intern.name || 'Unknown'}</div>
                <div className='text-xs text-gray-500'>{intern.email}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
