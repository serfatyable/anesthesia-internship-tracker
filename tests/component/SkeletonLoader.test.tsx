import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkeletonLoader, { CardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders with default props', () => {
    const { container } = render(<SkeletonLoader />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('renders with custom className', () => {
    const { container } = render(<SkeletonLoader className="custom-class" />);
    const skeleton = container.querySelector('.custom-class');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('renders multiple lines', () => {
    const { container } = render(<SkeletonLoader lines={3} />);
    const skeletonDivs = container.querySelectorAll('.bg-gray-200');
    expect(skeletonDivs).toHaveLength(3);
  });

  it('renders with custom height', () => {
    const { container } = render(<SkeletonLoader height="h-8" />);
    const skeletonDiv = container.querySelector('.h-8');
    expect(skeletonDiv).toHaveClass('h-8');
  });
});

describe('CardSkeleton', () => {
  it('renders card skeleton structure', () => {
    const { container } = render(<CardSkeleton />);
    
    // Check for avatar circle by finding the specific element
    const avatar = container.querySelector('.w-12.h-12.bg-gray-200.rounded-full');
    expect(avatar).toBeInTheDocument();
    
    // Check for text lines by finding elements with bg-gray-200
    const textLines = container.querySelectorAll('.bg-gray-200');
    expect(textLines.length).toBeGreaterThan(0);
  });
});

describe('TableSkeleton', () => {
  it('renders table skeleton with default rows', () => {
    const { container } = render(<TableSkeleton />);
    
    const tableContainer = container.querySelector('.animate-pulse');
    expect(tableContainer).toHaveClass('animate-pulse');
  });

  it('renders table skeleton with custom row count', () => {
    const { container } = render(<TableSkeleton rows={3} />);
    
    const tableContainer = container.querySelector('.animate-pulse');
    expect(tableContainer).toHaveClass('animate-pulse');
    
    // Check that we have the expected number of data rows (header + data rows)
    const rowElements = container.querySelectorAll('.px-6.py-4');
    expect(rowElements.length).toBe(4); // 1 header + 3 data rows
  });
});
