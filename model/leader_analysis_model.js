const mongoose = require('mongoose');

// Using an empty schema with strict=false to allow all fields
const leaderSchema = new mongoose.Schema({}, { strict: false });

// 1) "Politician" is the Mongoose model name (internal to Mongoose).
// 2) politiciansSchema is the schema defined above.
// 3) "influential_leader" is the actual collection name in the twitter_sentiment DB.
const LeaderAnalysisModel = mongoose.model('LeaderAnalysisModel', leaderSchema, 'influential_leader_sentiment');

module.exports = LeaderAnalysisModel;
