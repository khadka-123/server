const ElectionAnalysisModel = require('../model/election_analysisModel');
const Tweet = require('../model/election_prediction_model');

async function handleElectionAnalysis(req, res) {
  try {
    const party = req.params.party;

    const electionData = await ElectionAnalysisModel.find({ 
      Username: party
    });


    // Send the data to the frontend
    res.json({
      success: true,
      data: {
        election_analysis: electionData
      }
    });
  } catch (error) {
    // console.error("Error fetching election analysis data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching election analysis data",
      error: error.message
    });
  }
}

function getPartyFromUsername(tweetText = '') {
  const lowerText = tweetText.toLowerCase();
  if (lowerText.includes('bjp') || lowerText.includes('bjp4india') || lowerText.includes('modi')) {
    return 'BJP';
  }
  if (lowerText.includes('congress') || lowerText.includes('inc') || lowerText.includes('incindia') || lowerText.includes('rahul gandhi')) {
    return 'Congress';
  }
  if (lowerText.includes('aap') || lowerText.includes('aamaadmiparty')) {
    return 'AAP';
  }
}

// Simpler extraction using substring search and regex
function extractCompound(sentimentScores) {
  if (typeof sentimentScores === 'string') {
    const compoundIndex = sentimentScores.indexOf('compound');
    if (compoundIndex !== -1) {
      const colonIndex = sentimentScores.indexOf(':', compoundIndex);
      if (colonIndex !== -1) {
        const substring = sentimentScores.substring(colonIndex + 1);
        const match = substring.match(/([-+]?[0-9]*\.?[0-9]+)/);
        if (match && match[1]) {
          return parseFloat(match[1]);
        }
      }
    }
    return 0;
  }
  return sentimentScores?.compound || 0;
}

const predefinedTopics = [
  { topic: 'Economy', keywords: ['economy', 'economic'] },
  { topic: 'Healthcare Reform', keywords: ['healthcare', 'health reform', 'medical reform'] },
  { topic: 'Immigration', keywords: ['immigration', 'immigrants', 'migrant', 'illegal'] },
  { topic: 'National Security', keywords: ['national security', 'security', 'terrorism', 'police', 'armed forces', 'army'] },
  { topic: 'Climate Change', keywords: ['climate change', 'global warming', "weather"] },
  { topic: 'Education', keywords: ['education', 'schools', 'university', 'college'] },
  { topic: 'IT', keywords: ['information technology', 'tech'] },
  { topic: 'Finance', keywords: ['financial', 'financials', 'banking', 'finance', 'money'] },
];

function extractTrendingTopics(tweets) {
  const topicCounts = {};
  // Initialize counts for each predefined topic.
  predefinedTopics.forEach(({ topic }) => {
    topicCounts[topic] = 0;
  });

  tweets.forEach((tweet) => {
    const text = (tweet.cleaned_tweet || '').toLowerCase();
    predefinedTopics.forEach(({ topic, keywords }) => {
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          topicCounts[topic] += 1;
        }
      });
    });
  });

  // Sort topics by frequency (highest first)
  const sortedTopics = Object.entries(topicCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);

  // Return the top 2 trending topics for the party (adjust the number as needed)
  return sortedTopics.slice(0, 2);
}

function aggregateTweets(tweets) {
  const partyTotals = {};
  const partyTweets = {};
  // console.log("Debug - first 10 tweets:", tweets.slice(0, 10));
  tweets.forEach((tweet) => {
    const party = getPartyFromUsername(tweet.Username);
    if (!partyTotals[party]) {
      partyTotals[party] = {
        likes: 0,
        retweets: 0,
        tweetCount: 0,
        sentimentScoreSum: 0,
        positiveTweets: 0,
        negativeTweets: 0,
        neutralTweets: 0,
        trendingTopics: [] // Initialize trendingTopics for each party
      };
      partyTweets[party] = []; // Collect tweets for trending analysis
    }
    
    partyTotals[party].likes += tweet.likeCount || 0;
    partyTotals[party].retweets += tweet.Retweets || 0;
    partyTotals[party].tweetCount += 1;

    const compound = extractCompound(tweet.sentiment_scores);
    // Adding 1 to the compound (to avoid negatives) before summing
    partyTotals[party].sentimentScoreSum += (compound + 1);

    if (compound >= 0.05) {
      partyTotals[party].positiveTweets += 1;
    } else if (compound <= -0.05) {
      partyTotals[party].negativeTweets += 1;
    } else {
      partyTotals[party].neutralTweets += 1;
    }

    // Collect tweet for trending topics
    partyTweets[party].push(tweet);
  });

  
  // First, update each party with a combined score that includes engagement
  Object.keys(partyTotals).forEach((party) => {
    // Adjust the scaling factor as needed. Here, likes and retweets are multiplied by 0.1, then divided by 100.
    const engagementScore = (partyTotals[party].likes * 0.1 + partyTotals[party].retweets * 0.1) / 100;
    partyTotals[party].combinedScore = partyTotals[party].sentimentScoreSum*15 + engagementScore;
  });

  // Recompute totalScaledScore using the combinedScore for each party raised to the power of 3
  const totalScaledScore = Object.values(partyTotals).reduce(
    (sum, p) => sum + Math.pow(p.combinedScore, 15),
    0
  );

  // Now calculate vote percentage based on the combined score
  Object.keys(partyTotals).forEach((party) => {
    const scaledScore = Math.pow(partyTotals[party].combinedScore,15);
    const pct = totalScaledScore ? (scaledScore / totalScaledScore) * 100 : 0;
    partyTotals[party].votePercentage = +pct.toFixed(2);

    // Dynamically extract trending topics for this party using predefined topics
    partyTotals[party].trendingTopics = extractTrendingTopics(partyTweets[party]);
    // console.log(`Trending topics for ${party}:`, partyTotals[party].trendingTopics);
  });

  return partyTotals;
}

async function getElectionPrediction(req, res) {
  try {
    const tweets = await Tweet.find({});
    const aggregatedData = aggregateTweets(tweets);
    
    res.json(aggregatedData);
  } catch (err) {
    console.error('Error retrieving tweets:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getElectionPrediction,
  handleElectionAnalysis,
};