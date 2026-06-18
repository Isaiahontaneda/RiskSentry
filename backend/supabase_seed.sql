-- ============================================================
-- RiskSentry v2.0 — Datos de Simulación
-- Escenario: empresa FinTech "FinCore S.A."
-- Alineado a ISO/IEC 27002:2022 — 93 controles
-- Ejecutar DESPUÉS de supabase_patch_fk.sql
-- ============================================================

-- Asegurar columna tipo en observaciones (por si no existe)
ALTER TABLE observaciones ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'Observación';


-- ═══════════════════════════════════════════════════════════
-- 1. ACTIVOS  (10 activos — mix HW/SW/D/COM)
--    Clasificación CID escala 1-4: avg ≥ 3.5 → Muy Alta
--                                  avg ≥ 2.5 → Alta
--                                  avg ≥ 1.5 → Media
--                                  avg <  1.5 → Baja
-- ═══════════════════════════════════════════════════════════
INSERT INTO activos (
  id, activo_codigo, nombre, tipo, descripcion,
  sensibilidad, funcion_negocio,
  confidencialidad, integridad, disponibilidad, clasificacion_final,
  responsable_nombre, responsable_area, responsable_cargo,
  responsable_contacto, ubicacion
) VALUES

  ('a0000000-0000-0000-0000-000000000001',
   'ACT-001','Servidor Active Directory','HW',
   'Controlador de dominio principal que gestiona autenticación, políticas GPO y accesos de los 320 usuarios corporativos',
   'Restringida','Crítico', 4,4,4,'Muy Alta',
   'Carlos Mendoza','TI - Infraestructura','Administrador de Sistemas',
   'c.mendoza@fincore.com','Data Center Piso 3 — Rack B'),

  ('a0000000-0000-0000-0000-000000000002',
   'ACT-002','Aplicación Web Corporativa','SW',
   'Portal web para clientes que expone servicios financieros, consultas de saldo y transferencias en línea',
   'Confidencial','Crítico', 4,3,3,'Alta',
   'Laura Quispe','Desarrollo de Software','Líder Técnico',
   'l.quispe@fincore.com','Nube AWS us-east-1'),

  ('a0000000-0000-0000-0000-000000000003',
   'ACT-003','Base de Datos de Clientes','D',
   'PostgreSQL 15 con información PII y financiera de 50.000 clientes activos. Sujeta a regulación GDPR y SBS',
   'Restringida','Crítico', 4,4,3,'Muy Alta',
   'Mario Flores','TI - Base de Datos','DBA Senior',
   'm.flores@fincore.com','Data Center Piso 3 — Rack B'),

  ('a0000000-0000-0000-0000-000000000004',
   'ACT-004','Firewall Perimetral FortiGate 600E','HW',
   'Dispositivo UTM perimetral que controla el tráfico entre la red interna, DMZ e internet',
   'Confidencial','Crítico', 3,4,4,'Muy Alta',
   'Ana Torres','TI - Seguridad','Ingeniero de Seguridad',
   'a.torres@fincore.com','Rack A — Data Center'),

  ('a0000000-0000-0000-0000-000000000005',
   'ACT-005','Sistema ERP SAP S/4HANA','SW',
   'Plataforma ERP que centraliza contabilidad, tesorería, RRHH y operaciones. Procesamiento diario > S/. 2M',
   'Confidencial','Crítico', 3,4,4,'Muy Alta',
   'Pedro Vargas','Operaciones','Gerente de TI',
   'p.vargas@fincore.com','Nube Azure West US'),

  ('a0000000-0000-0000-0000-000000000006',
   'ACT-006','Red LAN Corporativa','COM',
   'Infraestructura de red interna: 12 switches Cisco Cat 9300, cableado Cat6A y 45 APs WiFi 6',
   'Interna','Soporte', 2,3,4,'Alta',
   'Carlos Mendoza','TI - Infraestructura','Administrador de Redes',
   'c.mendoza@fincore.com','Todas las sedes (3 oficinas)'),

  ('a0000000-0000-0000-0000-000000000007',
   'ACT-007','Servidor de Backups NAS (Synology)','HW',
   'NAS con copias diarias incrementales y semanales completas de BD y sistemas críticos. Capacidad: 120 TB',
   'Restringida','Soporte', 4,4,3,'Muy Alta',
   'Mario Flores','TI - Infraestructura','Administrador de Sistemas',
   'm.flores@fincore.com','Data Center Piso 2 — Rack D'),

  ('a0000000-0000-0000-0000-000000000008',
   'ACT-008','Portal de Recursos Humanos','SW',
   'Sistema de gestión de nómina, contratos, perfiles y evaluaciones de desempeño de 320 empleados',
   'Confidencial','Soporte', 3,3,2,'Alta',
   'Sofía Ramos','Recursos Humanos','Gerente de RRHH',
   's.ramos@fincore.com','Nube AWS us-east-1'),

  ('a0000000-0000-0000-0000-000000000009',
   'ACT-009','Estaciones de Trabajo Corporativas (150 equipos)','HW',
   'Equipos Dell Latitude Windows 11 Pro distribuidos en operaciones, finanzas y administración',
   'Interna','Soporte', 2,2,3,'Media',
   'Carlos Mendoza','TI - Soporte','Técnico de Soporte',
   'helpdesk@fincore.com','Oficinas Principales — Lima'),

  ('a0000000-0000-0000-0000-00000000000a',
   'ACT-010','Repositorio SGSI / Documentación ISO 27001','D',
   'Políticas de seguridad, procedimientos, evidencias de auditoría, planes de tratamiento y SoA',
   'Confidencial','No crítico', 3,4,2,'Alta',
   'Ana Torres','TI - Seguridad','CISO',
   'a.torres@fincore.com','SharePoint Online — Sitio SGSI')

ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════
-- 2. RIESGOS (15)
--    nivel_riesgo: P×I ≤4=Bajo  5-8=Medio  9-12=Alto  >12=Crítico
-- ═══════════════════════════════════════════════════════════
INSERT INTO riesgos (
  id, riesgo_codigo, activo_id,
  amenaza, vulnerabilidad,
  probabilidad, impacto, score_riesgo, nivel_riesgo, estado,
  area_responsable, responsable_nombre, responsable_cargo, cve_code
) VALUES

  -- ── CRÍTICOS (P×I > 12) ────────────────────────────────
  ('b0000000-0000-0000-0000-000000000001','RISK-001',
   'a0000000-0000-0000-0000-000000000001',
   'Acceso no autorizado al Directorio Activo',
   'Contraseñas débiles en cuentas privilegiadas y ausencia de MFA para administradores de dominio',
   4,4,16,'Crítico','Identificado',
   'TI - Seguridad','Ana Torres','Ingeniero de Seguridad',NULL),

  ('b0000000-0000-0000-0000-000000000002','RISK-002',
   'a0000000-0000-0000-0000-000000000001',
   'Spear phishing dirigido a administradores de dominio',
   'Falta de concienciación en ingeniería social avanzada y ausencia de filtros de correo DMARC/DKIM',
   4,4,16,'Crítico','En tratamiento',
   'TI - Seguridad','Ana Torres','CISO',NULL),

  ('b0000000-0000-0000-0000-000000000003','RISK-003',
   'a0000000-0000-0000-0000-000000000002',
   'Inyección SQL en portal web de transacciones',
   'Parámetros de entrada sin sanitizar en formularios de transferencias y consultas de saldo',
   3,4,12,'Alto','En tratamiento',
   'Desarrollo de Software','Laura Quispe','Líder Técnico',NULL),

  ('b0000000-0000-0000-0000-000000000004','RISK-004',
   'a0000000-0000-0000-0000-000000000003',
   'Ransomware cifra base de datos de clientes',
   'Ausencia de segmentación de red entre aplicación y BD, backups sin verificación automática de integridad',
   3,4,12,'Alto','Identificado',
   'TI - Base de Datos','Mario Flores','DBA Senior',NULL),

  ('b0000000-0000-0000-0000-000000000005','RISK-005',
   'a0000000-0000-0000-0000-000000000005',
   'Fuga de credenciales del sistema ERP',
   'Credenciales SAP almacenadas en texto plano en repositorios internos y reutilización de contraseñas',
   3,4,12,'Alto','En tratamiento',
   'Operaciones','Pedro Vargas','Gerente de TI',NULL),

  ('b0000000-0000-0000-0000-000000000006','RISK-006',
   'a0000000-0000-0000-0000-000000000009',
   'Infección por malware / troyano bancario en endpoints',
   'Endpoints sin solución EDR actualizada, navegación sin proxy y usuarios con privilegios de administrador local',
   4,3,12,'Alto','Identificado',
   'TI - Soporte','Carlos Mendoza','Técnico de Soporte','CVE-2022-30190'),

  -- ── ALTOS (P×I 9–12) ───────────────────────────────────
  ('b0000000-0000-0000-0000-000000000007','RISK-007',
   'a0000000-0000-0000-0000-000000000002',
   'Explotación de vulnerabilidad Log4Shell en backend',
   'Versiones desactualizadas de Apache Log4j 2.x usadas como dependencia en el backend Java',
   3,4,12,'Alto','Tratado',
   'Desarrollo de Software','Laura Quispe','Líder Técnico','CVE-2021-44228'),

  ('b0000000-0000-0000-0000-000000000008','RISK-008',
   'a0000000-0000-0000-0000-000000000005',
   'Interrupción no planificada del ERP por fallo de infraestructura',
   'Ausencia de plan de continuidad documentado y SLA de recuperación no definido formalmente',
   3,3,9,'Alto','Identificado',
   'Operaciones','Pedro Vargas','Gerente de TI',NULL),

  ('b0000000-0000-0000-0000-000000000009','RISK-009',
   'a0000000-0000-0000-0000-000000000008',
   'Exfiltración de datos de nómina y contratos de empleados',
   'Exceso de privilegios de acceso, ausencia de logs de auditoría y falta de DLP en el portal RRHH',
   3,3,9,'Alto','En tratamiento',
   'Recursos Humanos','Sofía Ramos','Gerente de RRHH',NULL),

  -- ── MEDIOS (P×I 5–8) ───────────────────────────────────
  ('b0000000-0000-0000-0000-00000000000a','RISK-010',
   'a0000000-0000-0000-0000-000000000004',
   'Bypass del firewall perimetral mediante reglas permisivas',
   'Reglas heredadas sin revisar desde 2021 y falta de política de firewall zero-trust documentada',
   2,4,8,'Medio','Identificado',
   'TI - Seguridad','Ana Torres','Ingeniero de Seguridad',NULL),

  ('b0000000-0000-0000-0000-00000000000b','RISK-011',
   'a0000000-0000-0000-0000-000000000006',
   'Interceptación de tráfico en red LAN corporativa',
   'Red plana sin segmentación VLAN, tráfico interno sin cifrar y sin detección de ARP spoofing',
   2,3,6,'Medio','Identificado',
   'TI - Infraestructura','Carlos Mendoza','Administrador de Redes',NULL),

  ('b0000000-0000-0000-0000-00000000000c','RISK-012',
   'a0000000-0000-0000-0000-000000000007',
   'Corrupción o pérdida de backups críticos',
   'Backups sin verificación automática de integridad SHA-256 y sin pruebas de restauración periódicas',
   2,4,8,'Medio','En tratamiento',
   'TI - Infraestructura','Mario Flores','Administrador de Sistemas',NULL),

  ('b0000000-0000-0000-0000-00000000000d','RISK-013',
   'a0000000-0000-0000-0000-000000000004',
   'Ataque DDoS volumétrico contra perímetro de red',
   'Ausencia de protección anti-DDoS dedicada y sin rate limiting a nivel de proveedor de internet',
   2,3,6,'Medio','Identificado',
   'TI - Seguridad','Ana Torres','Ingeniero de Seguridad','CVE-2023-44487'),

  ('b0000000-0000-0000-0000-00000000000e','RISK-014',
   'a0000000-0000-0000-0000-000000000009',
   'Acceso físico no autorizado a equipos desbloqueados',
   'Ausencia de política de pantalla limpia, sin bloqueo automático y discos sin cifrado en varios equipos',
   2,3,6,'Medio','Aceptado',
   'TI - Soporte','Carlos Mendoza','Técnico de Soporte',NULL),

  ('b0000000-0000-0000-0000-00000000000f','RISK-015',
   'a0000000-0000-0000-0000-00000000000a',
   'Modificación no autorizada de políticas de seguridad',
   'Control de versiones insuficiente en documentos SGSI y ausencia de firma digital del CISO',
   2,3,6,'Medio','Identificado',
   'TI - Seguridad','Ana Torres','CISO',NULL)

ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════
-- 3. CONTROLES / TRATAMIENTO (15)
--    ISO/IEC 27002:2022 — dominios: Organizacional, Personas, Físico, Tecnológico
-- ═══════════════════════════════════════════════════════════
INSERT INTO controles (
  id, riesgo_id, nombre, descripcion,
  estrategia, tipo_control,
  responsable, responsable_cargo, responsable_area,
  iso_referencia, dominio_iso, estado, progreso,
  fecha_inicio, fecha_fin,
  resultado_esperado, recursos_necesarios
) VALUES

  ('c0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001',
   'MFA obligatorio para cuentas AD privilegiadas',
   'Habilitar autenticación multifactor (Microsoft Authenticator) para las 52 cuentas privilegiadas del Directorio Activo. Bloqueo de acceso sin segundo factor.',
   'Mitigar','Preventivo',
   'Ana Torres','Ingeniero de Seguridad','TI - Seguridad',
   'ISO 27002:2022 - 8.5','Tecnológico','Implementado',100,
   '2024-01-15','2024-02-15',
   'Cobertura MFA = 100% cuentas privilegiadas. Cero accesos sin segundo factor.',
   'Licencias Microsoft Entra ID P2 (52 users). 2 días de implementación.'),

  ('c0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000002',
   'Programa de concienciación antiphishing (KnowBe4)',
   'Capacitación mensual obligatoria con módulos de ingeniería social + simulacros de phishing trimestrales para el 100% del personal.',
   'Mitigar','Preventivo',
   'Ana Torres','CISO','TI - Seguridad',
   'ISO 27002:2022 - 6.3','Personas','Parcial',60,
   '2024-02-01','2024-12-31',
   'Click-rate en phishing simulado < 5%. Tasa de reporte de intentos > 70%.',
   'Plataforma KnowBe4 ($8/user/año). 40 horas/año de capacitación.'),

  ('c0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000003',
   'WAF y revisión de código contra SQLi/XSS',
   'Despliegue de AWS WAF con reglas OWASP Core Rule Set v3.3 y revisión de código en sprints de desarrollo para sanitización de entradas.',
   'Mitigar','Preventivo',
   'Laura Quispe','Líder Técnico','Desarrollo de Software',
   'ISO 27002:2022 - 8.23','Tecnológico','Implementado',100,
   '2024-01-10','2024-03-10',
   'Cero vulnerabilidades SQLi/XSS críticas en escaneo DAST. WAF activo 24/7.',
   'AWS WAF ($150/mes). 1 semana de configuración y pruebas.'),

  ('c0000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000004',
   'Cifrado AES-256 en BD y segmentación de red',
   'Habilitar TDE (Transparent Data Encryption) en PostgreSQL y crear VLAN aislada para el servidor de BD con ACLs de mínimo privilegio.',
   'Mitigar','Preventivo',
   'Mario Flores','DBA Senior','TI - Base de Datos',
   'ISO 27002:2022 - 8.24','Tecnológico','Parcial',55,
   '2024-03-01','2024-06-30',
   'BD cifrada en reposo y en tránsito. Acceso solo desde VLAN de aplicación.',
   'Licencias pgcrypto. Switches gestionables VLAN. 2 semanas de implementación.'),

  ('c0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000005',
   'Bóveda de contraseñas y rotación automática SAP',
   'Implementar HashiCorp Vault como gestor de secretos con rotación automática de credenciales SAP cada 90 días.',
   'Mitigar','Preventivo',
   'Pedro Vargas','Gerente de TI','Operaciones',
   'ISO 27002:2022 - 5.17','Organizacional','Parcial',45,
   '2024-04-01','2024-07-31',
   'Cero credenciales en texto plano. Rotación automática activa sin interrupciones.',
   'HashiCorp Vault Enterprise. 2 semanas de integración con SAP.'),

  ('c0000000-0000-0000-0000-000000000006',
   'b0000000-0000-0000-0000-000000000006',
   'EDR CrowdStrike Falcon en todos los endpoints',
   'Instalación y configuración de CrowdStrike Falcon EDR en 150 estaciones con políticas de detección y respuesta automática activas.',
   'Mitigar','Detectivo',
   'Carlos Mendoza','Técnico de Soporte','TI - Soporte',
   'ISO 27002:2022 - 8.7','Tecnológico','Implementado',100,
   '2024-01-20','2024-02-28',
   'Cobertura EDR 100%. Tiempo de detección < 5 min. Bloqueo automático de malware.',
   'Licencias CrowdStrike Falcon Pro (150 endpoints). 3 días de despliegue.'),

  ('c0000000-0000-0000-0000-000000000007',
   'b0000000-0000-0000-0000-000000000007',
   'Actualización crítica Log4j a versión segura',
   'Actualización de todas las instancias Log4j a v2.17.1+ y auditoría de dependencias transitivas con Snyk en el pipeline CI/CD.',
   'Mitigar','Correctivo',
   'Laura Quispe','Líder Técnico','Desarrollo de Software',
   'ISO 27002:2022 - 8.8','Tecnológico','Implementado',100,
   '2021-12-15','2022-01-15',
   'Cero instancias vulnerables de Log4j en producción ni staging.',
   '4 días de trabajo de desarrollo. Snyk en pipeline CI/CD.'),

  ('c0000000-0000-0000-0000-000000000008',
   'b0000000-0000-0000-0000-000000000008',
   'Plan de Continuidad de Negocio (BCP) para ERP',
   'Desarrollar, documentar y probar BCP con RTO ≤ 4h y RPO ≤ 1h para SAP. Simulacro anual obligatorio.',
   'Mitigar','Correctivo',
   'Pedro Vargas','Gerente de TI','Operaciones',
   'ISO 27002:2022 - 5.30','Organizacional','Parcial',35,
   '2024-05-01','2024-09-30',
   'BCP documentado, probado y aprobado por Directorio. RTO ≤ 4h validado.',
   'Consultoría externa ISACA. 3 semanas de desarrollo. Infraestructura DR en Azure.'),

  ('c0000000-0000-0000-0000-000000000009',
   'b0000000-0000-0000-0000-000000000009',
   'RBAC con principio de mínimo privilegio en portal RRHH',
   'Implementar control de acceso basado en roles en el portal RRHH. Auditoría semestral de permisos y alertas de accesos anómalos.',
   'Mitigar','Preventivo',
   'Sofía Ramos','Gerente de RRHH','Recursos Humanos',
   'ISO 27002:2022 - 5.15','Organizacional','Parcial',70,
   '2024-03-15','2024-05-30',
   'Acceso solo por rol definido. Cero excesos de privilegios. Alertas en tiempo real.',
   'Desarrollo interno (2 semanas). Revisión legal de roles.'),

  ('c0000000-0000-0000-0000-00000000000a',
   'b0000000-0000-0000-0000-00000000000a',
   'Auditoría y endurecimiento de reglas de firewall',
   'Revisión completa de las 847 reglas del FortiGate, eliminación de reglas permisivas antiguas e implementación de política zero-trust.',
   'Mitigar','Preventivo',
   'Ana Torres','Ingeniero de Seguridad','TI - Seguridad',
   'ISO 27002:2022 - 8.20','Tecnológico','No implementado',10,
   '2024-06-01','2024-07-31',
   'Reducción de reglas permisivas en 80%. Política zero-trust documentada y activa.',
   '40 horas de trabajo. Licencia FortiAnalyzer para análisis de reglas.'),

  ('c0000000-0000-0000-0000-00000000000b',
   'b0000000-0000-0000-0000-00000000000b',
   'Segmentación VLAN por departamento',
   'Implementar 6 VLANs (Operaciones, Finanzas, RRHH, TI, DMZ, Invitados) con ACLs entre segmentos y NAC en puntos de acceso WiFi.',
   'Mitigar','Preventivo',
   'Carlos Mendoza','Administrador de Redes','TI - Infraestructura',
   'ISO 27002:2022 - 8.22','Tecnológico','Parcial',40,
   '2024-04-15','2024-08-15',
   'Red segmentada. Tráfico entre VLANs controlado por ACLs. Sin acceso lateral no autorizado.',
   'Switches Cisco Cat 9300 (ya adquiridos). 2 semanas de configuración.'),

  ('c0000000-0000-0000-0000-00000000000c',
   'b0000000-0000-0000-0000-00000000000c',
   'Verificación automática SHA-256 y pruebas de restauración',
   'Configurar Veeam para verificación de integridad post-backup con hash SHA-256 y prueba automática de restauración mensual.',
   'Mitigar','Detectivo',
   'Mario Flores','Administrador de Sistemas','TI - Infraestructura',
   'ISO 27002:2022 - 8.13','Tecnológico','Implementado',100,
   '2024-02-01','2024-03-31',
   'Tasa de backups verificados = 100%. Restauración de prueba exitosa. RTO < 2h.',
   'Veeam Backup Enterprise (ya licenciado). 1 semana de configuración.'),

  ('c0000000-0000-0000-0000-00000000000d',
   'b0000000-0000-0000-0000-00000000000d',
   'Protección anti-DDoS con Cloudflare Magic Transit',
   'Contratar Cloudflare Magic Transit para mitigación de ataques volumétricos (> 1 Tbps) y de capa 7 en tiempo real.',
   'Transferir','Preventivo',
   'Ana Torres','Ingeniero de Seguridad','TI - Seguridad',
   'ISO 27002:2022 - 8.20','Tecnológico','No implementado',0,
   '2024-07-01','2024-08-01',
   'Capacidad anti-DDoS activa. Tiempo de mitigación < 10 segundos.',
   'Cloudflare Enterprise ($2.500/mes). 3 días de configuración BGP.'),

  ('c0000000-0000-0000-0000-00000000000e',
   'b0000000-0000-0000-0000-00000000000e',
   'BitLocker y bloqueo automático de pantalla vía GPO',
   'Forzar cifrado BitLocker XTS-AES 256 en todos los equipos y bloqueo automático a los 5 minutos de inactividad mediante GPO de AD.',
   'Mitigar','Preventivo',
   'Carlos Mendoza','Técnico de Soporte','TI - Soporte',
   'ISO 27002:2022 - 7.9','Físico','Implementado',100,
   '2024-01-08','2024-01-31',
   '100% equipos con BitLocker activo y bloqueo a los 5 min. TPM 2.0 habilitado.',
   'GPO en AD. Sin costo adicional. 2 días de despliegue.'),

  ('c0000000-0000-0000-0000-00000000000f',
   'b0000000-0000-0000-0000-00000000000f',
   'Control de versiones y firma digital de documentos SGSI',
   'Migrar toda la documentación SGSI a repositorio GitLab con firma digital obligatoria del CISO y flujo de aprobación en 2 niveles.',
   'Mitigar','Preventivo',
   'Ana Torres','CISO','TI - Seguridad',
   'ISO 27002:2022 - 5.12','Organizacional','No implementado',5,
   '2024-08-01','2024-10-31',
   'Historial de versiones auditado. Cero documentos sin firma digital autorizada.',
   'GitLab Ultimate (ya disponible). 1 semana de migración y capacitación.')

ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════
-- 4. OBSERVACIONES (10)
-- ═══════════════════════════════════════════════════════════
INSERT INTO observaciones (riesgo_id, contenido, autor, tipo) VALUES

  ('b0000000-0000-0000-0000-000000000001',
   'Auditoría interna (15/01/2024) detectó 3 cuentas de administrador de dominio sin MFA activo. Se escaló al CISO con prioridad ALTA. Plazo de remediación: 72 horas.',
   'Ana Torres — CISO','Alerta'),

  ('b0000000-0000-0000-0000-000000000001',
   'Se recomienda implementar Privileged Access Workstations (PAW) dedicadas para administradores de dominio, separando las tareas administrativas de la navegación general.',
   'Consultor Externo — Deloitte Cyber','Recomendación'),

  ('b0000000-0000-0000-0000-000000000002',
   'Simulacro de phishing (marzo 2024): 23% del personal hizo clic en el enlace malicioso (74/320 usuarios). Las áreas de mayor riesgo son Finanzas (31%) y Operaciones (28%). Requiere refuerzo urgente.',
   'Ana Torres — CISO','Acción correctiva'),

  ('b0000000-0000-0000-0000-000000000003',
   'Pentest externo (febrero 2024) reveló vulnerabilidad SQLi en módulo de reportes del portal web. Severidad: Alta — CVSS 8.1. Corregida en release v2.4.1 del 28/02/2024.',
   'Red Team — CyberSec Consulting','Observación'),

  ('b0000000-0000-0000-0000-000000000004',
   'Los backups del NAS no están cifrados. Si el ransomware alcanza la red del Data Center Piso 3, podría cifrar también las copias de respaldo. Se requiere cifrado inmediato y segmentación de red del NAS.',
   'Mario Flores — DBA Senior','Alerta'),

  ('b0000000-0000-0000-0000-000000000005',
   'Se encontraron credenciales SAP hardcodeadas en 2 repositorios privados de GitHub Enterprise. Credenciales revocadas y rotadas el 10/04/2024. Se abrió incidente de seguridad IS-2024-042.',
   'Laura Quispe — Líder Técnico','Acción correctiva'),

  ('b0000000-0000-0000-0000-000000000006',
   'CrowdStrike Falcon bloqueó intento de instalación del troyano bancario Emotet en 3 estaciones de trabajo el 05/03/2024. Vector: macro maliciosa en documento Word recibido por correo. Incidente contenido.',
   'Sistema EDR — CrowdStrike Falcon Console','Observación'),

  ('b0000000-0000-0000-0000-000000000008',
   'El SLA de recuperación del ERP no está documentado formalmente. En el incidente de diciembre 2023 se tardó 18 horas en restaurar el servicio, generando pérdidas estimadas en S/. 340.000. El BCP es urgente.',
   'Pedro Vargas — Gerente de TI','Recomendación'),

  ('b0000000-0000-0000-0000-000000000009',
   'Auditoría de accesos RRHH (abril 2024): 5 empleados con acceso a datos de nómina sin justificación de negocio. Accesos revocados. Se actualiza matriz RBAC y se programa revisión trimestral.',
   'Auditor Interno — Comité de Seguridad','Alerta'),

  ('b0000000-0000-0000-0000-00000000000c',
   'Prueba de restauración de backup del 15/02/2024 falló: archivo de BD principal corrompido. Se migró a Veeam Backup Enterprise con verificación SHA-256 automática. Próxima prueba programada: 15/06/2024.',
   'Mario Flores — Administrador de Sistemas','Acción correctiva');


