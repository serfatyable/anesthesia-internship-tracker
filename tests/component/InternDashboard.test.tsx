import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InternDashboard } from '@/components/site/dashboard/InternDashboard';
import type { InternDashboard as InternDashboardType } from '@/lib/domain/progress';

// Mock child components
vi.mock('@/components/site/dashboard/OverallProgressCard', () => ({
  OverallProgressCard: ({ summary, rotations, userInfo }: any) => (
    <div data-testid='overall-progress-card'>
      Overall Progress: {summary.completionPercentage}%
    </div>
  ),
}));

vi.mock('@/components/site/dashboard/RotationGroups', () => ({
  RotationGroups: ({ rotations }: any) => (
    <div data-testid='rotation-groups'>Rotations: {rotations.length}</div>
  ),
}));

vi.mock('@/components/site/dashboard/CaseReviewCard', () => ({
  CaseReviewCard: () => <div data-testid='case-review-card'>Case Review</div>,
}));

vi.mock('@/components/site/dashboard/ProcedureKnowledgeFavoritesCard', () => ({
  ProcedureKnowledgeFavoritesCard: () => (
    <div data-testid='procedure-knowledge-card'>Procedure Knowledge</div>
  ),
}));

vi.mock('@/components/site/dashboard/FeedbackNotificationsCard', () => ({
  FeedbackNotificationsCard: () => (
    <div data-testid='feedback-notifications-card'>Feedback Notifications</div>
  ),
}));

vi.mock('@/components/site/dashboard/ResourcesCard', () => ({
  ResourcesCard: ({ driveUrl }: any) => (
    <div data-testid='resources-card'>
      Resources {driveUrl ? '(with drive URL)' : ''}
    </div>
  ),
}));

// Mock data for testing
const mockDashboard: InternDashboardType = {
  summary: {
    completionPercentage: 75,
    totalLogs: 45,
    totalApproved: 30,
    totalPending: 15,
    totalRejected: 0,
  },
  rotations: [
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
  ],
  userInfo: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    createdAt: new Date('2024-01-01'),
  },
};

describe('InternDashboard', () => {
  beforeEach(() => {
    // Reset environment variables
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_DRIVE_URL', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders all main components', () => {
    render(<InternDashboard dashboard={mockDashboard} />);

    expect(screen.getByTestId('overall-progress-card')).toBeInTheDocument();
    expect(screen.getByTestId('rotation-groups')).toBeInTheDocument();
    expect(screen.getByTestId('case-review-card')).toBeInTheDocument();
    expect(screen.getByTestId('procedure-knowledge-card')).toBeInTheDocument();
    expect(
      screen.getByTestId('feedback-notifications-card')
    ).toBeInTheDocument();
    expect(screen.getByTestId('resources-card')).toBeInTheDocument();
  });

  it('passes correct props to OverallProgressCard', () => {
    render(<InternDashboard dashboard={mockDashboard} />);

    const overallProgressCard = screen.getByTestId('overall-progress-card');
    expect(overallProgressCard).toHaveTextContent('Overall Progress: 75%');
  });

  it('passes correct props to RotationGroups', () => {
    render(<InternDashboard dashboard={mockDashboard} />);

    const rotationGroups = screen.getByTestId('rotation-groups');
    expect(rotationGroups).toHaveTextContent('Rotations: 2');
  });

  it('renders ResourcesCard without drive URL when env var is not set', () => {
    render(<InternDashboard dashboard={mockDashboard} />);

    const resourcesCard = screen.getByTestId('resources-card');
    expect(resourcesCard).toHaveTextContent('Resources');
    expect(resourcesCard).not.toHaveTextContent('with drive URL');
  });

  it('renders ResourcesCard with drive URL when env var is set', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_DRIVE_URL', 'https://drive.google.com');

    render(<InternDashboard dashboard={mockDashboard} />);

    const resourcesCard = screen.getByTestId('resources-card');
    expect(resourcesCard).toHaveTextContent('Resources (with drive URL)');
  });

  it('applies custom className', () => {
    const { container } = render(
      <InternDashboard dashboard={mockDashboard} className='custom-class' />
    );

    const dashboardElement = container.querySelector('.custom-class');
    expect(dashboardElement).toBeInTheDocument();
  });

  it('has correct grid layout classes', () => {
    const { container } = render(<InternDashboard dashboard={mockDashboard} />);

    const gridElement = container.querySelector(
      '.grid-cols-1.md\\:grid-cols-2'
    );
    expect(gridElement).toBeInTheDocument();
  });

  it('has correct spacing classes', () => {
    const { container } = render(<InternDashboard dashboard={mockDashboard} />);

    const mainContainer = container.querySelector('.space-y-6');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles empty rotations array', () => {
    const emptyDashboard = { ...mockDashboard, rotations: [] };
    render(<InternDashboard dashboard={emptyDashboard} />);

    const rotationGroups = screen.getByTestId('rotation-groups');
    expect(rotationGroups).toHaveTextContent('Rotations: 0');
  });

  it('handles missing userInfo', () => {
    const dashboardWithoutUserInfo = { ...mockDashboard, userInfo: undefined };
    render(<InternDashboard dashboard={dashboardWithoutUserInfo} />);

    expect(screen.getByTestId('overall-progress-card')).toBeInTheDocument();
    expect(screen.getByTestId('rotation-groups')).toBeInTheDocument();
  });

  it('handles zero completion percentage', () => {
    const zeroProgressDashboard = {
      ...mockDashboard,
      summary: { ...mockDashboard.summary, completionPercentage: 0 },
    };
    render(<InternDashboard dashboard={zeroProgressDashboard} />);

    const overallProgressCard = screen.getByTestId('overall-progress-card');
    expect(overallProgressCard).toHaveTextContent('Overall Progress: 0%');
  });

  it('handles 100% completion percentage', () => {
    const fullProgressDashboard = {
      ...mockDashboard,
      summary: { ...mockDashboard.summary, completionPercentage: 100 },
    };
    render(<InternDashboard dashboard={fullProgressDashboard} />);

    const overallProgressCard = screen.getByTestId('overall-progress-card');
    expect(overallProgressCard).toHaveTextContent('Overall Progress: 100%');
  });

  it('renders all four bottom cards in correct order', () => {
    render(<InternDashboard dashboard={mockDashboard} />);

    const cards = [
      screen.getByTestId('case-review-card'),
      screen.getByTestId('procedure-knowledge-card'),
      screen.getByTestId('feedback-notifications-card'),
      screen.getByTestId('resources-card'),
    ];

    cards.forEach(card => {
      expect(card).toBeInTheDocument();
    });
  });
});
