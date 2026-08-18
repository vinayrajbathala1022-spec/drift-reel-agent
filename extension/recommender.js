// extension/recommender.js — tag-level matching for real variety

function recommend(detectedInterest, watchedHistory) {
    if (!detectedInterest || !watchedHistory) return [];

    console.log("[Drift] Detected interest/tags:", detectedInterest);

    // Collect ALL tags the user actually watched (positive signals only)
    const watchedTags = new Set();
    const watchedTagWeights = {};
    (watchedHistory || []).forEach(function(item) {
        const pct = item.interaction.watchedPercentage || 0;
        if (pct > 30 || item.interaction.replayed || item.interaction.liked || item.interaction.saved) {
            (item.reel.tags || []).forEach(function(tag) {
                watchedTags.add(tag);
                watchedTagWeights[tag] = (watchedTagWeights[tag] || 0) + (pct / 100);
            });
        }
    });

    console.log("[Drift] Watched tags with weights:", watchedTagWeights);

    const scored = [];

    (recommendationCandidates || []).forEach(function(candidate) {
        if (candidate.isHype) return;

        // 1. CLUSTER MATCH — does this candidate belong to the detected cluster?
        let clusterScore = 0;
        (candidate.tags || []).forEach(function(tag) {
            const cl = (typeof getClusterForTag !== "undefined") ? getClusterForTag(tag) : "Other";
            if (cl === detectedInterest) clusterScore += 2;
        });

        // 2. TAG OVERLAP — how many of user's actual watched tags does this candidate share?
        let tagOverlapScore = 0;
        let matchedWatchedTags = [];
        (candidate.tags || []).forEach(function(tag) {
            if (watchedTags.has(tag)) {
                tagOverlapScore += 3 * (watchedTagWeights[tag] || 1);
                matchedWatchedTags.push(tag);
            }
        });

        // 3. FALLBACK — if zero overlap, try keyword substring match on interest name
        let fallbackScore = 0;
        if (clusterScore === 0 && tagOverlapScore === 0) {
            const iLower = detectedInterest.toLowerCase();
            (candidate.tags || []).forEach(function(tag) {
                if (iLower.indexOf(tag.toLowerCase()) !== -1) fallbackScore += 1;
            });
            if (fallbackScore === 0 && candidate.category) {
                const cat = candidate.category.toLowerCase();
                const words = iLower.split(/[\s/&]+/);
                words.forEach(function(w) { if (w.length > 3 && cat.indexOf(w) !== -1) fallbackScore += 1; });
            }
        }

        const totalRelevance = clusterScore + tagOverlapScore + fallbackScore;
        if (totalRelevance === 0) return; // genuinely irrelevant

        // 4. NOVELTY — penalize if candidate covers same ground as what was already watched
        let noveltyPenalty = 0;
        let noveltyScore = 4;
        let repeatedTags = [];
        (candidate.tags || []).forEach(function(tag) {
            if (matchedWatchedTags.indexOf(tag) !== -1) {
                noveltyPenalty += 1;
                noveltyScore = Math.max(0, noveltyScore - 1);
                repeatedTags.push(tag);
            }
        });

        const finalScore = totalRelevance
                         + (candidate.educationalValue  || 0)
                         + (candidate.technicalDepth    || 0)
                         + noveltyScore
                         - noveltyPenalty;

        // Build per-candidate reason
        let reason = "";
        if (matchedWatchedTags.length > 0) {
            reason = "You engaged with content about " + matchedWatchedTags.slice(0,2).join(" & ") + ". This goes deeper into that space at " + candidate.difficulty + " level.";
        } else if (clusterScore > 0) {
            reason = "Fits your " + detectedInterest + " interest. Rated " + (candidate.educationalValue||"?") + "/10 for educational value.";
        } else {
            reason = "Expands beyond your primary interest into " + candidate.category + " — high quality, low repetition.";
        }

        scored.push({ reel: candidate, reason: reason, score: finalScore, tagOverlap: tagOverlapScore, clusterScore: clusterScore });
    });

    // Sort by score descending
    scored.sort(function(a, b) { return b.score - a.score; });

    // Build diverse top-3:
    //   Slot 1: best cluster+tag match
    //   Slot 2: best from DIFFERENT category than slot 1
    //   Slot 3: wildcard — best educational value from ANY unseen category
    const top3 = [];
    const usedIds = new Set();
    const usedCats = new Set();

    // Slot 1 — top scorer
    if (scored.length > 0) {
        top3.push(scored[0]);
        usedIds.add(scored[0].reel.id);
        usedCats.add(scored[0].reel.category);
    }

    // Slot 2 — best with different category
    for (var i = 1; i < scored.length; i++) {
        if (usedIds.has(scored[i].reel.id)) continue;
        if (!usedCats.has(scored[i].reel.category)) {
            top3.push(scored[i]);
            usedIds.add(scored[i].reel.id);
            usedCats.add(scored[i].reel.category);
            break;
        }
    }
    // If no different category found, just take next best
    if (top3.length < 2 && scored.length > 1) {
        for (var j = 1; j < scored.length; j++) {
            if (!usedIds.has(scored[j].reel.id)) {
                top3.push(scored[j]);
                usedIds.add(scored[j].reel.id);
                break;
            }
        }
    }

    // Slot 3 — wildcard: highest educationalValue from any unused id
    var wildcard = null;
    var bestEdu = -1;
    scored.forEach(function(item) {
        if (!usedIds.has(item.reel.id) && (item.reel.educationalValue||0) > bestEdu) {
            bestEdu = item.reel.educationalValue || 0;
            wildcard = item;
        }
    });
    if (wildcard) {
        wildcard.reason = "High educational value pick (" + (wildcard.reel.educationalValue||"?") + "/10). Broadens your knowledge beyond what you've already seen.";
        top3.push(wildcard);
    } else if (top3.length < 3) {
        // Last resort: fill from remaining scored
        for (var k = 0; k < scored.length && top3.length < 3; k++) {
            if (!usedIds.has(scored[k].reel.id)) {
                top3.push(scored[k]);
                usedIds.add(scored[k].reel.id);
            }
        }
    }

    console.log("[Drift] Top 3 recommendations:", top3.map(function(r) { return r.reel.title + " (score:" + r.score.toFixed(1) + ")"; }));
    return top3;
}