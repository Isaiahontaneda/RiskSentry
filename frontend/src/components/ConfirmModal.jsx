export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#130c0e", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 14, width: "100%", maxWidth: 380, padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#f43f5e", fontSize: 16 }}>⚠</span>
          </div>
          <div>
            <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: 0 }}>Confirmar eliminación</p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: "3px 0 0" }}>{message}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button onClick={onConfirm} style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", border: "none", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 12px rgba(244,63,94,0.3)" }}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}
