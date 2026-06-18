from fastapi import APIRouter, HTTPException
from database import supabase
from models import Riesgo
from engine.risk_calculator import calcular_nivel_riesgo

router = APIRouter()


def _enrich(data: dict) -> dict:
    p = data.get("probabilidad", 1)
    i = data.get("impacto", 1)
    data["nivel_riesgo"] = calcular_nivel_riesgo(p, i)
    data["score_riesgo"] = p * i
    return data


def _next_codigo() -> str:
    result = supabase.table("riesgos").select("id").execute()
    return f"RISK-{len(result.data) + 1:03d}"


@router.get("/")
def obtener_riesgos():
    response = supabase.table("riesgos").select("*, activos(nombre)").execute()
    return response.data


@router.post("/")
def crear_riesgo(riesgo: Riesgo):
    data = _enrich(riesgo.model_dump())
    data.setdefault("riesgo_codigo", _next_codigo())
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
    data = _enrich(riesgo.model_dump())
    response = supabase.table("riesgos").update(data).eq("id", id).execute()
    return response.data


@router.delete("/{id}")
def eliminar_riesgo(id: str):
    supabase.table("riesgos").delete().eq("id", id).execute()
    return {"message": "Riesgo eliminado"}
