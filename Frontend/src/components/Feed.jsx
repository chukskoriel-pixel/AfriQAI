export default function Feed({ data = [] }) {

  if (!data || data.length === 0) {
    return (
      <div style={{
        background: "#0f1720",
        padding: 15,
        borderRadius: 10,
        color: "#6b7280"
      }}>
        No intelligence signals yet
      </div>
    );
  }

  /* =========================
     SAFE NORMALIZATION + SECTOR ALIGNMENT
  ========================= */
  const normalize = (item) => ({
    title: item?.title || "Untitled Signal",
    sector: item?.sector || "GENERAL",
    score: item?.score || 0,
    tier: item?.tier || "UNKNOWN",
    geo: item?.geo || "GLOBAL",
    summary: item?.summary || "",
    source: item?.source || "LIVE"
  });

  const safeData = data.map(normalize);

  /* =========================
     TIER COLORS (TERMINAL STANDARD)
  ========================= */
  const tierColor = {
    TIER_1: "#ef4444",
    TIER_2: "#f59e0b",
    TIER_3: "#22c55e",
    UNKNOWN: "#64748b"
  };

  const tierWeight = {
    TIER_1: 1,
    TIER_2: 2,
    TIER_3: 3,
    UNKNOWN: 4
  };

  /* =========================
     SECTOR ENGINE (WAR ROOM CLASSIFICATION)
  ========================= */
  const normalizeSector = (sector) => {
    if (!sector) return "GENERAL";

    const map = {
      AI: "AI",
      ARTIFICIAL_INTELLIGENCE: "AI",
      ENERGY: "ENERGY",
      OIL: "ENERGY",
      GAS: "ENERGY",
      FINANCE: "FINANCE",
      BANKING: "FINANCE",
      MARKETS: "FINANCE",
      INFRA: "INFRASTRUCTURE",
      INFRASTRUCTURE: "INFRASTRUCTURE",
      POLITICS: "POLICY",
      GOVERNMENT: "POLICY",
      RISK: "RISK"
    };

    return map[sector.toUpperCase()] || "GENERAL";
  };

  /* =========================
     INTELLIGENCE PIPELINE
  ========================= */
  const processed = safeData.map((item) => ({
    ...item,
    tier: item.tier,
    sector: normalizeSector(item.sector)
  }));

  /* =========================
     WAR ROOM CLUSTER ENGINE
  ========================= */
  const clusterMap = new Map();

  processed.forEach((item) => {
    const key = (item.title || "")
      .toLowerCase()
      .split(" ")
      .slice(0, 4)
      .join(" ");

    if (!clusterMap.has(key)) {
      clusterMap.set(key, { ...item, count: 1 });
    } else {
      const existing = clusterMap.get(key);
      clusterMap.set(key, {
        ...existing,
        count: existing.count + 1,
        score: Math.max(existing.score, item.score)
      });
    }
  });

  const clustered = Array.from(clusterMap.values());

  /* =========================
     WAR ROOM PRIORITY ENGINE
  ========================= */
  const tier1Stream = clustered.filter(i => i.tier === "TIER_1");
  const mainStream = clustered
    .filter(i => i.tier !== "TIER_1")
    .sort((a, b) => tierWeight[a.tier] - tierWeight[b.tier]);

  /* =========================
     CARD RENDER ENGINE
  ========================= */
  const renderCard = (item, i) => {
    const color = tierColor[item.tier] || "#64748b";

    return (
      <div
        key={i}
        style={{
          background: "#0f1720",
          padding: 14,
          borderRadius: 10,
          borderLeft: `4px solid ${color}`,
          marginBottom: 10
        }}
      >

        {/* HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6
        }}>
          <span style={{
            fontSize: 11,
            color,
            fontWeight: 700
          }}>
            {item.tier}
          </span>

          <span style={{
            fontSize: 11,
            color: "#6b7280"
          }}>
            {item.source}
          </span>
        </div>

        {/* TITLE */}
        <div style={{
          fontSize: 15,
          fontWeight: 600
        }}>
          {item.title}

          {item.count > 1 && (
            <span style={{
              marginLeft: 8,
              fontSize: 11,
              color: "#9aa4b2"
            }}>
              x{item.count}
            </span>
          )}
        </div>

        {/* META STRIP */}
        <div style={{
          fontSize: 11,
          color: "#9aa4b2",
          marginTop: 6,
          display: "flex",
          gap: 10,
          flexWrap: "wrap"
        }}>
          <span>🏷 {item.sector}</span>
          <span>🌍 {item.geo}</span>
          <span>⚡ Score: {item.score}</span>
        </div>

        {/* SUMMARY */}
        <div style={{
          fontSize: 12,
          color: "#9aa4b2",
          marginTop: 6
        }}>
          {item.summary || "No summary available"}
        </div>

      </div>
    );
  };

  /* =========================
     BLOOMBERG WAR ROOM UI
  ========================= */
  return (
    <div style={{ marginTop: 20 }}>

      {/* 🔴 PRIORITY INTERRUPT */}
      {tier1Stream.length > 0 && (
        <div style={{
          background: "#120606",
          border: "1px solid #ef4444",
          padding: 12,
          borderRadius: 10,
          marginBottom: 15
        }}>
          <div style={{
            color: "#ef4444",
            fontWeight: 700,
            marginBottom: 8
          }}>
            🚨 WAR ROOM PRIORITY STREAM
          </div>

          {tier1Stream.slice(0, 3).map((i, idx) => (
            <div key={idx} style={{ fontSize: 13, color: "#fff" }}>
              • {i.title}
            </div>
          ))}
        </div>
      )}

      {/* MAIN TERMINAL FEED */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 10
      }}>
        {mainStream.slice(0, 30).map(renderCard)}
      </div>

    </div>
  );
}