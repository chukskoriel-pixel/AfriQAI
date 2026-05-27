export default function Signals({ data }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h2>Live Signals</h2>

      {data?.slice(0, 10).map((s, i) => (
        <div key={i} style={{ padding: 8, borderBottom: "1px solid #222" }}>
          {s.title}
        </div>
      ))}
    </div>
  );
}