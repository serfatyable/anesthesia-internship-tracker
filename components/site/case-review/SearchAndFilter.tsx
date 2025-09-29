'use client';

import { useState } from 'react';
import { CaseCategory } from '@/lib/constants/caseCategories';

interface SearchAndFilterProps {
  search: string;
  setSearch: (search: string) => void;
  category: string;
  setCategory: (category: string) => void;
  categories: readonly CaseCategory[];
  onSearch: () => void;
  onCreateCase: () => void;
}

export function SearchAndFilter({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  onSearch,
  onCreateCase,
}: SearchAndFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6 space-y-4'>
      {/* Create Case Button */}
      <div className='flex justify-between items-center'>
        <h2 className='text-lg font-semibold text-gray-900'>Cases</h2>
        <button
          onClick={onCreateCase}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 4v16m8-8H4'
            />
          </svg>
          Add New Case
        </button>
      </div>

      {/* Search Bar */}
      <div className='flex gap-3'>
        <div className='flex-1 relative'>
          <input
            type='text'
            placeholder='Search cases by title or description...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <svg
            className='absolute right-3 top-2.5 w-5 h-5 text-gray-400'
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
        <button
          onClick={onSearch}
          className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
        >
          Search
        </button>
      </div>

      {/* Category Filter */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-medium text-gray-700'>
            Filter by Category
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1'
          >
            {isExpanded ? 'Show Less' : 'Show All'}
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
        </div>

        <div
          className={`grid gap-2 ${isExpanded ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'}`}
        >
          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              category === 'all'
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {(isExpanded ? categories : categories.slice(0, 7)).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                category === cat
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
