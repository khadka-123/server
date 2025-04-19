const express = require('express');
const router = express.Router();
const { getElectionPrediction } = require('../controller/election_analysis');

router.get('', getElectionPrediction);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');

// const PredictionSchema = new mongoose.Schema({}, { strict: false }); 
// const Prediction = mongoose.model('Prediction', PredictionSchema, 'election_sentiment');

// router.get('', async (req, res) => {
//     try {
//         const predictions = await Prediction.find().limit(5); // Fetch first 5 documents
//         res.json(predictions);
//     } catch (error) {
//         res.status(500).json({ error: 'Database connection error' });
//     }
// });

// module.exports = router;