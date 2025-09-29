import React from 'react';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  reference: string | null;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({
  isOpen,
  onClose,
  title,
  reference,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in fade-in duration-200'>
        {/* Header */}
        <div className='bg-blue-50 border-b border-blue-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-blue-900'>
              Miller&apos;s Reference
            </h2>
            <button
              onClick={onClose}
              className='text-blue-600 hover:text-blue-800 transition-colors duration-150'
              aria-label='Close modal'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(80vh-120px)]'>
          <div className='mb-4'>
            <h3 className='text-md font-medium text-gray-900 mb-2'>{title}</h3>
          </div>

          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            {reference ? (
              <div className='text-sm text-gray-700 leading-relaxed whitespace-pre-line'>
                {reference}
              </div>
            ) : (
              <div className='text-sm text-gray-500 italic'>
                No reference yet
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='bg-gray-50 border-t border-gray-200 px-6 py-4'>
          <div className='flex justify-end'>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
