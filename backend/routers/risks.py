from fastapi import APIRouter, HTTPException
from database import supabase
from models import Riesgo

router = APIRouter()

@router.get("/")
def obtener_riesgos():
    response = supabase.table("riesgos").select("*, activos(nombre)").execute()
    return response.data

@router.post("/")
def crear_riesgo(riesgo: Riesgo):
    data = riesgo.model_dump()
    response = supabase.table("riesgos").insert(data).execute()
    return response.data

@router.get("/{id}")
def obtener_riesgo(id: str):
    response = supabase.table("riesgos").select("*, activos(nombre)").eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Riesgo no encontrado")
    return response.data[0]

@router.put("/{id}")
def actualizar_riesgo(id: str, riesgo: Riesgo):
    data = riesgo.model_dump()
    response = supabase.table("riesgos").update(data).eq("id", id).execute()
    return response.data

@router.delete("/{id}")
def eliminar_riesgo(id: str):
    response = supabase.table("riesgos").delete().eq("id", id).execute()
    return {"message": "Riesgo eliminado"}