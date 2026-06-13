def calcular_nivel_riesgo(probabilidad: int, impacto: int) -> str:
    nivel = probabilidad * impacto

    if nivel <= 4:
        return "Bajo"
    elif nivel <= 9:
        return "Medio"
    elif nivel <= 16:
        return "Alto"
    else:
        return "Crítico"

def calcular_riesgo_residual(probabilidad_residual: int, impacto_residual: int) -> str:
    return calcular_nivel_riesgo(probabilidad_residual, impacto_residual)

def clasificar_activo(confidencialidad: int, integridad: int, disponibilidad: int) -> str:
    valor = confidencialidad + integridad + disponibilidad

    if valor <= 4:
        return "Bajo"
    elif valor <= 8:
        return "Medio"
    elif valor <= 12:
        return "Alto"
    else:
        return "Crítico"