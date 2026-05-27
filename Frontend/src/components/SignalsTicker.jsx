export default function SignalsTicker({ data = [] }) {
  if (!data || data.length === 0) {
    return null;
  }

  /* =========================
     NORMALIZE + SAFETY
  ========================= */
  const safeData = data.slice(0, 30).map((item) => ({
    title: item?.title || "Untitled Signal",
    sector: item?.sector || "GENERAL",
    score: item?.score || 0,
    tier: item?.tier || "UNKNOWN",
    source: item?.source || "LIVE",
  }));

  /* =========================
     TIER COLOR ENGINE
  ========================= */
  const getColor = (tier, score) => {
    if (tier === "TIER_1" || score >= 80) return "#ef4444"; // red (critical)
    if (tier === "TIER_2" || score >= 60) return "#f59e0b"; // amber (watch)
    if (tier === "TIER_3") return "#22c55e"; // green (stable)
    return "#64748b"; // neutral
  };

  /* =========================
     BLOOMBERG MARQUEE STYLE
  ========================= */
  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        background: "#070b10",
        borderBottom: "1px solid #1a2230",
        borderTop: "1px solid #1a2230",
        padding: "8px 0",
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          animation: "tickerScroll 35s linear infinite",
        }}
      >
        {safeData.map((item, i) => {
          const color = getColor(item.tier, item.score);

          return (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginRight: 28,
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {/* DOT INDICATOR */}
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: color,
                  marginRight: 8,
                }}
              />

              {/* SECTOR */}
              <span
                style={{
                  color: "#9aa4b2",
                  marginRight: 6,
                  textTransform: "uppercase",
                  fontSize: 11,
                }}
              >
                {item.sector}
              </span>

              {/* TITLE */}
              <span style={{ color: "#e5e7eb", marginRight: 6 }}>
                {item.title}
              </span>

              {/* SCORE */}
              <span style={{ color, fontWeight: 600 }}>
                {item.score}
              </span>

              {/* SOURCE TAG */}
              <span
                style={{
                  color: "#6b7280",
                  marginLeft: 8,
                  fontSize: 10,
                }}
              >
                [{item.source}]
              </span>
            </span>
          );
        })}
      </div>

      {/* ANIMATION KEYFRAMES */}
      <style>
        {`
          @keyframes tickerScroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </div>
  );
}