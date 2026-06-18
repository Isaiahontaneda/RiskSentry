from fastapi import APIRouter, HTTPException
from database import supabase
from models import Vulnerabilidad

router = APIRouter()


@router.get("/")
def obtener_vulnerabilidades():
    response = supabase.table("vulnerabilidades").select("*").execute()
    return sorted(response.data, key=lambda x: -(x.get("cvss_score") or 0))


@router.post("/")
def crear_vulnerabilidad(vuln: Vulnerabilidad):
    response = supabase.table("vulnerabilidades").insert(vuln.model_dump()).execute()
    return response.data


@router.get("/{id}")
def obtener_vulnerabilidad(id: str):
    response = supabase.table("vulnerabilidades").select("*").eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Vulnerabilidad no encontrada")
    return response.data[0]


@router.put("/{id}")
def actualizar_vulnerabilidad(id: str, vuln: Vulnerabilidad):
    response = supabase.table("vulnerabilidades").update(vuln.model_dump()).eq("id", id).execute()
    return response.data


@router.delete("/{id}")
def eliminar_vulnerabilidad(id: str):
    supabase.table("vulnerabilidades").delete().eq("id", id).execute()
    return {"message": "Vulnerabilidad eliminada"}
