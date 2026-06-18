import { useState } from "react";
import axios from "axios";
import { API } from "../lib/supabase";
import { CARD } from "../styles/theme";
import { getRiskLevel } from "../utils/risk";

const TIPOS_REPORTE = [
  { tipo: "ejecutivo",   label: "Resumen Ejecutivo",      desc: "Resumen para alta dirección: KPIs, riesgos críticos y estado general del SGSI.",           tags: ["KPIs","Dirección","ISO 27001"] },
  { tipo: "activos",     label: "Inventario de Activos",  desc: "Inventario CID completo con clasificación, responsables y ubicación de cada activo.",       tags: ["CID","Clasificación","ACT-XXX"] },
  { tipo: "riesgos",     label: "Análisis de Riesgos",    desc: "Matriz P×I 1-4, nivel, estado y CVE asociado por cada riesgo identificado.",                tags: ["P×I","RISK-XXX","CVE"] },
  { tipo: "controles",   label: "Estado de Controles",    desc: "Listado de los 93 controles ISO 27002:2022 con tipo, estado y progreso.",                   tags: ["ISO 27002","93 controles","Progreso"] },
  { tipo: "tratamiento", label: "Plan de Tratamiento",    desc: "Estrategias Mitigar/Aceptar/Transferir/Evitar con responsables y fechas de cada control.",  tags: ["Mitigar","Fechas","Responsables"] },
  { tipo: "monitoreo",   label: "Monitoreo de Controles", desc: "Seguimiento periódico de controles: frecuencia, cumplimiento y acciones de remediación.",   tags: ["Seguimiento","Cumplimiento","Fechas"] },
  { tipo: "cve",         label: "Vulnerabilidades CVE",   desc: "Listado de CVEs registrados ordenado por CVSS score con estado de parche y activos afectados.", tags: ["CVE","CVSS","Parche"] },
  { tipo: "completo",    label: "Informe Completo SGSI",  desc: "Documento consolidado con todos los módulos: activos, riesgos, controles, monitoreo y CVE.", tags: ["Completo","SGSI","ISO 27001/27002"] },
];

export default function Reportes({ activos, riesgos, controles }) {
  const [loadingTipo, setLoadingTipo] = useState(null);

  const handleDownload = async (tipo) => {
    setLoadingTipo(tipo);
    try {
      const res = await axios.get(`${API}/reportes/generar?tipo=${tipo}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `RiskSentry_${tipo}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("Error al generar el reporte. Verifica que el backend esté activo."); }
    setLoadingTipo(null);
  };

  const criticos = riesgos.filter(r => getRiskLevel(r.probabilidad, r.impacto) === "Crítico").length;
  const impl = controles.filter(c => c.estado === "Implementado").length;
  const eficacia = controles.length > 0 ? Math.round((impl / controles.length) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Generación de reportes</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Informes PDF alineados a ISO/IEC 27001:2022 · 27002:2022</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, ...CARD, padding: 18 }}>
        {[
          { label: "Activos", val: activos.length, color: "#f43f5e" },
          { label: "Riesgos críticos", val: criticos, color: "#ef4444" },
          { label: "Eficacia controles", val: `${eficacia}%`, color: "#10b981" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
            <p style={{ color, fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "monospace" }}>{val}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {TIPOS_REPORTE.map(({ tipo, label, desc, tags }) => (
          <div key={tipo} style={{ ...CARD, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <h3 style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>{label}</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {tags.map(t => (
                <span key={t} style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "rgba(244,63,94,0.8)", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontFamily: "monospace" }}>{t}</span>
              ))}
            </div>
            <button
              onClick={() => handleDownload(tipo)}
              disabled={loadingTipo === tipo}
              style={{ background: loadingTipo === tipo ? "rgba(244,63,94,0.3)" : "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: loadingTipo === tipo ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: "auto", boxShadow: loadingTipo !== tipo ? "0 2px 12px rgba(244,63,94,0.3)" : "none" }}
            >
              {loadingTipo === tipo ? "Generando..." : "Descargar PDF"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