-- ═══════════════════════════════════════════════════════════
-- 5. VULNERABILIDADES CVE (8)
-- ═══════════════════════════════════════════════════════════
INSERT INTO vulnerabilidades (
  cve_id, cvss_score, severidad_cvss, descripcion_cve,
  activos_afectados, riesgos_relacionados,
  fecha_publicacion, estado_parche
) VALUES

  ('CVE-2021-44228', 10.0, 'Crítica',
   'Log4Shell: RCE en Apache Log4j 2.x mediante lookup JNDI. Permite ejecutar código arbitrario al registrar un string controlado por el atacante. Explotado masivamente en estado wild desde diciembre 2021.',
   'Aplicación Web Corporativa (ACT-002)','RISK-003, RISK-007',
   '2021-12-10','Parche aplicado'),

  ('CVE-2023-23397', 9.8, 'Crítica',
   'Microsoft Outlook: Elevación de privilegios mediante correo que fuerza autenticación NTLM al servidor del atacante. No requiere interacción del usuario. Explotado por APT28 (Rusia).',
   'Estaciones de Trabajo (ACT-009)','RISK-002',
   '2023-03-14','Parche aplicado'),

  ('CVE-2022-30190', 7.8, 'Alta',
   'Follina: RCE en Microsoft Support Diagnostic Tool (MSDT) invocado desde aplicaciones Office mediante URL ms-msdt://. Explotado como zero-day antes del parche oficial.',
   'Estaciones de Trabajo (ACT-009)','RISK-006',
   '2022-05-30','Parche aplicado'),

  ('CVE-2021-34527', 8.8, 'Alta',
   'PrintNightmare: RCE y LPE en Windows Print Spooler. Permite a usuarios remotos instalar drivers de impresora maliciosos con privilegios SYSTEM. Afecta a todos los Windows Server.',
   'Servidor Active Directory (ACT-001), Estaciones de Trabajo (ACT-009)','RISK-001',
   '2021-07-01','Parche aplicado'),

  ('CVE-2023-20198', 10.0, 'Crítica',
   'Cisco IOS XE Web UI: Acceso no autenticado crea cuentas de nivel 15 (privilegio máximo). Explotado activamente contra miles de dispositivos Cisco en todo el mundo.',
   'Firewall Perimetral FortiGate (ACT-004)','RISK-010',
   '2023-10-16','Sin parche'),

  ('CVE-2024-3400', 10.0, 'Crítica',
   'Palo Alto PAN-OS GlobalProtect: Inyección de comandos OS sin autenticación en el Gateway. Permite ejecución con privilegios root. Explotado por UTA0218 como zero-day.',
   'Firewall Perimetral FortiGate (ACT-004)','RISK-010, RISK-013',
   '2024-04-12','Parche disponible'),

  ('CVE-2022-0778', 7.5, 'Alta',
   'OpenSSL: Bucle infinito en parseo de certificados X.509 con curvas elípticas malformadas. Genera DoS en servidores TLS/SSL al recibir un certificado especialmente construido.',
   'Aplicación Web Corporativa (ACT-002), Servidor de Backups (ACT-007)','RISK-013',
   '2022-03-15','Parche aplicado'),

  ('CVE-2023-44487', 7.5, 'Alta',
   'HTTP/2 Rapid Reset: Explotación del mecanismo de cancelación de streams para generar ataques DDoS de capa 7 de alta magnitud con recursos mínimos. Superó el récord de DDoS (398 Mpps).',
   'Aplicación Web Corporativa (ACT-002), Firewall Perimetral (ACT-004)','RISK-013',
   '2023-10-10','Parche disponible');


