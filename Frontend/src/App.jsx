import { useEffect, useState } from "react";
import socket from "./services/socket";

import Header from "./components/Header";
import Brief from "./components/Brief";
import Signals from "./components/Signals";
import SignalsTicker from "./components/SignalsTicker";
import Feed from "./components/Feed";
import TierFilter from "./components/TierFilter";

import { getBrief, getSignals, getIntelligence } from "./services/api";

/* =========================
   DOMINANCE HELPERS (NEW LAYER)
========================= */
const getSectorColor = (sector) => {
  switch ((sector || "").toUpperCase()) {
    case "POWER":
      return "#60a5fa";
    case "CAPITAL":
      return "#34d399";
    case "FRONTIER":
      return "#a78bfa";
    case "INFRASTRUCTURE":
      return "#fbbf24";
    case "PERFORMANCE":
      return "#f472b6";
    case "INFLUENCE":
      return "#fb7185";
    default:
      return "#9ca3af";
  }
};

const getTierColor = (tier) => {
  if (tier === "TIER_1") return "#ef4444";
  if (tier === "TIER_2") return "#f59e0b";
  return "#6b7280";
};

export default function App() {
  const [brief, setBrief] = useState(null);
  const [signals, setSignals] = useState([]);
  const [feed, setFeed] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dominance, setDominance] = useState([]);
  const [activeTier, setActiveTier] = useState("ALL");

  /* =========================
     INITIAL DATA LOAD
  ========================= */
  useEffect(() => {
    load();
    const interval = setInterval(load, 45000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    try {
      const [b, s, f] = await Promise.all([
        getBrief(),
        getSignals(),
        getIntelligence(),
      ]);

      setBrief(b?.data || null);
      setSignals(s?.data || []);
      setFeed(f?.data || []);
    } catch (err) {
      console.log("API error:", err.message);
    }
  };

  /* =========================
     SOCKET STREAMS (ENHANCED)
  ========================= */
  useEffect(() => {
    socket.on("intelligence:update", (data) => {
      if (data?.signals) setFeed(data.signals);
    });

    socket.on("briefUpdate", (data) => {
      if (data) setBrief(data);
    });

    socket.on("alerts:update", (data) => {
      if (Array.isArray(data)) setAlerts(data);
      else if (data?.alerts) setAlerts(data.alerts);
    });

    // 🔥 NEW: DOMINANCE STREAM
    socket.on("dominance:update", (data) => {
      setDominance(data || []);
    });

    return () => {
      socket.off("intelligence:update");
      socket.off("briefUpdate");
      socket.off("alerts:update");
      socket.off("dominance:update");
    };
  }, []);

  /* =========================
     TIER ENGINE
  ========================= */
  const normalizeTier = (tier) => {
    const map = {
      HIGH: "TIER_1",
      MEDIUM: "TIER_2",
      LOW: "TIER_3",
      TIER_1: "TIER_1",
      TIER_2: "TIER_2",
      TIER_3: "TIER_3",
    };
    return map[tier] || "UNKNOWN";
  };

  /* =========================
     SECTOR ENGINE
  ========================= */
  const normalizeSector = (sector) => {
    if (!sector) return "GENERAL";

    const map = {
      AI: "FRONTIER",
      ENERGY: "INFRASTRUCTURE",
      OIL: "CAPITAL",
      FINANCE: "CAPITAL",
      BANKING: "CAPITAL",
      POLITICS: "POWER",
      GOVERNMENT: "POWER",
      RISK: "RISK",
    };

    return map[String(sector).toUpperCase()] || "GENERAL";
  };

  /* =========================
     PROCESS FEED
  ========================= */
  const processedFeed = (feed || []).map((item) => ({
    ...item,
    tier: normalizeTier(item.tier),
    sector: normalizeSector(item.sector),
  }));

  const tierOrder = {
    TIER_1: 1,
    TIER_2: 2,
    TIER_3: 3,
    UNKNOWN: 4,
  };

  const filteredFeed = processedFeed
    .filter((item) => activeTier === "ALL" || item.tier === activeTier)
    .sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

  /* =========================
     DOMINANCE ENGINE (UI LAYER)
  ========================= */
  const dominanceView = dominance?.slice(0, 5) || [];

  /* =========================
     UI
  ========================= */
  return (
    <div style={styles.container}>
      <Header />

      {/* TOP STRIP */}
      <div style={styles.strip}>
        ● AFREQ AI INTELLIGENCE GRID — LIVE SYSTEM ACTIVE
      </div>

      <SignalsTicker data={signals} />

      {/* ALERTS */}
      <div style={styles.alertBox}>
        <div style={styles.alertTitle}>ACTIVE ALERTS</div>

        {alerts.length === 0 ? (
          <div style={styles.muted}>No active threats</div>
        ) : (
          alerts.map((a, i) => (
            <div key={i} style={styles.alertItem}>
              <strong>{a.title}</strong> — {a.message}
            </div>
          ))
        )}
      </div>

      {/* MAIN GRID */}
      <div style={styles.grid}>
        
        {/* LEFT COLUMN */}
        <div style={styles.col}>
          <div style={styles.sectionTitle}>📡 BRIEF</div>
          <Brief data={brief} />

          <div style={styles.sectionTitle}>🧠 SIGNALS</div>
          <Signals data={signals} />
        </div>

        {/* CENTER COLUMN */}
        <div style={styles.colCenter}>
          <div style={styles.sectionTitle}>INTELLIGENCE FEED</div>

          <TierFilter active={activeTier} setActive={setActiveTier} />

          <Feed data={filteredFeed} />
        </div>

        {/* RIGHT COLUMN (DOMINANCE PANEL) */}
        <div style={styles.col}>
          <div style={styles.sectionTitle}>🔥 DOMINANT NARRATIVES</div>

          {dominanceView.length === 0 ? (
            <div style={styles.muted}>No dominance clusters detected</div>
          ) : (
            dominanceView.map((d, i) => (
              <div key={i} style={styles.dominanceCard}>
                <div style={styles.flex}>
                  <span style={styles.domBadge}>DOM</span>
                  <span style={styles.bold}>
                    {d.narrative || "Unnamed Narrative"}
                  </span>
                </div>

                <div style={styles.small}>
                  Score: {d.dominanceScore || 0}
                </div>
              </div>
            ))
          )}

          <div style={styles.sectionTitle}>SYSTEM VIEW</div>
          <div style={styles.systemBox}>
            Live intelligence clustering active. Dominance engine tracking narrative concentration in real time.
          </div>
        </div>

      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  container: {
    background: "#02060a",
    color: "#e5e7eb",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "system-ui",
  },

  strip: {
    background: "#0a0f18",
    padding: "6px 12px",
    fontSize: 11,
    color: "#f59e0b",
    borderBottom: "1px solid #1f2937",
  },

  alertBox: {
    maxHeight: 110,
    overflowY: "auto",
    padding: "8px 12px",
    borderBottom: "1px solid #1f2937",
  },

  alertTitle: {
    fontSize: 11,
    color: "#ef4444",
    marginBottom: 6,
  },

  alertItem: {
    background: "#0b1220",
    padding: 6,
    marginBottom: 5,
    borderLeft: "2px solid #ef4444",
    fontSize: 11,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.4fr 1fr",
    gap: 8,
    flex: 1,
    overflow: "hidden",
    padding: 8,
  },

  col: { overflowY: "auto" },

  colCenter: {
    overflowY: "auto",
    borderLeft: "1px solid #1f2937",
    borderRight: "1px solid #1f2937",
    padding: "0 8px",
  },

  sectionTitle: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 6,
  },

  dominanceCard: {
    background: "#0b1220",
    padding: 8,
    marginBottom: 6,
    borderRadius: 6,
    border: "1px solid #1f2937",
  },

  domBadge: {
    fontSize: 10,
    padding: "2px 6px",
    background: "#7c3aed",
    borderRadius: 4,
    marginRight: 6,
  },

  flex: { display: "flex", gap: 6, alignItems: "center" },

  bold: { fontWeight: 600, fontSize: 12 },

  small: { fontSize: 11, color: "#9ca3af" },

  muted: { fontSize: 11, color: "#6b7280" },

  systemBox: {
    background: "#0b1220",
    padding: 10,
    borderRadius: 6,
    fontSize: 11,
    color: "#94a3b8",
  },
};