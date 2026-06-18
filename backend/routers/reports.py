from fastapi import APIRouter, Query
from fastapi.responses import FileResponse
from database import supabase
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

router = APIRouter()

W, H = letter
MARGIN = 50
RED = colors.HexColor("#c0392b")


def _new_page(c, title):
    c.showPage()
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(RED)
    c.drawString(MARGIN, H - 35, title)
    c.setFillColor(colors.black)
    c.line(MARGIN, H - 42, W - MARGIN, H - 42)
    return H - 60


def _header(c, title, subtitle=""):
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(RED)
    c.drawString(MARGIN, H - MARGIN, title)
    c.setFillColor(colors.HexColor("#555555"))
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN, H - MARGIN - 18, subtitle)
    c.setFillColor(colors.black)
    c.line(MARGIN, H - MARGIN - 28, W - MARGIN, H - MARGIN - 28)
    return H - MARGIN - 50


def _section(c, y, title):
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(RED)
    c.drawString(MARGIN, y, title)
    c.setFillColor(colors.black)
    return y - 18


def _row(c, y, text, indent=10):
    if y < 80:
        y = _new_page(c, "RiskSentry — continuación")
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#222222"))
    c.drawString(MARGIN + indent, y, text[:120])
    c.setFillColor(colors.black)
    return y - 13


def _nivel_color(nivel):
    return {"Bajo": "#27ae60", "Medio": "#f39c12", "Alto": "#e67e22", "Crítico": "#e74c3c"}.get(nivel, "#333333")


def _generar_pdf(path, secciones, titulo, subtitulo="Informe ISO/IEC 27002:2022"):
    c = canvas.Canvas(path, pagesize=letter)
    y = _header(c, titulo, subtitulo)
    for sec_title, rows in secciones:
        if y < 120:
            y = _new_page(c, titulo)
        y = _section(c, y, sec_title)
        for row in rows:
            y = _row(c, y, row)
        y -= 8
    c.save()


