-- ============================================================
-- RiskSentry — Parche FK + columna nivel_riesgo
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Columna nivel_riesgo faltante en riesgos
--    (el backend la calcula y la envía al INSERT/UPDATE)
ALTER TABLE riesgos
  ADD COLUMN IF NOT EXISTS nivel_riesgo TEXT;

-- 2. FK riesgos → activos con CASCADE
--    Permite eliminar un activo aunque tenga riesgos asociados.
ALTER TABLE riesgos
  DROP CONSTRAINT IF EXISTS riesgos_activo_id_fkey;

ALTER TABLE riesgos
  ADD CONSTRAINT riesgos_activo_id_fkey
  FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE;

-- 3. FK controles → riesgos con CASCADE
--    Permite eliminar un riesgo aunque tenga controles asociados.
ALTER TABLE controles
  DROP CONSTRAINT IF EXISTS controles_riesgo_id_fkey;

ALTER TABLE controles
  ADD CONSTRAINT controles_riesgo_id_fkey
  FOREIGN KEY (riesgo_id) REFERENCES riesgos(id) ON DELETE CASCADE;

-- 4. FK observaciones → riesgos con CASCADE
ALTER TABLE observaciones
  DROP CONSTRAINT IF EXISTS observaciones_riesgo_id_fkey;

ALTER TABLE observaciones
  ADD CONSTRAINT observaciones_riesgo_id_fkey
  FOREIGN KEY (riesgo_id) REFERENCES riesgos(id) ON DELETE CASCADE;

-- 5. FK monitoreo → controles ya tiene CASCADE (creada en migración previa)
--    Solo verificamos que la columna cumple_esperado acepte los valores del frontend
--    Frontend envía: "Sí" | "No" | "Parcial" | "N/A"
--    (no hay restricción CHECK, así que ya acepta cualquier texto)
