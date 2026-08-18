// js/taxonomy.js

const CLUSTERS = {
    "Software Engineering / Technology Career": [
        "java", "programming", "software-engineering", "career", 
        "tech", "interview", "coding", "dsa", "hardware", 
        "developer", "system-design", "computer-science", 
        "backend", "frontend", "architecture"
    ],
    "Gaming & Esports": ["gaming", "esports", "valorant"],
    "Entertainment & Comedy": ["funny", "animals", "meme", "joke"],
    "Health & Fitness": ["workout", "health", "gym"],
    "Lifestyle": ["coffee", "food", "aesthetic", "vlog"]
};

// Maps a tag to its broader cluster
function getClusterForTag(tag) {
    for (const [cluster, tags] of Object.entries(CLUSTERS)) {
        if (tags.includes(tag.toLowerCase())) {
            return cluster;
        }
    }
    return "Other";
}

function calculateSignalWeight(interaction) {
    let weight = 0;
    
    // Positive signals
    if (interaction.saved) weight += 3;
    if (interaction.liked) weight += 2;
    if (interaction.replayed) weight += 2;
    if (interaction.watchedPercentage >= 80) weight += 1;
    
    // Negative signals (skip or very low watch time without likes/saves)
    if (interaction.skipped) {
        weight -= 2;
    } else if (interaction.watchedPercentage < 20 && !interaction.liked && !interaction.saved) {
        weight -= 1;
    }

    return weight;
}

function detectInterest(watchedHistory) {
    const clusterScores = {};
    const clusterEvidence = {};
    const clusterTags = {}; // To measure diversity
    let totalMeaningfulSignals = 0;

    watchedHistory.forEach(item => {
        const { reel, interaction } = item;
        const weight = calculateSignalWeight(interaction);
        
        // Even if weight is 0, we might ignore. But we process all.
        if (weight !== 0) {
            totalMeaningfulSignals++;
            
            // Generate a reason for evidence
            let reason = "";
            if (weight > 0) {
                if (interaction.saved) reason += "Saved ";
                else if (interaction.liked) reason += "Liked ";
                else if (interaction.replayed) reason += "Replayed ";
                else reason += "Watched completely ";
            } else {
                reason = "Skipped/Ignored ";
            }

            reel.tags.forEach(tag => {
                const cluster = getClusterForTag(tag);
                
                if (!clusterScores[cluster]) {
                    clusterScores[cluster] = 0;
                    clusterEvidence[cluster] = [];
                    clusterTags[cluster] = new Set();
                }

                clusterScores[cluster] += weight;
                clusterTags[cluster].add(tag);

                // Add to evidence if it's a positive contribution towards a positive score
                // Or if it's a negative contribution, we track it but mainly we care about the top cluster
                clusterEvidence[cluster].push({
                    reelId: reel.id,
                    reelTitle: reel.title,
                    contribution: `${reason} (${weight > 0 ? '+' : ''}${weight} weight via '${tag}')`
                });
            });
        }
    });

    if (Object.keys(clusterScores).length === 0) {
        return { detectedInterest: null, evidence: [], confidence: "Low", signalCount: 0 };
    }

    // Find the highest scoring cluster
    let topCluster = null;
    let maxScore = -Infinity;

    for (const [cluster, score] of Object.entries(clusterScores)) {
        if (score > maxScore) {
            maxScore = score;
            topCluster = cluster;
        }
    }

    if (!topCluster || maxScore <= 0) {
        return { detectedInterest: null, evidence: [], confidence: "Low", signalCount: 0 };
    }

    // Calculate confidence based on diversity of tags and total score
    const uniqueTagsInCluster = clusterTags[topCluster].size;
    let confidence = "Low";

    if (maxScore >= 8 && uniqueTagsInCluster >= 3) {
        confidence = "High";
    } else if (maxScore >= 4 && uniqueTagsInCluster >= 2) {
        confidence = "Medium";
    }

    // Filter evidence to just show the relevant ones for the top cluster (positive mostly)
    const topEvidence = clusterEvidence[topCluster].filter(e => e.contribution.includes('+'));

    // Also include strong negative signals for other clusters as comparative evidence
    // e.g., "Skipped Entertainment"
    for (const [cluster, evidenceList] of Object.entries(clusterEvidence)) {
        if (cluster !== topCluster) {
            const negativeEvidences = evidenceList.filter(e => e.contribution.includes('-'));
            if (negativeEvidences.length > 0) {
                // Just add the most prominent negative evidence as reinforcement
                topEvidence.push({
                    reelId: negativeEvidences[0].reelId,
                    reelTitle: negativeEvidences[0].reelTitle,
                    contribution: `Reinforced by rejecting ${cluster} content`
                });
            }
        }
    }

    return {
        detectedInterest: topCluster,
        evidence: topEvidence,
        confidence: confidence,
        signalCount: totalMeaningfulSignals,
        score: maxScore
    };
}