@router.get("/generar")
def generar_reporte(tipo: str = Query("completo", description="activos|riesgos|controles|tratamiento|monitoreo|cve|ejecutivo|completo")):
    activos = supabase.table("activos").select("*").execute().data
    riesgos = supabase.table("riesgos").select("*, activos(nombre)").execute().data
    controles = supabase.table("controles").select("*, riesgos(amenaza)").execute().data

    path = f"reporte_{tipo}.pdf"

    if tipo == "activos":
        secciones = [("Inventario de Activos de Información", [
            f"[{a.get('activo_codigo','—')}] {a['nombre']} | Tipo: {a['tipo']} | Sensibilidad: {a.get('sensibilidad','—')} | Clasificación: {a.get('clasificacion_final','—')} | C:{a['confidencialidad']} I:{a['integridad']} D:{a['disponibilidad']}"
            for a in activos
        ])]
        _generar_pdf(path, secciones, "Informe de Activos", "Inventario CID · ISO/IEC 27002:2022")

    elif tipo == "riesgos":
        secciones = [("Análisis de Riesgos", [
            f"[{r.get('riesgo_codigo','—')}] {r['amenaza']} | P:{r['probabilidad']} × I:{r['impacto']} = {r['probabilidad']*r['impacto']} | Nivel: {r.get('nivel_riesgo','—')} | Estado: {r.get('estado','—')} | CVE: {r.get('cve_code','—')}"
            for r in riesgos
        ])]
        _generar_pdf(path, secciones, "Análisis de Riesgos", "Matriz P×I 1-4 · ISO/IEC 27005")

    elif tipo == "controles":
        secciones = [("Controles de Seguridad ISO 27002:2022", [
            f"{c['nombre']} | Ref: {c.get('iso_referencia','—')} | Tipo: {c.get('tipo_control','—')} | Estado: {c.get('estado','—')} | Progreso: {c.get('progreso',0)}%"
            for c in controles
        ])]
        _generar_pdf(path, secciones, "Estado de Controles", "ISO/IEC 27002:2022 · 93 controles")

    elif tipo == "tratamiento":
        secciones = [("Plan de Tratamiento del Riesgo", [
            f"{c['nombre']} | Estrategia: {c['estrategia']} | Responsable: {c.get('responsable','—')} | Inicio: {c.get('fecha_inicio','—')} | Fin: {c.get('fecha_fin','—')} | Progreso: {c.get('progreso',0)}%"
            for c in controles
        ])]
        _generar_pdf(path, secciones, "Plan de Tratamiento", "Mitigar · Aceptar · Transferir · Evitar")

    elif tipo == "monitoreo":
        mon = supabase.table("monitoreo").select("*, controles(nombre)").execute().data
        secciones = [("Monitoreo de Controles", [
            f"Control: {m.get('controles',{}).get('nombre','—') if m.get('controles') else '—'} | ISO: {m.get('iso_referencia','—')} | Frecuencia: {m.get('frecuencia','—')} | Cumple: {m.get('cumple_esperado','—')} | Próxima revisión: {m.get('fecha_proxima_revision','—')}"
            for m in mon
        ])]
        _generar_pdf(path, secciones, "Informe de Monitoreo", "Seguimiento de controles implementados")

    elif tipo == "cve":
        vulns = supabase.table("vulnerabilidades").select("*").execute().data
        vulns_sorted = sorted(vulns, key=lambda x: -(x.get("cvss_score") or 0))
        secciones = [("Vulnerabilidades CVE Registradas", [
            f"{v['cve_id']} | CVSS: {v.get('cvss_score','—')} | Severidad: {v.get('severidad_cvss','—')} | Estado parche: {v.get('estado_parche','—')} | Activos: {v.get('activos_afectados','—')}"
            for v in vulns_sorted
        ])]
        _generar_pdf(path, secciones, "Informe de Vulnerabilidades CVE", "Common Vulnerabilities and Exposures")

    elif tipo == "ejecutivo":
        criticos = [r for r in riesgos if r.get("nivel_riesgo") == "Crítico"]
        impl = [c for c in controles if c.get("estado") == "Implementado"]
        eficacia = round(len(impl) / len(controles) * 100) if controles else 0
        secciones = [
            ("Resumen Ejecutivo", [
                f"Total de activos registrados: {len(activos)}",
                f"Total de riesgos identificados: {len(riesgos)}",
                f"Riesgos críticos sin resolver: {len(criticos)}",
                f"Controles definidos: {len(controles)}",
                f"Controles implementados: {len(impl)} ({eficacia}% de cobertura)",
            ]),
            ("Riesgos Críticos", [
                f"[{r.get('riesgo_codigo','—')}] {r['amenaza']} — Score: {r['probabilidad']*r['impacto']}"
                for r in criticos
            ] or ["Sin riesgos críticos activos."]),
        ]
        _generar_pdf(path, secciones, "Resumen Ejecutivo SGSI", "ISO/IEC 27001:2022 · ISO/IEC 27002:2022")

    else:  # completo
        mon = supabase.table("monitoreo").select("*, controles(nombre)").execute().data
        vulns = supabase.table("vulnerabilidades").select("*").execute().data
        criticos = [r for r in riesgos if r.get("nivel_riesgo") == "Crítico"]
        impl = [c for c in controles if c.get("estado") == "Implementado"]
        eficacia = round(len(impl) / len(controles) * 100) if controles else 0
        secciones = [
            ("1. Resumen Ejecutivo", [
                f"Activos: {len(activos)} | Riesgos: {len(riesgos)} | Críticos: {len(criticos)} | Controles: {len(controles)} | Eficacia: {eficacia}%"
            ]),
            ("2. Inventario de Activos", [
                f"[{a.get('activo_codigo','—')}] {a['nombre']} | {a['tipo']} | C:{a['confidencialidad']} I:{a['integridad']} D:{a['disponibilidad']} | {a.get('clasificacion_final','—')}"
                for a in activos
            ]),
            ("3. Análisis de Riesgos", [
                f"[{r.get('riesgo_codigo','—')}] {r['amenaza']} | {r.get('nivel_riesgo','—')} | P:{r['probabilidad']} I:{r['impacto']} | {r.get('estado','—')}"
                for r in riesgos
            ]),
            ("4. Controles y Tratamiento", [
                f"{c['nombre']} | {c['estrategia']} | {c.get('estado','—')} | {c.get('progreso',0)}%"
                for c in controles
            ]),
            ("5. Monitoreo de Controles", [
                f"{m.get('controles',{}).get('nombre','—') if m.get('controles') else '—'} | {m.get('frecuencia','—')} | {m.get('cumple_esperado','—')}"
                for m in mon
            ]),
            ("6. Vulnerabilidades CVE", [
                f"{v['cve_id']} | CVSS:{v.get('cvss_score','—')} | {v.get('severidad_cvss','—')} | {v.get('estado_parche','—')}"
                for v in sorted(vulns, key=lambda x: -(x.get("cvss_score") or 0))
            ]),
        ]
        _generar_pdf(path, secciones, "Informe Completo SGSI", "Sistema de Gestión de Seguridad · ISO/IEC 27001/27002:2022")

    return FileResponse(path, media_type="application/pdf", filename=f"RiskSentry_{tipo}.pdf")
