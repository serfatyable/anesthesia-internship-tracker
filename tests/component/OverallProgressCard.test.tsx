import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverallProgressCard } from '@/components/site/dashboard/OverallProgressCard';
import type { ProgressSummary, RotationProgress } from '@/lib/domain/progress';

// Mock data for testing
const mockSummary: ProgressSummary = {
  completionPercentage: 75,
  totalLogs: 45,
  totalApproved: 30,
  totalPending: 15,
  totalRejected: 0,
};

const mockRotations: RotationProgress[] = [
  {
    id: 'rotation-1',
    name: 'General Anesthesia',
    state: 'ACTIVE',
    completionPercentage: 100,
    totalRequired: 50,
    logged: 50,
    approved: 50,
    pending: 0,
    rejected: 0,
    requirements: [],
    noRequirement: false,
  },
  {
    id: 'rotation-2',
    name: 'Cardiac Anesthesia',
    state: 'ACTIVE',
    completionPercentage: 50,
    totalRequired: 30,
    logged: 20,
    approved: 15,
    pending: 5,
    rejected: 0,
    requirements: [],
    noRequirement: false,
  },
  {
    id: 'rotation-3',
    name: 'Pediatric Anesthesia',
    state: 'ACTIVE',
    completionPercentage: 0,
    totalRequired: 25,
    logged: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    requirements: [],
    noRequirement: false,
  },
];

const mockUserInfo = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  createdAt: new Date('2024-01-01'),
};

describe('OverallProgressCard', () => {
  it('renders with correct progress percentage', () => {
    render(
      <OverallProgressCard summary={mockSummary} rotations={mockRotations} />
    );

    expect(screen.getByText('Internship Progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays completed rotations count correctly', () => {
    render(
      <OverallProgressCard summary={mockSummary} rotations={mockRotations} />
    );

    // Check that the count appears in both locations
    const completedCountElements = screen.getAllByText('1 / 3');
    expect(completedCountElements).toHaveLength(2);

    // Check that "Completed Rotations" appears in both locations
    const completedRotationsElements = screen.getAllByText(
      'Completed Rotations'
    );
    expect(completedRotationsElements).toHaveLength(2);
  });

  it('shows pending count from summary', () => {
    render(
      <OverallProgressCard summary={mockSummary} rotations={mockRotations} />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Pending for Approval')).toBeInTheDocument();
  });

  it('calculates and displays internship duration', () => {
    render(
      <OverallProgressCard
        summary={mockSummary}
        rotations={mockRotations}
        userInfo={mockUserInfo}
      />
    );

    // Should show duration since January 1, 2024
    expect(screen.getByText(/months/)).toBeInTheDocument();
    expect(screen.getByText('Time in Internship')).toBeInTheDocument();
  });

  it('shows N/A for duration when userInfo is not provided', () => {
    render(
      <OverallProgressCard summary={mockSummary} rotations={mockRotations} />
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText('Time in Internship')).toBeInTheDocument();
  });

  it('displays progress bar with correct width', () => {
    render(
      <OverallProgressCard summary={mockSummary} rotations={mockRotations} />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveStyle('width: 75%');
  });

  it('shows congratulations message when all rotations are completed', () => {
    const allCompletedRotations = mockRotations.map(rotation => ({
      ...rotation,
      completionPercentage: 100,
    }));

    const allCompletedSummary = {
      ...mockSummary,
      completionPercentage: 100,
    };

    render(
      <OverallProgressCard
        summary={allCompletedSummary}
        rotations={allCompletedRotations}
      />
    );

    expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You have completed all rotations in your internship program.'
      )
    ).toBeInTheDocument();
  });

  it('does not show congratulations message when not all rotations are completed', () => {
    render(
      <OverallProgressCard summary={mockSummary} rotations={mockRotations} />
    );

    expect(screen.queryByText('🎉 Congratulations!')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <OverallProgressCard
        summary={mockSummary}
        rotations={mockRotations}
        className='custom-class'
      />
    );

    const cardElement = container.querySelector('.custom-class');
    expect(cardElement).toBeInTheDocument();
  });

  it('handles empty rotations array', () => {
    render(<OverallProgressCard summary={mockSummary} rotations={[]} />);

    // Check that the count appears in both locations
    const completedCountElements = screen.getAllByText('0 / 0');
    expect(completedCountElements).toHaveLength(2);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('handles zero completion percentage', () => {
    const zeroSummary = { ...mockSummary, completionPercentage: 0 };
    render(
      <OverallProgressCard summary={zeroSummary} rotations={mockRotations} />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 0%');
  });

  it('handles 100% completion percentage', () => {
    const fullSummary = { ...mockSummary, completionPercentage: 100 };
    render(
      <OverallProgressCard summary={fullSummary} rotations={mockRotations} />
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 100%');
  });
});
