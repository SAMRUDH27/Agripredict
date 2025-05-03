import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DashboardWeather from './DashboardWeather';

import { 
  BarChart3, 
  Cloud, 
  Lightbulb,
  ChevronUp,
  Plus,
  AlertTriangle
} from 'lucide-react';

const Dashboard = ({ username, isLoggedIn, farmerId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyData, setWeeklyData] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Fetch user's fields on component mount
  useEffect(() => {
    if (isLoggedIn && farmerId) {
      fetchUserFields();
      fetchCrops();
    }
  }, [isLoggedIn, farmerId]);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Fetch user's fields
  const fetchUserFields = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user-fields/${farmerId}`);
      if (response.data?.fields) {
        setFields(response.data.fields);
        setError('');
      }
    } catch (err) {
      setError('Failed to load fields. Please try again later.');
      setFields([]);
    }
  };

  // Fetch available crops
  const fetchCrops = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/crops');
      if (response.data) {
        setCrops(response.data);
        setError('');
      }
    } catch (err) {
      setError('Failed to load crops. Please try again later.');
      setCrops([]);
    }
  };

  // Fetch weather data
  const fetchWeatherData = async (location, date) => {
    if (!location || !date) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(
        `http://localhost:5000/api/weather/${encodeURIComponent(location)}/${date}`
      );
      
      if (response.data?.success) {
        setWeatherData(response.data.weather);
        if (response.data.weather?.forecast) {
          setWeeklyData(response.data.weather.forecast);
        }
      } else {
        throw new Error('Invalid weather data received');
      }
    } catch (err) {
      setError('Failed to fetch weather data. Please try again later.');
      setWeatherData(null);
      setWeeklyData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle field selection
  const handleFieldChange = async (e) => {
    const fieldId = e.target.value;
    setSelectedField(fieldId);
    
    const selectedFieldData = fields.find(f => f.FIELDID.toString() === fieldId);
    if (selectedFieldData?.LOCATION) {
      fetchWeatherData(
        selectedFieldData.LOCATION,
        selectedDate.toISOString().split('T')[0]
      );
    }
  };

  // Handle date selection
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    
    const selectedFieldData = fields.find(f => f.FIELDID.toString() === selectedField);
    if (selectedFieldData?.LOCATION) {
      fetchWeatherData(
        selectedFieldData.LOCATION,
        newDate.toISOString().split('T')[0]
      );
    }
  };

  const saveWeatherData = async (dayData) => {
    if (!selectedField) {
      setError('Please select a field');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/save-weather', {
        fieldId: selectedField,
        date: dayData.date,
        temperature: dayData.temperature,
        humidity: dayData.humidity
      });

      if (response.data?.success) {
        setToast({
          show: true,
          message: `Weather data saved for ${new Date(dayData.date).toLocaleDateString()}`
        });
      }
    } catch (err) {
      setError('Failed to save weather data. Please try again later.');
    }
  };

  const generateRecommendation = async () => {
    if (!selectedField || !selectedCrop) {
      setError('Please select both field and crop');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/generate-recommendation', {
        fieldId: selectedField,
        cropId: selectedCrop
      });

      if (response.data?.success) {
        setRecommendation(response.data.recommendation);
      } else {
        throw new Error('Failed to generate recommendation');
      }
    } catch (err) {
      setError('Failed to generate recommendation. Please try again later.');
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-400 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 transform rotate-45 translate-x-32 -translate-y-32"></div>
          <h1 className="text-4xl font-bold mb-4">
            {isLoggedIn ? `Welcome back, ${username}!` : 'AgriPredict Dashboard'}
          </h1>
          <p className="text-lg text-green-50 mb-6">
            {isLoggedIn 
              ? "Track your farm's performance and get AI-powered insights" 
              : "Transform your farming with data-driven decisions"}
          </p>
          {!isLoggedIn && (
            <div className="flex gap-4">
              <Link to="/login" className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition-colors">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {isLoggedIn && (
          <>
            {/* Quick Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-600">Analytics</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">12.5K</h3>
                <p className="text-gray-500 text-sm">Crop yield (kg)</p>
              </div>

              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Cloud className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">Weather</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {weatherData ? `${weatherData.temperature}°C` : '--'}
                </h3>
                <p className="text-gray-500 text-sm">Current temperature</p>
              </div>

              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-purple-600">Insights</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">5</h3>
                <p className="text-gray-500 text-sm">Active recommendations</p>
              </div>
            </div>

            {/* Weather Data Display */}
            {selectedField && weatherData && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Current Weather for {weatherData.location}
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Temperature</h4>
                    <p className="text-2xl font-bold text-blue-600">{weatherData.temperature}°C</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">Humidity</h4>
                    <p className="text-2xl font-bold text-green-600">{weatherData.humidity}%</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">Conditions</h4>
                    <p className="text-2xl font-bold text-purple-600">{weatherData.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Weather Tracking & Recommendations
              </h2>

              {/* Field and Date Selection */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
  <label htmlFor="field-select" className="block text-sm font-medium text-gray-700 mb-2">
    Select Field
  </label>
  <select
    id="field-select"
    value={selectedField}
    onChange={handleFieldChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
  >
    <option value="">Choose a field...</option>
    {fields.map((field) => (
      <option key={field.FIELDID} value={field.FIELDID}>
        {`Field ${field.FIELDID} - ${field.FIELDAREA} acres`}
      </option>
    ))}
  </select>
</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Toast Message */}
              {toast.show && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out">
                  {toast.message}
                </div>
              )}

              {/* Weather Data Table */}
              <DashboardWeather 
                selectedField={fields.find(f => f.FIELDID.toString() === selectedField)}
                selectedDate={selectedDate.toISOString().split('T')[0]}
              />

              {/* Recommendation Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Get Crop Recommendations</h3>
                <div className="flex gap-4">
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a crop...</option>
                    {crops.map((crop) => (
                      <option key={crop.CROPID} value={crop.CROPID}>
                        {crop.CROPNAME}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={generateRecommendation}
                    disabled={!selectedField || !selectedCrop || loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Recommendation'}
                  </button>
                </div>

                {/* Recommendation Display */}
                {recommendation && (
                  <div className="mt-6 bg-green-50 rounded-xl p-6 border border-green-100">
                    <h4 className="text-lg font-bold text-green-800 mb-4">Field Recommendations</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg">
                        <h5 className="text-sm font-semibold text-gray-600 mb-2">Crop Details</h5>
                        <p className="text-gray-800">{recommendation.cropName}</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg">
                        <h5 className="text-sm font-semibold text-gray-600 mb-2">Fertilizer</h5>
                        <p className="text-gray-800">{recommendation.fertilizerQuantity} kg/acre</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg">
                        <h5 className="text-sm font-semibold text-gray-600 mb-2">Irrigation</h5>
                        <p className="text-gray-800">{recommendation.irrigationSchedule}</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg">
                        <h5 className="text-sm font-semibold text-gray-600 mb-2">Weather Alert</h5>
                        <p className="text-gray-800">{recommendation.weatherWarning}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Data Legend</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Temperature (°C)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Humidity (%)</span>
                  </div>
                  <div className="flex items-center">
                    <ChevronUp className="w-3 h-3 text-orange-500 mr-2" />
                    <span className="text-sm text-gray-600">Increasing</span>
                  </div>
                  <div className="flex items-center">
                    <Plus className="w-3 h-3 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Stable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg mr-4">
                        <Cloud className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Weather data updated</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Tips</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Optimal Planting Time</h4>
                    <p className="text-sm text-blue-600">Consider planting during early morning or late afternoon to minimize water loss through evaporation.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">Soil Health</h4>
                    <p className="text-sm text-green-600">Regular soil testing helps maintain optimal pH levels for better crop yield.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  username: PropTypes.string,
  isLoggedIn: PropTypes.bool.isRequired,
  farmerId: PropTypes.string
};

Dashboard.defaultProps = {
  username: '',
  farmerId: ''
};

export default Dashboard;