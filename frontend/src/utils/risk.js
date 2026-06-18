export function getRiskLevel(p, i) {
  const n = p * i;
  if (n <= 4)  return "Bajo";
  if (n <= 8)  return "Medio";
  if (n <= 12) return "Alto";
  return "Crítico";
}

export function getRiskColor(level) {
  const map = { Bajo: "#10b981", Medio: "#f59e0b", Alto: "#f97316", Crítico: "#ef4444" };
  return map[level] || "#8b949e";
}

export function getMatrizColor(score) {
  if (score <= 4)  return "#10b981";
  if (score <= 8)  return "#f59e0b";
  if (score <= 12) return "#f97316";
  return "#ef4444";
}

export function getAssetClasif(a) {
  const avg = (a.confidencialidad + a.integridad + a.disponibilidad) / 3;
  if (avg >= 3.5) return "Muy Alta";
  if (avg >= 3.0) return "Alta";
  if (avg >= 2.0) return "Media";
  return "Baja";
}
