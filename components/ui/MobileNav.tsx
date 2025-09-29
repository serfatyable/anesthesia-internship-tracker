'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  user: {
    name: string;
    role: string;
  };
  onSignOut: () => void;
}

export default function MobileNav({ user, onSignOut }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Logs', href: '/logs', icon: '📝' },
    { name: 'Rotations', href: '/rotations', icon: '🔄' },
    { name: 'Favorites', href: '/favorites', icon: '⭐' },
    ...(user.role === 'TUTOR' || user.role === 'ADMIN'
      ? [
          { name: 'Pending Approvals', href: '/pending-approvals', icon: '⏳' },
          { name: 'Verify', href: '/verify', icon: '✅' },
        ]
      : []),
    ...(user.role === 'ADMIN'
      ? [{ name: 'Admin', href: '/admin', icon: '⚙️' }]
      : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        aria-label='Toggle mobile menu'
      >
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          {isOpen ? (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          ) : (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 6h16M4 12h16M4 18h16'
            />
          )}
        </svg>
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className='lg:hidden fixed inset-0 z-50'>
          <div
            className='fixed inset-0 bg-black bg-opacity-25'
            onClick={() => setIsOpen(false)}
          />
          <div className='fixed top-0 right-0 w-64 h-full bg-white shadow-lg'>
            <div className='flex items-center justify-between p-4 border-b'>
              <h2 className='text-lg font-semibold'>Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className='p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              >
                <svg
                  className='w-5 h-5'
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

            <nav className='p-4 space-y-2'>
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className='text-lg'>{item.icon}</span>
                  <span className='font-medium'>{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className='absolute bottom-0 left-0 right-0 p-4 border-t'>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium'>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {user.name}
                  </p>
                  <p className='text-xs text-gray-500 capitalize'>
                    {user.role.toLowerCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
