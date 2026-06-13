from fastapi import APIRouter
from fastapi.responses import FileResponse
from database import supabase
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

router = APIRouter()

@router.get("/generar")
def generar_reporte():
    activos = supabase.table("activos").select("*").execute().data
    riesgos = supabase.table("riesgos").select("*, activos(nombre)").execute().data
    controles = supabase.table("controles").select("*, riesgos(amenaza)").execute().data

    path = "reporte_riesgos.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Reporte de Gestión de Riesgos Cibernéticos")

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 90, "ACTIVOS")
    c.setFont("Helvetica", 10)
    y = height - 110
    for a in activos:
        c.drawString(60, y, f"- {a['nombre']} | Tipo: {a['tipo']} | C:{a['confidencialidad']} I:{a['integridad']} D:{a['disponibilidad']}")
        y -= 15
        if y < 100:
            c.showPage()
            y = height - 50

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y - 10, "RIESGOS")
    c.setFont("Helvetica", 10)
    y -= 30
    for r in riesgos:
        activo_nombre = r.get("activos", {}).get("nombre", "N/A") if r.get("activos") else "N/A"
        c.drawString(60, y, f"- {r['amenaza']} | Activo: {activo_nombre} | Nivel: {r['nivel_riesgo']}")
        y -= 15
        if y < 100:
            c.showPage()
            y = height - 50

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y - 10, "CONTROLES")
    c.setFont("Helvetica", 10)
    y -= 30
    for ctrl in controles:
        c.drawString(60, y, f"- {ctrl['nombre']} | Estrategia: {ctrl['estrategia']} | Estado: {ctrl['estado']}")
        y -= 15
        if y < 100:
            c.showPage()
            y = height - 50

    c.save()
    return FileResponse(path, media_type="application/pdf", filename="reporte_riesgos.pdf")