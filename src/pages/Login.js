import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  UserIcon, 
  LockClosedIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/solid';

const Login = ({ onLogin }) => {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const navigate = useNavigate();

  // Validation functions
  const validateContact = (value) => {
    return /^\d{10}$/.test(value);
  };

  const validatePassword = (value) => {
    return value.length >= 8 && 
           /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value);
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    setContact(value);
    
    if (!validateContact(value)) {
      setErrors(prev => ({
        ...prev,
        contact: 'Contact must be 10 digits'
      }));
    } else {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.contact;
        return newErrors;
      });
    }
    setGlobalError('');
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (!validatePassword(value)) {
      setErrors(prev => ({
        ...prev,
        password: 'Password must be at least 8 characters with letters and numbers'
      }));
    } else {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.password;
        return newErrors;
      });
    }
    setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    // Validate all fields
    const newErrors = {};
    if (!validateContact(contact)) {
      newErrors.contact = 'Contact must be 10 digits';
    }
    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters with letters and numbers';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        contact,
        password,
      });

      if (response.data.success) {
        const { name, farmerId, fields, recommendations, weatherData } = response.data.user;
        
        // Pass all retrieved data to onLogin if needed
        onLogin(name, farmerId, {
          fields, 
          recommendations, 
          weatherData
        });
        
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      setGlobalError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-green-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center">
            <UserIcon className="h-8 w-8 mr-2" />
            AgriPredict Login
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {globalError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <ExclamationCircleIcon className="h-6 w-6 mr-2 text-red-500" />
              {globalError}
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-green-600" />
              Contact Number
            </label>
            <input
              type="tel"
              value={contact}
              onChange={handleContactChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none 
                ${errors.contact 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                }`}
              placeholder="Enter 10-digit contact number"
            />
            {errors.contact && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.contact}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <LockClosedIcon className="h-5 w-5 mr-2 text-green-600" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none 
                ${errors.password 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                }`}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg 
                       hover:bg-green-700 transition duration-300 
                       flex items-center justify-center space-x-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={Object.keys(errors).length > 0 || !contact || !password}
          >
            Login
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-green-600 hover:underline font-medium"
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;