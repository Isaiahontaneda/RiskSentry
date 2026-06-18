from fastapi import APIRouter, HTTPException
from database import supabase
from models import Activo
from engine.risk_calculator import clasificar_activo_cid

router = APIRouter()


def _enrich(data: dict) -> dict:
    c = data.get("confidencialidad", 1)
    i = data.get("integridad", 1)
    d = data.get("disponibilidad", 1)
    data["clasificacion_final"] = clasificar_activo_cid(c, i, d)
    return data


def _next_codigo() -> str:
    result = supabase.table("activos").select("id").execute()
    return f"ACT-{len(result.data) + 1:03d}"


@router.get("/")
def obtener_activos():
    response = supabase.table("activos").select("*").execute()
    return response.data


@router.post("/")
def crear_activo(activo: Activo):
    data = _enrich(activo.model_dump())
    data.setdefault("activo_codigo", _next_codigo())
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
    data = _enrich(activo.model_dump())
    response = supabase.table("activos").update(data).eq("id", id).execute()
    return response.data


@router.delete("/{id}")
def eliminar_activo(id: str):
    supabase.table("activos").delete().eq("id", id).execute()
    return {"message": "Activo eliminado"}
