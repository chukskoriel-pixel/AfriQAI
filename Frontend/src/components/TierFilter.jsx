export default function TierFilter({ active, setActive }) {

  const tiers = [
    { label: "All", value: "ALL", color: "#ffffff", icon: "⚪" },
    { label: "Tier 1", value: "TIER_1", color: "#ef4444", icon: "🔴" },
    { label: "Tier 2", value: "TIER_2", color: "#f59e0b", icon: "🟡" },
    { label: "Tier 3", value: "TIER_3", color: "#22c55e", icon: "🟢" },
  ];

  const baseStyle = {
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 12,
    cursor: "pointer",
    border: "1px solid #1f2937",
    background: "transparent",
    color: "#9aa4b2",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s ease"
  };

  const activeStyle = (color) => ({
    border: `1px solid ${color}`,
    background: "#0f1720",
    color: color
  });

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 15,
        flexWrap: "wrap"
      }}
    >
      {tiers.map((t) => (
        <span
          key={t.value}
          onClick={() => setActive(t.value)}
          style={{
            ...baseStyle,
            ...(active === t.value ? activeStyle(t.color) : {})
          }}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </span>
      ))}
    </div>
  );
}