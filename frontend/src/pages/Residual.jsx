import { CARD } from "../styles/theme";
import { getRiskLevel } from "../utils/risk";
import RiskBadge from "../components/RiskBadge";
import EmptyState from "../components/EmptyState";

export default function Residual({ riesgos, controles, activos }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Riesgo residual</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Evaluación post-implementación de controles</p>
      </div>
      {riesgos.length === 0 ? <EmptyState text="No hay riesgos registrados." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {riesgos.map(r => {
            const ctrl = controles.filter(c => c.riesgo_id === r.id);
            const implementados = ctrl.filter(c => c.estado === "Implementado").length;
            const enProgreso = ctrl.filter(c => c.estado === "Parcial").length;
            const nivelOriginal = getRiskLevel(r.probabilidad, r.impacto);
            const reduccion = Math.min(implementados * 1.0 + enProgreso * 0.3, 3);
            const pResidual = Math.max(1, Math.round(r.probabilidad - reduccion / 2));
            const iResidual = Math.max(1, Math.round(r.impacto - reduccion / 2));
            const nivelResidual = getRiskLevel(pResidual, iResidual);
            const activo = activos.find(a => a.id === r.activo_id);
            const mejoro = (r.probabilidad * r.impacto) > (pResidual * iResidual);
            return (
              <div key={r.id} style={{ ...CARD, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <span style={{ color: "#fff", fontWeight: 500, fontSize: 13 }}>{r.amenaza}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginLeft: 10 }}>Activo: {activo?.nombre || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                    <span style={{ color: "#10b981" }}>{implementados} impl.</span>
                    <span>|</span>
                    <span style={{ color: "#3b82f6" }}>{enProgreso} en progreso</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "center", minWidth: 80 }}>
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "monospace", margin: "0 0 5px" }}>INICIAL</p>
                    <RiskBadge level={nivelOriginal} />
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "monospace", margin: "4px 0 0" }}>{r.probabilidad * r.impacto} pts</p>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                    <span style={{ color: mejoro ? "#10b981" : "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "monospace", whiteSpace: "nowrap" }}>{mejoro ? "▼ redujo" : "sin cambio"}</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                  </div>
                  <div style={{ textAlign: "center", minWidth: 80 }}>
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "monospace", margin: "0 0 5px" }}>RESIDUAL</p>
                    <RiskBadge level={nivelResidual} />
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "monospace", margin: "4px 0 0" }}>{pResidual * iResidual} pts</p>
                  </div>
                </div>
                {ctrl.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {ctrl.map(c => <span key={c.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "2px 8px", borderRadius: 4, fontSize: 10 }}>{c.nombre}</span>)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
