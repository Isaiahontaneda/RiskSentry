from fastapi import APIRouter, HTTPException
from database import supabase
from models import Observacion

router = APIRouter()

@router.get("/")
def obtener_observaciones():
    response = supabase.table("observaciones").select("*, riesgos(amenaza)").execute()
    return response.data

@router.post("/")
def crear_observacion(obs: Observacion):
    data = obs.model_dump()
    response = supabase.table("observaciones").insert(data).execute()
    return response.data

@router.put("/{id}")
def actualizar_observacion(id: str, obs: Observacion):
    data = obs.model_dump()
    response = supabase.table("observaciones").update(data).eq("id", id).execute()
    return response.data

@router.delete("/{id}")
def eliminar_observacion(id: str):
    response = supabase.table("observaciones").delete().eq("id", id).execute()
    return {"message": "Observación eliminada"}