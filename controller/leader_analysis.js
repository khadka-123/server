const LeaderAnalysisModel = require('../model/leader_analysis_model');

async function handleLeaderAnalysis(req, res) {
    try {

        // Fetch all leader data from MongoDB
        const leaderData = await LeaderAnalysisModel.find();
      
        if (!leaderData.length) {
            return res.json({ success: false, message: "No data found" });
        }

        // Object to store leader stats
        const leaderStats = {};

        leaderData.forEach((tweet) => {
            const { leader_name, sentiment_scores } = tweet;

            if (!leader_name) return;

            let parsedScore = { compound: 0.0 };
            if (typeof sentiment_scores === 'string') {
                try {
                    parsedScore = JSON.parse(sentiment_scores.replace(/'/g, '"'));
                } catch (error) {
                    console.error(`Error parsing sentiment score for ${leader_name}:`, error);
                }
            }

            // Initialize leader entry if not present
            if (!leaderStats[leader_name]) {
                leaderStats[leader_name] = {
                    total_tweets: 0,
                    positive_tweets: 0,
                    neutral_tweets: 0,
                    negative_tweets: 0
                };
            }

            // Update tweet count
            leaderStats[leader_name].total_tweets += 1;

            // Categorize sentiment
            if (parsedScore.compound >= 0.05) {
                leaderStats[leader_name].positive_tweets += 1;
            } else if (parsedScore.compound > -0.05 && parsedScore.compound < 0.05) {
                leaderStats[leader_name].neutral_tweets += 1;
            } else {
                leaderStats[leader_name].negative_tweets += 1;
            }
        });

        // Compute final scores
        const processedLeaders = Object.keys(leaderStats).map((leader_name) => {
            const stats = leaderStats[leader_name];

            const totalTweets = stats.total_tweets;
            const positive = stats.positive_tweets;
            const neutral = stats.neutral_tweets;
            const negative = stats.negative_tweets;

            // Score formula
            const score = Math.round(
                100 * ((positive + 0.5 * neutral) / totalTweets)
            );

            return {
                leader_name,
                total_tweets: totalTweets,
                score,
                positive_tweets: positive,
                neutral_tweets: neutral,
                negative_tweets: negative
            };
        });

        res.json({
            success: true,
            data: processedLeaders
        });
    } catch (error) {
        console.error("Backend error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching leader analysis data",
            error: error.message
        });
    }
}

module.exports = handleLeaderAnalysis;