/* ================================================================
   Drift content.js — TOP-3 RECOMMENDATIONS BUILD
================================================================ */
(function () {
    "use strict";
    try {

    // 1. Shadow DOM
    const host = document.createElement("div");
    host.id = "drift-root";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = chrome.runtime.getURL("styles.css");
    shadow.appendChild(styleLink);

    const ui = document.createElement("div");
    ui.innerHTML = `
        <div id="toast" class="toast-notification">Pattern found! Tap to see recommendations 🎯</div>
        <button class="agent-btn idle" id="agent-btn">
            <div class="agent-icon"></div>
            <div class="agent-badge hidden" id="agent-badge">0</div>
        </button>
        <div class="bottom-sheet" id="bottom-sheet">
            <div class="bottom-sheet-content">
                <div class="drag-handle"></div>
                <div class="sheet-header">
                    <h2>Drift Analysis</h2>
                    <div class="agent-toggle-container">
                        <button id="simulate-btn" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#1a1a1a;border:none;padding:5px 9px;border-radius:6px;font-weight:700;cursor:pointer;font-size:11px;margin-right:6px;box-shadow:0 0 10px rgba(245,158,11,.5);">&#9654; Sim</button>
                        <button id="reset-btn" style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.4);padding:5px 9px;border-radius:6px;font-weight:700;cursor:pointer;font-size:11px;margin-right:6px;">&#8635;</button>
                        <span class="agent-toggle-label" id="toggle-label">ON</span>
                        <label class="switch">
                            <input type="checkbox" id="agent-toggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <button class="close-btn" id="close-sheet">&times;</button>
                </div>
                <div class="sheet-body" id="sheet-body">
                    <p style="color:#93c5fd;padding:20px;text-align:center;">Scroll some Shorts to start...</p>
                </div>
            </div>
        </div>
    `;
    shadow.appendChild(ui);

    const agentBtn      = shadow.getElementById("agent-btn");
    const agentBadge    = shadow.getElementById("agent-badge");
    const bottomSheet   = shadow.getElementById("bottom-sheet");
    const closeSheetBtn = shadow.getElementById("close-sheet");
    const sheetBody     = shadow.getElementById("sheet-body");
    const toastEl       = shadow.getElementById("toast");
    const agentToggle   = shadow.getElementById("agent-toggle");
    const toggleLabel   = shadow.getElementById("toggle-label");
    const simulateBtn   = shadow.getElementById("simulate-btn");
    const resetBtn      = shadow.getElementById("reset-btn");

    let isAgentOn         = true;
    let hasShownExplainer = false;
    let toastShown        = false;
    let lastRendererEl    = null;
    let watchStartMs      = 0;
    let currentReel       = null;
    let currentTitle      = "None";

    // Chips helper
    function chips(tags) {
        if (!tags || !tags.length) return "";
        return "<div class='hashtag-row'>" +
            tags.slice(0, 4).map(function(t) { return "<span class='hashtag-chip'>#" + t + "</span>"; }).join("") +
            "</div>";
    }

    // Confidence to color
    function confColor(c) { return c==="High"?"#f87171":c==="Medium"?"#fbbf24":"#93c5fd"; }

    // ── RENDER PANEL ─────────────────────────────────────────────────────────
    function renderPanel() {
        const report = driftAgent.getReport();
        console.log("[Drift] Render function called with:", {
            interest: report.interest,
            recs: (report.recommendations||[]).map(function(r){return r.reel.title;}),
            histLen: (report.history||[]).length
        });

        if (!isAgentOn) {
            sheetBody.innerHTML = "<div class='report-section' style='text-align:center;padding-top:30px;'><p style='color:#93c5fd;font-size:15px;font-weight:700;'>Agent is PAUSED</p><p style='color:#bfdbfe;font-size:13px;margin-top:8px;'>Toggle ON to resume.</p></div>";
            return;
        }

        const interest  = report.interest;
        const recs      = report.recommendations || [];
        const histLen   = (report.history||[]).length;
        const signals   = (interest && interest.signalCount) || 0;

        let html = "";

        // Explainer (once per session)
        if (!hasShownExplainer) {
            html += "<div class='explainer-box'><strong>Drift</strong> watches your scrolling, finds the real pattern behind what you watch, and surfaces 3 relevant recommendations — ranked by quality and novelty.</div>";
            hasShownExplainer = true;
        }

        // Stats bar
        html += "<div class='stats-bar'>" +
            "<div class='stat-item'><span class='stat-val'>" + histLen + "</span><span class='stat-lbl'>Shorts Seen</span></div>" +
            "<div class='stat-item'><span class='stat-val'>" + signals + "</span><span class='stat-lbl'>Signals</span></div>" +
            "<div class='stat-item'><span class='stat-val' style='color:#22c55e;'>" + (isAgentOn?"LIVE":"OFF") + "</span><span class='stat-lbl'>Status</span></div>" +
        "</div>";

        // Current reel
        html += "<div class='report-section'><div class='report-label'>NOW WATCHING:</div><div class='report-value'>" +
            (currentTitle !== "None" ? currentTitle : "<span style='color:#f59e0b;'>Scanning...</span>") +
        "</div></div>";

        // Not detected yet
        if (!interest || !interest.detectedInterest) {
            html += "<div class='report-section'>" +
                "<p style='color:#facc15;font-weight:600;font-size:14px;margin-bottom:8px;'>Still learning... " + signals + " signal" + (signals!==1?"s":"") + " collected.</p>" +
                "<div style='height:4px;border-radius:2px;background:rgba(255,255,255,0.08);overflow:hidden;margin-bottom:10px;'>" +
                    "<div style='height:100%;width:" + Math.min(100, (signals/8)*100) + "%;background:linear-gradient(90deg,#3b82f6,#f59e0b);border-radius:2px;'></div>" +
                "</div>" +
                "<p style='color:#93c5fd;font-size:12px;'>Need ~8 signals to detect a pattern. Keep scrolling or hit Simulate.</p>" +
            "</div>";
            sheetBody.innerHTML = html;
            return;
        }

        // ── INTEREST DETECTED ──────────────────────────────────────────────
        html += "<div class='report-section'>" +
            "<div class='report-label'>INTEREST DETECTED:</div>" +
            "<div class='report-value highlight'>" + interest.detectedInterest + "</div>" +
            "<div class='metrics-row'>" +
                "<div class='metric " + interest.confidence.toLowerCase() + "'>" +
                    "<div class='metric-label'>CONFIDENCE</div>" +
                    "<div class='metric-value'>" + interest.confidence + "</div>" +
                "</div>" +
                "<div class='metric'><div class='metric-label'>SIGNALS</div><div class='metric-value' style='color:#facc15;'>" + signals + "</div></div>" +
                "<div class='metric'><div class='metric-label'>SCORE</div><div class='metric-value' style='color:#60a5fa;'>" + (interest.score||0) + "</div></div>" +
            "</div>" +
        "</div>";

        // ── WHY ────────────────────────────────────────────────────────────
        const evHtml = (interest.evidence||[]).map(function(e) {
            return "<div class='evidence-item'><span class='evidence-bullet'>&bull;</span><span><b>" + e.reelTitle + "</b>: " + e.contribution + "</span></div>";
        }).join("");
        html += "<div class='report-section'>" +
            "<div class='evidence-container'>" +
                "<button class='evidence-toggle'>Why? (" + (interest.evidence||[]).length + " signals)</button>" +
                "<div class='evidence-content'>" + evHtml + "</div>" +
            "</div>" +
        "</div>";

        // ── TOP 3 RECOMMENDATION CARDS ─────────────────────────────────────
        if (recs.length > 0) {
            html += "<div class='report-label' style='margin-bottom:12px;color:#60a5fa;letter-spacing:1px;'>TOP " + recs.length + " RECOMMENDED TECH REELS:</div>";

            recs.forEach(function(rec, i) {
                const r = rec.reel;
                const searchUrl = "https://www.youtube.com/results?search_query=" + encodeURIComponent(r.title);
                const rankColor = i===0?"#f59e0b":i===1?"#60a5fa":"#a78bfa"; // gold, blue, purple
                const rankLabel = i===0?"🥇 Best Match":i===1?"🥈 Runner-up":"🥉 Also Try";

                html += "<a href='" + searchUrl + "' target='_blank' class='recommendation-link' style='margin-bottom:12px;display:block;'>" +
                    "<div class='recommendation-card' style='border-color:" + rankColor + "44;box-shadow:0 0 16px " + rankColor + "22;'>" +
                        // Rank badge + title
                        "<div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;'>" +
                            "<span style='font-size:10px;font-weight:700;color:" + rankColor + ";background:" + rankColor + "22;padding:2px 7px;border-radius:10px;margin-right:8px;white-space:nowrap;'>" + rankLabel + "</span>" +
                            "<span style='font-size:10px;color:#fbbf24;background:rgba(251,191,36,0.15);padding:2px 7px;border-radius:10px;white-space:nowrap;'>" + r.difficulty + "</span>" +
                        "</div>" +
                        "<div style='font-size:15px;font-weight:700;color:#bfdbfe;margin-bottom:6px;line-height:1.3;'>" + r.title + "</div>" +
                        chips(r.tags) +
                        // Mini metrics row
                        "<div style='display:flex;gap:8px;margin:8px 0;'>" +
                            "<span style='font-size:11px;color:#93c5fd;background:rgba(59,130,246,0.12);padding:3px 8px;border-radius:6px;'>" + r.category + "</span>" +
                            "<span style='font-size:11px;color:#4ade80;background:rgba(74,222,128,0.1);padding:3px 8px;border-radius:6px;'>Depth " + (r.technicalDepth||"?") + "/10</span>" +
                            "<span style='font-size:11px;color:#facc15;background:rgba(250,204,21,0.1);padding:3px 8px;border-radius:6px;'>Edu " + (r.educationalValue||"?") + "/10</span>" +
                        "</div>" +
                        // Why
                        "<div style='font-size:12px;color:#94a3b8;line-height:1.45;margin-top:4px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);'>" + rec.reason + "</div>" +
                        // CTA
                        "<div style='margin-top:8px;padding:6px;background:rgba(59,130,246,0.12);border-radius:6px;color:#60a5fa;font-size:11px;font-weight:600;text-align:center;'>&#128269; Search on YouTube</div>" +
                    "</div>" +
                "</a>";
            });
        } else {
            html += "<div class='report-section'><p style='color:#fbbf24;font-size:13px;'>Interest detected — collecting more signals before recommending...</p></div>";
        }

        sheetBody.innerHTML = html;

        // Re-attach evidence toggle
        const evBtn = sheetBody.querySelector(".evidence-toggle");
        if (evBtn) evBtn.addEventListener("click", function(e) { e.currentTarget.parentElement.classList.toggle("expanded"); });
    }

    // ── Subscribe ────────────────────────────────────────────────────────────
    driftAgent.subscribe(function(state, interest) {
        if (!isAgentOn) return;
        agentBtn.className = "agent-btn " + state.toLowerCase();

        if (state === "LEARNING" || state === "OBSERVING") {
            agentBadge.classList.remove("hidden");
            agentBadge.textContent = interest ? interest.signalCount : "0";
        } else if (state === "PATTERN_DETECTED") {
            agentBadge.classList.remove("hidden");
            agentBadge.textContent = "!";
            if (!toastShown) {
                toastShown = true;
                toastEl.classList.add("show");
                setTimeout(function() { toastEl.classList.remove("show"); }, 5000);
            }
        } else {
            agentBadge.classList.add("hidden");
        }
        renderPanel();
    });

    // ── Toggle ───────────────────────────────────────────────────────────────
    agentToggle.addEventListener("change", function(e) {
        isAgentOn = e.target.checked;
        toggleLabel.textContent = isAgentOn ? "ON" : "OFF";
        agentBtn.className = isAgentOn ? "agent-btn " + driftAgent.state.toLowerCase() : "agent-btn off";
        if (!isAgentOn) { agentBadge.classList.add("hidden"); lastRendererEl = null; currentReel = null; watchStartMs = 0; }
        renderPanel();
    });

    // ── Reset ────────────────────────────────────────────────────────────────
    resetBtn.addEventListener("click", function() {
        driftAgent.watchedHistory = [];
        driftAgent.currentInterest = null;
        driftAgent.currentRecommendation = null;
        driftAgent.currentRecommendations = [];
        driftAgent.state = "IDLE";
        toastShown = false;
        lastRendererEl = null; currentReel = null; currentTitle = "None";
        agentBtn.className = "agent-btn idle";
        agentBadge.classList.add("hidden");
        hasShownExplainer = false;
        renderPanel();
        console.log("[Drift] Reset complete");
    });

    // ── Button = view only ───────────────────────────────────────────────────
    agentBtn.addEventListener("click", function() { renderPanel(); bottomSheet.classList.add("open"); });
    closeSheetBtn.addEventListener("click", function() { bottomSheet.classList.remove("open"); });

    // ── Simulate cycles 3 different interest clusters ────────────────────────
        const simClusters = [
        {
            name: "Software Engineering / Technology Career",
            reels: [
                { id:"s1a", title:"Java memory management deep dive",         tags:["java","backend","programming"],           category:"Tech"   },
                { id:"s1b", title:"Spring Boot dependency injection tutorial",  tags:["java","spring","backend","framework"],    category:"Tech"   },
                { id:"s1c", title:"System design interview tips for FAANG",    tags:["system-design","interview","career"],     category:"Career" }
            ]
        },
        {
            name: "Gaming & Esports",
            reels: [
                { id:"s2a", title:"Valorant pro player aim training",          tags:["gaming","esports","valorant","fps"],      category:"Gaming" },
                { id:"s2b", title:"Top 10 Twitch streamers this week",         tags:["gaming","streamer","twitch"],             category:"Gaming" },
                { id:"s2c", title:"Game engine rendering pipeline explained",  tags:["gaming","computer-science","graphics"],   category:"Gaming" }
            ]
        },
        {
            name: "Health & Fitness",
            reels: [
                { id:"s3a", title:"Progressive overload gym science",          tags:["workout","gym","health","training"],      category:"Fitness" },
                { id:"s3b", title:"Why sleep is your best recovery tool",      tags:["health","recovery","sleep","wellness"],   category:"Health"  },
                { id:"s3c", title:"Best beginner nutrition and meal prep",      tags:["nutrition","diet","health","meal-prep"],  category:"Health"  }
            ]
        }
    ];
    let simStep = 0;
    simulateBtn.addEventListener("click", function() {
        const cluster = simClusters[simStep % simClusters.length]; simStep++;
        console.log("[Drift] SIMULATE cluster:", cluster.name);
        cluster.reels.forEach(function(mock) {
            mock.tone = "educational";
            mock.caption = cluster.name;
            for (let i = 0; i < 5; i++) pushInteraction(mock, 12000);
        });
        bottomSheet.classList.add("open");
    });

    // ══════════════════════════════════════════════════════════════
    //  AUTO-DETECTION ENGINE — fully background, scroll-driven
    // ══════════════════════════════════════════════════════════════
    console.log("[Drift] Auto-detection listener active");

    function cleanTitle(raw) {
        if (!raw) return null;
        let t = raw.replace(/#\w+/g, " ").replace(/\s+/g, " ").trim();
        t = t.replace(/ - YouTube$/i, "").trim();
        try { t = t.replace(/\p{Emoji}/gu, "").trim(); } catch(e) {}
        return (t.length >= 4 && t !== "YouTube") ? t : null;
    }

    function findActiveRenderer() {
        try {
            const all = document.querySelectorAll("ytd-reel-video-renderer, ytd-shorts-video-renderer");
            console.log("[Drift] Trying selector: ytd-reel-video-renderer -> found:", all.length);
            const mid = window.innerHeight / 2;
            for (const el of all) {
                const r = el.getBoundingClientRect();
                if (r.top <= mid && r.bottom >= mid) return el;
            }
        } catch(e) {}
        return null;
    }

    function extractTitle(renderer) {
        const sels = ["#video-title","h2","yt-formatted-string",".title","[title]"];
        if (renderer) {
            for (const sel of sels) {
                try {
                    const el = renderer.querySelector(sel);
                    const t  = cleanTitle(el && el.textContent);
                    console.log("[Drift] Trying selector:", sel, "-> found:", t ? t.length : 0);
                    if (t) return t;
                } catch(e) {}
            }
        }
        // Overlay selectors
        const overlaySels = [
            "ytd-reel-player-overlay-renderer #title",
            "#shorts-container #video-title",
            "ytd-reel-player-overlay-renderer yt-formatted-string"
        ];
        for (const sel of overlaySels) {
            try {
                const els = document.querySelectorAll(sel);
                for (const el of els) {
                    const rb = el.getBoundingClientRect();
                    if (rb.bottom >= 0 && rb.top <= window.innerHeight) {
                        const t = cleanTitle(el.textContent);
                        if (t) return t;
                    }
                }
            } catch(e) {}
        }
        const t = cleanTitle(document.title);
        console.log("[Drift] Trying selector: document.title -> found:", t || "(nothing useful)");
        return t;
    }

    function buildReel(title, renderer) {
        let description = "";
        try { const d = renderer && renderer.querySelector("#description,.description"); if (d) description = d.textContent.trim(); } catch(e) {}
        const text = (title + " " + description).toLowerCase();
        let tags = [], category = "Other";
        if (typeof CLUSTERS !== "undefined") {
            for (const cluster in CLUSTERS) {
                for (const kw of CLUSTERS[cluster]) {
                    if (text.indexOf(kw) !== -1 && tags.indexOf(kw) === -1) {
                        tags.push(kw);
                        if (category === "Other") category = cluster.split(" ")[0];
                    }
                }
            }
        }
        if (!tags.length) {
            if (/code|bug|program|develop/.test(text)) tags.push("programming");
            if (/game|play|fps|valorant/.test(text))   tags.push("gaming");
            if (/gym|workout|fitness/.test(text))       tags.push("workout");
            if (/food|recipe|coffee/.test(text))        tags.push("food");
        }
        if (!tags.length) tags.push("general");
        return { id:"yt_"+Math.random().toString(36).slice(2,8), title, caption:description, category, tags, tone:"neutral" };
    }

    function pushInteraction(reel, durationMs) {
        if (!reel) return;
        try {
            const sec = durationMs / 1000;
            driftAgent.recordInteraction(reel, {
                watchedPercentage: Math.min(100, Math.round((sec / 10) * 100)),
                liked: false, saved: false,
                skipped: sec < 2, replayed: sec > 15
            });
            console.log("[Drift] Interest state:", driftAgent.currentInterest);
        } catch(e) { console.error("[Drift] pushInteraction error:", e); }
    }

    function detectionTick() {
        if (!isAgentOn) return;
        try {
            const renderer = findActiveRenderer();
            if (renderer && renderer !== lastRendererEl) {
                if (lastRendererEl && currentReel && watchStartMs > 0) {
                    pushInteraction(currentReel, Date.now() - watchStartMs);
                }
                lastRendererEl = renderer;
                watchStartMs   = Date.now();
                const title = extractTitle(renderer);
                if (!title) { console.log("[Drift] Final extracted: FAILED"); return; }
                currentTitle = title;
                currentReel  = buildReel(title, renderer);
                console.log("[Drift] Auto-detected signal from scroll:", currentReel);
                pushInteraction(currentReel, 8000);
            } else if (lastRendererEl && currentReel && watchStartMs > 0) {
                const dur = Date.now() - watchStartMs;
                if (dur > 5000 && (dur % 5000) < 600) pushInteraction(currentReel, dur);
            }
        } catch(e) { console.error("[Drift] detectionTick error:", e); }
    }

    // MutationObserver
    try {
        const obs = new MutationObserver(detectionTick);
        obs.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["is-active"] });
        console.log("[Drift] MutationObserver attached");
    } catch(e) { console.error("[Drift] MO error:", e); }

    setInterval(detectionTick, 500);
    window.addEventListener("wheel",    function() { setTimeout(detectionTick, 100); }, { passive:true });
    window.addEventListener("scroll",   function() { setTimeout(detectionTick, 100); }, { passive:true });
    window.addEventListener("touchend", function() { setTimeout(detectionTick, 200); }, { passive:true });
    document.addEventListener("visibilitychange", function() { if (!document.hidden) detectionTick(); });

    console.log("[Drift] All listeners registered — auto-detection is live");

    } catch(initErr) { console.error("[Drift] INIT ERROR:", initErr); }
})();