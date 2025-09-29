import React, { useState } from 'react';
import { ReferenceModal } from './ReferenceModal';

interface MillersReferenceButtonProps {
  title: string;
  reference: string | null;
  className?: string;
}

export const MillersReferenceButton: React.FC<MillersReferenceButtonProps> = ({
  title,
  reference,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasReference = reference && reference.trim() !== '';

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          inline-flex items-center px-2 py-1 text-xs font-medium rounded-md transition-all duration-150
          ${
            hasReference
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
          }
          ${className}
        `}
        title={
          hasReference ? "View Miller's Reference" : 'No reference available'
        }
      >
        <svg
          className='w-3 h-3 mr-1'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
          />
        </svg>
        Miller&apos;s Reference
      </button>

      <ReferenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        reference={reference}
      />
    </>
  );
};
