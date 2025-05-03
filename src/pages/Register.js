import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  UserIcon, 
  LocationMarkerIcon, 
  CalendarIcon, 
  PhoneIcon, 
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/solid';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    age: '',
    contact: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const navigate = useNavigate();

  // Improved validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.length >= 2 && /^[a-zA-Z\s]+$/.test(value);
      case 'location':
        return value.length >= 2;
      case 'age':
        const numAge = Number(value);
        return !isNaN(numAge) && numAge >= 18 && numAge <= 120;
      case 'contact':
        return /^\d{10}$/.test(value);
      case 'password':
        // Updated password validation
        // Must contain at least one letter and one number
        // Can be in any order, minimum 8 characters
        return value.length >= 8 && 
               /^(?=.*[a-zA-Z])(?=.*\d).+$/.test(value);
      default:
        return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (!validateField(name, value)) {
      setErrors(prev => ({
        ...prev,
        [name]: getErrorMessage(name)
      }));
    } else {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear global error
    setGlobalError('');
  };

  const getErrorMessage = (field) => {
    switch (field) {
      case 'name':
        return 'Name must be at least 2 characters long and contain only letters';
      case 'location':
        return 'Location must be at least 2 characters long';
      case 'age':
        return 'Age must be between 18 and 120';
      case 'contact':
        return 'Contact must be 10 digits';
      case 'password':
        return 'Password must be at least 8 characters with both letters and numbers';
      default:
        return 'Invalid input';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) {
        newErrors[key] = getErrorMessage(key);
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData);

      if (response.data.success) {
        const farmerId = response.data.farmerId;
        onRegister(formData.name, farmerId);
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      setGlobalError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center">
            <UserIcon className="h-8 w-8 mr-2" />
            AgriPredict Registration
          </h2>
          <p className="text-green-100 mt-2">Create your agricultural management account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Global Error Message */}
          {globalError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <ExclamationCircleIcon className="h-6 w-6 mr-2 text-red-500" />
              {globalError}
            </div>
          )}

          {/* Form Fields */}
          {[
            { 
              name: 'name', 
              label: 'Full Name', 
              type: 'text', 
              icon: UserIcon 
            },
            { 
              name: 'location', 
              label: 'Location', 
              type: 'text', 
              icon: LocationMarkerIcon 
            },
            { 
              name: 'age', 
              label: 'Age', 
              type: 'number', 
              icon: CalendarIcon 
            },
            { 
              name: 'contact', 
              label: 'Contact Number', 
              type: 'tel', 
              icon: PhoneIcon 
            },
            { 
              name: 'password', 
              label: 'Password', 
              type: 'password', 
              icon: LockClosedIcon 
            }
          ].map(({ name, label, type, icon: Icon }) => (
            <div key={name} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Icon className="h-5 w-5 mr-2 text-green-600" />
                {label}
              </label>
              <div className="relative">
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none 
                    ${errors[name] 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                    }`}
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
                {formData[name] && !errors[name] && (
                  <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              {errors[name] && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                  {errors[name]}
                </p>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg 
                       hover:bg-green-700 transition duration-300 
                       flex items-center justify-center space-x-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={Object.keys(errors).length > 0 || 
              !formData.name || 
              !formData.location || 
              !formData.age || 
              !formData.contact || 
              !formData.password}
          >
            Register
          </button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-green-600 hover:underline font-medium"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;