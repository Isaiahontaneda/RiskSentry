import { RISK_COLORS } from "../constants/colors";

export default function RiskBadge({ level }) {
  const c = RISK_COLORS[level] || RISK_COLORS["Bajo"];
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontFamily: "monospace" }}>
      {level}
    </span>
  );
}
