from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import assets, risks, treatment, reports, observaciones, vulnerabilidades, monitoreo

app = FastAPI(title="RiskSentry API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://risk-sentry.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router, prefix="/activos", tags=["Activos"])
app.include_router(risks.router, prefix="/riesgos", tags=["Riesgos"])
app.include_router(treatment.router, prefix="/controles", tags=["Controles"])
app.include_router(reports.router, prefix="/reportes", tags=["Reportes"])
app.include_router(observaciones.router, prefix="/observaciones", tags=["Observaciones"])
app.include_router(vulnerabilidades.router, prefix="/vulnerabilidades", tags=["Vulnerabilidades"])
app.include_router(monitoreo.router, prefix="/monitoreo", tags=["Monitoreo"])


@app.get("/")
def root():
    return {"status": "ok", "message": "RiskSentry API v2.0 — ISO/IEC 27002:2022"}
