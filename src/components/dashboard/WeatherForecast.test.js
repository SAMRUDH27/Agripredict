import React from 'react';
import { render, screen } from '@testing-library/react';
import WeatherForecast from '../../components/dashboard/WeatherForecast';

// Mock the icon components
jest.mock('../../icons', () => ({
  SunIcon: () => <div data-testid="sun-icon">Sun Icon</div>,
  CloudIcon: () => <div data-testid="cloud-icon">Cloud Icon</div>
}));

describe('WeatherForecast Component', () => {
  // Test when user is logged out
  test('renders login message when user is not logged in', () => {
    render(<WeatherForecast isLoggedIn={false} />);
    
    // Check for the header
    expect(screen.getByText('Weather Forecast')).toBeInTheDocument();
    
    // Check for login message
    expect(screen.getByText('Login to view weather forecast')).toBeInTheDocument();
    
    // Make sure weather data is not displayed
    expect(screen.queryByText('Mon')).not.toBeInTheDocument();
    expect(screen.queryByText('28°C')).not.toBeInTheDocument();
  });

  // Test when user is logged in
  test('renders weather data when user is logged in', () => {
    render(<WeatherForecast isLoggedIn={true} />);
    
    // Check for the header
    expect(screen.getByText('Weather Forecast')).toBeInTheDocument();
    
    // Verify all days are displayed
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    
    // Verify temperatures are displayed
    expect(screen.getByText('28°C')).toBeInTheDocument();
    expect(screen.getByText('25°C')).toBeInTheDocument();
    expect(screen.getByText('24°C')).toBeInTheDocument();
    expect(screen.getByText('27°C')).toBeInTheDocument();
  });

  // Test if icons are rendered correctly
  test('renders correct weather icons', () => {
    render(<WeatherForecast isLoggedIn={true} />);
    
    // Check for the presence of icons
    const sunIcons = screen.getAllByTestId('sun-icon');
    const cloudIcons = screen.getAllByTestId('cloud-icon');
    
    // We expect 3 sun icons (Mon, Wed, Thu) and 1 cloud icon (Tue)
    expect(sunIcons).toHaveLength(3);
    expect(cloudIcons).toHaveLength(1);
  });

  // Test the component structure
  test('has the correct component structure', () => {
    render(<WeatherForecast isLoggedIn={true} />);
    
    // Check for container classes
    const container = screen.getByText('Weather Forecast').closest('div');
    expect(container).toHaveClass('bg-white', 'shadow-md', 'rounded-lg', 'p-6');
    
    // Check for heading styling
    const heading = screen.getByText('Weather Forecast');
    expect(heading).toHaveClass('text-xl', 'font-bold', 'text-green-600', 'mb-4');
    
    // Check if days are displayed in a flex container
    const daysContainer = screen.getByText('Mon').closest('div').parentElement;
    expect(daysContainer).toHaveClass('flex', 'justify-between');
  });

  // Test with snapshot
  test('matches snapshot when logged in', () => {
    const { container } = render(<WeatherForecast isLoggedIn={true} />);
    expect(container).toMatchSnapshot();
  });

  test('matches snapshot when logged out', () => {
    const { container } = render(<WeatherForecast isLoggedIn={false} />);
    expect(container).toMatchSnapshot();
  });
});