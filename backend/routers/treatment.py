from fastapi import APIRouter, HTTPException
from database import supabase
from models import Control

router = APIRouter()

@router.get("/")
def obtener_controles():
    response = supabase.table("controles").select("*, riesgos(amenaza)").execute()
    return response.data

@router.post("/")
def crear_control(control: Control):
    data = control.model_dump()
    response = supabase.table("controles").insert(data).execute()
    return response.data

@router.get("/{id}")
def obtener_control(id: str):
    response = supabase.table("controles").select("*, riesgos(amenaza)").eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Control no encontrado")
    return response.data[0]

@router.put("/{id}")
def actualizar_control(id: str, control: Control):
    data = control.model_dump()
    response = supabase.table("controles").update(data).eq("id", id).execute()
    return response.data

@router.delete("/{id}")
def eliminar_control(id: str):
    response = supabase.table("controles").delete().eq("id", id).execute()
    return {"message": "Control eliminado"}