import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RotationCard } from '@/components/site/dashboard/RotationCard';
import type { RotationProgress } from '@/lib/domain/progress';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock data for testing
const mockRotation: RotationProgress = {
  rotationId: 'rotation-1',
  rotationName: 'General Anesthesia',
  required: 50,
  verified: 35,
  pending: 10,
  completionPercentage: 70,
  state: 'ACTIVE',
  currentInterns: 3,
};

describe('RotationCard', () => {
  it('renders rotation name correctly', () => {
    render(<RotationCard rotation={mockRotation} />);

    expect(screen.getByText('General Anesthesia')).toBeInTheDocument();
  });

  it('displays progress percentage correctly', () => {
    render(<RotationCard rotation={mockRotation} />);

    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('shows procedures count correctly', () => {
    render(<RotationCard rotation={mockRotation} />);

    // Check that the count appears for both Procedures and Knowledge
    const countElements = screen.getAllByText('35 / 50');
    expect(countElements).toHaveLength(2);
    expect(screen.getByText('Procedures:')).toBeInTheDocument();
  });

  it('displays pending count', () => {
    render(<RotationCard rotation={mockRotation} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Pending:')).toBeInTheDocument();
  });

  it('shows intern count', () => {
    render(<RotationCard rotation={mockRotation} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Interns:')).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    render(<RotationCard rotation={mockRotation} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '70');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveStyle('width: 70%');
  });

  it('applies correct progress bar color for ACTIVE state with 70% completion', () => {
    render(<RotationCard rotation={mockRotation} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-yellow-500');
  });

  it('applies correct progress bar color for ACTIVE state with 100% completion', () => {
    const completedRotation = { ...mockRotation, completionPercentage: 100 };
    render(<RotationCard rotation={completedRotation} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-green-500');
  });

  it('applies correct progress bar color for ACTIVE state with low completion', () => {
    const lowCompletionRotation = { ...mockRotation, completionPercentage: 30 };
    render(<RotationCard rotation={lowCompletionRotation} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-red-500');
  });

  it('applies correct progress bar color for FINISHED state', () => {
    const finishedRotation = { ...mockRotation, state: 'FINISHED' };
    render(<RotationCard rotation={finishedRotation} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-blue-500');
  });

  it('applies correct progress bar color for NOT_STARTED state', () => {
    const notStartedRotation = { ...mockRotation, state: 'NOT_STARTED' };
    render(<RotationCard rotation={notStartedRotation} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-gray-300');
  });

  it('shows N/A when required is 0', () => {
    const noRequirementsRotation = { ...mockRotation, required: 0 };
    render(<RotationCard rotation={noRequirementsRotation} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('displays no requirements notice when required is 0', () => {
    const noRequirementsRotation = { ...mockRotation, required: 0 };
    render(<RotationCard rotation={noRequirementsRotation} />);

    expect(
      screen.getByText('No specific requirements defined for this rotation.')
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <RotationCard rotation={mockRotation} className='custom-class' />
    );

    const cardElement = container.querySelector('.custom-class');
    expect(cardElement).toBeInTheDocument();
  });

  it('has correct link href', () => {
    render(<RotationCard rotation={mockRotation} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/rotations/General%20Anesthesia');
  });

  it('applies correct background color for known rotation types', () => {
    const icuRotation = { ...mockRotation, rotationName: 'ICU' };
    const { container } = render(<RotationCard rotation={icuRotation} />);

    const cardElement = container.querySelector('.bg-blue-50');
    expect(cardElement).toBeInTheDocument();
  });

  it('applies default background color for unknown rotation types', () => {
    const unknownRotation = {
      ...mockRotation,
      rotationName: 'Unknown Rotation',
    };
    const { container } = render(<RotationCard rotation={unknownRotation} />);

    const cardElement = container.querySelector('.bg-gray-50');
    expect(cardElement).toBeInTheDocument();
  });

  it('handles zero intern count', () => {
    const noInternsRotation = { ...mockRotation, currentInterns: 0 };
    render(<RotationCard rotation={noInternsRotation} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles zero pending count', () => {
    const noPendingRotation = { ...mockRotation, pending: 0 };
    render(<RotationCard rotation={noPendingRotation} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles zero verified count', () => {
    const noVerifiedRotation = { ...mockRotation, verified: 0 };
    render(<RotationCard rotation={noVerifiedRotation} />);

    // Check that the count appears for both Procedures and Knowledge
    const countElements = screen.getAllByText('0 / 50');
    expect(countElements).toHaveLength(2);
  });

  it('handles 100% completion with finished state', () => {
    const completedFinishedRotation = {
      ...mockRotation,
      completionPercentage: 100,
      state: 'FINISHED',
      verified: 50,
      pending: 0,
    };
    render(<RotationCard rotation={completedFinishedRotation} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
    // Check that the count appears for both Procedures and Knowledge
    const countElements = screen.getAllByText('50 / 50');
    expect(countElements).toHaveLength(2);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
