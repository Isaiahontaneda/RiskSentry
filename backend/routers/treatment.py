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
    response = supabase.table("controles").insert(control.model_dump()).execute()
    return response.data


@router.get("/{id}")
def obtener_control(id: str):
    response = supabase.table("controles").select("*, riesgos(amenaza)").eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Control no encontrado")
    return response.data[0]


@router.put("/{id}")
def actualizar_control(id: str, control: Control):
    response = supabase.table("controles").update(control.model_dump()).eq("id", id).execute()
    return response.data


@router.delete("/{id}")
def eliminar_control(id: str):
    supabase.table("controles").delete().eq("id", id).execute()
    return {"message": "Control eliminado"}
