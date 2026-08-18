// extension/taxonomy.js — Expanded cluster coverage (unchanged algorithm, only keyword maps)

const CLUSTERS = {
    // -- Tech & Career (broad — catches coding memes, interview jokes, laptop reviews, etc.) --
    "Software Engineering / Technology Career": [
        // Languages & stacks
        "java", "python", "javascript", "typescript", "rust", "go", "kotlin", "swift", "cpp",
        "react", "angular", "vue", "node", "spring", "django", "rails", "flutter",
        // Roles & concepts
        "programming", "software-engineering", "developer", "engineer", "coding", "coder",
        "backend", "frontend", "fullstack", "devops", "cloud", "architecture", "system-design",
        // Career / interview
        "career", "interview", "internship", "resume", "leetcode", "dsa", "algorithms",
        "data-structures", "computer-science",
        // Hardware / gadgets
        "hardware", "laptop", "gpu", "cpu", "macbook", "processor", "chip", "apple-silicon",
        "ram", "specs", "benchmark", "review",
        // AI / ML when framed as engineering
        "ai", "ml", "machine-learning", "llm", "gpt", "neural-network", "deep-learning",
        "data-science", "nlp",
        // Tech news / industry
        "tech", "startup", "layoffs", "big-tech", "faang", "silicon-valley", "product",
        // Meme signals (trap case — still maps to the right cluster)
        "meme", "joke", "semicolon", "segfault", "null-pointer", "stackoverflow"
    ],

    // -- Gaming & Esports --
    "Gaming & Esports": [
        "gaming", "gamer", "esports", "tournament", "ranked",
        "valorant", "csgo", "apex", "fortnite", "minecraft", "roblox", "lol", "dota",
        "fps", "rpg", "mmorpg", "speedrun", "clutch", "pro-player", "vct",
        "console", "playstation", "xbox", "nintendo", "switch", "steam",
        "streamer", "twitch", "gameplay", "montage", "highlight"
    ],

    // -- Entertainment & Comedy --
    "Entertainment & Comedy": [
        "funny", "lol", "hilarious", "humor", "comedy", "prank", "skit", "parody",
        "animals", "cats", "dogs", "cute", "adorable", "wholesome",
        "viral", "trending", "reaction", "fails", "bloopers", "roast",
        "celebrity", "movie", "series", "netflix", "trailer", "spoiler",
        "music", "song", "cover", "dance", "choreography"
    ],

    // -- Health & Fitness --
    "Health & Fitness": [
        "workout", "gym", "fitness", "exercise", "training", "bodybuilding", "crossfit",
        "health", "nutrition", "diet", "calories", "protein", "meal-prep",
        "running", "cycling", "yoga", "meditation", "mindfulness", "sleep",
        "weight-loss", "muscle", "gains", "cardio", "hiit", "stretching",
        "mental-health", "anxiety", "wellness", "recovery"
    ],

    // -- Lifestyle & Aesthetic --
    "Lifestyle": [
        "coffee", "espresso", "barista", "cafe", "food", "recipe", "cooking", "baking",
        "restaurant", "vlog", "day-in-the-life", "routine", "aesthetic", "minimal",
        "travel", "adventure", "explore", "roadtrip", "beach", "hiking",
        "fashion", "outfit", "style", "thrift", "sustainable",
        "productivity", "journaling", "notion", "study-with-me", "focus"
    ]
};

// Maps a tag to its broader cluster — UNCHANGED algorithm
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
    if (interaction.saved) weight += 3;
    if (interaction.liked) weight += 2;
    if (interaction.replayed) weight += 2;
    if (interaction.watchedPercentage >= 80) weight += 1;
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
    const clusterTags = {};
    let totalMeaningfulSignals = 0;

    watchedHistory.forEach(item => {
        const { reel, interaction } = item;
        const weight = calculateSignalWeight(interaction);
        if (weight !== 0) {
            totalMeaningfulSignals++;
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
                clusterEvidence[cluster].push({
                    reelId: reel.id,
                    reelTitle: reel.title,
                    contribution: `${reason} (${weight > 0 ? "+" : ""}${weight} weight via "${tag}")`
                });
            });
        }
    });

    if (Object.keys(clusterScores).length === 0) {
        return { detectedInterest: null, evidence: [], confidence: "Low", signalCount: 0 };
    }

    let topCluster = null;
    let maxScore = -Infinity;
    for (const [cluster, score] of Object.entries(clusterScores)) {
        if (score > maxScore) { maxScore = score; topCluster = cluster; }
    }

    if (!topCluster || maxScore <= 0) {
        return { detectedInterest: null, evidence: [], confidence: "Low", signalCount: 0 };
    }

    const uniqueTagsInCluster = clusterTags[topCluster].size;
    let confidence = "Low";
    if (maxScore >= 8 && uniqueTagsInCluster >= 3) {
        confidence = "High";
    } else if (maxScore >= 4 && uniqueTagsInCluster >= 2) {
        confidence = "Medium";
    }

    const topEvidence = clusterEvidence[topCluster].filter(e => e.contribution.includes("+"));
    for (const [cluster, evidenceList] of Object.entries(clusterEvidence)) {
        if (cluster !== topCluster) {
            const neg = evidenceList.filter(e => e.contribution.includes("-"));
            if (neg.length > 0) {
                topEvidence.push({
                    reelId: neg[0].reelId,
                    reelTitle: neg[0].reelTitle,
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

