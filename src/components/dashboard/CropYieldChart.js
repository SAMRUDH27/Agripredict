import React from 'react';
import { Line } from 'recharts';
import { 
  LineChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const CropYieldChart = ({ isLoggedIn }) => {
  const data = [
    { month: 'Jan', yield: 30 },
    { month: 'Feb', yield: 40 },
    { month: 'Mar', yield: 35 },
    { month: 'Apr', yield: 50 },
    { month: 'May', yield: 70 },
    { month: 'Jun', yield: 60 },
    { month: 'Jul', yield: 80 }
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold text-green-600 mb-3">Crop Yield</h3>
      
      {isLoggedIn ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="yield" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 text-center text-sm">Login to view crop yield</p>
      )}
    </div>
  );
};

export default CropYieldChart;