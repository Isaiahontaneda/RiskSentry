from pydantic import BaseModel
from typing import Optional

class Activo(BaseModel):
    nombre: str
    tipo: str
    descripcion: Optional[str] = None
    confidencialidad: int
    integridad: int
    disponibilidad: int

class Riesgo(BaseModel):
    activo_id: str
    amenaza: str
    vulnerabilidad: str
    probabilidad: int
    impacto: int

class Control(BaseModel):
    riesgo_id: str
    nombre: str
    descripcion: str
    estrategia: str
    responsable: str
    iso_referencia: Optional[str] = None
    estado: Optional[str] = "pendiente"

class Observacion(BaseModel):
    riesgo_id: str
    contenido: str
    autor: str