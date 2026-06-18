import { useState } from "react";
import axios from "axios";
import { API } from "../lib/supabase";
import { CARD, selectStyle } from "../styles/theme";
import { ESTADO_CTRL_COLORS, ESTRATEGIA_COLORS } from "../constants/colors";
import { ISO_CONTROLES } from "../constants/isoControles";
import Btn from "../components/Btn";
import Inp from "../components/Inp";
import Sel from "../components/Sel";
import Txt from "../components/Txt";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

const ESTADOS_CTRL = ["No implementado", "Parcial", "Implementado", "No aplica"];

const EMPTY_CTRL = {
  riesgo_id: "", nombre: "", descripcion: "", estrategia: "Mitigar",
  tipo_control: "Preventivo", responsable: "", responsable_cargo: "",
  responsable_area: "", iso_referencia: "", dominio_iso: "",
  estado: "No implementado", fecha_inicio: "", fecha_fin: "",
  evidencia: "", resultado_esperado: "", progreso: 0, recursos_necesarios: "",
};

export default function Controles({ controles, riesgos, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(EMPTY_CTRL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [toast, setToast] = useState(null);

  const filtered = controles.filter(c => filterEstado === "Todos" || c.estado === filterEstado);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const validate = () => {
    const e = {};
    if (!form.riesgo_id) e.riesgo_id = "Selecciona un riesgo";
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditando(null); setForm(EMPTY_CTRL); setErrors({}); setModal(true); };
  const openEdit = (c) => {
    setEditando(c);
    setForm({ riesgo_id: c.riesgo_id, nombre: c.nombre, descripcion: c.descripcion || "", estrategia: c.estrategia, tipo_control: c.tipo_control || "Preventivo", responsable: c.responsable || "", responsable_cargo: c.responsable_cargo || "", responsable_area: c.responsable_area || "", iso_referencia: c.iso_referencia || "", dominio_iso: c.dominio_iso || "", estado: c.estado, fecha_inicio: c.fecha_inicio || "", fecha_fin: c.fecha_fin || "", evidencia: c.evidencia || "", resultado_esperado: c.resultado_esperado || "", progreso: c.progreso || 0, recursos_necesarios: c.recursos_necesarios || "" });
    setErrors({}); setModal(true);
  };

  const handleISOSelect = (ref) => {
    const iso = ISO_CONTROLES.find(i => i.ref === ref);
    if (iso) setForm(f => ({ ...f, iso_referencia: `ISO 27002:2022 - ${iso.ref}`, dominio_iso: iso.dom, nombre: iso.nombre, descripcion: iso.desc }));
    else setForm(f => ({ ...f, iso_referencia: ref }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { riesgo_id: form.riesgo_id, nombre: form.nombre, descripcion: form.descripcion, estrategia: form.estrategia, tipo_control: form.tipo_control, responsable: form.responsable, responsable_cargo: form.responsable_cargo, responsable_area: form.responsable_area, iso_referencia: form.iso_referencia, dominio_iso: form.dominio_iso, estado: form.estado, fecha_inicio: form.fecha_inicio || null, fecha_fin: form.fecha_fin || null, evidencia: form.evidencia, resultado_esperado: form.resultado_esperado, progreso: +form.progreso, recursos_necesarios: form.recursos_necesarios };
      if (editando) { await axios.put(`${API}/controles/${editando.id}`, payload); showToast("Control actualizado"); }
      else { await axios.post(`${API}/controles/`, payload); showToast("Control registrado"); }
      setModal(false); onRefresh();
    } catch { showToast("Error al guardar", "error"); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/controles/${confirmDelete.id}`);
      showToast("Control eliminado"); setConfirmDelete(null); onRefresh();
    } catch { showToast("Error al eliminar", "error"); setConfirmDelete(null); }
  };

  const handleUpdateEstado = async (id, nuevoEstado) => {
    const ctrl = controles.find(c => c.id === id);
    try {
      await axios.put(`${API}/controles/${id}`, { ...ctrl, estado: nuevoEstado });
      showToast("Estado actualizado"); onRefresh();
    } catch { showToast("Error al actualizar estado", "error"); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {confirmDelete && <ConfirmModal message={`¿Eliminar el control "${confirmDelete.nombre}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
      {toast && <Toast {...toast} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Tratamiento del riesgo</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Controles basados en ISO/IEC 27002:2022</p>
        </div>
        <Btn onClick={openCreate}>+ Nuevo control</Btn>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {["Todos", ...ESTADOS_CTRL].map(e => (
          <button key={e} onClick={() => setFilterEstado(e)} style={{ background: filterEstado === e ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${filterEstado === e ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.08)"}`, color: filterEstado === e ? "#f43f5e" : "rgba(255,255,255,0.45)", borderRadius: 6, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{e}</button>
        ))}
      </div>

      {filtered.length === 0 ? <EmptyState text="No hay controles registrados." /> : (
        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map(c => {
            const riesgo = riesgos.find(r => r.id === c.riesgo_id);
            const ec = ESTRATEGIA_COLORS[c.estrategia] || "#888";
            return (
              <div key={c.id} style={{ ...CARD, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ color: "#fff", fontWeight: 500, fontSize: 13 }}>{c.nombre}</span>
                      <span style={{ background: `${ec}20`, color: ec, border: `1px solid ${ec}30`, padding: "2px 7px", borderRadius: 4, fontSize: 10, fontFamily: "monospace" }}>{c.estrategia}</span>
                      {c.iso_referencia && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}>{c.iso_referencia}</span>}
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "0 0 6px" }}>{c.descripcion}</p>
                    <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>Riesgo: <span style={{ color: "rgba(255,255,255,0.55)" }}>{riesgo?.amenaza || "N/A"}</span></span>
                      {c.responsable && <span style={{ color: "rgba(255,255,255,0.3)" }}>Responsable: <span style={{ color: "rgba(255,255,255,0.55)" }}>{c.responsable}</span></span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <select value={c.estado} onChange={e => handleUpdateEstado(c.id, e.target.value)} style={{ background: "#1a0f11", border: `1px solid ${(ESTADO_CTRL_COLORS[c.estado] || "#6b7280")}40`, color: ESTADO_CTRL_COLORS[c.estado] || "#6b7280", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", outline: "none", colorScheme: "dark" }}>
                      {ESTADOS_CTRL.map(s => <option key={s} value={s} style={{ background: "#1a0f11", color: "#fff" }}>{s}</option>)}
                    </select>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(c)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                      <button onClick={() => setConfirmDelete(c)} style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Eliminar</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={editando ? "Editar control" : "Registrar control de seguridad"} onClose={() => setModal(false)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Sel label="Riesgo a tratar" value={form.riesgo_id} onChange={e => setForm({ ...form, riesgo_id: e.target.value })} options={[{ value: "", label: "Seleccionar riesgo" }, ...riesgos.map(r => ({ value: r.id, label: r.amenaza }))]} error={errors.riesgo_id} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>Control ISO 27002:2022 (predefinido)</label>
              <select onChange={e => handleISOSelect(e.target.value)} value={form.iso_referencia} style={selectStyle}>
                <option value="" style={{ background: "#1a0f11", color: "#fff" }}>— Seleccionar control ISO o ingresar manualmente —</option>
                {ISO_CONTROLES.map(iso => (
                  <option key={iso.ref} value={iso.ref} style={{ background: "#1a0f11", color: "#fff" }}>{iso.ref} — {iso.nombre}</option>
                ))}
              </select>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: "2px 0 0" }}>Al seleccionar un control ISO se autocompletarán el nombre y la descripción.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Inp label="Nombre del control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Autenticación multifactor" error={errors.nombre} />
              <Inp label="Referencia ISO (editable)" value={form.iso_referencia} onChange={e => setForm({ ...form, iso_referencia: e.target.value })} placeholder="Ej. ISO 27002:2022 - 8.5" />
            </div>
            <Txt label="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Cómo este control mitiga el riesgo..." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Sel label="Estrategia" value={form.estrategia} onChange={e => setForm({ ...form, estrategia: e.target.value })} options={["Mitigar","Transferir","Aceptar","Evitar"]} />
              <Sel label="Tipo de control" value={form.tipo_control} onChange={e => setForm({ ...form, tipo_control: e.target.value })} options={["Preventivo","Detectivo","Correctivo","Compensatorio"]} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Inp label="Responsable" value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} placeholder="Nombre" />
              <Inp label="Cargo" value={form.responsable_cargo} onChange={e => setForm({ ...form, responsable_cargo: e.target.value })} placeholder="Cargo" />
              <Inp label="Área" value={form.responsable_area} onChange={e => setForm({ ...form, responsable_area: e.target.value })} placeholder="Área" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Sel label="Estado" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} options={ESTADOS_CTRL} />
              <Inp label="Fecha inicio" type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} />
              <Inp label="Fecha fin" type="date" value={form.fecha_fin} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>Progreso: {form.progreso}%</label>
              <input type="range" min={0} max={100} step={5} value={form.progreso} onChange={e => setForm({ ...form, progreso: +e.target.value })} style={{ accentColor: "#f43f5e" }} />
            </div>
            <Txt label="Evidencia" value={form.evidencia} onChange={e => setForm({ ...form, evidencia: e.target.value })} placeholder="Describe la evidencia del control implementado..." />
            <Txt label="Resultado esperado" value={form.resultado_esperado} onChange={e => setForm({ ...form, resultado_esperado: e.target.value })} placeholder="Qué resultado se espera obtener..." />
            <Inp label="Recursos necesarios" value={form.recursos_necesarios} onChange={e => setForm({ ...form, recursos_necesarios: e.target.value })} placeholder="Presupuesto, herramientas, personal..." />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={handleSubmit} disabled={loading}>{loading ? "Guardando..." : editando ? "Guardar cambios" : "Guardar control"}</Btn>
              <Btn onClick={() => setModal(false)} color="rgba(255,255,255,0.06)" textColor="rgba(255,255,255,0.5)">Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
