from pydantic import BaseModel
from typing import Optional

# ── ACTIVOS ──────────────────────────────────────────────────────────────────
# Tipos según ISO/IEC 27005 nomenclatura
TIPOS_ACTIVO = ["D", "S", "SW", "HW", "COM", "Media", "L", "P"]
SENSIBILIDADES = ["Pública", "Interna", "Confidencial", "Restringida"]
FUNCIONES_NEGOCIO = ["Crítico", "Soporte", "No crítico"]

class Activo(BaseModel):
    nombre: str
    tipo: str                                   # D|S|SW|HW|COM|Media|L|P
    descripcion: Optional[str] = None
    sensibilidad: Optional[str] = "Interna"
    funcion_negocio: Optional[str] = "Soporte"
    responsable_nombre: Optional[str] = None
    responsable_area: Optional[str] = None
    responsable_cargo: Optional[str] = None
    responsable_contacto: Optional[str] = None
    ubicacion: Optional[str] = None
    confidencialidad: int                       # 1-4
    integridad: int                             # 1-4
    disponibilidad: int                         # 1-4

# ── RIESGOS ──────────────────────────────────────────────────────────────────
ESTADOS_RIESGO = ["Identificado", "En tratamiento", "Tratado", "Aceptado"]

class Riesgo(BaseModel):
    activo_id: str
    amenaza: str
    vulnerabilidad: str
    area_responsable: Optional[str] = None
    responsable_nombre: Optional[str] = None
    responsable_cargo: Optional[str] = None
    cve_code: Optional[str] = None
    probabilidad: int                           # 1-4
    impacto: int                                # 1-4
    estado: Optional[str] = "Identificado"
    controles_aplicables: Optional[str] = None

# ── CONTROLES / TRATAMIENTO ───────────────────────────────────────────────────
TIPOS_CONTROL = ["Preventivo", "Detectivo", "Correctivo", "Compensatorio"]
ESTADOS_CONTROL = ["No implementado", "Parcial", "Implementado", "No aplica"]
DOMINIOS_ISO = ["Organizacional", "Personas", "Físico", "Tecnológico"]
ESTRATEGIAS_TRATAMIENTO = ["Mitigar", "Aceptar", "Transferir", "Evitar"]
FRECUENCIAS_SEGUIMIENTO = ["Semanal", "Quincenal", "Mensual", "Trimestral"]

class Control(BaseModel):
    riesgo_id: str
    nombre: str
    descripcion: str
    estrategia: str                             # Mitigar|Aceptar|Transferir|Evitar
    tipo_control: Optional[str] = "Preventivo"
    responsable: str
    responsable_cargo: Optional[str] = None
    responsable_area: Optional[str] = None
    iso_referencia: Optional[str] = None
    dominio_iso: Optional[str] = None
    estado: Optional[str] = "No implementado"
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    fecha_seguimiento: Optional[str] = None
    frecuencia_seguimiento: Optional[str] = "Mensual"
    fecha_proxima_revision: Optional[str] = None
    evidencia: Optional[str] = None
    resultado_esperado: Optional[str] = None
    resultado_obtenido: Optional[str] = None
    progreso: Optional[int] = 0
    recursos_necesarios: Optional[str] = None

# ── OBSERVACIONES ─────────────────────────────────────────────────────────────
TIPOS_OBSERVACION = ["Recomendación", "Observación", "Acción correctiva", "Alerta"]

class Observacion(BaseModel):
    riesgo_id: str
    contenido: str
    autor: str
    tipo: Optional[str] = "Observación"

# ── VULNERABILIDADES CVE ───────────────────────────────────────────────────────
ESTADOS_PARCHE = ["Sin parche", "Parche disponible", "Parche aplicado"]
SEVERIDADES_CVSS = ["Ninguna", "Baja", "Media", "Alta", "Crítica"]

class Vulnerabilidad(BaseModel):
    cve_id: str
    cvss_score: Optional[float] = None
    severidad_cvss: Optional[str] = None
    descripcion_cve: Optional[str] = None
    activos_afectados: Optional[str] = None    # IDs separados por coma
    riesgos_relacionados: Optional[str] = None  # IDs separados por coma
    fecha_publicacion: Optional[str] = None
    estado_parche: Optional[str] = "Sin parche"

# ── MONITOREO DE CONTROLES ────────────────────────────────────────────────────
CUMPLE_OPCIONES = ["Sí", "No", "Parcialmente"]

class Monitoreo(BaseModel):
    control_id: str
    iso_referencia: Optional[str] = None
    metodo_monitoreo: Optional[str] = None
    frecuencia: Optional[str] = "Mensual"
    responsable: Optional[str] = None
    herramienta: Optional[str] = None
    resultado_esperado: Optional[str] = None
    resultado_obtenido: Optional[str] = None
    fecha_ultima_revision: Optional[str] = None
    fecha_proxima_revision: Optional[str] = None
    cumple_esperado: Optional[str] = None
    acciones_remediacion: Optional[str] = None
