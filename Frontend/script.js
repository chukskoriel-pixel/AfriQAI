// ✅ REAL-TIME SOCKET (TOP OF FILE)
const socket = io("http://localhost:3000");

let startTime = Date.now();
let currentStory = null;

/* =========================
   STORY CLICK TRACKING
========================= */
document.addEventListener("click", (e) => {
  const card = e.target.closest(".card");

  if (card) {
    currentStory =
      card.querySelector("h4")?.innerText ||
      card.querySelector("h3")?.innerText ||
      "unknown";

    startTime = Date.now();
  }
});

/* =========================
   PAGE + ENGAGEMENT TRACKING
========================= */
window.addEventListener("beforeunload", () => {
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);

  const payload = {
    page: window.location.pathname,
    story: currentStory,
    timeSpent
  };

  navigator.sendBeacon(
    "http://localhost:3000/api/track",
    JSON.stringify(payload)
  );

  if (currentStory) {
    navigator.sendBeacon(
      "http://localhost:3000/api/engagement",
      JSON.stringify({
        story: currentStory,
        timeSpent,
        page: window.location.pathname
      })
    );
  }
});

/* =========================
   LOAD NEWS
========================= */
async function loadNews() {
  try {
    const res = await fetch("http://localhost:3000/api/news");
    const result = await res.json();

    const container = document.getElementById("newsContainer");
    if (!container) return;

    const articles = result.data || result;

    container.innerHTML = articles.map(article => `
      <div class="news-card">
        <h3>${article.title}</h3>
        <p>${article.summary || article.insight || ""}</p>
      </div>
    `).join("");

  } catch (error) {
    console.error("Error loading news:", error);
  }
}

/* =========================
   AFRICAN INTELLIGENCE
========================= */
async function loadAfricanIntelligence() {
  try {
    const res = await fetch("http://localhost:3000/api/african-intelligence");
    const result = await res.json();

    const container = document.getElementById("african-intelligence");
    if (!container) return;

    const clusters = result.data || [];

    container.innerHTML = clusters.map(item => `
      <div class="intel-card">
        <h3>${item.title}</h3>
        <p><strong>Why it matters:</strong> ${item.why_it_matters || "N/A"}</p>
        <p><strong>Trend signal:</strong> ${item.trend_signal || "N/A"}</p>
        <p><strong>Risk factors:</strong> ${item.risk_factors || "N/A"}</p>
      </div>
    `).join("");

  } catch (error) {
    console.error("Error loading African intelligence:", error);
  }
}

/* =========================
   DAILY INTELLIGENCE BRIEF (API FALLBACK)
========================= */
async function loadDailyBrief() {
  try {
    const res = await fetch("http://localhost:3000/api/daily-brief");
    const data = await res.json();

    if (!data.success) return;

    const brief = data.data;

    renderSection("globalSignals", brief.top_global);
    renderSection("africaFocus", brief.africa_focus);
    renderTrends("emergingTrends", brief.emerging_trends);
    renderRisks("riskWatchlist", brief.risk_watchlist);
    renderSection("frontierOpps", brief.frontier_opportunities);

  } catch (err) {
    console.log("Daily brief error:", err.message);
  }
}

/* =========================
   🔴 REAL-TIME LISTENER
========================= */
socket.on("dailyBriefUpdate", (brief) => {
  console.log("📡 Live update received");

  renderSection("globalSignals", brief.top_global);
  renderSection("africaFocus", brief.africa_focus);
  renderTrends("emergingTrends", brief.emerging_trends);
  renderRisks("riskWatchlist", brief.risk_watchlist);
  renderSection("frontierOpps", brief.frontier_opportunities);
});

/* =========================
   RENDER HELPERS
========================= */
function renderSection(id, items = []) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerHTML = items.map(i => `
    <div class="card">
      <h3>${i.title || "Untitled"}</h3>
      <p>${i.why_it_matters || i.insight || ""}</p>
    </div>
  `).join("");
}

function renderTrends(id, items = []) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerHTML = items.map(i => `
    <div class="trend-card">
      <h3>${i.trend}</h3>
      <p>Momentum: ${i.strength}</p>
    </div>
  `).join("");
}

function renderRisks(id, items = []) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerHTML = items.map(i => `
    <div class="risk-card">
      <h3>${i.title}</h3>
      <p>${i.risk}</p>
      <small>${i.geo || ""}</small>
    </div>
  `).join("");
}

/* =========================
   INIT
========================= */
function init() {
  loadNews();
  loadAfricanIntelligence();
  loadDailyBrief();

  // fallback refresh every 5 mins (safety net)
  setInterval(loadDailyBrief, 5 * 60 * 1000);
}

init();