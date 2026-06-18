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
    response = supabase.table("observaciones").insert(obs.model_dump()).execute()
    return response.data


@router.put("/{id}")
def actualizar_observacion(id: str, obs: Observacion):
    response = supabase.table("observaciones").update(obs.model_dump()).eq("id", id).execute()
    return response.data


@router.delete("/{id}")
def eliminar_observacion(id: str):
    supabase.table("observaciones").delete().eq("id", id).execute()
    return {"message": "Observación eliminada"}
