import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DataTable from '@/components/ui/DataTable';

interface TestData {
  id: string;
  name: string;
  age: number;
  email: string;
}

const mockData: TestData[] = [
  { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
];

const mockColumns = [
  { key: 'name' as keyof TestData, label: 'Name', sortable: true },
  { key: 'age' as keyof TestData, label: 'Age', sortable: true },
  { key: 'email' as keyof TestData, label: 'Email', sortable: false },
];

describe('DataTable', () => {
  it('renders data correctly', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows search input when searchable is true', () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable={true} />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('hides search input when searchable is false', () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable={false} />);
    
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('filters data based on search term', async () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable={true} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'john doe' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });
  });

  it('sorts data when sortable column header is clicked', async () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // First row should be header, second should be Bob Johnson (sorted ascending)
      expect(rows[1]).toHaveTextContent('Bob Johnson');
    });
  });

  it('toggles sort direction on second click', async () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader); // First click - ascending
    fireEvent.click(nameHeader); // Second click - descending
    
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // First row should be header, second should be John Doe (sorted descending)
      expect(rows[1]).toHaveTextContent('John Doe');
    });
  });

  it('shows pagination when enabled', () => {
    render(<DataTable data={mockData} columns={mockColumns} pagination={true} pageSize={2} />);
    
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('hides pagination when disabled', () => {
    render(<DataTable data={mockData} columns={mockColumns} pagination={false} />);
    
    expect(screen.queryByText('Page 1 of 2')).not.toBeInTheDocument();
  });

  it('navigates pages correctly', async () => {
    render(<DataTable data={mockData} columns={mockColumns} pagination={true} pageSize={2} />);
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });
  });

  it('disables previous button on first page', () => {
    render(<DataTable data={mockData} columns={mockColumns} pagination={true} pageSize={2} />);
    
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', async () => {
    render(<DataTable data={mockData} columns={mockColumns} pagination={true} pageSize={2} />);
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(nextButton).toBeDisabled();
    });
  });

  it('shows empty state when no data', () => {
    render(<DataTable data={[]} columns={mockColumns} />);
    
    expect(screen.getByText('No data found')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('shows empty state with search message when filtering', async () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable={true} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('No data found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument();
    });
  });

  it('renders custom cell content with render function', () => {
    const columnsWithRender = [
      { key: 'name' as keyof TestData, label: 'Name', sortable: true },
      { key: 'age' as keyof TestData, label: 'Age', sortable: true },
      { key: 'email' as keyof TestData, label: 'Email', sortable: false },
      {
        key: 'age' as keyof TestData,
        label: 'Age Group',
        render: (value: number) => value > 30 ? 'Senior' : 'Junior',
        className: 'age-group-column',
      },
    ];

    render(<DataTable data={mockData} columns={columnsWithRender} />);
    
    expect(screen.getByText('Senior')).toBeInTheDocument();
    expect(screen.getAllByText('Junior')).toHaveLength(2); // Two people under 30
  });

  it('applies custom className', () => {
    const { container } = render(<DataTable data={mockData} columns={mockColumns} className="custom-table" />);
    
    const tableContainer = container.querySelector('.custom-table');
    expect(tableContainer).toHaveClass('custom-table');
  });
});
