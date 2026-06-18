export default function StatCard({ label, value, accent, sub }) {
  const a = accent || "#f43f5e";
  return (
    <div style={{ background: "rgba(13,10,11,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 18, position: "relative", overflow: "hidden", backdropFilter: "blur(8px)" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${a}80, transparent)` }} />
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 6px" }}>{label}</p>
      <p style={{ color: a, fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: "5px 0 0" }}>{sub}</p>}
    </div>
  );
}
