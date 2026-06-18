export default function EmptyState({ text }) {
  return (
    <div style={{ background: "rgba(13,10,11,0.5)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: 48, textAlign: "center", backdropFilter: "blur(8px)" }}>
      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>{text}</p>
    </div>
  );
}
