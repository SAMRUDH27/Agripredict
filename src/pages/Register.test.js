import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../pages/Register';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// Mock axios
jest.mock('axios');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks(); // Ensure fresh mocks before each test
});

// Helper function to render Register component
const setup = () => {
  return render(
    <BrowserRouter>
      <Register onRegister={jest.fn()} />
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  test('renders Register form with required fields', () => {
    setup();

    expect(screen.getByText(/AgriPredict Registration/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter location/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter age/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });

  test('validates input fields correctly', () => {
    setup();

    // Name validation
    const nameInput = screen.getByPlaceholderText(/Enter full name/i);
    fireEvent.change(nameInput, { target: { value: 'A' } });
    expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');

    // Age validation
    const ageInput = screen.getByPlaceholderText(/Enter age/i);
    fireEvent.change(ageInput, { target: { value: '17' } });
    expect(screen.getByText(/Age must be between 18 and 120/i)).toBeInTheDocument();

    fireEvent.change(ageInput, { target: { value: '25' } });
    expect(ageInput.value).toBe('25');

    // Contact validation
    const contactInput = screen.getByPlaceholderText(/Enter contact number/i);
    fireEvent.change(contactInput, { target: { value: '12345' } });
    expect(screen.getByText(/Contact must be 10 digits/i)).toBeInTheDocument();

    fireEvent.change(contactInput, { target: { value: '9876543210' } });
    expect(contactInput.value).toBe('9876543210');

    // Password validation
    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: 'Strong123' } });
    expect(passwordInput.value).toBe('Strong123');
  });

  test('submits form successfully and navigates to dashboard', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true, farmerId: '123' } });
    const mockOnRegister = jest.fn();

    render(
      <BrowserRouter>
        <Register onRegister={mockOnRegister} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter location/i), { target: { value: 'Farmville' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter age/i), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter contact number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByText(/Register/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/register', {
        name: 'John Doe',
        location: 'Farmville',
        age: '30',
        contact: '9876543210',
        password: 'Password123'
      });

      expect(mockOnRegister).toHaveBeenCalledTimes(1);
      expect(mockOnRegister).toHaveBeenCalledWith('John Doe', '123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('displays error message when registration fails', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Registration failed' } } });

    setup();

    fireEvent.change(screen.getByPlaceholderText(/Enter full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter location/i), { target: { value: 'Farmville' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter age/i), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter contact number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByText(/Register/i));

    await waitFor(() => {
      expect(screen.getByText(/Registration failed/i)).toBeInTheDocument();
    });
  });

  test('button is disabled when there are validation errors', async () => {
    setup();

    const registerButton = screen.getByRole('button', { name: /Register/i });

    // Ensure the button is disabled at first (empty form)
    expect(registerButton).toBeDisabled();

    // Fill in all fields except password
    fireEvent.change(screen.getByPlaceholderText(/Enter full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter location/i), { target: { value: 'Farmville' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter age/i), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter contact number/i), { target: { value: '9876543210' } });

    // Add an invalid password
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'short' } });

    // Button should still be disabled
    await waitFor(() => expect(registerButton).toBeDisabled());

    // Fix the password
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'Password123' } });

    // Button should now be enabled
    await waitFor(() => expect(registerButton).not.toBeDisabled());
  });
});
