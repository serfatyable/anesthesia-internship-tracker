import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorFallback from '@/components/ui/ErrorFallback';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockResetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  it('renders with default props', () => {
    render(<ErrorFallback error={mockError} resetError={mockResetError} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('An unexpected error occurred. Please try again.')
    ).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetError={mockResetError}
        title='Custom Error'
        message='Custom error message'
      />
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('calls resetError when Try Again button is clicked', () => {
    render(<ErrorFallback error={mockError} resetError={mockResetError} />);

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    expect(mockResetError).toHaveBeenCalledTimes(1);
  });

  it('navigates to dashboard when Go to Dashboard button is clicked', () => {
    render(<ErrorFallback error={mockError} resetError={mockResetError} />);

    const dashboardButton = screen.getByText('Go to Dashboard');
    fireEvent.click(dashboardButton);

    expect(mockLocation.href).toBe('/dashboard');
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(<ErrorFallback error={mockError} resetError={mockResetError} />);

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    // Check for error message in the pre element - use a more flexible matcher
    const errorDetails = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'pre' &&
        content.includes('Test error message')
      );
    });
    expect(errorDetails).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('does not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(<ErrorFallback error={mockError} resetError={mockResetError} />);

    expect(
      screen.queryByText('Error Details (Development)')
    ).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('displays error icon', () => {
    render(<ErrorFallback error={mockError} resetError={mockResetError} />);

    // SVG elements don't have role="img" by default, so we'll find it by its path element
    const icon = screen
      .getByText('Something went wrong')
      .parentElement?.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('w-8', 'h-8', 'text-red-600');
  });
});
