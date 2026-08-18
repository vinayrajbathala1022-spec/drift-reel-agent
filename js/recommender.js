// js/recommender.js

function recommend(detectedInterest, watchedHistory) {
    if (!detectedInterest) return null;

    let bestCandidate = null;
    let maxScore = -Infinity;
    let bestReason = "";

    // Extract exact tags watched with positive signals to calculate repetition penalty
    const watchedTags = new Set();
    watchedHistory.forEach(item => {
        if (item.interaction.liked || item.interaction.saved || item.interaction.replayed || item.interaction.watchedPercentage > 50) {
            item.reel.tags.forEach(tag => watchedTags.add(tag));
        }
    });

    recommendationCandidates.forEach(candidate => {
        // Strict Hype Exclusion
        if (candidate.isHype) return;

        // Check relevance
        let relevanceScore = 0;
        let isRelevant = false;
        
        candidate.tags.forEach(tag => {
            const cluster = getClusterForTag(tag);
            if (cluster === detectedInterest) {
                isRelevant = true;
                relevanceScore += 3;
            }
        });

        if (!isRelevant) return; // Only recommend from the detected broader cluster

        // Calculate Repetition Penalty
        let repetitionPenalty = 0;
        let noveltyScore = 3; // Base novelty
        
        let repeatedTags = [];
        candidate.tags.forEach(tag => {
            if (watchedTags.has(tag)) {
                repetitionPenalty += 2;
                noveltyScore -= 1;
                repeatedTags.push(tag);
            }
        });

        // Calculate Final Score
        // formula: relevance + educationalValue + technicalDepth + novelty - hypePenalty (which is infinite if isHype=true, handled above) - repetitionPenalty
        const score = relevanceScore 
                    + candidate.educationalValue 
                    + candidate.technicalDepth 
                    + noveltyScore 
                    - repetitionPenalty;

        if (score > maxScore) {
            maxScore = score;
            bestCandidate = candidate;
            
            bestReason = `Strong match for ${detectedInterest}. `;
            if (repeatedTags.length === 0) {
                bestReason += `Provides novel technical content (${candidate.difficulty}) instead of repeating surface topics. `;
            } else {
                bestReason += `Deepens your knowledge in ${repeatedTags.join(', ')} with high educational value. `;
            }
        }
    });

    if (!bestCandidate) return null;

    return {
        reel: bestCandidate,
        reason: bestReason,
        score: maxScore
    };
}
