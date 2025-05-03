import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CropManagement = () => {
  const [crops, setCrops] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/crops');
      setCrops(response.data);
    } catch (err) {
      console.error('Error fetching crops:', err);
      setError('Failed to fetch crops');
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop =>
    crop.CROPNAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.VARIETY.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            Crop Inventory Management
          </h1>
          <p className="text-gray-600">
            Track and manage your farm's crop varieties
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search crops or varieties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            />
            <span className="absolute right-3 top-3 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">⚠️</div>
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading crops...</p>
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-xl text-gray-500">
              {searchTerm ? 'No crops found matching your search' : 'No crops found in the inventory'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map(crop => (
              <div
                key={crop.CROPID}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="bg-green-50 p-4">
                  <h2 className="text-2xl font-bold text-green-800">
                    {crop.CROPNAME}
                  </h2>
                  <p className="text-green-600 mt-1">
                    {crop.VARIETY}
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">🌱</span>
                      <span>Required Area:</span>
                    </div>
                    <span className="font-medium">{crop.ACRESREQUIRED} acres</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">📅</span>
                      <span>Growth Period:</span>
                    </div>
                    <span className="font-medium">{crop.DAYS_TO_GROW} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CropManagement;