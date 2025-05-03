import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FieldEntry from '../pages/FieldEntry';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// Mock axios
jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock FileReader for file upload test
global.FileReader = class {
  constructor() {
    this.result = 'data:image/jpeg;base64,mockImageData';
  }
  readAsDataURL() {
    // Simulate async file reading
    setTimeout(() => {
      this.onload();
    }, 0);
  }
};

test('renders FieldEntry form with required inputs', () => {
  render(
    <BrowserRouter>
      <FieldEntry username="John" farmerId="123" />
    </BrowserRouter>
  );

  expect(screen.getByText(/Add New Field/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Enter survey number/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Enter field area/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Enter field location/i)).toBeInTheDocument();
  expect(screen.getByText(/Save Field Details/i)).toBeInTheDocument();
});

test('validates survey number input', () => {
  render(
    <BrowserRouter>
      <FieldEntry username="John" farmerId="123" />
    </BrowserRouter>
  );

  const surveyInput = screen.getByPlaceholderText(/Enter survey number/i);
  fireEvent.change(surveyInput, { target: { value: 'abc' } }); // Invalid input
  expect(surveyInput.value).toBe(''); // Should not update

  fireEvent.change(surveyInput, { target: { value: '12345' } }); // Valid input
  expect(surveyInput.value).toBe('12345');
});

test('validates field area input', () => {
  render(
    <BrowserRouter>
      <FieldEntry username="John" farmerId="123" />
    </BrowserRouter>
  );

  const fieldAreaInput = screen.getByPlaceholderText(/Enter field area/i);
  fireEvent.change(fieldAreaInput, { target: { value: 'abc' } }); // Invalid input
  expect(fieldAreaInput.value).toBe(''); // Should not update

  fireEvent.change(fieldAreaInput, { target: { value: '5.2' } }); // Valid input
  expect(fieldAreaInput.value).toBe('5.2');
});

test('triggers file upload and displays preview', async () => {
  render(
    <BrowserRouter>
      <FieldEntry username="John" farmerId="123" />
    </BrowserRouter>
  );

  // Create a mock file
  const file = new File(['sample'], 'field.jpg', { type: 'image/jpeg' });
  
  // Get the file input by its label
  const fileInput = screen.getByLabelText(/Browse Files/i);
  
  // Trigger file selection
  fireEvent.change(fileInput, { target: { files: [file] } });

  // Wait for the preview to appear
  await waitFor(() => {
    expect(screen.getByAltText('Field Preview')).toBeInTheDocument();
  });
});

test('submits form successfully and shows success message', async () => {
  // Mock successful API response
  axios.post.mockResolvedValueOnce({
    data: { success: true, nutrientContent: 'High', soilMoistureLevel: 75 },
  });

  render(
    <BrowserRouter>
      <FieldEntry username="John" farmerId="123" />
    </BrowserRouter>
  );

  // Fill out the form
  fireEvent.change(screen.getByPlaceholderText(/Enter survey number/i), { target: { value: '12345' } });
  fireEvent.change(screen.getByPlaceholderText(/Enter field area/i), { target: { value: '5' } });
  fireEvent.change(screen.getByPlaceholderText(/Enter field location/i), { target: { value: 'Farm1' } });

  // Submit the form
  fireEvent.click(screen.getByText(/Save Field Details/i));

  // Wait for success message
  await waitFor(() => {
    expect(screen.getByText(/Field details saved successfully/i)).toBeInTheDocument();
  });
});

test('shows error message when submission fails', async () => {
  // Mock API error
  axios.post.mockRejectedValueOnce(new Error('API Error'));

  render(
    <BrowserRouter>
      <FieldEntry username="John" farmerId="123" />
    </BrowserRouter>
  );

  // Fill out the form
  fireEvent.change(screen.getByPlaceholderText(/Enter survey number/i), { target: { value: '12345' } });
  fireEvent.change(screen.getByPlaceholderText(/Enter field area/i), { target: { value: '5' } });
  fireEvent.change(screen.getByPlaceholderText(/Enter field location/i), { target: { value: 'Farm1' } });

  // Submit the form
  fireEvent.click(screen.getByText(/Save Field Details/i));

  // Wait for error message
  await waitFor(() => {
    expect(screen.getByText(/Error saving field details/i)).toBeInTheDocument();
  });
});