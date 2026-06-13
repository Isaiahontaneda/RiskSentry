import { useState, useEffect } from "react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const API = "https://risksentry.onrender.com";
const SUPABASE_URL = "https://kccqsakoujtldwukbzal.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjY3FzYWtvdWp0bGR3dWtiemFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNzExODAsImV4cCI6MjA5NTg0NzE4MH0.VkKr3VVPLjJ37GMngLYtkZr9KZMYnVicP-0hnYQVViU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LOGO_RED_URL = "https://res.cloudinary.com/dcabuupn1/image/upload/v1781356792/RiskSentry_Logo_Rojo_qmjmlr.png";
const BG_LOGIN_URL = "https://res.cloudinary.com/dcabuupn1/image/upload/v1781356595/RiskSentry_Fondo_wv1sgr.png";

const APP_BG = `
  radial-gradient(ellipse 70% 60% at 30% 50%, rgba(160,10,20,0.55) 0%, rgba(100,5,10,0.3) 40%, transparent 70%),
  radial-gradient(ellipse 40% 40% at 70% 20%, rgba(120,8,15,0.25) 0%, transparent 60%),
  #080406
`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "activos", label: "Activos", icon: "◈" },
  { id: "riesgos", label: "Riesgos", icon: "◬" },
  { id: "controles", label: "Tratamiento", icon: "◉" },
  { id: "residual", label: "Riesgo Residual", icon: "◎" },
  { id: "observaciones", label: "Observaciones", icon: "◷" },
  { id: "reportes", label: "Reportes", icon: "◫" },
];

const RISK_COLORS = {
  Bajo: { bg: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.4)" },
  Medio: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", border: "rgba(245,158,11,0.4)" },
  Alto: { bg: "rgba(249,115,22,0.15)", text: "#f97316", border: "rgba(249,115,22,0.4)" },
  Crítico: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", border: "rgba(239,68,68,0.4)" },
};

const ISO_CONTROLES = [
  { ref: "ISO 27002:2022 - 5.1", nombre: "Políticas de seguridad de la información", desc: "Definir, aprobar y publicar políticas de seguridad de la información." },
  { ref: "ISO 27002:2022 - 5.15", nombre: "Control de acceso", desc: "Gestionar el acceso a la información y activos según necesidad de negocio." },
  { ref: "ISO 27002:2022 - 5.26", nombre: "Respuesta a incidentes de seguridad", desc: "Establecer procedimientos para responder a incidentes de seguridad de la información." },
  { ref: "ISO 27002:2022 - 6.3", nombre: "Concientización y capacitación", desc: "Capacitar al personal para identificar y responder ante ataques de ingeniería social y phishing." },
  { ref: "ISO 27002:2022 - 7.1", nombre: "Perímetro de seguridad física", desc: "Definir perímetros de seguridad para proteger áreas con información sensible." },
  { ref: "ISO 27002:2022 - 8.5", nombre: "Autenticación segura", desc: "Implementar mecanismos de autenticación segura incluyendo MFA donde aplique." },
  { ref: "ISO 27002:2022 - 8.7", nombre: "Protección contra malware", desc: "Implementar controles de detección, prevención y recuperación ante malware." },
  { ref: "ISO 27002:2022 - 8.8", nombre: "Gestión de vulnerabilidades técnicas", desc: "Identificar, evaluar y remediar vulnerabilidades técnicas de forma oportuna." },
  { ref: "ISO 27002:2022 - 8.13", nombre: "Respaldo de información", desc: "Mantener copias de seguridad y verificar su restauración periódicamente." },
  { ref: "ISO 27002:2022 - 8.16", nombre: "Actividades de monitoreo", desc: "Monitorear redes, sistemas y aplicaciones para detectar comportamientos anómalos." },
  { ref: "ISO 27002:2022 - 8.20", nombre: "Seguridad de redes", desc: "Gestionar y controlar la seguridad en redes para proteger sistemas y aplicaciones." },
  { ref: "ISO 27002:2022 - 8.24", nombre: "Uso de criptografía", desc: "Aplicar cifrado para proteger la confidencialidad e integridad de la información." },
  { ref: "ISO 27002:2022 - 8.28", nombre: "Codificación segura", desc: "Aplicar principios de codificación segura en el desarrollo de software." },
  { ref: "ISO 27002:2022 - 8.32", nombre: "Gestión de cambios", desc: "Controlar cambios en instalaciones de procesamiento de información y sistemas." },
];

