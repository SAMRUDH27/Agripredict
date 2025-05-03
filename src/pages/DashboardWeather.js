import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronUp,
  Plus,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const DashboardWeather = ({ selectedField, selectedDate }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState({});

  // Function to generate dates for the next 7 days
  const generateWeekDates = (startDate) => {
    const dates = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Function to generate mock weather data
  const generateMockWeatherData = (dates) => {
    return dates.map(date => ({
      date: date.toISOString().split('T')[0],
      temperature: Math.floor(Math.random() * (32 - 20) + 20),
      humidity: Math.floor(Math.random() * (90 - 40) + 40),
      trend: Math.random() > 0.5 ? 'up' : 'stable'
    }));
  };

  // Save weather data
  const handleSaveWeather = async (dayData) => {
    if (!selectedField?.FIELDID) {
      setError('No field selected');
      return;
    }

    setSaveLoading(prev => ({ ...prev, [dayData.date]: true }));

    try {
      const response = await axios.post('http://localhost:5000/api/save-weather', {
        fieldId: selectedField.FIELDID,
        date: dayData.date,
        temperature: dayData.temperature.toString(),
        humidity: dayData.humidity
      });

      if (response.data.success) {
        // Show success message (you can implement a toast notification here)
        alert('Weather data saved successfully');
      } else {
        setError('Failed to save weather data');
      }
    } catch (err) {
      console.error('Error saving weather data:', err);
      setError('Error saving weather data');
    } finally {
      setSaveLoading(prev => ({ ...prev, [dayData.date]: false }));
    }
  };

  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!selectedField?.LOCATION || !selectedDate) return;
      
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get(
          `http://localhost:5000/api/weather/${encodeURIComponent(selectedField.LOCATION)}/${selectedDate}`
        );
        
        if (response.data.success) {
          const weekDates = generateWeekDates(selectedDate);
          const mockData = generateMockWeatherData(weekDates);
          
          mockData[0] = {
            ...mockData[0],
            temperature: response.data.weather.temperature,
            humidity: response.data.weather.humidity
          };
          
          setWeeklyData(mockData);
        } else {
          setError('Failed to fetch weather data');
        }
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Error loading weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedField, selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center bg-red-50 text-red-700 p-4 rounded-lg">
        <AlertTriangle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {weeklyData.map((data, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(data.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-orange-500 font-medium">{data.temperature.toFixed(1)}°C</span>
                  {data.trend === 'up' && <ChevronUp className="h-4 w-4 ml-2 text-orange-500" />}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-blue-500 font-medium">{data.humidity}%</span>
                  <Plus className="h-4 w-4 ml-2 text-blue-500" />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSaveWeather(data)}
                  disabled={saveLoading[data.date]}
                >
                  {saveLoading[data.date] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardWeather;