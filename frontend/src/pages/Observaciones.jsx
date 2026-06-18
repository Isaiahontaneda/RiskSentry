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

export default function Observaciones({ riesgos }) {
  const [obs, setObs] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ riesgo_id: "", contenido: "", autor: "", tipo: "Recomendación" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const fetchObs = () => axios.get(`${API}/observaciones/`).then(r => setObs(r.data)).catch(() => {});
  useEffect(() => { fetchObs(); }, []);

  const validate = () => {
    const e = {};
    if (!form.riesgo_id) e.riesgo_id = "Selecciona un riesgo";
    if (!form.contenido.trim()) e.contenido = "El contenido es requerido";
    if (!form.autor.trim()) e.autor = "El autor es requerido";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditando(null); setForm({ riesgo_id: "", contenido: "", autor: "", tipo: "Recomendación" }); setErrors({}); setModal(true); };
  const openEdit = (o) => { setEditando(o); setForm({ riesgo_id: o.riesgo_id, contenido: o.contenido, autor: o.autor, tipo: o.tipo || "Recomendación" }); setErrors({}); setModal(true); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { riesgo_id: form.riesgo_id, contenido: form.contenido, autor: form.autor, tipo: form.tipo };
      if (editando) { await axios.put(`${API}/observaciones/${editando.id}`, payload); showToast("Observación actualizada"); }
      else { await axios.post(`${API}/observaciones/`, payload); showToast("Observación registrada"); }
      await fetchObs(); setModal(false);
    } catch { showToast("Error al guardar", "error"); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/observaciones/${confirmDelete.id}`);
      showToast("Observación eliminada"); setConfirmDelete(null); await fetchObs();
    } catch { showToast("Error al eliminar", "error"); setConfirmDelete(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {confirmDelete && <ConfirmModal message="¿Eliminar esta observación?" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
      {toast && <Toast {...toast} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Observaciones</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Recomendaciones para partes interesadas</p>
        </div>
        <Btn onClick={openCreate}>+ Nueva observación</Btn>
      </div>

      {obs.length === 0 ? <EmptyState text="No hay observaciones registradas." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {obs.map(o => {
            const riesgo = riesgos.find(r => r.id === o.riesgo_id);
            return (
              <div key={o.id} style={{ ...CARD, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Riesgo: <span style={{ color: "rgba(255,255,255,0.75)" }}>{riesgo?.amenaza || "N/A"}</span></span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "0 0 8px", lineHeight: 1.5 }}>{o.contenido}</p>
                    <div style={{ display: "flex", gap: 14, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                      <span>Por: <span style={{ color: "rgba(255,255,255,0.55)" }}>{o.autor}</span></span>
                      {o.created_at && <span>{new Date(o.created_at).toLocaleDateString("es-EC")}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => openEdit(o)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                    <button onClick={() => setConfirmDelete(o)} style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Eliminar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={editando ? "Editar observación" : "Registrar observación"} onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Sel label="Riesgo asociado" value={form.riesgo_id} onChange={e => setForm({ ...form, riesgo_id: e.target.value })} options={[{ value: "", label: "Seleccionar riesgo" }, ...riesgos.map(r => ({ value: r.id, label: r.amenaza }))]} error={errors.riesgo_id} />
            <Sel label="Tipo" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} options={["Recomendación","Observación","Acción correctiva","Alerta"]} />
            <Txt label="Contenido" value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })} placeholder="Describe la observación detalladamente..." error={errors.contenido} />
            <Inp label="Autor" value={form.autor} onChange={e => setForm({ ...form, autor: e.target.value })} placeholder="Nombre del autor" error={errors.autor} />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={handleSubmit} disabled={loading}>{loading ? "Guardando..." : editando ? "Guardar cambios" : "Guardar"}</Btn>
              <Btn onClick={() => setModal(false)} color="rgba(255,255,255,0.06)" textColor="rgba(255,255,255,0.5)">Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
