import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Upload,
  X,
  AlertCircle,
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react';

const FieldEntry = ({ username, farmerId }) => {
  const [surveyNumber, setSurveyNumber] = useState('');
  const [fieldArea, setFieldArea] = useState('');
  const [location, setLocation] = useState('');
  const [fieldImage, setFieldImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!farmerId) {
      showToast('Please log in first', 'error');
      navigate('/login');
    }
  }, [farmerId, navigate]);

  const handleSurveyNumberChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setSurveyNumber(value);
      setError('');
    }
  };

  const handleFieldAreaChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFieldArea(value);
      setError('');
    }
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    setFieldImage(file);
    setError('');
  };

  const removeImage = () => {
    setFieldImage(null);
  };

  const handleSave = async () => {
    if (!farmerId) {
      showToast('Authentication error. Please log in again.', 'error');
      navigate('/login');
      return;
    }

    if (!surveyNumber || !fieldArea || !fieldImage || !location) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('surveyNumber', surveyNumber);
    formData.append('fieldImage', fieldImage);
    formData.append('farmerId', farmerId);
    formData.append('fieldArea', fieldArea);
    formData.append('location', location);

    try {
      const response = await axios.post('http://localhost:5000/api/field', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setAnalysis({
          nutrientContent: response.data.nutrientContent,
          soilMoistureLevel: response.data.soilMoistureLevel
        });
        showToast('Field details saved successfully', 'success');
        setSurveyNumber('');
        setFieldArea('');
        setLocation('');
        setFieldImage(null);
      } else {
        showToast(response.data.message || 'Failed to save field details', 'error');
      }
    } catch (error) {
      console.error('Error saving field details:', error);
      if (error.response) {
        showToast(error.response.data.message || 'Error saving field details', 'error');
      } else if (error.request) {
        showToast('No response from server. Please check your connection.', 'error');
      } else {
        showToast('Error processing your request', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out flex items-center`;
    
    const icon = document.createElement('span');
    icon.className = 'mr-2';
    icon.innerHTML = type === 'success' ? '✓' : '⚠';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Add New Field</h1>
          <p className="text-gray-600 mt-2">Enter your field details below</p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="flex items-center bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Survey Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Number
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={surveyNumber}
                onChange={handleSurveyNumberChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Enter survey number (integers only)"
              />
            </div>

            {/* Field Area Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Area (acres)
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fieldArea}
                onChange={handleFieldAreaChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Enter field area in acres"
              />
            </div>
            {/* New Location Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={handleLocationChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Enter field location (city or coordinates)"
              />
            </div>


            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Image
                <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!fieldImage ? (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your field image here, or
                    </p>
                    <label className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors">
                      Browse Files
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Maximum file size: 5MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(fieldImage)}
                      alt="Field Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Field Details
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/')}
                disabled={isLoading}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="mt-8 bg-green-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-xl font-bold text-green-800 mb-4">Field Analysis Results</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Nutrient Content</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {analysis.nutrientContent}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Soil Moisture</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {analysis.soilMoistureLevel}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldEntry;