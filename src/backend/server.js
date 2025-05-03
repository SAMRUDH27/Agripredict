const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// MySQL database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'admin',
  password: 'admin',
  database: 'agri_database',
});

// Validation Functions
function validateName(name) {
  return name && name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
}

function validateContact(contact) {
  return contact && /^\d{10}$/.test(contact);
}

function validatePassword(password) {
  return password && 
         password.length >= 8 && 
         /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password);
}

function validateLocation(location) {
  return location && location.length >= 2;
}

function validateAge(age) {
  return age && !isNaN(age) && age >= 18 && age <= 120;
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { name, location, age, contact, password } = req.body;

  // Comprehensive Validations
  if (!validateName(name)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid name. Use alphabets and spaces only.'
    });
  }

  if (!validateContact(contact)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid contact number. Use 10 digits.'
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters with letters and numbers.'
    });
  }

  if (!validateLocation(location)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid location.'
    });
  }

  if (!validateAge(age)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid age. Must be between 18-120.'
    });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM farmers WHERE ContactDetails = ?',
      [contact]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this contact number already exists',
      });
    }

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO farmers (Name, Location, Age, ContactDetails, Password) VALUES (?, ?, ?, ?, ?)',
      [name, location, age, contact, password]
    );

    res.json({ 
      success: true, 
      message: 'User registered successfully',
      farmerId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { contact, password } = req.body;

  if (!validateContact(contact)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid contact number'
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid password'
    });
  }

  try {
    const [users] = await pool.execute(
      'SELECT * FROM farmers WHERE ContactDetails = ?',
      [contact]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = users[0];

    if (user.Password !== password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Fetch user's data
    const [fields] = await pool.execute(
      'SELECT * FROM field WHERE FARMERID = ?',
      [user.FARMERID]
    );

    const [recommendations] = await pool.execute(
      'SELECT r.*, c.CROPNAME FROM recommendation r ' +
      'JOIN crop c ON r.CROPID = c.CROPID ' +
      'WHERE r.FIELDID IN (SELECT FIELDID FROM field WHERE FARMERID = ?)',
      [user.FARMERID]
    );

    const [weatherData] = await pool.execute(
      'SELECT w.* FROM weather w ' +
      'JOIN field f ON w.FIELDID = f.FIELDID ' +
      'WHERE f.FARMERID = ?',
      [user.FARMERID]
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        name: user.Name,
        contact: user.ContactDetails,
        farmerId: user.FARMERID,
        fields: fields,
        recommendations: recommendations,
        weatherData: weatherData
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Field image upload endpoint
app.post('/api/upload-field-image', upload.single('fieldImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  res.json({
    success: true,
    filePath: `/uploads/${req.file.filename}`,
    message: 'Field image uploaded successfully',
  });
});

// Updated field registration endpoint with location
app.post('/api/field', upload.single('fieldImage'), async (req, res) => {
  const { surveyNumber, farmerId, fieldArea, location } = req.body;
  const fieldImage = req.file ? req.file.filename : null;

  if (!surveyNumber || !farmerId || !fieldArea || !location || !fieldImage) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  const nutrientContent = generateNutrientContent();
  const soilMoistureLevel = generateSoilMoistureLevel();

  try {
    await pool.execute(
      'INSERT INTO field (FIELDID, FARMERID, FIELDAREA, NUTRIENTCONTENT, SOILMOISTURELEVEL, FIELDIMAGE, LOCATION) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [surveyNumber, farmerId, fieldArea, nutrientContent, soilMoistureLevel, fieldImage, location]
    );

    res.json({
      success: true,
      nutrientContent,
      soilMoistureLevel,
      message: 'Field details saved successfully'
    });
  } catch (error) {
    console.error('Error saving field details:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'Survey Number already exists' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error saving field details' 
    });
  }
});

// Weather API endpoint
app.get('/api/weather/:location/:date', async (req, res) => {
  const { location, date } = req.params;
  const API_KEY = 'ceb5b5b5b147888d6a35e03f92c5e8e3';

  try {
    const geoResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`
    );

    if (!geoResponse.data.length) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    const { lat, lon } = geoResponse.data[0];
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    res.json({
      success: true,
      weather: {
        temperature: weatherResponse.data.main.temp,
        humidity: weatherResponse.data.main.humidity,
        description: weatherResponse.data.weather[0].description,
        location: location
      }
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data'
    });
  }
});

// Get all crops endpoint
app.get('/api/crops', async (req, res) => {
  try {
    const [crops] = await pool.execute('SELECT * FROM crop');
    res.json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch crops' 
    });
  }
});

// Save weather data endpoint
app.post('/api/save-weather', async (req, res) => {
  const { fieldId, date, temperature, humidity } = req.body;

  if (!fieldId || !date || temperature === undefined || humidity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    // Check if weather data already exists for this field and date
    const [existing] = await pool.execute(
      'SELECT * FROM weather WHERE FIELDID = ? AND DATE = ?',
      [fieldId, date]
    );

    if (existing.length > 0) {
      // Update existing record
      await pool.execute(
        'UPDATE weather SET TEMPERATURE = ?, HUMIDITY = ? WHERE FIELDID = ? AND DATE = ?',
        [temperature, humidity, fieldId, date]
      );
    } else {
      // Insert new record
      await pool.execute(
        'INSERT INTO weather (FIELDID, DATE, TEMPERATURE, HUMIDITY) VALUES (?, ?, ?, ?)',
        [fieldId, date, temperature, humidity]
      );
    }

    res.json({
      success: true,
      message: 'Weather data saved successfully'
    });
  } catch (error) {
    console.error('Error saving weather data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save weather data'
    });
  }
});

// Get user fields endpoint
app.get('/api/user-fields/:farmerId', async (req, res) => {
  const { farmerId } = req.params;

  try {
    const [fields] = await pool.execute(
      'SELECT FIELDID, FIELDAREA, LOCATION FROM field WHERE FARMERID = ?',
      [farmerId]
    );

    res.json({
      success: true,
      fields
    });
  } catch (error) {
    console.error('Error fetching user fields:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fields'
    });
  }
});

// Helper functions
function generateNutrientContent() {
  const nutrients = ['High Nitrogen', 'Balanced NPK', 'Low Phosphorus', 'Rich in Potassium'];
  return nutrients[Math.floor(Math.random() * nutrients.length)];
}

function generateSoilMoistureLevel() {
  return Math.floor(Math.random() * 51) + 50;
}

function generateFertilizerQuantity() {
  return (Math.random() * (200 - 50) + 50).toFixed(1);
}

function generateIrrigationSchedule() {
  const schedules = [
    'Twice a week, morning and evening',
    'Every 3 days, early morning',
    'Once a week, deep watering',
    'Alternate days, morning irrigation',
    'Every 4 days, evening watering'
  ];
  return schedules[Math.floor(Math.random() * schedules.length)];
}

function generateWeatherWarning() {
  const warnings = [
    'Potential light frost expected',
    'Moderate heat wave predicted',
    'Chance of heavy rainfall',
    'Mild drought conditions possible',
    'Normal weather conditions expected'
  ];
  return warnings[Math.floor(Math.random() * warnings.length)];
}

// Recommendation generation endpoint
app.post('/api/generate-recommendation', async (req, res) => {
  const { fieldId, cropId } = req.body;

  if (!fieldId || !cropId) {
    return res.status(400).json({
      success: false,
      message: 'Field ID and Crop ID are required'
    });
  }

  try {
    const [fieldCheck] = await pool.execute(
      'SELECT * FROM field WHERE FIELDID = ?',
      [fieldId]
    );

    const [cropCheck] = await pool.execute(
      'SELECT * FROM crop WHERE CROPID = ?',
      [cropId]
    );

    if (fieldCheck.length === 0 || cropCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Field or Crop'
      });
    }

    const fertilizerQuantity = generateFertilizerQuantity();
    const irrigationSchedule = generateIrrigationSchedule();
    const weatherWarning = generateWeatherWarning();

    const [result] = await pool.execute(
      'INSERT INTO recommendation (FIELDID, CROPID, FERTILIZERQUANTITY, IRRIGATIONSCHEDULE, WEATHERWARNING) VALUES (?, ?, ?, ?, ?)',
      [fieldId, cropId, fertilizerQuantity, irrigationSchedule, weatherWarning]
    );

    const [cropName] = await pool.execute(
      'SELECT CROPNAME FROM crop WHERE CROPID = ?',
      [cropId]
    );

    res.json({
      success: true,
      recommendation: {
        cropName: cropName[0].CROPNAME,
        fertilizerQuantity,
        irrigationSchedule,
        weatherWarning
      }
    });
  } catch (error) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendation'
    });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});