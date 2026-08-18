// js/ui.js

document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed');
    const agentBtn = document.getElementById('agent-btn');
    const agentBadge = document.getElementById('agent-badge');
    const analyzeBtn = document.getElementById('analyze-btn');
    const bottomSheet = document.getElementById('bottom-sheet');
    const closeSheetBtn = document.getElementById('close-sheet');
    const sheetBody = document.getElementById('sheet-body');

    // State tracking for UI
    let currentVisibleReelId = null;
    let reelTimers = {};
    const interactionCache = {};

    // 1. Render Feed
    function renderFeed() {
        feedReels.forEach((reel, index) => {
            const reelElement = document.createElement('div');
            reelElement.classList.add('reel');
            reelElement.dataset.id = reel.id;
            
            // Random dark gradient for background
            const hue = Math.floor(Math.random() * 360);
            const bgGradient = `linear-gradient(45deg, hsl(${hue}, 30%, 10%), hsl(${hue + 40}, 40%, 15%))`;

            reelElement.innerHTML = `
                <div class="reel-bg" style="background: ${bgGradient}"></div>
                <div class="reel-content">
                    <div class="reel-category">${reel.category}</div>
                    <h2 class="reel-title">${reel.title}</h2>
                    <p class="reel-caption">${reel.caption}</p>
                    <div class="reel-actions">
                        <button class="action-btn like-btn" data-id="${reel.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            Like
                        </button>
                        <button class="action-btn save-btn" data-id="${reel.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                            Save
                        </button>
                    </div>
                </div>
            `;
            feedContainer.appendChild(reelElement);

            // Initialize interaction cache
            interactionCache[reel.id] = {
                watchedPercentage: 0,
                liked: false,
                saved: false,
                skipped: false,
                replayed: false,
                watchStartTime: 0,
                totalWatchedMs: 0,
                hasBeenViewed: false
            };
        });

        setupInteractions();
        setupIntersectionObserver();
    }

    // 2. Setup Interactions (Like/Save)
    function setupInteractions() {
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                interactionCache[id].liked = !interactionCache[id].liked;
                e.currentTarget.classList.toggle('active');
                reportInteraction(id);
            });
        });

        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                interactionCache[id].saved = !interactionCache[id].saved;
                e.currentTarget.classList.toggle('active');
                reportInteraction(id);
            });
        });
    }

    // 3. Setup Scroll Tracking
    function setupIntersectionObserver() {
        const options = {
            root: feedContainer,
            threshold: 0.6 // 60% visibility triggers active state
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.dataset.id;
                const cache = interactionCache[id];

                if (entry.isIntersecting) {
                    // Reel became active
                    currentVisibleReelId = id;
                    cache.watchStartTime = Date.now();
                    
                    if (cache.hasBeenViewed) {
                        cache.replayed = true;
                    }
                    cache.hasBeenViewed = true;
                } else {
                    // Reel lost focus
                    if (cache.watchStartTime > 0) {
                        const watchedTime = Date.now() - cache.watchStartTime;
                        cache.totalWatchedMs += watchedTime;
                        cache.watchStartTime = 0;

                        // Calculate mock percentage (assume 5 seconds is a full reel for demo)
                        const percentage = Math.min(100, Math.round((cache.totalWatchedMs / 5000) * 100));
                        cache.watchedPercentage = percentage;

                        // If watched < 10% and not interacted, mark as skipped
                        if (percentage < 10 && !cache.liked && !cache.saved && !cache.replayed) {
                            cache.skipped = true;
                        }

                        reportInteraction(id);
                    }
                }
            });
        }, options);

        document.querySelectorAll('.reel').forEach(reel => {
            observer.observe(reel);
        });
    }

    function reportInteraction(id) {
        const reel = feedReels.find(r => r.id === id);
        if (reel) {
            driftAgent.recordInteraction(reel, interactionCache[id]);
        }
    }

    // 4. Agent UI Subscription
    driftAgent.subscribe((state, interest, recommendation) => {
        // Update Floating Button Classes
        agentBtn.className = 'agent-btn ' + state.toLowerCase();
        
        if (state === 'LEARNING' || state === 'OBSERVING') {
            agentBadge.classList.remove('hidden');
            agentBadge.textContent = interest.signalCount;
        } else if (state === 'PATTERN_DETECTED') {
            agentBadge.classList.remove('hidden');
            agentBadge.textContent = '★';
        } else {
            agentBadge.classList.add('hidden');
        }
    });

    // 5. Bottom Sheet Rendering
    function openSheet() {
        // Force an evaluation in case they click while still on a reel
        if (currentVisibleReelId) {
            const cache = interactionCache[currentVisibleReelId];
            if (cache.watchStartTime > 0) {
                const watchedTime = Date.now() - cache.watchStartTime;
                const percentage = Math.min(100, Math.round(((cache.totalWatchedMs + watchedTime) / 5000) * 100));
                cache.watchedPercentage = Math.max(cache.watchedPercentage, percentage);
                reportInteraction(currentVisibleReelId);
            }
        }

        const report = driftAgent.getReport();
        renderReport(report);
        bottomSheet.classList.add('open');
    }

    function closeSheet() {
        bottomSheet.classList.remove('open');
    }

    function renderReport(report) {
        const { interest, recommendation } = report;
        
        let currentReelStr = 'None';
        if (currentVisibleReelId) {
            const r = feedReels.find(x => x.id === currentVisibleReelId);
            if (r) currentReelStr = r.title;
        }

        if (!interest || !interest.detectedInterest) {
            sheetBody.innerHTML = `
                <div class="report-section">
                    <p style="color: var(--text-secondary)">Keep scrolling... I'm still learning your interests.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="report-section">
                <div class="report-label">CURRENT REEL:</div>
                <div class="report-value">${currentReelStr}</div>
            </div>

            <div class="report-section">
                <div class="report-label">INTEREST DETECTED:</div>
                <div class="report-value highlight">${interest.detectedInterest}</div>
                <div class="metrics-row">
                    <div class="metric ${interest.confidence.toLowerCase()}">
                        <div class="metric-label">CONFIDENCE</div>
                        <div class="metric-value">${interest.confidence}</div>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <div class="report-label">WHY:</div>
                <div class="report-value" style="font-size: 13px; font-weight: 400; color: #ddd">
                    Based on ${interest.signalCount} interaction signals across diverse content.
                </div>
                
                <div class="evidence-container">
                    <button class="evidence-toggle">Why did you choose this?</button>
                    <div class="evidence-content">
                        ${interest.evidence.map(e => `
                            <div class="evidence-item">
                                <span class="evidence-bullet">→</span>
                                <span><b>${e.reelTitle}</b>: ${e.contribution}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        if (recommendation) {
            html += `
                <div class="report-section" style="background: rgba(92,111,255,0.1); padding: 16px; border-radius: 12px; border: 1px solid rgba(92,111,255,0.2);">
                    <div class="report-label" style="color: var(--accent-color)">RECOMMENDED TECH REEL:</div>
                    <div class="report-value" style="font-size: 18px; margin-bottom: 8px;">${recommendation.reel.title}</div>
                    
                    <div class="metrics-row" style="margin-top: 12px; margin-bottom: 12px;">
                        <div class="metric">
                            <div class="metric-label">CATEGORY</div>
                            <div class="metric-value">${recommendation.reel.category}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">DIFFICULTY</div>
                            <div class="metric-value">${recommendation.reel.difficulty}</div>
                        </div>
                    </div>

                    <div class="report-label">WHY THIS RECOMMENDATION:</div>
                    <div class="report-value" style="font-size: 13px; font-weight: 400; color: #ddd; line-height: 1.5;">
                        ${recommendation.reason}
                    </div>
                    
                    ${recommendation.reel.goDeeper ? `
                        <div class="go-deeper-card">
                            <div class="go-deeper-info">
                                <h4>Go Deeper</h4>
                                <p>${recommendation.reel.goDeeper.title}</p>
                                <span>${recommendation.reel.goDeeper.duration}</span>
                            </div>
                            <button class="go-deeper-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        sheetBody.innerHTML = html;

        // Attach event listener for expandable evidence
        const evidenceToggle = sheetBody.querySelector('.evidence-toggle');
        if (evidenceToggle) {
            evidenceToggle.addEventListener('click', (e) => {
                e.currentTarget.parentElement.classList.toggle('expanded');
            });
        }
    }

    // Event Listeners
    agentBtn.addEventListener('click', openSheet);
    analyzeBtn.addEventListener('click', openSheet);
    closeSheetBtn.addEventListener('click', closeSheet);

    // Initial Render
    renderFeed();
        // Initialize section reveal observer for scroll animations
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });
        document.querySelectorAll('.reveal').forEach(section => {
            revealObserver.observe(section);
        });
});
