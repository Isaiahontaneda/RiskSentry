from fastapi import APIRouter, HTTPException
from database import supabase
from models import Monitoreo

router = APIRouter()


@router.get("/")
def obtener_monitoreos():
    response = supabase.table("monitoreo").select("*, controles(nombre, iso_referencia)").execute()
    return response.data


@router.post("/")
def crear_monitoreo(mon: Monitoreo):
    response = supabase.table("monitoreo").insert(mon.model_dump()).execute()
    return response.data


@router.get("/{id}")
def obtener_monitoreo(id: str):
    response = supabase.table("monitoreo").select("*, controles(nombre)").eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Monitoreo no encontrado")
    return response.data[0]


@router.put("/{id}")
def actualizar_monitoreo(id: str, mon: Monitoreo):
    response = supabase.table("monitoreo").update(mon.model_dump()).eq("id", id).execute()
    return response.data


@router.delete("/{id}")
def eliminar_monitoreo(id: str):
    supabase.table("monitoreo").delete().eq("id", id).execute()
    return {"message": "Monitoreo eliminado"}
