-- ============================================================
-- RiskSentry v2.0 — Migración ISO/IEC 27002:2022
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ─── TABLA: activos ──────────────────────────────────────────
ALTER TABLE activos
  ADD COLUMN IF NOT EXISTS activo_codigo       TEXT,
  ADD COLUMN IF NOT EXISTS sensibilidad        TEXT DEFAULT 'Interna',
  ADD COLUMN IF NOT EXISTS funcion_negocio     TEXT DEFAULT 'Soporte',
  ADD COLUMN IF NOT EXISTS responsable_nombre  TEXT,
  ADD COLUMN IF NOT EXISTS responsable_area    TEXT,
  ADD COLUMN IF NOT EXISTS responsable_cargo   TEXT,
  ADD COLUMN IF NOT EXISTS responsable_contacto TEXT,
  ADD COLUMN IF NOT EXISTS ubicacion           TEXT,
  ADD COLUMN IF NOT EXISTS clasificacion_final TEXT;

-- Cambiar escala CID de 1-5 a 1-4 (si aplica):
-- Los valores existentes 5 se deben revisar manualmente.

-- ─── TABLA: riesgos ──────────────────────────────────────────
ALTER TABLE riesgos
  ADD COLUMN IF NOT EXISTS riesgo_codigo       TEXT,
  ADD COLUMN IF NOT EXISTS area_responsable    TEXT,
  ADD COLUMN IF NOT EXISTS responsable_nombre  TEXT,
  ADD COLUMN IF NOT EXISTS responsable_cargo   TEXT,
  ADD COLUMN IF NOT EXISTS cve_code            TEXT,
  ADD COLUMN IF NOT EXISTS estado              TEXT DEFAULT 'Identificado',
  ADD COLUMN IF NOT EXISTS controles_aplicables TEXT,
  ADD COLUMN IF NOT EXISTS score_riesgo        INTEGER;

-- ─── TABLA: controles ────────────────────────────────────────
ALTER TABLE controles
  ADD COLUMN IF NOT EXISTS tipo_control         TEXT DEFAULT 'Preventivo',
  ADD COLUMN IF NOT EXISTS responsable_cargo    TEXT,
  ADD COLUMN IF NOT EXISTS responsable_area     TEXT,
  ADD COLUMN IF NOT EXISTS dominio_iso          TEXT,
  ADD COLUMN IF NOT EXISTS fecha_inicio         TEXT,
  ADD COLUMN IF NOT EXISTS fecha_fin            TEXT,
  ADD COLUMN IF NOT EXISTS fecha_seguimiento    TEXT,
  ADD COLUMN IF NOT EXISTS frecuencia_seguimiento TEXT DEFAULT 'Mensual',
  ADD COLUMN IF NOT EXISTS fecha_proxima_revision TEXT,
  ADD COLUMN IF NOT EXISTS evidencia            TEXT,
  ADD COLUMN IF NOT EXISTS resultado_esperado   TEXT,
  ADD COLUMN IF NOT EXISTS resultado_obtenido   TEXT,
  ADD COLUMN IF NOT EXISTS progreso             INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recursos_necesarios  TEXT;

-- Actualizar valores de estado para coincidir con nueva nomenclatura:
UPDATE controles SET estado = 'No implementado' WHERE estado = 'pendiente';
UPDATE controles SET estado = 'Parcial'         WHERE estado = 'en progreso';
UPDATE controles SET estado = 'Implementado'    WHERE estado = 'implementado';

-- ─── TABLA: vulnerabilidades (NUEVA) ─────────────────────────
CREATE TABLE IF NOT EXISTS vulnerabilidades (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cve_id              TEXT NOT NULL,
  cvss_score          FLOAT,
  severidad_cvss      TEXT,
  descripcion_cve     TEXT,
  activos_afectados   TEXT,
  riesgos_relacionados TEXT,
  fecha_publicacion   TEXT,
  estado_parche       TEXT DEFAULT 'Sin parche',
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── TABLA: monitoreo (NUEVA) ────────────────────────────────
CREATE TABLE IF NOT EXISTS monitoreo (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  control_id             UUID REFERENCES controles(id) ON DELETE CASCADE,
  iso_referencia         TEXT,
  metodo_monitoreo       TEXT,
  frecuencia             TEXT DEFAULT 'Mensual',
  responsable            TEXT,
  herramienta            TEXT,
  resultado_esperado     TEXT,
  resultado_obtenido     TEXT,
  fecha_ultima_revision  TEXT,
  fecha_proxima_revision TEXT,
  cumple_esperado        TEXT,
  acciones_remediacion   TEXT,
  created_at             TIMESTAMPTZ DEFAULT now()
);

-- ─── RLS: habilitar y permitir acceso autenticado ────────────
ALTER TABLE vulnerabilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoreo        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_auth_vuln" ON vulnerabilidades;
CREATE POLICY "allow_auth_vuln"
  ON vulnerabilidades FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_auth_monitoreo" ON monitoreo;
CREATE POLICY "allow_auth_monitoreo"
  ON monitoreo FOR ALL TO authenticated USING (true) WITH CHECK (true);
