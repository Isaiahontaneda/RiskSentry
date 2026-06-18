import { CARD } from "../styles/theme";
import { TIPO_COLORS } from "../constants/colors";
import { getRiskLevel, getRiskColor, getMatrizColor, getAssetClasif } from "../utils/risk";
import StatCard from "../components/StatCard";
import RiskBadge from "../components/RiskBadge";

export default function Dashboard({ activos, riesgos, controles }) {
  const criticos = riesgos.filter(r => getRiskLevel(r.probabilidad, r.impacto) === "Crítico").length;
  const altos = riesgos.filter(r => getRiskLevel(r.probabilidad, r.impacto) === "Alto").length;
  const controlados = controles.filter(c => c.estado === "Implementado").length;
  const enProgreso = controles.filter(c => c.estado === "Parcial").length;

  const dist = ["Bajo", "Medio", "Alto", "Crítico"].map(level => ({
    level,
    count: riesgos.filter(r => getRiskLevel(r.probabilidad, r.impacto) === level).length,
    color: getRiskColor(level),
  }));
  const maxDist = Math.max(...dist.map(d => d.count), 1);

  const tiposActivos = activos.reduce((acc, a) => { acc[a.tipo] = (acc[a.tipo] || 0) + 1; return acc; }, {});

  const matrizData = {};
  riesgos.forEach(r => {
    const key = `${r.probabilidad}-${r.impacto}`;
    matrizData[key] = (matrizData[key] || 0) + 1;
  });

  const eficacia = controles.length > 0 ? Math.round((controlados / controles.length) * 100) : 0;

  const riesgoResidualProm = riesgos.length > 0
    ? (riesgos.reduce((acc, r) => {
        const ctrl = controles.filter(c => c.riesgo_id === r.id);
        const impl = ctrl.filter(c => c.estado === "Implementado").length;
        const red = Math.min(impl * 1.0, 3);
        const pR = Math.max(1, r.probabilidad - red / 2);
        const iR = Math.max(1, r.impacto - red / 2);
        return acc + pR * iR;
      }, 0) / riesgos.length).toFixed(1)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Panel de control</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Estado general del sistema de gestión de riesgos · ISO 27005</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "monospace" }}>Monitoreo en vivo</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Activos" value={activos.length} accent="#f43f5e" sub="registrados e inventariados" />
        <StatCard label="Riesgos" value={riesgos.length} accent="#f43f5e" sub="identificados y evaluados" />
        <StatCard label="Críticos" value={criticos} accent="#ef4444" sub="requieren atención inmediata" />
        <StatCard label="Implementados" value={controlados} accent="#10b981" sub={`controles activos · ${eficacia}% cobertura`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {/* Matriz de riesgo P×I */}
        <div style={{ ...CARD, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#f43f5e" }}>▦</span> Matriz de riesgo</h3>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}>4 × 4</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: "0 0 12px" }}>Probabilidad × Impacto — escala 1-4 ISO 27005</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3 }}>
            {[4, 3, 2, 1].map(prob =>
              [1, 2, 3, 4].map(imp => {
                const key = `${prob}-${imp}`;
                const count = matrizData[key] || 0;
                const score = prob * imp;
                const col = getMatrizColor(score);
                return (
                  <div key={key} style={{ aspectRatio: "1", borderRadius: 4, background: count > 0 ? col : `${col}18`, border: `1px solid ${col}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {count > 0 && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{count}</span>}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "monospace" }}>IMPACTO →</span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "monospace" }}>↑ PROBABILIDAD</span>
          </div>
        </div>

        {/* Distribución de riesgos */}
        <div style={{ ...CARD, padding: 18 }}>
          <h3 style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#f43f5e" }}>◬</span> Distribución de riesgos</h3>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: "0 0 14px" }}>Clasificación según nivel de severidad calculado</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dist.map(({ level, count, color }) => (
              <div key={level} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color, fontSize: 10, fontFamily: "monospace", width: 48 }}>{level}</span>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / maxDist) * 100}%`, background: color, opacity: 0.85, borderRadius: 3, transition: "width 0.6s" }} />
                </div>
                <span style={{ color, fontSize: 11, fontFamily: "monospace", fontWeight: 600, width: 16 }}>{count}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", margin: "0 0 4px" }}>Riesgo residual</p>
              <p style={{ color: "#f43f5e", fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "monospace" }}>{riesgoResidualProm}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>/16</span></p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", margin: "0 0 4px" }}>Eficacia controles</p>
              <p style={{ color: "#10b981", fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "monospace" }}>{eficacia}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>%</span></p>
            </div>
          </div>
        </div>

        {/* Activos por tipo */}
        <div style={{ ...CARD, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <h3 style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#f43f5e" }}>◈</span> Activos por tipo</h3>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}>{activos.length} TOTAL</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: "0 0 14px" }}>Distribución del inventario clasificado</p>
          {activos.length > 0 && (() => {
            const total = activos.length;
            const entries = Object.entries(tiposActivos);
            let offset = 0;
            const r = 38, cx = 50, cy = 50, circ = 2 * Math.PI * r;
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <svg width={100} height={100} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
                  {entries.map(([tipo, count], i) => {
                    const pct = count / total;
                    const dash = pct * circ;
                    const gap = circ - dash;
                    const el = (
                      <circle key={tipo} cx={cx} cy={cy} r={r} fill="none" stroke={TIPO_COLORS[i % TIPO_COLORS.length]} strokeWidth={14} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circ} style={{ transition: "all 0.6s" }} />
                    );
                    offset += pct;
                    return el;
                  })}
                  <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700}>{total}</text>
                  <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>activos</text>
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
                  {entries.map(([tipo, count], i) => (
                    <div key={tipo} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: TIPO_COLORS[i % TIPO_COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, flex: 1 }}>{tipo}</span>
                      <span style={{ color: TIPO_COLORS[i % TIPO_COLORS.length], fontSize: 10, fontFamily: "monospace", fontWeight: 600 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          {activos.length === 0 && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Sin activos registrados.</p>}
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            {[{ label: "Muy Alta", val: activos.filter(a => getAssetClasif(a) === "Muy Alta").length, color: "#ef4444" },
              { label: "Alta", val: activos.filter(a => getAssetClasif(a) === "Alta").length, color: "#f59e0b" }
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, width: 56 }}>{label}</span>
                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: activos.length > 0 ? `${(val / activos.length) * 100}%` : "0%", background: color, borderRadius: 2 }} />
                </div>
                <span style={{ color, fontSize: 10, fontFamily: "monospace", width: 16 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Estado de controles */}
        <div style={{ ...CARD, padding: 18 }}>
          <h3 style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#f43f5e" }}>◉</span> Estado de controles</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Implementados", val: controlados, color: "#10b981" },
              { label: "Parcial", val: enProgreso, color: "#3b82f6" },
              { label: "No implementados", val: controles.filter(c => c.estado === "No implementado").length, color: "#f59e0b" },
            ].map(({ label, val, color }) => {
              const pct = controles.length > 0 ? (val / controles.length) * 100 : 0;
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{label}</span>
                    <span style={{ color, fontSize: 11, fontFamily: "monospace", fontWeight: 600 }}>{val} <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.6s" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Total de controles</span>
            <span style={{ color: "#f43f5e", fontSize: 16, fontFamily: "monospace", fontWeight: 700 }}>{controles.length}</span>
          </div>
        </div>

        {/* Alertas */}
        <div style={{ ...CARD, padding: 18 }}>
          <h3 style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#ef4444" }}>⚠</span> Alertas de prioridad</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {criticos > 0 && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}><span style={{ color: "#ef4444", fontWeight: 600 }}>{criticos} riesgo(s) crítico(s)</span> sin resolver</p>
              </div>
            )}
            {altos > 0 && (
              <div style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}><span style={{ color: "#f97316", fontWeight: 600 }}>{altos} riesgo(s) alto(s)</span> requieren revisión</p>
              </div>
            )}
            {controles.filter(c => c.estado === "No implementado").length > 0 && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}><span style={{ color: "#f59e0b", fontWeight: 600 }}>{controles.filter(c => c.estado === "No implementado").length} control(es)</span> pendientes</p>
              </div>
            )}
            {criticos === 0 && altos === 0 && controles.filter(c => c.estado === "No implementado").length === 0 && (
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}>Sin alertas activas. Sistema bajo control.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla últimos riesgos */}
      <div style={{ ...CARD, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h3 style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0 }}>▤ Últimos riesgos registrados</h3>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}>{riesgos.length} ACTIVOS</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: "0 0 12px" }}>Registro cronológico de amenazas evaluadas · P = Probabilidad · I = Impacto</p>
        {riesgos.length === 0 ? <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Sin riesgos registrados aún.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Amenaza", "Vulnerabilidad", "Activo", "P", "I", "Nivel"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "5px 10px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riesgos.slice(-8).reverse().map(r => {
                const activo = activos.find(a => a.id === r.activo_id);
                const level = getRiskLevel(r.probabilidad, r.impacto);
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "8px 10px", color: "rgba(255,255,255,0.85)" }}>{r.amenaza}</td>
                    <td style={{ padding: "8px 10px", color: "rgba(255,255,255,0.45)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.vulnerabilidad}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", padding: "2px 6px", borderRadius: 4, fontSize: 10 }}>{activo?.tipo || "N/A"}</span>
                    </td>
                    <td style={{ padding: "8px 10px", color: "#f43f5e", fontFamily: "monospace" }}>{r.probabilidad}</td>
                    <td style={{ padding: "8px 10px", color: "#f43f5e", fontFamily: "monospace" }}>{r.impacto}</td>
                    <td style={{ padding: "8px 10px" }}><RiskBadge level={level} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
