# Drift

**"Don't stop scrolling. Make your scrolling count."**

Drift is an AI-powered career-content recommendation agent for students, built as an interactive prototype using plain HTML, CSS, and Vanilla JavaScript. 

## Problem
Students spend significant time consuming short-form content. Drift aims to make this time more productive by subtly detecting their underlying technical/career interests and recommending high-value educational content inside the feed experience.

## Architecture
- `data.js`: Seed data containing the trap-case reels and candidate recommendations.
- `taxonomy.js`: The core intelligence. It extracts all 5 interaction signals (watch%, like, save, replay, skip), maps tags to semantic clusters, and infers a broader interest using weighted scores and diversity metrics to calculate confidence.
- `recommender.js`: Takes the inferred interest, filters out "Hype" content, penalizes repetitive surface topics, and selects the most novel and educational candidate.
- `agent.js`: Orchestrates the flow between UI events, taxonomy, and recommender.
- `ui.js`: Handles scroll tracking (IntersectionObserver), bottom-sheet rendering, and animations.

## The Trap Case
The prototype demonstrates the "Trap Case". If a user watches a Java meme, a Software Engineering vlog, a coding interview joke, and a developer laptop review, a simple system would just categorize them as "Java" or "Funny". Drift's multi-signal taxonomy maps all these distinct tags to a broader `"Software Engineering / Technology Career"` cluster, preventing localized loops and enabling deeper recommendations.

## Running the Project
No build step is required. Simply open `index.html` in any modern web browser.

1. Open `index.html`.
2. Scroll through the feed. Like, save, or skip reels.
3. Watch the floating agent button react as it gathers signals.
4. Click the agent or "Analyze My Scroll" to see the structured inference and recommendation report.
