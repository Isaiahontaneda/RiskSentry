CONTROLES_ISO = {
    "acceso": {
        "referencia": "ISO 27002:2022 - 5.15",
        "nombre": "Control de acceso",
        "descripcion": "Gestionar el acceso a la información y activos según necesidad de negocio."
    },
    "malware": {
        "referencia": "ISO 27002:2022 - 8.7",
        "nombre": "Protección contra malware",
        "descripcion": "Implementar controles de detección, prevención y recuperación ante malware."
    },
    "cifrado": {
        "referencia": "ISO 27002:2022 - 8.24",
        "nombre": "Uso de criptografía",
        "descripcion": "Aplicar cifrado para proteger la confidencialidad e integridad de la información."
    },
    "backup": {
        "referencia": "ISO 27002:2022 - 8.13",
        "nombre": "Respaldo de información",
        "descripcion": "Mantener copias de seguridad y verificar su restauración periódicamente."
    },
    "red": {
        "referencia": "ISO 27002:2022 - 8.20",
        "nombre": "Seguridad de redes",
        "descripcion": "Gestionar y controlar la seguridad en redes para proteger sistemas y aplicaciones."
    },
    "incidente": {
        "referencia": "ISO 27002:2022 - 5.26",
        "nombre": "Respuesta a incidentes",
        "descripcion": "Establecer procedimientos para responder a incidentes de seguridad."
    },
    "phishing": {
        "referencia": "ISO 27002:2022 - 6.3",
        "nombre": "Concientización y capacitación",
        "descripcion": "Capacitar al personal para identificar y responder ante ataques de ingeniería social."
    },
    "fisico": {
        "referencia": "ISO 27002:2022 - 7.1",
        "nombre": "Perímetro de seguridad física",
        "descripcion": "Definir perímetros de seguridad para proteger áreas con información sensible."
    }
}

def sugerir_control(amenaza: str) -> dict:
    amenaza_lower = amenaza.lower()

    for clave, control in CONTROLES_ISO.items():
        if clave in amenaza_lower:
            return control

    return {
        "referencia": "ISO 27002:2022 - 5.1",
        "nombre": "Políticas de seguridad",
        "descripcion": "Revisar y aplicar políticas generales de seguridad de la información."
    }