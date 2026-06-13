from fastapi import APIRouter, HTTPException
from database import supabase
from models import Activo

router = APIRouter()

@router.get("/")
def obtener_activos():
    response = supabase.table("activos").select("*").execute()
    return response.data

@router.post("/")
def crear_activo(activo: Activo):
    data = activo.model_dump()
    response = supabase.table("activos").insert(data).execute()
    return response.data

@router.get("/{id}")
def obtener_activo(id: str):
    response = supabase.table("activos").select("*").eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return response.data[0]

@router.put("/{id}")
def actualizar_activo(id: str, activo: Activo):
    data = activo.model_dump()
    response = supabase.table("activos").update(data).eq("id", id).execute()
    return response.data

@router.delete("/{id}")
def eliminar_activo(id: str):
    response = supabase.table("activos").delete().eq("id", id).execute()
    return {"message": "Activo eliminado"}