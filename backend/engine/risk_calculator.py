def calcular_nivel_riesgo(probabilidad: int, impacto: int) -> str:
    nivel = probabilidad * impacto
    if nivel <= 4:
        return "Bajo"
    elif nivel <= 8:
        return "Medio"
    elif nivel <= 12:
        return "Alto"
    else:
        return "Crítico"


def calcular_riesgo_residual(probabilidad_residual: int, impacto_residual: int) -> str:
    return calcular_nivel_riesgo(probabilidad_residual, impacto_residual)


def clasificar_activo_cid(confidencialidad: int, integridad: int, disponibilidad: int) -> str:
    """Clasifica un activo por promedio CID según escala 1-4."""
    promedio = (confidencialidad + integridad + disponibilidad) / 3
    if promedio >= 3.5:
        return "Muy Alta"
    elif promedio >= 3.0:
        return "Alta"
    elif promedio >= 2.0:
        return "Media"
    else:
        return "Baja"
