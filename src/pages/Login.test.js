import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// Mock axios
jest.mock('axios');

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks(); // Reset mocks before each test
});

// Helper function to render Login component
const setup = () => {
  return render(
    <BrowserRouter>
      <Login onLogin={jest.fn()} />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  test('renders Login form with required fields', () => {
    setup();

    expect(screen.getByText(/AgriPredict Login/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter 10-digit contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('validates contact number field correctly', () => {
    setup();

    const contactInput = screen.getByPlaceholderText(/Enter 10-digit contact number/i);
    
    fireEvent.change(contactInput, { target: { value: '12345' } });
    expect(screen.getByText(/Contact must be 10 digits/i)).toBeInTheDocument();
    
    fireEvent.change(contactInput, { target: { value: '9876543210' } });
    expect(screen.queryByText(/Contact must be 10 digits/i)).not.toBeInTheDocument();
  });

  test('validates password field correctly', () => {
    setup();

    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    
    fireEvent.change(passwordInput, { target: { value: 'Strong123' } });
    expect(screen.queryByText(/Password must be at least 8 characters/i)).not.toBeInTheDocument();
  });

  test('submits form successfully and navigates to dashboard', async () => {
    axios.post.mockResolvedValueOnce({ 
      data: { 
        success: true, 
        user: { name: 'John Doe', farmerId: '123', fields: [], recommendations: [], weatherData: [] } 
      } 
    });

    const mockOnLogin = jest.fn();
    render(
      <BrowserRouter>
        <Login onLogin={mockOnLogin} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter 10-digit contact number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/login', {
        contact: '9876543210',
        password: 'Password123',
      });

      expect(mockOnLogin).toHaveBeenCalledWith('John Doe', '123', {
        fields: [],
        recommendations: [],
        weatherData: [],
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('displays error message when login fails', async () => {
    axios.post.mockRejectedValueOnce({ 
      response: { data: { message: 'Invalid credentials' } } 
    });

    setup();

    fireEvent.change(screen.getByPlaceholderText(/Enter 10-digit contact number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'WrongPass123' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('button is disabled when there are validation errors', async () => {
    setup();
  
    const loginButton = screen.getByRole('button', { name: /Login/i });
  
    // Initially button should be disabled (empty form)
    expect(loginButton).toBeDisabled();
  
    // Fill only the contact number (invalid state)
    fireEvent.change(screen.getByPlaceholderText(/Enter 10-digit contact number/i), { 
      target: { value: '9876543210' } 
    });
  
    expect(loginButton).toBeDisabled(); // Password is missing, should still be disabled
  
    // Fill in an invalid password
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { 
      target: { value: 'short' } 
    });
  
    expect(loginButton).toBeDisabled(); // Password is invalid, should still be disabled
  
    // Now fix the password
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { 
      target: { value: 'Password123' } 
    });
  
    // Button should now be enabled
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });
  });
});
