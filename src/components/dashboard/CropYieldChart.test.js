import { render, screen } from '@testing-library/react';
import CropYieldChart from './CropYieldChart'; // Ensure correct path

// Mock recharts components to avoid rendering actual charts in tests
jest.mock('recharts', () => ({
  LineChart: (props) => <div data-testid="line-chart">{props.children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: (props) => <div data-testid="responsive-container">{props.children}</div>,
}));

describe('CropYieldChart Component', () => {
  test('renders chart when user is logged in', () => {
    render(<CropYieldChart isLoggedIn={true} />);

    // Check for heading
    expect(screen.getByText(/Crop Yield/i)).toBeInTheDocument();

    // Check that chart components are rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('renders login message when user is not logged in', () => {
    render(<CropYieldChart isLoggedIn={false} />);
    
    // Print the actual rendered HTML to check if the text is missing or different
    screen.debug();
  
    expect(screen.getByText(/Login to view crop yield/i)).toBeInTheDocument();
  });
  
  
  
  
});
