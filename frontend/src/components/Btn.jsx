export default function Btn({ children, color, textColor = "#fff", onClick, disabled }) {
  const bg = color || (disabled ? "rgba(244,63,94,0.3)" : "linear-gradient(135deg, #f43f5e, #e11d48)");
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        color: disabled ? "rgba(255,255,255,0.4)" : textColor,
        border: "none",
        borderRadius: 8,
        padding: "9px 16px",
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        boxShadow: !disabled && !color ? "0 2px 12px rgba(244,63,94,0.3)" : "none",
      }}
    >
      {children}
    </button>
  );
}
