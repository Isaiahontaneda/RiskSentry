import { useState } from "react";
import axios from "axios";
import { API } from "../lib/supabase";
import { CARD, inputStyle } from "../styles/theme";
import { CLASIF_COLORS } from "../constants/colors";
import { getAssetClasif } from "../utils/risk";
import Btn from "../components/Btn";
import Inp from "../components/Inp";
import Sel from "../components/Sel";
import Txt from "../components/Txt";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

const TIPOS_ACTIVO = [
  { value: "HW",    label: "HW — Hardware" },
  { value: "SW",    label: "SW — Software" },
  { value: "D",     label: "D — Datos" },
  { value: "S",     label: "S — Servicio" },
  { value: "COM",   label: "COM — Comunicaciones" },
  { value: "Media", label: "Media — Medios físicos" },
  { value: "L",     label: "L — Instalaciones" },
  { value: "P",     label: "P — Personal" },
];

const EMPTY_FORM = {
  nombre: "", tipo: "HW", descripcion: "",
  sensibilidad: "Interna", funcion_negocio: "Soporte",
  responsable_nombre: "", responsable_area: "", responsable_cargo: "",
  ubicacion: "", confidencialidad: 2, integridad: 2, disponibilidad: 2,
};

export default function Activos({ activos, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [toast, setToast] = useState(null);

  const tipos = ["Todos", ...TIPOS_ACTIVO.map(t => t.value)];
  const filtered = activos.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) &&
    (filterTipo === "Todos" || a.tipo === filterTipo)
  );

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.tipo) e.tipo = "Selecciona un tipo";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditando(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
  const openEdit = (a) => {
    setEditando(a);
    setForm({ nombre: a.nombre, tipo: a.tipo, descripcion: a.descripcion || "", sensibilidad: a.sensibilidad || "Interna", funcion_negocio: a.funcion_negocio || "Soporte", responsable_nombre: a.responsable_nombre || "", responsable_area: a.responsable_area || "", responsable_cargo: a.responsable_cargo || "", ubicacion: a.ubicacion || "", confidencialidad: a.confidencialidad, integridad: a.integridad, disponibilidad: a.disponibilidad });
    setErrors({}); setModal(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { nombre: form.nombre, tipo: form.tipo, descripcion: form.descripcion, sensibilidad: form.sensibilidad, funcion_negocio: form.funcion_negocio, responsable_nombre: form.responsable_nombre, responsable_area: form.responsable_area, responsable_cargo: form.responsable_cargo, ubicacion: form.ubicacion, confidencialidad: +form.confidencialidad, integridad: +form.integridad, disponibilidad: +form.disponibilidad };
      if (editando) { await axios.put(`${API}/activos/${editando.id}`, payload); showToast("Activo actualizado correctamente"); }
      else { await axios.post(`${API}/activos/`, payload); showToast("Activo creado correctamente"); }
      setModal(false); onRefresh();
    } catch { showToast("Error al guardar el activo", "error"); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/activos/${confirmDelete.id}`);
      showToast("Activo eliminado"); setConfirmDelete(null); onRefresh();
    } catch { showToast("Error al eliminar", "error"); setConfirmDelete(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {confirmDelete && <ConfirmModal message={`¿Eliminar el activo "${confirmDelete.nombre}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
      {toast && <Toast {...toast} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Activos de información</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Inventario y valoración C·I·D</p>
        </div>
        <Btn onClick={openCreate}>+ Nuevo activo</Btn>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar activo..." style={{ ...inputStyle, width: 220 }} />
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {tipos.map(t => (
            <button key={t} onClick={() => setFilterTipo(t)} style={{ background: filterTipo === t ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${filterTipo === t ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.08)"}`, color: filterTipo === t ? "#f43f5e" : "rgba(255,255,255,0.45)", borderRadius: 6, padding: "4px 10px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState text="No hay activos que coincidan." /> : (
        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Código", "Nombre", "Tipo", "Responsable", "C", "I", "D", "Clasificación", "Acciones"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "9px 12px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => {
                const clasif = a.clasificacion_final || getAssetClasif(a);
                const cc = CLASIF_COLORS[clasif] || CLASIF_COLORS["Baja"];
                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: idx % 2 === 0 ? "rgba(13,10,11,0.6)" : "rgba(10,8,9,0.6)" }}>
                    <td style={{ padding: "9px 12px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", fontSize: 10 }}>{a.activo_codigo || "—"}</td>
                    <td style={{ padding: "9px 12px", color: "#fff", fontWeight: 500 }}>{a.nombre}</td>
                    <td style={{ padding: "9px 12px" }}><span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontFamily: "monospace" }}>{a.tipo}</span></td>
                    <td style={{ padding: "9px 12px", color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{a.responsable_nombre || "—"}</td>
                    <td style={{ padding: "9px 12px", color: "#f43f5e", fontFamily: "monospace" }}>{a.confidencialidad}</td>
                    <td style={{ padding: "9px 12px", color: "#f43f5e", fontFamily: "monospace" }}>{a.integridad}</td>
                    <td style={{ padding: "9px 12px", color: "#f43f5e", fontFamily: "monospace" }}>{a.disponibilidad}</td>
                    <td style={{ padding: "9px 12px" }}><span style={{ background: cc.bg, color: cc.text, border: `1px solid ${cc.border}`, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontFamily: "monospace" }}>{clasif}</span></td>
                    <td style={{ padding: "9px 12px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(a)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                        <button onClick={() => setConfirmDelete(a)} style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editando ? "Editar activo" : "Registrar activo de información"} onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Inp label="Nombre del activo" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Servidor principal" error={errors.nombre} />
              <Sel label="Tipo de activo" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} options={TIPOS_ACTIVO} error={errors.tipo} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Sel label="Sensibilidad" value={form.sensibilidad} onChange={e => setForm({ ...form, sensibilidad: e.target.value })} options={["Pública","Interna","Confidencial","Restringida"]} />
              <Sel label="Función de negocio" value={form.funcion_negocio} onChange={e => setForm({ ...form, funcion_negocio: e.target.value })} options={["Crítica","Importante","Soporte","Auxiliar"]} />
            </div>
            <Txt label="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del activo..." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Inp label="Responsable" value={form.responsable_nombre} onChange={e => setForm({ ...form, responsable_nombre: e.target.value })} placeholder="Nombre" />
              <Inp label="Área" value={form.responsable_area} onChange={e => setForm({ ...form, responsable_area: e.target.value })} placeholder="Área/Departamento" />
              <Inp label="Cargo" value={form.responsable_cargo} onChange={e => setForm({ ...form, responsable_cargo: e.target.value })} placeholder="Cargo" />
            </div>
            <Inp label="Ubicación" value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} placeholder="Ej. Datacenter, Nube AWS" />
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 14 }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>Valoración C·I·D — 1=Baja 2=Media 3=Alta 4=Muy Alta</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {["confidencialidad", "integridad", "disponibilidad"].map(attr => (
                  <div key={attr} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase" }}>{attr.charAt(0).toUpperCase()} — {form[attr]}</label>
                    <input type="range" min={1} max={4} value={form[attr]} onChange={e => setForm({ ...form, [attr]: +e.target.value })} style={{ accentColor: "#f43f5e" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}><span>1</span><span>2</span><span>3</span><span>4</span></div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: "7px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 6, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "monospace" }}>Clasificación estimada:</span>
                <span style={{ color: "#f43f5e", fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>{getAssetClasif(form)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={handleSubmit} disabled={loading}>{loading ? "Guardando..." : editando ? "Guardar cambios" : "Guardar activo"}</Btn>
              <Btn onClick={() => setModal(false)} color="rgba(255,255,255,0.06)" textColor="rgba(255,255,255,0.5)">Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
