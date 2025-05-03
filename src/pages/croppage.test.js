import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CropManagement from '../pages/croppage';
import axios from 'axios';

// Mock axios
jest.mock('axios');

test('renders Crop Inventory Management heading', () => {
  render(<CropManagement />);
  expect(screen.getByText(/Crop Inventory Management/i)).toBeInTheDocument();
});

test('renders search input field', () => {
  render(<CropManagement />);
  const searchInput = screen.getByPlaceholderText('Search crops or varieties...');
  expect(searchInput).toBeInTheDocument();
});

test('updates search term when typing', () => {
  render(<CropManagement />);
  const searchInput = screen.getByPlaceholderText('Search crops or varieties...');
  fireEvent.change(searchInput, { target: { value: 'Wheat' } });
  expect(searchInput.value).toBe('Wheat');
});

test('displays loading state initially', async () => {
  axios.get.mockResolvedValueOnce({ data: [] }); // Mock empty data
  render(<CropManagement />);
  expect(screen.getByText(/Loading crops.../i)).toBeInTheDocument();
});

test('displays fetched crops when API call is successful', async () => {
  const mockCrops = [
    { CROPID: 1, CROPNAME: 'Wheat', VARIETY: 'Golden', ACRESREQUIRED: 5, DAYS_TO_GROW: 120 },
    { CROPID: 2, CROPNAME: 'Corn', VARIETY: 'Sweet', ACRESREQUIRED: 3, DAYS_TO_GROW: 90 }
  ];
  
  axios.get.mockResolvedValueOnce({ data: mockCrops });

  render(<CropManagement />);
  
  await waitFor(() => {
    expect(screen.getByText('Wheat')).toBeInTheDocument();
    expect(screen.getByText('Corn')).toBeInTheDocument();
  });
});

test('displays error message when API call fails', async () => {
  axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

  render(<CropManagement />);
  
  await waitFor(() => {
    expect(screen.getByText(/Failed to fetch crops/i)).toBeInTheDocument();
  });
});