-- ═══════════════════════════════════════════════════════════
-- 6. MONITOREO DE CONTROLES (8)
-- ═══════════════════════════════════════════════════════════
INSERT INTO monitoreo (
  control_id, iso_referencia, metodo_monitoreo, frecuencia,
  responsable, herramienta,
  resultado_esperado, resultado_obtenido,
  fecha_ultima_revision, fecha_proxima_revision,
  cumple_esperado, acciones_remediacion
) VALUES

  ('c0000000-0000-0000-0000-000000000001',
   'ISO 27002:2022 - 8.5',
   'Revisión de logs de autenticación MFA en Azure AD. Reporte automático de cuentas sin MFA activo.',
   'Mensual','Ana Torres','Microsoft Entra ID / Azure AD',
   'Cobertura MFA = 100% cuentas privilegiadas. Cero bypass reportados.',
   '01/05/2024 — Cobertura MFA: 100% (52/52 cuentas AD privilegiadas). Sin intentos de bypass en el período.',
   '2024-05-01','2024-06-01','Sí',NULL),

  ('c0000000-0000-0000-0000-000000000002',
   'ISO 27002:2022 - 6.3',
   'Simulacros mensuales de phishing y métricas de click-rate del LMS corporativo KnowBe4.',
   'Mensual','Ana Torres','KnowBe4 Security Awareness Platform',
   'Click-rate < 5% en phishing simulado. Tasa de reporte de intentos > 70%.',
   '10/05/2024 — Click-rate: 12% (mejoró desde 23% en marzo). Tasa de reporte: 45%. Ambos por debajo del objetivo.',
   '2024-05-10','2024-06-10','Parcial',
   'Reforzar módulo de ingeniería social para Finanzas y Operaciones. Agregar simulacros con contexto financiero. Meta: click-rate < 8% en junio.'),

  ('c0000000-0000-0000-0000-000000000003',
   'ISO 27002:2022 - 8.23',
   'Escaneo DAST semanal con OWASP ZAP y revisión de alertas del panel AWS WAF.',
   'Semanal','Laura Quispe','AWS WAF + OWASP ZAP',
   'Cero vulnerabilidades SQLi/XSS críticas. WAF bloqueando > 99% de intentos de inyección.',
   '15/05/2024 — Escaneo: 0 vulnerabilidades críticas. WAF bloqueó 347 intentos SQLi y 89 XSS en la semana.',
   '2024-05-15','2024-05-22','Sí',NULL),

  ('c0000000-0000-0000-0000-000000000006',
   'ISO 27002:2022 - 8.7',
   'Dashboard de cobertura EDR en CrowdStrike Console y revisión de alertas de detección activa.',
   'Semanal','Carlos Mendoza','CrowdStrike Falcon Console',
   'Cobertura EDR 100%. Tiempo de respuesta a incidentes < 15 min. Cero endpoints desprotegidos.',
   '13/05/2024 — Cobertura: 98% (147/150 equipos). 3 equipos en mantenimiento preventivo. Tiempo promedio respuesta: 8 min.',
   '2024-05-13','2024-05-20','Parcial',
   'Reinstalar agente Falcon en 3 equipos al retornar de mantenimiento. ETA: 48 horas. Responsable: C. Mendoza.'),

  ('c0000000-0000-0000-0000-000000000007',
   'ISO 27002:2022 - 8.8',
   'Escaneo de dependencias con Snyk integrado al pipeline CI/CD. Revisión mensual del SBOM.',
   'Mensual','Laura Quispe','Snyk + GitHub Dependabot',
   'Cero dependencias con CVEs críticos en producción. SBOM actualizado y publicado.',
   '01/05/2024 — Snyk: 0 CVEs críticos en producción. 2 CVEs medios en dependencias de desarrollo (no críticos, aceptados).',
   '2024-05-01','2024-06-01','Sí',NULL),

  ('c0000000-0000-0000-0000-00000000000c',
   'ISO 27002:2022 - 8.13',
   'Verificación automática SHA-256 post-backup en Veeam y prueba de restauración selectiva mensual.',
   'Mensual','Mario Flores','Veeam Backup Enterprise',
   '100% backups verificados con hash correcto. Restauración de prueba exitosa. RTO < 2 horas.',
   '05/05/2024 — 100% backups verificados. Restauración de prueba BD clientes: 1h 23min. Dentro del objetivo.',
   '2024-05-05','2024-06-05','Sí',NULL),

  ('c0000000-0000-0000-0000-00000000000e',
   'ISO 27002:2022 - 7.9',
   'Informe de cumplimiento BitLocker desde Microsoft Intune y auditoría de GPO de bloqueo automático.',
   'Trimestral','Carlos Mendoza','Microsoft Intune + SCCM',
   '100% equipos con BitLocker XTS-AES 256 activo. Bloqueo automático a los 5 min sin excepciones.',
   '01/04/2024 — BitLocker activo: 148/150 equipos (98.7%). 2 con exención temporal aprobada por CISO hasta 30/06/2024.',
   '2024-04-01','2024-07-01','Sí',NULL),

  ('c0000000-0000-0000-0000-000000000009',
   'ISO 27002:2022 - 5.15',
   'Revisión trimestral de matriz RBAC y auditoría de logs de acceso a datos de nómina en portal RRHH.',
   'Trimestral','Sofía Ramos','SAP GRC + Logs Portal RRHH',
   'Cero accesos fuera del rol definido. Revisión de permisos completada al 100%.',
   '15/04/2024 — Se eliminaron 5 accesos excesivos detectados. Matriz RBAC actualizada y aprobada por CISO y Legal.',
   '2024-04-15','2024-07-15','Sí',NULL);


-- ============================================================
-- FIN DEL SCRIPT — RiskSentry v2.0 Datos de Simulación
-- Registros insertados:
--   Activos        : 10
--   Riesgos        : 15  (2 Críticos, 7 Altos, 6 Medios)
--   Controles      : 15  (4 Implementado, 6 Parcial, 3 No implementado, 2 Implementado)
--   Observaciones  : 10
--   Vulnerabilidades: 8  (3 CVE CVSS 10.0, 2 críticas, 3 altas)
--   Monitoreo      : 8
-- ============================================================
