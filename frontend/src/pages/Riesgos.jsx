import { useState } from "react";
import axios from "axios";
import { API } from "../lib/supabase";
import { CARD } from "../styles/theme";
import { getRiskLevel, getMatrizColor } from "../utils/risk";
import Btn from "../components/Btn";
import Inp from "../components/Inp";
import Sel from "../components/Sel";
import Txt from "../components/Txt";
import RiskBadge from "../components/RiskBadge";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

export default function Riesgos({ riesgos, activos, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ activo_id: "", amenaza: "", vulnerabilidad: "", tipo_amenaza: "Técnica", probabilidad: 2, impacto: 2, estado: "Identificado", area_responsable: "", responsable_nombre: "", responsable_cargo: "", cve_code: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState("Todos");
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = riesgos
    .filter(r => filterLevel === "Todos" || getRiskLevel(r.probabilidad, r.impacto) === filterLevel)
    .sort((a, b) => (b.probabilidad * b.impacto) - (a.probabilidad * a.impacto));
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const validate = () => {
    const e = {};
    if (!form.activo_id) e.activo_id = "Selecciona un activo";
    if (!form.amenaza.trim()) e.amenaza = "La amenaza es requerida";
    if (!form.vulnerabilidad.trim()) e.vulnerabilidad = "La vulnerabilidad es requerida";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditando(null); setForm({ activo_id: "", amenaza: "", vulnerabilidad: "", tipo_amenaza: "Técnica", probabilidad: 2, impacto: 2, estado: "Identificado", area_responsable: "", responsable_nombre: "", responsable_cargo: "", cve_code: "" }); setErrors({}); setModal(true); };
  const openEdit = (r) => { setEditando(r); setForm({ activo_id: r.activo_id, amenaza: r.amenaza, vulnerabilidad: r.vulnerabilidad, tipo_amenaza: "Técnica", probabilidad: r.probabilidad, impacto: r.impacto, estado: r.estado || "Identificado", area_responsable: r.area_responsable || "", responsable_nombre: r.responsable_nombre || "", responsable_cargo: r.responsable_cargo || "", cve_code: r.cve_code || "" }); setErrors({}); setModal(true); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { activo_id: form.activo_id, amenaza: form.amenaza, vulnerabilidad: form.vulnerabilidad, probabilidad: +form.probabilidad, impacto: +form.impacto, estado: form.estado, area_responsable: form.area_responsable, responsable_nombre: form.responsable_nombre, responsable_cargo: form.responsable_cargo, cve_code: form.cve_code };
      if (editando) { await axios.put(`${API}/riesgos/${editando.id}`, payload); showToast("Riesgo actualizado"); }
      else { await axios.post(`${API}/riesgos/`, payload); showToast("Riesgo registrado"); }
      setModal(false); onRefresh();
    } catch { showToast("Error al guardar", "error"); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/riesgos/${confirmDelete.id}`);
      showToast("Riesgo eliminado"); setConfirmDelete(null); onRefresh();
    } catch { showToast("Error al eliminar", "error"); setConfirmDelete(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {confirmDelete && <ConfirmModal message={`¿Eliminar el riesgo "${confirmDelete.amenaza}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
      {toast && <Toast {...toast} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Identificación de riesgos</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Amenazas, vulnerabilidades y cálculo P×I</p>
        </div>
        <Btn onClick={openCreate}>+ Nuevo riesgo</Btn>
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {["Todos", "Bajo", "Medio", "Alto", "Crítico"].map(l => (
          <button key={l} onClick={() => setFilterLevel(l)} style={{ background: filterLevel === l ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${filterLevel === l ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.08)"}`, color: filterLevel === l ? "#f43f5e" : "rgba(255,255,255,0.45)", borderRadius: 6, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
        ))}
        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "monospace" }}>{filtered.length} riesgo(s)</span>
      </div>

      {filtered.length === 0 ? <EmptyState text="No hay riesgos en esta categoría." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(r => {
            const activo = activos.find(a => a.id === r.activo_id);
            const level = getRiskLevel(r.probabilidad, r.impacto);
            const expanded = expandedId === r.id;
            const score = r.probabilidad * r.impacto;
            const col = getMatrizColor(score);
            return (
              <div key={r.id} style={{ ...CARD, overflow: "hidden" }}>
                <div onClick={() => setExpandedId(expanded ? null : r.id)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${col}15`, border: `1px solid ${col}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: col, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{score}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ color: "#fff", fontWeight: 500, fontSize: 13 }}>{r.amenaza}</span>
                      <RiskBadge level={level} />
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Activo: <span style={{ color: "rgba(255,255,255,0.55)" }}>{activo?.nombre || "N/A"}</span></span>
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "monospace", margin: 0 }}>PROB</p>
                      <p style={{ color: "#f43f5e", fontFamily: "monospace", fontSize: 13, fontWeight: 600, margin: 0 }}>{r.probabilidad}</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "monospace", margin: 0 }}>IMP</p>
                      <p style={{ color: "#f43f5e", fontFamily: "monospace", fontSize: 13, fontWeight: 600, margin: 0 }}>{r.impacto}</p>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
                  </div>
                </div>
                {expanded && (
                  <div style={{ padding: "12px 16px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", margin: "0 0 4px" }}>Vulnerabilidad</p>
                        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}>{r.vulnerabilidad}</p>
                      </div>
                      <div>
                        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", margin: "0 0 4px" }}>Nivel P×I</p>
                        <p style={{ color: col, fontSize: 12, fontFamily: "monospace", margin: 0 }}>{r.probabilidad} × {r.impacto} = {score}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={e => { e.stopPropagation(); openEdit(r); }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete(r); }} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Eliminar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={editando ? "Editar riesgo" : "Registrar riesgo cibernético"} onClose={() => setModal(false)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Sel label="Activo asociado" value={form.activo_id} onChange={e => setForm({ ...form, activo_id: e.target.value })} options={[{ value: "", label: "Seleccionar activo" }, ...activos.map(a => ({ value: a.id, label: a.nombre }))]} error={errors.activo_id} />
              <Sel label="Tipo de amenaza" value={form.tipo_amenaza} onChange={e => setForm({ ...form, tipo_amenaza: e.target.value })} options={["Técnica","Humana","Física","Ambiental","Organizacional"]} />
            </div>
            <Inp label="Amenaza identificada" value={form.amenaza} onChange={e => setForm({ ...form, amenaza: e.target.value })} placeholder="Ej. Acceso no autorizado al sistema" error={errors.amenaza} />
            <Txt label="Vulnerabilidad asociada" value={form.vulnerabilidad} onChange={e => setForm({ ...form, vulnerabilidad: e.target.value })} placeholder="Describe la debilidad que podría ser explotada..." error={errors.vulnerabilidad} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Inp label="CVE (opcional)" value={form.cve_code} onChange={e => setForm({ ...form, cve_code: e.target.value })} placeholder="CVE-2024-XXXXX" />
              <Inp label="Área responsable" value={form.area_responsable} onChange={e => setForm({ ...form, area_responsable: e.target.value })} placeholder="Área" />
              <Sel label="Estado del riesgo" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} options={["Identificado","En tratamiento","Tratado","Aceptado"]} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Inp label="Responsable" value={form.responsable_nombre} onChange={e => setForm({ ...form, responsable_nombre: e.target.value })} placeholder="Nombre" />
              <Inp label="Cargo" value={form.responsable_cargo} onChange={e => setForm({ ...form, responsable_cargo: e.target.value })} placeholder="Cargo" />
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 14 }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>Valoración del riesgo — escala 1-4</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase" }}>Probabilidad: {form.probabilidad} — {["","Baja","Media","Alta","Muy Alta"][form.probabilidad]}</label>
                  <input type="range" min={1} max={4} value={form.probabilidad} onChange={e => setForm({ ...form, probabilidad: +e.target.value })} style={{ width: "100%", margin: "8px 0 4px", accentColor: "#f43f5e" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}><span>Baja</span><span>Muy alta</span></div>
                </div>
                <div>
                  <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase" }}>Impacto: {form.impacto} — {["","Bajo","Medio","Alto","Muy Alto"][form.impacto]}</label>
                  <input type="range" min={1} max={4} value={form.impacto} onChange={e => setForm({ ...form, impacto: +e.target.value })} style={{ width: "100%", margin: "8px 0 4px", accentColor: "#f43f5e" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}><span>Bajo</span><span>Muy alto</span></div>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "monospace" }}>P({form.probabilidad}) × I({form.impacto}) = <span style={{ color: getMatrizColor(form.probabilidad * form.impacto), fontSize: 16, fontWeight: 700 }}>{form.probabilidad * form.impacto}</span></span>
                <RiskBadge level={getRiskLevel(form.probabilidad, form.impacto)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={handleSubmit} disabled={loading}>{loading ? "Guardando..." : editando ? "Guardar cambios" : "Registrar riesgo"}</Btn>
              <Btn onClick={() => setModal(false)} color="rgba(255,255,255,0.06)" textColor="rgba(255,255,255,0.5)">Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
