const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  Datetime: Date,
  Text: String,
  Username: String,
  likeCount: Number,
  Retweets: Number,
  Replycount: Number,
  user_followers: Number,
  user_verified: Boolean,
  user_location: String,
  cleaned_tweet: String,
  sentiment_scores: String,
  sentiment: String,
});

const Tweet = mongoose.model('Tweet', tweetSchema, 'election_sentiment');

module.exports = Tweet;