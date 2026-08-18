// js/agent.js

class DriftAgent {
    constructor() {
        this.state = 'IDLE'; // IDLE, OBSERVING, LEARNING, PATTERN_DETECTED
        this.watchedHistory = [];
        this.currentInterest = null;
        this.currentRecommendation = null;
        this.listeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.state, this.currentInterest, this.currentRecommendation));
    }

    recordInteraction(reel, interaction) {
        // Update or add history
        const existingIdx = this.watchedHistory.findIndex(h => h.reel.id === reel.id);
        if (existingIdx >= 0) {
            // merge interactions, keeping the strongest signals
            const existing = this.watchedHistory[existingIdx].interaction;
            this.watchedHistory[existingIdx].interaction = {
                watchedPercentage: Math.max(existing.watchedPercentage || 0, interaction.watchedPercentage || 0),
                liked: existing.liked || interaction.liked,
                saved: existing.saved || interaction.saved,
                skipped: existing.skipped || interaction.skipped,
                replayed: existing.replayed || interaction.replayed
            };
        } else {
            this.watchedHistory.push({ reel, interaction });
        }

        this.evaluate();
    }

    evaluate() {
        // Run taxonomy inference
        const taxonomyResult = detectInterest(this.watchedHistory);
        this.currentInterest = taxonomyResult;

        // Determine State
        const prevConfidence = this.state;

        if (!taxonomyResult.detectedInterest || taxonomyResult.signalCount === 0) {
            this.state = 'IDLE';
            this.currentRecommendation = null;
        } else if (taxonomyResult.confidence === 'Low') {
            this.state = taxonomyResult.signalCount > 1 ? 'LEARNING' : 'OBSERVING';
            this.currentRecommendation = null;
        } else {
            // Medium or High confidence
            this.state = 'PATTERN_DETECTED';
            
            // Run recommender
            console.log('[Drift] Calling recommend with interest:', taxonomyResult.detectedInterest);
            const recommendationResult = recommend(taxonomyResult.detectedInterest, this.watchedHistory);
            this.currentRecommendation = recommendationResult;
            // If we have a high‑confidence recommendation, trigger a toast via the UI layer
            if (taxonomyResult.confidence === 'High' && recommendationResult) {
                if (typeof window.showToast === 'function') {
                    window.showToast('Tech content detected — tap to see your recommendation 🎯');
                }
            }
        }

        this.notify();
    }

    getReport() {
        return {
            interest: this.currentInterest,
            recommendation: this.currentRecommendation,
            history: this.watchedHistory
        };
    }
}

// Global instance
const driftAgent = new DriftAgent();
