import React from 'react';
// For Heroicons v1
// src/components/dashboard/WeatherForecast.js
import { SunIcon, CloudIcon } from '../../icons';




const WeatherForecast = ({ isLoggedIn }) => {
  const weatherData = [
    { day: 'Mon', icon: SunIcon, temp: '28°C' },
    { day: 'Tue', icon: CloudIcon, temp: '25°C' },
    { day: 'Wed', icon: SunIcon, temp: '24°C' },
    { day: 'Thu', icon: SunIcon, temp: '27°C' },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-600 mb-4">Weather Forecast</h3>
      
      {isLoggedIn ? (
        <div className="flex justify-between">
          {weatherData.map(({ day, icon: Icon, temp }) => (
            <div key={day} className="text-center">
              <p className="font-medium">{day}</p>
              <Icon className="h-10 w-10 text-green-500 mx-auto my-2" />
              <p className="font-bold">{temp}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">Login to view weather forecast</p>
      )}
    </div>
  );
};

export default WeatherForecast;