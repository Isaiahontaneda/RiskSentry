import { useState, useEffect } from "react";
import axios from "axios";
import { supabase, API } from "./lib/supabase";
import { APP_BG, LOGO_RED_URL } from "./styles/theme";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Activos from "./pages/Activos";
import Riesgos from "./pages/Riesgos";
import Controles from "./pages/Controles";
import Residual from "./pages/Residual";
import Observaciones from "./pages/Observaciones";
import Reportes from "./pages/Reportes";
import Vulnerabilidades from "./pages/Vulnerabilidades";
import Monitoreo from "./pages/Monitoreo";

const NAV_ITEMS = [
  { id: "dashboard",       label: "Dashboard",       icon: "⬡" },
  { id: "activos",         label: "Activos",          icon: "◈" },
  { id: "riesgos",         label: "Riesgos",          icon: "◬" },
  { id: "controles",       label: "Tratamiento",      icon: "◉" },
  { id: "residual",        label: "Riesgo Residual",  icon: "◎" },
  { id: "observaciones",   label: "Observaciones",    icon: "◷" },
  { id: "vulnerabilidades",label: "CVE",              icon: "◌" },
  { id: "monitoreo",       label: "Monitoreo",        icon: "◍" },
  { id: "reportes",        label: "Reportes",         icon: "◫" },
];

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
    dashboard:       <Dashboard activos={activos} riesgos={riesgos} controles={controles} />,
    activos:         <Activos activos={activos} onRefresh={fetchAll} />,
    riesgos:         <Riesgos riesgos={riesgos} activos={activos} onRefresh={fetchAll} />,
    controles:       <Controles controles={controles} riesgos={riesgos} onRefresh={fetchAll} />,
    residual:        <Residual riesgos={riesgos} controles={controles} activos={activos} />,
    observaciones:   <Observaciones riesgos={riesgos} activos={activos} />,
    vulnerabilidades:<Vulnerabilidades />,
    monitoreo:       <Monitoreo controles={controles} />,
    reportes:        <Reportes activos={activos} riesgos={riesgos} controles={controles} />,
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
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{ background: "none", border: "none", borderBottom: page === item.id ? "2px solid #f43f5e" : "2px solid transparent", color: page === item.id ? "#fff" : "rgba(255,255,255,0.45)", padding: "0 14px", height: 54, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: page === item.id ? 600 : 400, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", whiteSpace: "nowrap" }}
            >
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