function getRiskLevel(p, i) {
  const n = p * i;
  if (n <= 4) return "Bajo";
  if (n <= 9) return "Medio";
  if (n <= 16) return "Alto";
  return "Crítico";
}

function getRiskColor(level) {
  const map = { Bajo: "#10b981", Medio: "#f59e0b", Alto: "#f97316", Crítico: "#ef4444" };
  return map[level] || "#8b949e";
}

function getMatrizColor(score) {
  if (score <= 4) return "#10b981";
  if (score <= 9) return "#f59e0b";
  if (score <= 16) return "#f97316";
  return "#ef4444";
}

function RiskBadge({ level }) {
  const c = RISK_COLORS[level] || RISK_COLORS["Bajo"];
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontFamily: "monospace" }}>
      {level}
    </span>
  );
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#130c0e", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 14, width: "100%", maxWidth: 380, padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#f43f5e", fontSize: 16 }}>⚠</span>
          </div>
          <div>
            <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: 0 }}>Confirmar eliminación</p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: "3px 0 0" }}>{message}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button onClick={onConfirm} style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", border: "none", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 12px rgba(244,63,94,0.3)" }}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Correo y contraseña son requeridos."); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onLogin(data.user);
      } else {
        if (!nombre.trim()) { setError("El nombre es requerido."); setLoading(false); return; }
        if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); setLoading(false); return; }
        const { data, error: e } = await supabase.auth.signUp({ email, password, options: { data: { nombre } } });
        if (e) throw e;
        if (data.user) onLogin(data.user);
      }
    } catch (e) {
      const msg = e.message || "Error desconocido";
      if (msg.includes("Invalid login")) setError("Correo o contraseña incorrectos.");
      else if (msg.includes("already registered")) setError("Este correo ya está registrado.");
      else setError(msg);
    }
    setLoading(false);
  };

  const iStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'JetBrains Mono', monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <img src={BG_LOGIN_URL} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(8,4,6,0.7) 100%)" }} />
      </div>
      <div style={{ width: 440, background: "#0d0a0b", borderLeft: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 44px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <img src={LOGO_RED_URL} alt="RiskSentry" style={{ width: 72, filter: "drop-shadow(0 0 16px rgba(244,63,94,0.45))" }} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: "0 0 6px", letterSpacing: -0.5 }}>{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>{mode === "login" ? "Accede a tu panel de gestión" : "Regístrate para empezar"}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 }}>Nombre completo</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" style={iStyle} />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 }}>Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@empresa.com" style={iStyle} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} style={{ ...iStyle, paddingRight: 60 }} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>{showPass ? "ocultar" : "ver"}</button>
            </div>
          </div>
          {error && <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f43f5e", fontSize: 12 }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ background: loading ? "rgba(244,63,94,0.5)" : "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4, boxShadow: loading ? "none" : "0 4px 20px rgba(244,63,94,0.35)" }}>
            {loading ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
          <div style={{ textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}</span>
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ background: "none", border: "none", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>{mode === "login" ? "Regístrate" : "Inicia sesión"}</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace", letterSpacing: 1 }}>CONFORME A <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>ISO/IEC 27002:2022</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#130c0e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, width: "100%", maxWidth: wide ? 680 : 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// Fix selector: forzar fondo oscuro en options via style global
const selectStyle = {
  background: "#1a0f11",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "#fff",
  fontSize: 13,
  outline: "none",
  fontFamily: "'JetBrains Mono', monospace",
  width: "100%",
  boxSizing: "border-box",
  colorScheme: "dark",
};

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "#fff",
  fontSize: 13,
  outline: "none",
  fontFamily: "'JetBrains Mono', monospace",
  width: "100%",
  boxSizing: "border-box",
};

function Inp({ label, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>{label}</label>
      <input style={{ ...inputStyle, border: error ? "1px solid rgba(244,63,94,0.6)" : inputStyle.border }} {...props} />
      {error && <span style={{ color: "#f43f5e", fontSize: 10 }}>{error}</span>}
    </div>
  );
}

function Sel({ label, options, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>{label}</label>
      <select style={{ ...selectStyle, border: error ? "1px solid rgba(244,63,94,0.6)" : selectStyle.border }} {...props}>
        {options.map(o => typeof o === "string" ? <option key={o} value={o} style={{ background: "#1a0f11", color: "#fff" }}>{o}</option> : <option key={o.value} value={o.value} style={{ background: "#1a0f11", color: "#fff" }}>{o.label}</option>)}
      </select>
      {error && <span style={{ color: "#f43f5e", fontSize: 10 }}>{error}</span>}
    </div>
  );
}

function Txt({ label, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>{label}</label>
      <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", border: error ? "1px solid rgba(244,63,94,0.6)" : inputStyle.border }} {...props} />
      {error && <span style={{ color: "#f43f5e", fontSize: 10 }}>{error}</span>}
    </div>
  );
}

function Btn({ children, color, textColor = "#fff", onClick, disabled }) {
  const bg = color || (disabled ? "rgba(244,63,94,0.3)" : "linear-gradient(135deg, #f43f5e, #e11d48)");
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: bg, color: disabled ? "rgba(255,255,255,0.4)" : textColor, border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: !disabled && !color ? "0 2px 12px rgba(244,63,94,0.3)" : "none" }}>
      {children}
    </button>
  );
}

