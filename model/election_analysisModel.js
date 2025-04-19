const mongoose = require('mongoose');

// Using an empty schema with strict=false to allow all fields
const electionSchema = new mongoose.Schema({}, { strict: false });

// 1) "Politician" is the Mongoose model name (internal to Mongoose).

// 3) "influential_leader" is the actual collection name in the twitter_sentiment DB.
const ElectionAnalysisModel = mongoose.model('ElectionAnalysisModel', electionSchema, 'election_sentiment');

module.exports = ElectionAnalysisModel;
