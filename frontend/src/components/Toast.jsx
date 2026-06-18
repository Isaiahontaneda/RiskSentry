export default function Toast({ msg, type }) {
  const isError = type === "error";
  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      background: isError ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
      border: `1px solid ${isError ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`,
      borderRadius: 10,
      padding: "12px 20px",
      color: isError ? "#ef4444" : "#10b981",
      fontSize: 13,
      zIndex: 200,
      backdropFilter: "blur(8px)",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {msg}
    </div>
  );
}