function StatCard({ label, value, accent, sub }) {
  const a = accent || "#f43f5e";
  return (
    <div style={{ background: "rgba(13,10,11,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 18, position: "relative", overflow: "hidden", backdropFilter: "blur(8px)" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${a}80, transparent)` }} />
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 6px" }}>{label}</p>
      <p style={{ color: a, fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: "5px 0 0" }}>{sub}</p>}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ background: "rgba(13,10,11,0.5)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: 48, textAlign: "center", backdropFilter: "blur(8px)" }}>
      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>{text}</p>
    </div>
  );
}

const CARD = { background: "rgba(13,10,11,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, backdropFilter: "blur(8px)" };

// ─── DASHBOARD MEJORADO ────────────────────────────────────────────────────────
function Dashboard({ activos, riesgos, controles }) {
  const criticos = riesgos.filter(r => getRiskLevel(r.probabilidad, r.impacto) === "Crítico").length;
  const altos = riesgos.filter(r => getRiskLevel(r.probabilidad, r.impacto) === "Alto").length;
  const controlados = controles.filter(c => c.estado === "implementado").length;
  const enProgreso = controles.filter(c => c.estado === "en progreso").length;

  const dist = ["Bajo", "Medio", "Alto", "Crítico"].map(level => ({
    level,
    count: riesgos.filter(r => getRiskLevel(r.probabilidad, r.impacto) === level).length,
    color: getRiskColor(level),
  }));
  const maxDist = Math.max(...dist.map(d => d.count), 1);

  const tiposActivos = activos.reduce((acc, a) => { acc[a.tipo] = (acc[a.tipo] || 0) + 1; return acc; }, {});
  const tipoColors = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#06b6d4", "#ec4899"];

  // Matriz de riesgo 5x5
  const matrizData = {};
  riesgos.forEach(r => {
    const key = `${r.probabilidad}-${r.impacto}`;
    matrizData[key] = (matrizData[key] || 0) + 1;
  });

  // Eficacia controles
  const eficacia = controles.length > 0 ? Math.round((controlados / controles.length) * 100) : 0;

  // Riesgo residual promedio
  const riesgoResidualProm = riesgos.length > 0
    ? (riesgos.reduce((acc, r) => {
        const ctrl = controles.filter(c => c.riesgo_id === r.id);
        const impl = ctrl.filter(c => c.estado === "implementado").length;
        const red = Math.min(impl * 1.5, 4);
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

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Activos" value={activos.length} accent="#f43f5e" sub="registrados e inventariados" />
        <StatCard label="Riesgos" value={riesgos.length} accent="#f43f5e" sub="identificados y evaluados" />
        <StatCard label="Críticos" value={criticos} accent="#ef4444" sub="requieren atención inmediata" />
        <StatCard label="Implementados" value={controlados} accent="#10b981" sub={`controles activos · ${eficacia}% cobertura`} />
      </div>

      {/* Fila 2: Matriz de riesgo + Distribución + Activos por tipo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

        {/* Matriz de riesgo P×I */}
        <div style={{ ...CARD, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#f43f5e" }}>▦</span> Matriz de riesgo</h3>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}>5 × 5</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: "0 0 12px" }}>Probabilidad × Impacto — ubicación de riesgos activos</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
            {[5, 4, 3, 2, 1].map(prob => (
              [1, 2, 3, 4, 5].map(imp => {
                const key = `${prob}-${imp}`;
                const count = matrizData[key] || 0;
                const score = prob * imp;
                const col = getMatrizColor(score);
                return (
                  <div key={key} style={{ aspectRatio: "1", borderRadius: 4, background: count > 0 ? col : `${col}18`, border: `1px solid ${col}30`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {count > 0 && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{count}</span>}
                  </div>
                );
              })
            ))}
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
              <p style={{ color: "#f43f5e", fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "monospace" }}>{riesgoResidualProm}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>/10</span></p>
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

          {/* Donut SVG simple */}
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
                      <circle key={tipo} cx={cx} cy={cy} r={r} fill="none" stroke={tipoColors[i % tipoColors.length]} strokeWidth={14} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circ} style={{ transition: "all 0.6s" }} />
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
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: tipoColors[i % tipoColors.length], flexShrink: 0 }} />
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, flex: 1 }}>{tipo}</span>
                      <span style={{ color: tipoColors[i % tipoColors.length], fontSize: 10, fontFamily: "monospace", fontWeight: 600 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          {activos.length === 0 && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Sin activos registrados.</p>}

          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            {[{ label: "Críticos", val: activos.filter(a => (a.confidencialidad + a.integridad + a.disponibilidad) > 12).length, color: "#ef4444" },
              { label: "Sensibles", val: activos.filter(a => { const t = a.confidencialidad + a.integridad + a.disponibilidad; return t > 8 && t <= 12; }).length, color: "#f59e0b" }
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

      {/* Fila 3: Estado de controles + Alertas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ ...CARD, padding: 18 }}>
          <h3 style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#f43f5e" }}>◉</span> Estado de controles</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Implementados", val: controlados, color: "#10b981" },
              { label: "En progreso", val: enProgreso, color: "#3b82f6" },
              { label: "Pendientes", val: controles.filter(c => c.estado === "pendiente").length, color: "#f59e0b" },
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
            {controles.filter(c => c.estado === "pendiente").length > 0 && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}><span style={{ color: "#f59e0b", fontWeight: 600 }}>{controles.filter(c => c.estado === "pendiente").length} control(es)</span> pendientes de implementar</p>
              </div>
            )}
            {criticos === 0 && altos === 0 && controles.filter(c => c.estado === "pendiente").length === 0 && (
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}>Sin alertas activas. Sistema bajo control.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla completa últimos riesgos */}
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

// ─── ACTIVOS ──────────────────────────────────────────────────────────────────
function Activos({ activos, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ nombre: "", tipo: "Hardware", descripcion: "", confidencialidad: 3, integridad: 3, disponibilidad: 3 });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [toast, setToast] = useState(null);

  const tipos = ["Todos", "Hardware", "Software", "Datos", "Red", "Personal", "Instalaciones", "Servicios"];
  const filtered = activos.filter(a => a.nombre.toLowerCase().includes(search.toLowerCase()) && (filterTipo === "Todos" || a.tipo === filterTipo));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.tipo) e.tipo = "Selecciona un tipo";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditando(null); setForm({ nombre: "", tipo: "Hardware", descripcion: "", confidencialidad: 3, integridad: 3, disponibilidad: 3 }); setErrors({}); setModal(true); };
  const openEdit = (a) => { setEditando(a); setForm({ nombre: a.nombre, tipo: a.tipo, descripcion: a.descripcion || "", confidencialidad: a.confidencialidad, integridad: a.integridad, disponibilidad: a.disponibilidad }); setErrors({}); setModal(true); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { nombre: form.nombre, tipo: form.tipo, descripcion: form.descripcion, confidencialidad: +form.confidencialidad, integridad: +form.integridad, disponibilidad: +form.disponibilidad };
      if (editando) { await axios.put(`${API}/activos/${editando.id}`, payload); showToast("Activo actualizado correctamente"); }
      else { await axios.post(`${API}/activos/`, payload); showToast("Activo creado correctamente"); }
      setModal(false);
      onRefresh();
    } catch (e) { showToast("Error al guardar el activo", "error"); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/activos/${confirmDelete.id}`);
      showToast("Activo eliminado");
      setConfirmDelete(null);
      onRefresh();
    } catch (e) { showToast("Error al eliminar", "error"); setConfirmDelete(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {confirmDelete && <ConfirmModal message={`¿Eliminar el activo "${confirmDelete.nombre}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`, borderRadius: 10, padding: "12px 20px", color: toast.type === "error" ? "#ef4444" : "#10b981", fontSize: 13, zIndex: 200, backdropFilter: "blur(8px)", fontFamily: "'JetBrains Mono', monospace" }}>
          {toast.msg}
        </div>
      )}
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
                {["Nombre", "Tipo", "Descripción", "C", "I", "D", "Total", "Clasificación", "Acciones"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "9px 12px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => {
                const total = a.confidencialidad + a.integridad + a.disponibilidad;
                const clasif = total <= 6 ? "Bajo" : total <= 9 ? "Medio" : total <= 12 ? "Alto" : "Crítico";
                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: idx % 2 === 0 ? "rgba(13,10,11,0.6)" : "rgba(10,8,9,0.6)" }}>
                    <td style={{ padding: "9px 12px", color: "#fff", fontWeight: 500 }}>{a.nombre}</td>
                    <td style={{ padding: "9px 12px", color: "rgba(255,255,255,0.5)" }}>{a.tipo}</td>
                    <td style={{ padding: "9px 12px", color: "rgba(255,255,255,0.3)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.descripcion || "—"}</td>
                    <td style={{ padding: "9px 12px", color: "#f43f5e", fontFamily: "monospace" }}>{a.confidencialidad}</td>
                    <td style={{ padding: "9px 12px", color: "#f43f5e", fontFamily: "monospace" }}>{a.integridad}</td>
                    <td style={{ padding: "9px 12px", color: "#f43f5e", fontFamily: "monospace" }}>{a.disponibilidad}</td>
                    <td style={{ padding: "9px 12px" }}><span style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.2)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 11 }}>{total}</span></td>
                    <td style={{ padding: "9px 12px" }}><RiskBadge level={clasif} /></td>
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
              <Sel label="Tipo" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} options={["Hardware", "Software", "Datos", "Red", "Personal", "Instalaciones", "Servicios"]} error={errors.tipo} />
            </div>
            <Txt label="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del activo..." />
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 14 }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>Valoración C·I·D (1 = Bajo, 5 = Crítico)</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {["confidencialidad", "integridad", "disponibilidad"].map(attr => (
                  <div key={attr} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase" }}>{attr.slice(0, 1).toUpperCase()}</label>
                    <select value={form[attr]} onChange={e => setForm({ ...form, [attr]: e.target.value })} style={selectStyle}>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n} style={{ background: "#1a0f11", color: "#fff" }}>{n}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: "7px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 6, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "monospace" }}>Valor total:</span>
                <span style={{ color: "#f43f5e", fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>{+form.confidencialidad + +form.integridad + +form.disponibilidad} / 15</span>
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

// ─── RIESGOS ──────────────────────────────────────────────────────────────────
function Riesgos({ riesgos, activos, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ activo_id: "", amenaza: "", vulnerabilidad: "", tipo_amenaza: "Técnica", probabilidad: 3, impacto: 3 });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState("Todos");
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = riesgos.filter(r => filterLevel === "Todos" || getRiskLevel(r.probabilidad, r.impacto) === filterLevel);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const validate = () => {
    const e = {};
    if (!form.activo_id) e.activo_id = "Selecciona un activo";
    if (!form.amenaza.trim()) e.amenaza = "La amenaza es requerida";
    if (!form.vulnerabilidad.trim()) e.vulnerabilidad = "La vulnerabilidad es requerida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditando(null); setForm({ activo_id: "", amenaza: "", vulnerabilidad: "", tipo_amenaza: "Técnica", probabilidad: 3, impacto: 3 }); setErrors({}); setModal(true); };
  const openEdit = (r) => { setEditando(r); setForm({ activo_id: r.activo_id, amenaza: r.amenaza, vulnerabilidad: r.vulnerabilidad, tipo_amenaza: "Técnica", probabilidad: r.probabilidad, impacto: r.impacto }); setErrors({}); setModal(true); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { activo_id: form.activo_id, amenaza: form.amenaza, vulnerabilidad: form.vulnerabilidad, probabilidad: +form.probabilidad, impacto: +form.impacto };
      if (editando) { await axios.put(`${API}/riesgos/${editando.id}`, payload); showToast("Riesgo actualizado"); }
      else { await axios.post(`${API}/riesgos/`, payload); showToast("Riesgo registrado"); }
      setModal(false);
      onRefresh();
    } catch (e) { showToast("Error al guardar", "error"); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/riesgos/${confirmDelete.id}`);
      showToast("Riesgo eliminado");
      setConfirmDelete(null);
      onRefresh();
    } catch (e) { showToast("Error al eliminar", "error"); setConfirmDelete(null); }
  };

  const matrizColor = (p, i) => getMatrizColor(p * i);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {confirmDelete && <ConfirmModal message={`¿Eliminar el riesgo "${confirmDelete.amenaza}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`, borderRadius: 10, padding: "12px 20px", color: toast.type === "error" ? "#ef4444" : "#10b981", fontSize: 13, zIndex: 200, backdropFilter: "blur(8px)", fontFamily: "'JetBrains Mono', monospace" }}>{toast.msg}</div>}
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
            const col = matrizColor(r.probabilidad, r.impacto);
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
              <Sel label="Tipo de amenaza" value={form.tipo_amenaza} onChange={e => setForm({ ...form, tipo_amenaza: e.target.value })} options={["Técnica", "Humana", "Física", "Ambiental", "Organizacional"]} />
            </div>
            <Inp label="Amenaza identificada" value={form.amenaza} onChange={e => setForm({ ...form, amenaza: e.target.value })} placeholder="Ej. Acceso no autorizado al sistema" error={errors.amenaza} />
            <Txt label="Vulnerabilidad asociada" value={form.vulnerabilidad} onChange={e => setForm({ ...form, vulnerabilidad: e.target.value })} placeholder="Describe la debilidad que podría ser explotada..." error={errors.vulnerabilidad} />
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 14 }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>Valoración del riesgo</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase" }}>Probabilidad: {form.probabilidad}</label>
                  <input type="range" min={1} max={5} value={form.probabilidad} onChange={e => setForm({ ...form, probabilidad: +e.target.value })} style={{ width: "100%", margin: "8px 0 4px", accentColor: "#f43f5e" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}><span>Muy baja</span><span>Muy alta</span></div>
                </div>
                <div>
                  <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase" }}>Impacto: {form.impacto}</label>
                  <input type="range" min={1} max={5} value={form.impacto} onChange={e => setForm({ ...form, impacto: +e.target.value })} style={{ width: "100%", margin: "8px 0 4px", accentColor: "#f43f5e" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}><span>Muy bajo</span><span>Muy alto</span></div>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "monospace" }}>P({form.probabilidad}) × I({form.impacto}) = <span style={{ color: matrizColor(form.probabilidad, form.impacto), fontSize: 16, fontWeight: 700 }}>{form.probabilidad * form.impacto}</span></span>
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

// ─── CONTROLES ────────────────────────────────────────────────────────────────
function Controles({ controles, riesgos, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ riesgo_id: "", nombre: "", descripcion: "", estrategia: "mitigar", responsable: "", iso_referencia: "", estado: "pendiente" });
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditando(null); setForm({ riesgo_id: "", nombre: "", descripcion: "", estrategia: "mitigar", responsable: "", iso_referencia: "", estado: "pendiente" }); setErrors({}); setModal(true); };
  const openEdit = (c) => { setEditando(c); setForm({ riesgo_id: c.riesgo_id, nombre: c.nombre, descripcion: c.descripcion || "", estrategia: c.estrategia, responsable: c.responsable || "", iso_referencia: c.iso_referencia || "", estado: c.estado }); setErrors({}); setModal(true); };

  const handleISOSelect = (ref) => {
    const iso = ISO_CONTROLES.find(i => i.ref === ref);
    if (iso) setForm(f => ({ ...f, iso_referencia: iso.ref, nombre: iso.nombre, descripcion: iso.desc }));
    else setForm(f => ({ ...f, iso_referencia: ref }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { riesgo_id: form.riesgo_id, nombre: form.nombre, descripcion: form.descripcion, estrategia: form.estrategia, responsable: form.responsable, iso_referencia: form.iso_referencia, estado: form.estado };
      if (editando) { await axios.put(`${API}/controles/${editando.id}`, payload); showToast("Control actualizado"); }
      else { await axios.post(`${API}/controles/`, payload); showToast("Control registrado"); }
      setModal(false);
      onRefresh();
    } catch (e) { showToast("Error al guardar", "error"); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/controles/${confirmDelete.id}`);
      showToast("Control eliminado");
      setConfirmDelete(null);
      onRefresh();
    } catch (e) { showToast("Error al eliminar", "error"); setConfirmDelete(null); }
  };

  const handleUpdateEstado = async (id, nuevoEstado) => {
    const ctrl = controles.find(c => c.id === id);
    try {
      await axios.put(`${API}/controles/${id}`, { ...ctrl, estado: nuevoEstado });
      showToast("Estado actualizado");
      onRefresh();
    } catch (e) { showToast("Error al actualizar estado", "error"); }
  };

  const estadoColor = { pendiente: "#f59e0b", "en progreso": "#3b82f6", implementado: "#10b981" };
  const estrategiaColor = { mitigar: "#f43f5e", transferir: "#8b5cf6", aceptar: "#f59e0b", evitar: "#ef4444" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {confirmDelete && <ConfirmModal message={`¿Eliminar el control "${confirmDelete.nombre}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`, borderRadius: 10, padding: "12px 20px", color: toast.type === "error" ? "#ef4444" : "#10b981", fontSize: 13, zIndex: 200, backdropFilter: "blur(8px)", fontFamily: "'JetBrains Mono', monospace" }}>{toast.msg}</div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Tratamiento del riesgo</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Controles basados en ISO/IEC 27002:2022</p>
        </div>
        <Btn onClick={openCreate}>+ Nuevo control</Btn>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {["Todos", "pendiente", "en progreso", "implementado"].map(e => (
          <button key={e} onClick={() => setFilterEstado(e)} style={{ background: filterEstado === e ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${filterEstado === e ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.08)"}`, color: filterEstado === e ? "#f43f5e" : "rgba(255,255,255,0.45)", borderRadius: 6, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{e}</button>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyState text="No hay controles registrados." /> : (
        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map(c => {
            const riesgo = riesgos.find(r => r.id === c.riesgo_id);
            return (
              <div key={c.id} style={{ ...CARD, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ color: "#fff", fontWeight: 500, fontSize: 13 }}>{c.nombre}</span>
                      <span style={{ background: `${estrategiaColor[c.estrategia]}20`, color: estrategiaColor[c.estrategia], border: `1px solid ${estrategiaColor[c.estrategia]}30`, padding: "2px 7px", borderRadius: 4, fontSize: 10, fontFamily: "monospace" }}>{c.estrategia}</span>
                      {c.iso_referencia && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}>{c.iso_referencia}</span>}
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "0 0 6px" }}>{c.descripcion}</p>
                    <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>Riesgo: <span style={{ color: "rgba(255,255,255,0.55)" }}>{riesgo?.amenaza || "N/A"}</span></span>
                      {c.responsable && <span style={{ color: "rgba(255,255,255,0.3)" }}>Responsable: <span style={{ color: "rgba(255,255,255,0.55)" }}>{c.responsable}</span></span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <select value={c.estado} onChange={e => handleUpdateEstado(c.id, e.target.value)} style={{ background: "#1a0f11", border: `1px solid ${estadoColor[c.estado]}40`, color: estadoColor[c.estado], borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", outline: "none", colorScheme: "dark" }}>
                      {["pendiente", "en progreso", "implementado"].map(s => <option key={s} value={s} style={{ background: "#1a0f11", color: "#fff" }}>{s}</option>)}
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

            {/* Selector ISO predefinido */}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Sel label="Estrategia" value={form.estrategia} onChange={e => setForm({ ...form, estrategia: e.target.value })} options={["mitigar", "transferir", "aceptar", "evitar"]} />
              <Sel label="Estado" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} options={["pendiente", "en progreso", "implementado"]} />
              <Inp label="Responsable" value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} placeholder="Nombre" />
            </div>
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

// ─── RESIDUAL ─────────────────────────────────────────────────────────────────
function Residual({ riesgos, controles, activos }) {
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
            const implementados = ctrl.filter(c => c.estado === "implementado").length;
            const enProgreso = ctrl.filter(c => c.estado === "en progreso").length;
            const nivelOriginal = getRiskLevel(r.probabilidad, r.impacto);
            const reduccion = Math.min(implementados * 1.5 + enProgreso * 0.5, 4);
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

// ─── OBSERVACIONES ────────────────────────────────────────────────────────────
function Observaciones({ riesgos }) {
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditando(null); setForm({ riesgo_id: "", contenido: "", autor: "", tipo: "Recomendación" }); setErrors({}); setModal(true); };
  const openEdit = (o) => { setEditando(o); setForm({ riesgo_id: o.riesgo_id, contenido: o.contenido, autor: o.autor, tipo: "Recomendación" }); setErrors({}); setModal(true); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { riesgo_id: form.riesgo_id, contenido: form.contenido, autor: form.autor };
      if (editando) { await axios.put(`${API}/observaciones/${editando.id}`, payload); showToast("Observación actualizada"); }
      else { await axios.post(`${API}/observaciones/`, payload); showToast("Observación registrada"); }
      await fetchObs();
      setModal(false);
    } catch (e) { showToast("Error al guardar", "error"); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/observaciones/${confirmDelete.id}`);
      showToast("Observación eliminada");
      setConfirmDelete(null);
      await fetchObs();
    } catch (e) { showToast("Error al eliminar", "error"); setConfirmDelete(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {confirmDelete && <ConfirmModal message="¿Eliminar esta observación?" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`, borderRadius: 10, padding: "12px 20px", color: toast.type === "error" ? "#ef4444" : "#10b981", fontSize: 13, zIndex: 200, backdropFilter: "blur(8px)", fontFamily: "'JetBrains Mono', monospace" }}>{toast.msg}</div>}
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
            <Sel label="Tipo" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} options={["Recomendación", "Observación", "Acción correctiva", "Alerta"]} />
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

// ─── REPORTES ─────────────────────────────────────────────────────────────────
function Reportes({ activos, riesgos, controles }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/reportes/generar`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "RiskSentry_Reporte.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { alert("Error al generar el reporte. Verifica que el backend esté activo."); }
    setLoading(false);
  };

  const criticos = riesgos.filter(r => getRiskLevel(r.probabilidad, r.impacto) === "Crítico").length;
  const implementados = controles.filter(c => c.estado === "implementado").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Reportes</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Genera reportes PDF para partes interesadas</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Activos" value={activos.length} accent="#f43f5e" />
        <StatCard label="Riesgos" value={riesgos.length} accent="#f43f5e" />
        <StatCard label="Críticos" value={criticos} accent="#ef4444" />
        <StatCard label="Controles impl." value={implementados} accent="#10b981" />
      </div>
      <div style={{ ...CARD, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
          <div>
            <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 6px" }}>Reporte completo de gestión de riesgos</h3>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: "0 0 14px", lineHeight: 1.6 }}>Documento PDF con inventario de activos, análisis de riesgos, controles y riesgo residual.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Inventario C·I·D", "Matriz P×I", "Controles ISO 27002", "Riesgo residual"].map(i => (
                <span key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", padding: "3px 8px", borderRadius: 5, fontSize: 10 }}>{i}</span>
              ))}
            </div>
          </div>
          <Btn onClick={handleDownload} disabled={loading}>{loading ? "Generando..." : "⬇ Descargar PDF"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [activos, setActivos] = useState([]);
  const [riesgos, setRiesgos] = useState([]);
  const [controles, setControles] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchAll = async () => {
    try {
      const [a, r, c] = await Promise.all([
        axios.get(`${API}/activos/`),
        axios.get(`${API}/riesgos/`),
        axios.get(`${API}/controles/`),
      ]);
      setActivos(a.data);
      setRiesgos(r.data);
      setControles(c.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: APP_BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <span style={{ color: "#f43f5e", fontSize: 13 }}>Cargando...</span>
    </div>
  );

  if (!user) return <AuthPage onLogin={setUser} />;

  const pages = {
    dashboard: <Dashboard activos={activos} riesgos={riesgos} controles={controles} />,
    activos: <Activos activos={activos} onRefresh={fetchAll} />,
    riesgos: <Riesgos riesgos={riesgos} activos={activos} onRefresh={fetchAll} />,
    controles: <Controles controles={controles} riesgos={riesgos} onRefresh={fetchAll} />,
    residual: <Residual riesgos={riesgos} controles={controles} activos={activos} />,
    observaciones: <Observaciones riesgos={riesgos} activos={activos} />,
    reportes: <Reportes activos={activos} riesgos={riesgos} controles={controles} />,
  };

  const nombreUsuario = user.user_metadata?.nombre || user.email?.split("@")[0] || "Usuario";

  return (
    <div style={{ minHeight: "100vh", background: APP_BG, display: "flex", flexDirection: "column", fontFamily: "'JetBrains Mono', monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <header style={{ height: 54, background: "rgba(8,4,6,0.75)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 36 }}>
          <img src={LOGO_RED_URL} alt="RS" style={{ width: 28, height: 28, objectFit: "contain" }} />
          <div>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Risk</span>
            <span style={{ color: "#f43f5e", fontSize: 13, fontWeight: 700 }}>Sentry</span>
          </div>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ background: "none", border: "none", borderBottom: page === item.id ? "2px solid #f43f5e" : "2px solid transparent", color: page === item.id ? "#fff" : "rgba(255,255,255,0.45)", padding: "0 14px", height: 54, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: page === item.id ? 600 : 400, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #f43f5e, #e11d48)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {nombreUsuario.slice(0, 1).toUpperCase()}
            </div>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{nombreUsuario}</span>
            <button onClick={handleLogout} style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
              <span>⏻</span><span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>
      <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
        {pages[page]}
      </main>
    </div>
  );
}
