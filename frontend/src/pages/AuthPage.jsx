import { useState } from "react";
import { supabase } from "../lib/supabase";
import { LOGO_RED_URL, BG_LOGIN_URL } from "../styles/theme";

export default function AuthPage({ onLogin }) {
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
          <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: "0 0 6px", letterSpacing: -0.5 }}>
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
            {mode === "login" ? "Accede a tu panel de gestión" : "Regístrate para empezar"}
          </p>
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
              <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
                {showPass ? "ocultar" : "ver"}
              </button>
            </div>
          </div>
          {error && (
            <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f43f5e", fontSize: 12 }}>
              {error}
            </div>
          )}
          <button onClick={handleSubmit} disabled={loading} style={{ background: loading ? "rgba(244,63,94,0.5)" : "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4, boxShadow: loading ? "none" : "0 4px 20px rgba(244,63,94,0.35)" }}>
            {loading ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
          <div style={{ textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
              {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            </span>
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ background: "none", border: "none", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>
              {mode === "login" ? "Regístrate" : "Inicia sesión"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace", letterSpacing: 1 }}>
              CONFORME A <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>ISO/IEC 27002:2022</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
