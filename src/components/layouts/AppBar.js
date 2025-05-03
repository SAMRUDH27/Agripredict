import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LoginIcon, 
  UserIcon, 
  LogoutIcon, 
  PlusCircleIcon, 
  ViewGridIcon,
  SparklesIcon // Replacing LeafIcon with SparklesIcon for Crops
} from '@heroicons/react/solid';

const AppBar = ({ isLoggedIn, username, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-green-600 text-white p-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-lg font-bold">
          AgriPredict
        </Link>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link 
                to="/" 
                className="flex items-center space-x-1 hover:bg-green-700 px-2 py-1 rounded transition"
              >
                <ViewGridIcon className="h-4 w-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link 
                to="/field-entry" 
                className="flex items-center space-x-1 hover:bg-green-700 px-2 py-1 rounded transition"
              >
                <PlusCircleIcon className="h-4 w-4" />
                <span className="text-sm">Field</span>
              </Link>
              <Link 
                to="/crops" 
                className="flex items-center space-x-1 hover:bg-green-700 px-2 py-1 rounded transition"
              >
                <SparklesIcon className="h-4 w-4" />
                <span className="text-sm">Crops</span>
              </Link>
              <div className="flex items-center space-x-1">
                <UserIcon className="h-4 w-4" />
                <span className="text-sm">{username}</span>
              </div>
              <button 
                onClick={() => {
                  onLogout();
                  navigate('/');
                }}
                className="flex items-center space-x-1 bg-green-700 px-2 py-1 rounded hover:bg-green-800 transition"
              >
                <LogoutIcon className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="flex items-center space-x-1 bg-green-700 px-2 py-1 rounded hover:bg-green-800 transition"
            >
              <LoginIcon className="h-4 w-4" />
              <span className="text-sm">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AppBar;
