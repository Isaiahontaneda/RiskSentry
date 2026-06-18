import { inputStyle } from "../styles/theme";

export default function Txt({ label, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>
        {label}
      </label>
      <textarea
        style={{ ...inputStyle, minHeight: 80, resize: "vertical", border: error ? "1px solid rgba(244,63,94,0.6)" : inputStyle.border }}
        {...props}
      />
      {error && <span style={{ color: "#f43f5e", fontSize: 10 }}>{error}</span>}
    </div>
  );
}
