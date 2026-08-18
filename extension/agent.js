// extension/agent.js

class DriftAgent {
    constructor() {
        this.state = "IDLE";              // IDLE, OBSERVING, LEARNING, PATTERN_DETECTED
        this.watchedHistory = [];
        this.currentInterest = null;
        this.currentRecommendation = null; // kept for subscriber compat (first item)
        this.currentRecommendations = [];  // NEW: top-3 array
        this.listeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(function(cb) {
            cb(this.state, this.currentInterest, this.currentRecommendation);
        }, this);
    }

    recordInteraction(reel, interaction) {
        const idx = this.watchedHistory.findIndex(function(h) { return h.reel.id === reel.id; });
        if (idx >= 0) {
            const ex = this.watchedHistory[idx].interaction;
            this.watchedHistory[idx].interaction = {
                watchedPercentage: Math.max(ex.watchedPercentage || 0, interaction.watchedPercentage || 0),
                liked:   ex.liked   || interaction.liked,
                saved:   ex.saved   || interaction.saved,
                skipped: ex.skipped || interaction.skipped,
                replayed: ex.replayed || interaction.replayed
            };
        } else {
            this.watchedHistory.push({ reel: reel, interaction: interaction });
        }
        this.evaluate();
    }

    evaluate() {
        const result = detectInterest(this.watchedHistory);
        this.currentInterest = result;

        if (!result.detectedInterest || result.signalCount === 0) {
            this.state = "IDLE";
            this.currentRecommendation  = null;
            this.currentRecommendations = [];
        } else if (result.confidence === "Low") {
            this.state = result.signalCount > 1 ? "LEARNING" : "OBSERVING";
            this.currentRecommendation  = null;
            this.currentRecommendations = [];
        } else {
            // Medium or High — run recommender, get TOP 3
            this.state = "PATTERN_DETECTED";
            const recs = recommend(result.detectedInterest, this.watchedHistory);
            // recommend() now returns array; handle both old (object) and new (array) shapes
            if (Array.isArray(recs)) {
                this.currentRecommendations = recs;
                this.currentRecommendation  = recs.length > 0 ? recs[0] : null;
            } else {
                // fallback: old single-object shape
                this.currentRecommendation  = recs;
                this.currentRecommendations = recs ? [recs] : [];
            }
        }

        this.notify();
    }

    getReport() {
        return {
            interest:        this.currentInterest,
            recommendation:  this.currentRecommendation,
            recommendations: this.currentRecommendations,
            history:         this.watchedHistory
        };
    }
}

const driftAgent = new DriftAgent();