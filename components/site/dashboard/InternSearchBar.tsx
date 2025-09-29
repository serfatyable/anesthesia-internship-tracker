'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';

interface Intern {
  id: string;
  name: string | null;
  email: string;
}

interface InternSearchBarProps {
  interns: Intern[];
  className?: string;
}

export const InternSearchBar = memo(function InternSearchBar({
  interns,
  className = '',
}: InternSearchBarProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  // Track selection implicitly via searchTerm/router; no need to store selected intern

  // Filter interns based on search term
  const filteredInterns = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    return interns.filter(
      intern =>
        intern.name?.toLowerCase().includes(term) ||
        intern.email.toLowerCase().includes(term)
    );
  }, [interns, searchTerm]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      setIsOpen(value.length > 0);
    },
    []
  );

  const handleInternSelect = useCallback(
    (intern: Intern) => {
      setSearchTerm(intern.name || intern.email);
      setIsOpen(false);
      // Navigate to the individual intern page
      console.log('Navigating to intern page:', `/intern/${intern.id}`);
      router.push(`/intern/${intern.id}`);
    },
    [router]
  );

  const handleInputFocus = useCallback(() => {
    if (searchTerm.length > 0) {
      setIsOpen(true);
    }
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-intern-search]')) {
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
    <div className={`relative ${className}`} data-intern-search>
      <div className='relative'>
        <input
          type='text'
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          placeholder='Search for an intern by name or email...'
          className='w-full px-4 py-3 pl-10 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
        />
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <svg
            className='h-5 w-5 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
      </div>

      {isOpen && filteredInterns.length > 0 && (
        <div className='absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto'>
          <ul role='listbox' className='py-1'>
            {filteredInterns.map(intern => (
              <li
                key={intern.id}
                role='option'
                aria-selected='false'
                className='px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 text-gray-900 border-b border-gray-100 last:border-b-0'
                onClick={() => handleInternSelect(intern)}
              >
                <div className='font-medium'>{intern.name || 'Unknown'}</div>
                <div className='text-gray-500 text-xs mt-1'>{intern.email}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && searchTerm.length > 0 && filteredInterns.length === 0 && (
        <div className='absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'>
          <div className='px-4 py-3 text-sm text-gray-500'>
            No interns found matching &quot;{searchTerm}&quot;
          </div>
        </div>
      )}
    </div>
  );
});
