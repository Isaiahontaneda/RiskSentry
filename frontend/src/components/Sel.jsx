import { selectStyle } from "../styles/theme";

export default function Sel({ label, options, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>
        {label}
      </label>
      <select
        style={{ ...selectStyle, border: error ? "1px solid rgba(244,63,94,0.6)" : selectStyle.border }}
        {...props}
      >
        {options.map(o =>
          typeof o === "string"
            ? <option key={o} value={o} style={{ background: "#1a0f11", color: "#fff" }}>{o}</option>
            : <option key={o.value} value={o.value} style={{ background: "#1a0f11", color: "#fff" }}>{o.label}</option>
        )}
      </select>
      {error && <span style={{ color: "#f43f5e", fontSize: 10 }}>{error}</span>}
    </div>
  );
}
