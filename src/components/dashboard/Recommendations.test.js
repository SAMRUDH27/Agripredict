import { render, screen } from '@testing-library/react';
import Recommendations from './Recommendations';

test('renders the Recommendations component with a title', () => {
  render(<Recommendations />);
  expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
});

test('renders a list of recommendations', () => {
  render(<Recommendations />);
  
  const recommendations = [
    'Consider increasing irrigation during dry seasons.',
    'Try planting drought-resistant crops.',
    'Optimize fertilizer usage for better crop yield.',
  ];

  recommendations.forEach((rec) => {
    expect(screen.getByText(rec)).toBeInTheDocument();
  });
});
