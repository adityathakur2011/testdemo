const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection setup
const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'heart_rate_monitor',
  password: 'password',  // Use env vars in production!
  port: 5432,
});

app.use(bodyParser.json());

/**
 * MODEL LOGIC
 */
const HeartRateModel = {
  // Simulate getting real-time heart rate data
  getRealTimeData: async () => {
    return {
      timestamp: new Date().toISOString(),
      heartRate: 72,
    };
  },

  // Query historical heart rate data between startDate and endDate
  getHistoricalData: async (startDate, endDate) => {
    const result = await db.query(
      'SELECT * FROM heart_rate_data WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp ASC',
      [startDate, endDate]
    );
    return result.rows;
  },

  // Return aggregated heart rate data based on the type requested
  getAggregatedData: async (type) => {
    if (type === 'weekly_resting') {
      return [
        { day: 'Monday', averageRestingRate: 65 },
        { day: 'Tuesday', averageRestingRate: 68 },
        { day: 'Wednesday', averageRestingRate: 66 },
        // More days...
      ];
    }
    return [];
  },

  // Return heart rate zone durations (mocked)
  getHeartRateZones: async (workoutId) => {
    return {
      zones: {
        peak: '10 minutes',
        cardio: '25 minutes',
        fatBurn: '15 minutes',
        rest: '5 minutes',
      },
    };
  },
};

/**
 * CONTROLLERS
 */
const heartRateController = {
  getRealTimeHeartRate: async (req, res) => {
    try {
      const data = await HeartRateModel.getRealTimeData();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve real-time heart rate data.' });
    }
  },

  getHistoricalHeartRateData: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const data = await HeartRateModel.getHistoricalData(startDate, endDate);
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve historical heart rate data.' });
    }
  },

  getAggregatedHeartRateData: async (req, res) => {
    try {
      const { type } = req.query;
      const data = await HeartRateModel.getAggregatedData(type);
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve aggregated heart rate data.' });
    }
  },

  getHeartRateZones: async (req, res) => {
    try {
      const { workoutId } = req.query;
      const data = await HeartRateModel.getHeartRateZones(workoutId);
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve heart rate zones data.' });
    }
  },
};

/**
 * ROUTES
 */
app.get('/heart-rate/real-time', heartRateController.getRealTimeHeartRate);
app.get('/heart-rate/history', heartRateController.getHistoricalHeartRateData);
app.get('/heart-rate/aggregate', heartRateController.getAggregatedHeartRateData);
app.get('/heart-rate/zones', heartRateController.getHeartRateZones);

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;  // For testing purposes if needed
