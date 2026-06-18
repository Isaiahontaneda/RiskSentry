import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../lib/supabase";
import { CARD } from "../styles/theme";
import Btn from "../components/Btn";
import Inp from "../components/Inp";
import Sel from "../components/Sel";
import Txt from "../components/Txt";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

const CUMPLE_COLORS = { "Sí": "#10b981", "No": "#ef4444", "Parcial": "#f59e0b", "N/A": "#6b7280" };

const EMPTY = {
  control_id: "", iso_referencia: "", metodo_monitoreo: "", frecuencia: "Mensual",
  responsable: "", herramienta: "", resultado_esperado: "", resultado_obtenido: "",
  fecha_ultima_revision: "", fecha_proxima_revision: "", cumple_esperado: "N/A", acciones_remediacion: "",
};

export default function Monitoreo({ controles }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const fetchItems = () => axios.get(`${API}/monitoreo/`).then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { fetchItems(); }, []);

  const validate = () => {
    const e = {};
    if (!form.control_id) e.control_id = "Selecciona un control";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditando(null); setForm(EMPTY); setErrors({}); setModal(true); };
  const openEdit = (m) => {
    setEditando(m);
    setForm({ control_id: m.control_id, iso_referencia: m.iso_referencia || "", metodo_monitoreo: m.metodo_monitoreo || "", frecuencia: m.frecuencia || "Mensual", responsable: m.responsable || "", herramienta: m.herramienta || "", resultado_esperado: m.resultado_esperado || "", resultado_obtenido: m.resultado_obtenido || "", fecha_ultima_revision: m.fecha_ultima_revision || "", fecha_proxima_revision: m.fecha_proxima_revision || "", cumple_esperado: m.cumple_esperado || "N/A", acciones_remediacion: m.acciones_remediacion || "" });
    setErrors({}); setModal(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (editando) { await axios.put(`${API}/monitoreo/${editando.id}`, form); showToast("Monitoreo actualizado"); }
      else { await axios.post(`${API}/monitoreo/`, form); showToast("Monitoreo registrado"); }
      await fetchItems(); setModal(false);
    } catch { showToast("Error al guardar", "error"); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/monitoreo/${confirmDelete.id}`);
      showToast("Registro eliminado"); setConfirmDelete(null); await fetchItems();
    } catch { showToast("Error al eliminar", "error"); setConfirmDelete(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {confirmDelete && <ConfirmModal message="¿Eliminar este registro de monitoreo?" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
      {toast && <Toast {...toast} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Monitoreo de controles</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Seguimiento periódico · ISO/IEC 27002:2022</p>
        </div>
        <Btn onClick={openCreate}>+ Nuevo monitoreo</Btn>
      </div>

      {items.length === 0 ? <EmptyState text="No hay registros de monitoreo." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(m => {
            const ctrl = controles.find(c => c.id === m.control_id);
            const cc = CUMPLE_COLORS[m.cumple_esperado] || "#888";
            return (
              <div key={m.id} style={{ ...CARD, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ color: "#fff", fontWeight: 500, fontSize: 13 }}>{ctrl?.nombre || m.control_id}</span>
                      {m.iso_referencia && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}>{m.iso_referencia}</span>}
                      <span style={{ background: `${cc}20`, color: cc, border: `1px solid ${cc}30`, padding: "2px 7px", borderRadius: 4, fontSize: 10, fontFamily: "monospace" }}>Cumple: {m.cumple_esperado}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      <span>Frecuencia: <span style={{ color: "rgba(255,255,255,0.6)" }}>{m.frecuencia}</span></span>
                      {m.responsable && <span>Responsable: <span style={{ color: "rgba(255,255,255,0.6)" }}>{m.responsable}</span></span>}
                      {m.fecha_proxima_revision && <span>Próxima revisión: <span style={{ color: "#f59e0b" }}>{m.fecha_proxima_revision}</span></span>}
                    </div>
                    {m.acciones_remediacion && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: "6px 0 0" }}>Acciones: {m.acciones_remediacion}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => openEdit(m)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                    <button onClick={() => setConfirmDelete(m)} style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Eliminar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={editando ? "Editar monitoreo" : "Registrar monitoreo de control"} onClose={() => setModal(false)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Sel label="Control a monitorear" value={form.control_id} onChange={e => setForm({ ...form, control_id: e.target.value })} options={[{ value: "", label: "Seleccionar control" }, ...controles.map(c => ({ value: c.id, label: c.nombre }))]} error={errors.control_id} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Inp label="Referencia ISO" value={form.iso_referencia} onChange={e => setForm({ ...form, iso_referencia: e.target.value })} placeholder="ISO 27002:2022 - 8.16" />
              <Sel label="Frecuencia" value={form.frecuencia} onChange={e => setForm({ ...form, frecuencia: e.target.value })} options={["Diaria","Semanal","Mensual","Trimestral","Semestral","Anual"]} />
              <Sel label="¿Cumple lo esperado?" value={form.cumple_esperado} onChange={e => setForm({ ...form, cumple_esperado: e.target.value })} options={["Sí","No","Parcial","N/A"]} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Inp label="Responsable" value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} placeholder="Nombre" />
              <Inp label="Herramienta / método" value={form.herramienta} onChange={e => setForm({ ...form, herramienta: e.target.value })} placeholder="Ej. Splunk, revisión manual" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Inp label="Última revisión" type="date" value={form.fecha_ultima_revision} onChange={e => setForm({ ...form, fecha_ultima_revision: e.target.value })} />
              <Inp label="Próxima revisión" type="date" value={form.fecha_proxima_revision} onChange={e => setForm({ ...form, fecha_proxima_revision: e.target.value })} />
            </div>
            <Inp label="Método de monitoreo" value={form.metodo_monitoreo} onChange={e => setForm({ ...form, metodo_monitoreo: e.target.value })} placeholder="Describe cómo se realiza el monitoreo" />
            <Txt label="Resultado esperado" value={form.resultado_esperado} onChange={e => setForm({ ...form, resultado_esperado: e.target.value })} placeholder="Qué se espera observar..." />
            <Txt label="Resultado obtenido" value={form.resultado_obtenido} onChange={e => setForm({ ...form, resultado_obtenido: e.target.value })} placeholder="Qué se observó en la última revisión..." />
            <Txt label="Acciones de remediación" value={form.acciones_remediacion} onChange={e => setForm({ ...form, acciones_remediacion: e.target.value })} placeholder="Acciones correctivas si no cumple..." />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={handleSubmit} disabled={loading}>{loading ? "Guardando..." : editando ? "Guardar cambios" : "Registrar monitoreo"}</Btn>
              <Btn onClick={() => setModal(false)} color="rgba(255,255,255,0.06)" textColor="rgba(255,255,255,0.5)">Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
