export default function Brief({ data }) {
  if (!data) {
    return (
      <div style={{
        background: "#0f1720",
        padding: 15,
        borderRadius: 10,
        color: "#6b7280"
      }}>
        Loading intelligence brief...
      </div>
    );
  }

  const {
    headline,
    summary,
    top_global = [],
    africa_focus = [],
    emerging_trends = [],
    risk_watchlist = [],
    frontier_opportunities = []
  } = data;

  /* =========================
     CARD RENDERER
  ========================= */
  const renderItems = (items) => {
    if (!items || items.length === 0) {
      return <p style={{ color: "#6b7280" }}>No signals available</p>;
    }

    return items.slice(0, 3).map((item, i) => (
      <div
        key={i}
        style={{
          background: "#0b1220",
          padding: 10,
          borderRadius: 8,
          marginBottom: 8,
          borderLeft: "2px solid #2563eb"
        }}
      >
        <strong style={{ fontSize: 13 }}>
          {item.title || item.trend || "Signal"}
        </strong>

        <p style={{ fontSize: 12, color: "#9aa4b2", marginTop: 4 }}>
          {item.why_it_matters || item.risk || item.summary || ""}
        </p>
      </div>
    ));
  };

  return (
    <div style={{
      background: "#0f1720",
      padding: 15,
      borderRadius: 12,
      border: "1px solid #1a2230"
    }}>

      {/* HEADLINE */}
      <h2 style={{
        marginBottom: 8,
        fontSize: 18,
        color: "#f59e0b"
      }}>
        {headline || "Market Intelligence Brief"}
      </h2>

      {/* SUMMARY */}
      <p style={{
        color: "#9aa4b2",
        fontSize: 13,
        marginBottom: 15
      }}>
        {summary || "No summary available"}
      </p>

      {/* GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 15
      }}>

        {/* LEFT COLUMN */}
        <div>

          <h4 style={{ color: "#fff" }}>🌍 Global Signals</h4>
          {renderItems(top_global)}

          <h4 style={{ color: "#fff", marginTop: 15 }}>🇳🇬 Africa Focus</h4>
          {renderItems(africa_focus)}

          <h4 style={{ color: "#fff", marginTop: 15 }}>⚡ Emerging Trends</h4>
          {renderItems(emerging_trends)}

        </div>

        {/* RIGHT COLUMN */}
        <div>

          <h4 style={{ color: "#fff" }}>🚨 Risk Watchlist</h4>
          {renderItems(risk_watchlist)}

          <h4 style={{ color: "#fff", marginTop: 15 }}>🚀 Frontier Opportunities</h4>
          {renderItems(frontier_opportunities)}

        </div>

      </div>
    </div>
  );
}