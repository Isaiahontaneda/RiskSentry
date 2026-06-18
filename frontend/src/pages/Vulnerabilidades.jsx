import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../lib/supabase";
import Btn from "../components/Btn";
import Inp from "../components/Inp";
import Sel from "../components/Sel";
import Txt from "../components/Txt";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

const SEV_COLORS = { Crítica: "#ef4444", Alta: "#f97316", Media: "#f59e0b", Baja: "#10b981" };
const PARCHE_COLORS = { "Sin parche": "#ef4444", "En prueba": "#f59e0b", "Con parche": "#10b981", "Mitigado": "#3b82f6" };

const EMPTY = {
  cve_id: "", cvss_score: "", severidad_cvss: "Media", descripcion_cve: "",
  activos_afectados: "", riesgos_relacionados: "", fecha_publicacion: "", estado_parche: "Sin parche",
};

export default function Vulnerabilidades() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const fetchItems = () => axios.get(`${API}/vulnerabilidades/`).then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { fetchItems(); }, []);

  const validate = () => {
    const e = {};
    if (!form.cve_id.trim()) e.cve_id = "El ID CVE es requerido";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditando(null); setForm(EMPTY); setErrors({}); setModal(true); };
  const openEdit = (v) => {
    setEditando(v);
    setForm({ cve_id: v.cve_id, cvss_score: v.cvss_score ?? "", severidad_cvss: v.severidad_cvss || "Media", descripcion_cve: v.descripcion_cve || "", activos_afectados: v.activos_afectados || "", riesgos_relacionados: v.riesgos_relacionados || "", fecha_publicacion: v.fecha_publicacion || "", estado_parche: v.estado_parche || "Sin parche" });
    setErrors({}); setModal(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, cvss_score: form.cvss_score !== "" ? +form.cvss_score : null };
      if (editando) { await axios.put(`${API}/vulnerabilidades/${editando.id}`, payload); showToast("Vulnerabilidad actualizada"); }
      else { await axios.post(`${API}/vulnerabilidades/`, payload); showToast("CVE registrado"); }
      await fetchItems(); setModal(false);
    } catch { showToast("Error al guardar", "error"); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/vulnerabilidades/${confirmDelete.id}`);
      showToast("CVE eliminado"); setConfirmDelete(null); await fetchItems();
    } catch { showToast("Error al eliminar", "error"); setConfirmDelete(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {confirmDelete && <ConfirmModal message={`¿Eliminar ${confirmDelete.cve_id}?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
      {toast && <Toast {...toast} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Vulnerabilidades CVE</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Registro de CVEs · CVSS score · Estado de parche</p>
        </div>
        <Btn onClick={openCreate}>+ Registrar CVE</Btn>
      </div>

      {items.length === 0 ? <EmptyState text="No hay vulnerabilidades registradas." /> : (
        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["CVE ID","CVSS","Severidad","Descripción","Activos afectados","Estado parche","Acciones"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "9px 12px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((v, idx) => (
                <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: idx % 2 === 0 ? "rgba(13,10,11,0.6)" : "rgba(10,8,9,0.6)" }}>
                  <td style={{ padding: "9px 12px", color: "#f43f5e", fontFamily: "monospace", fontWeight: 600 }}>{v.cve_id}</td>
                  <td style={{ padding: "9px 12px", color: SEV_COLORS[v.severidad_cvss] || "#fff", fontFamily: "monospace", fontWeight: 600 }}>{v.cvss_score ?? "—"}</td>
                  <td style={{ padding: "9px 12px" }}><span style={{ background: `${SEV_COLORS[v.severidad_cvss] || "#888"}20`, color: SEV_COLORS[v.severidad_cvss] || "#888", border: `1px solid ${SEV_COLORS[v.severidad_cvss] || "#888"}30`, padding: "2px 7px", borderRadius: 4, fontSize: 10, fontFamily: "monospace" }}>{v.severidad_cvss || "—"}</span></td>
                  <td style={{ padding: "9px 12px", color: "rgba(255,255,255,0.5)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.descripcion_cve || "—"}</td>
                  <td style={{ padding: "9px 12px", color: "rgba(255,255,255,0.45)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.activos_afectados || "—"}</td>
                  <td style={{ padding: "9px 12px" }}><span style={{ background: `${PARCHE_COLORS[v.estado_parche] || "#888"}20`, color: PARCHE_COLORS[v.estado_parche] || "#888", border: `1px solid ${PARCHE_COLORS[v.estado_parche] || "#888"}30`, padding: "2px 7px", borderRadius: 4, fontSize: 10, fontFamily: "monospace" }}>{v.estado_parche}</span></td>
                  <td style={{ padding: "9px 12px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(v)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                      <button onClick={() => setConfirmDelete(v)} style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editando ? "Editar CVE" : "Registrar vulnerabilidad CVE"} onClose={() => setModal(false)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Inp label="CVE ID" value={form.cve_id} onChange={e => setForm({ ...form, cve_id: e.target.value })} placeholder="CVE-2024-XXXXX" error={errors.cve_id} />
              <Inp label="CVSS Score" type="number" min={0} max={10} step={0.1} value={form.cvss_score} onChange={e => setForm({ ...form, cvss_score: e.target.value })} placeholder="0.0 – 10.0" />
              <Sel label="Severidad CVSS" value={form.severidad_cvss} onChange={e => setForm({ ...form, severidad_cvss: e.target.value })} options={["Crítica","Alta","Media","Baja"]} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Sel label="Estado del parche" value={form.estado_parche} onChange={e => setForm({ ...form, estado_parche: e.target.value })} options={["Sin parche","En prueba","Con parche","Mitigado"]} />
              <Inp label="Fecha publicación" type="date" value={form.fecha_publicacion} onChange={e => setForm({ ...form, fecha_publicacion: e.target.value })} />
            </div>
            <Txt label="Descripción CVE" value={form.descripcion_cve} onChange={e => setForm({ ...form, descripcion_cve: e.target.value })} placeholder="Descripción técnica de la vulnerabilidad..." />
            <Inp label="Activos afectados" value={form.activos_afectados} onChange={e => setForm({ ...form, activos_afectados: e.target.value })} placeholder="Ej. Servidor web, App móvil" />
            <Inp label="Riesgos relacionados" value={form.riesgos_relacionados} onChange={e => setForm({ ...form, riesgos_relacionados: e.target.value })} placeholder="Ej. RISK-001, RISK-002" />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={handleSubmit} disabled={loading}>{loading ? "Guardando..." : editando ? "Guardar cambios" : "Registrar CVE"}</Btn>
              <Btn onClick={() => setModal(false)} color="rgba(255,255,255,0.06)" textColor="rgba(255,255,255,0.5)">Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
