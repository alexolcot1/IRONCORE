-- ==============================================================================
-- IRONCORE FITNESS GUATEMALA - ESQUEMA DE BASE DE DATOS (SUPABASE / POSTGRESQL)
-- Versión: 2.4.0 (Edición Guatemala - Localizada SAT / DPI / Quetzales)
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM DE ROLES DEL SISTEMA
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('ADMIN', 'RECEPCION', 'ENTRENADOR', 'SOCIO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA DE PERFILES (Vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABLA DE ROLES POR USUARIO (RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'SOCIO',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (user_id, role)
);

-- 5. TABLA DE CONFIGURACIÓN DEL NEGOCIO (SAT Guatemala)
CREATE TABLE IF NOT EXISTS public.negocio_config (
  id TEXT PRIMARY KEY DEFAULT 'cfg-1',
  nombre TEXT NOT NULL DEFAULT 'IronCore Fitness Guatemala',
  slogan TEXT DEFAULT 'Centro de Alto Rendimiento, Acondicionamiento Físico y Musculación',
  direccion TEXT DEFAULT 'Av. Las Américas 15-20, Zona 10, Edificio Sixtino II, Nivel 3, Ciudad de Guatemala',
  telefono TEXT DEFAULT '+502 2345 6789',
  email TEXT DEFAULT 'contacto@ironcore.com.gt',
  rfc TEXT DEFAULT '8945231-K', -- NIT SAT Guatemala
  moneda TEXT DEFAULT 'GTQ',     -- Quetzal guatemalteco (Q)
  iva_porcentaje NUMERIC(5,2) DEFAULT 12.00,
  costo_pase_diario NUMERIC(10,2) DEFAULT 40.00,
  control_aforo BOOLEAN DEFAULT true,
  capacidad_maxima INTEGER DEFAULT 120,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABLA DE PLANES DE MEMBRESÍA
CREATE TABLE IF NOT EXISTS public.planes_membresia (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  duracion_dias INTEGER NOT NULL,
  precio NUMERIC(10,2) NOT NULL, -- Expresado en Quetzales (Q)
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABLA DE SOCIOS / ATLETAS (Localizada a DPI y Guatemala)
CREATE TABLE IF NOT EXISTS public.socios (
  id TEXT PRIMARY KEY,
  codigo_socio TEXT UNIQUE NOT NULL,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  dni TEXT NOT NULL, -- DPI / CUI (13 dígitos)
  telefono TEXT,
  email TEXT,
  foto_url TEXT,
  fecha_nacimiento DATE,
  genero TEXT CHECK (genero IN ('M', 'F', 'OTRO')),
  contacto_emergencia TEXT,
  notas_medicas TEXT, -- Peso en libras, condiciones
  alergias TEXT,
  observaciones TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. TABLA DE SUSCRIPCIONES
CREATE TABLE IF NOT EXISTS public.suscripciones (
  id TEXT PRIMARY KEY,
  socio_id TEXT NOT NULL REFERENCES public.socios(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.planes_membresia(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('ACTIVA', 'POR_VENCER', 'VENCIDA', 'CANCELADA')),
  total_pagado NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. TABLA DE PRODUCTOS E INVENTARIO (POS)
CREATE TABLE IF NOT EXISTS public.productos (
  id TEXT PRIMARY KEY,
  codigo_barras TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio_venta NUMERIC(10,2) NOT NULL, -- En Quetzales (Q)
  costo NUMERIC(10,2) NOT NULL,
  stock_actual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  imagen_tipo TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. TABLA DE VENTAS EN TIENDA POS
CREATE TABLE IF NOT EXISTS public.ventas_pos (
  id TEXT PRIMARY KEY,
  folio TEXT UNIQUE NOT NULL,
  fecha_hora TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  socio_id TEXT REFERENCES public.socios(id) ON DELETE SET NULL,
  socio_nombre TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  descuento NUMERIC(10,2) DEFAULT 0,
  impuesto NUMERIC(10,2) NOT NULL, -- IVA 12% SAT
  total NUMERIC(10,2) NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
  cajero TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.detalle_ventas_pos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venta_id TEXT NOT NULL REFERENCES public.ventas_pos(id) ON DELETE CASCADE,
  producto_id TEXT REFERENCES public.productos(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

-- 11. REGISTRO DE ACCESOS Y TORNIQUETE
CREATE TABLE IF NOT EXISTS public.registro_accesos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  socio_id TEXT REFERENCES public.socios(id) ON DELETE CASCADE,
  socio_nombre TEXT NOT NULL,
  codigo_socio TEXT NOT NULL,
  fecha_hora TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  resultado TEXT NOT NULL CHECK (resultado IN ('PERMITIDO', 'DENEGADO')),
  motivo TEXT
);

-- 12. APERTURA Y CIERRE DE CAJA (ARQUEOS)
CREATE TABLE IF NOT EXISTS public.caja_turnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id TEXT,
  monto_inicial NUMERIC(10,2) NOT NULL,
  monto_cierre NUMERIC(10,2),
  total_ventas NUMERIC(10,2),
  apertura TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  cierre TIMESTAMPTZ,
  notas TEXT
);

-- 13. BITÁCORA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS public.auditoria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id TEXT,
  accion TEXT NOT NULL,
  tabla TEXT,
  detalle TEXT,
  fecha_hora TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 14. EVALUACIONES FÍSICAS Y ANTROPOMÉTRICAS (Libras y cm)
CREATE TABLE IF NOT EXISTS public.evaluaciones_fisicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  socio_id TEXT REFERENCES public.socios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  peso_lb NUMERIC(6,2) NOT NULL,
  grasa_porcentaje NUMERIC(5,2),
  musculo_porcentaje NUMERIC(5,2),
  pecho_cm NUMERIC(5,2),
  cintura_cm NUMERIC(5,2),
  cadera_cm NUMERIC(5,2),
  brazo_cm NUMERIC(5,2),
  muslo_cm NUMERIC(5,2),
  evaluador TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- DATOS SEMILLA INICIALES (GUATEMALA)
-- ==============================================================================

INSERT INTO public.negocio_config (id, nombre, slogan, direccion, telefono, email, rfc, moneda, iva_porcentaje, costo_pase_diario, control_aforo, capacidad_maxima)
VALUES ('cfg-1', 'IronCore Fitness Guatemala', 'Centro de Alto Rendimiento, Acondicionamiento Físico y Musculación', 'Av. Las Américas 15-20, Zona 10, Edificio Sixtino II, Nivel 3, Ciudad de Guatemala', '+502 2345 6789', 'contacto@ironcore.com.gt', '8945231-K', 'GTQ', 12.00, 40.00, true, 120)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.planes_membresia (id, nombre, duracion_dias, precio, descripcion, activo)
VALUES 
  ('plan-1', 'Pase Diario', 1, 40.00, 'Acceso ilimitado por 1 día a sala de pesas, máquinas y área de cardio.', true),
  ('plan-2', 'Mensual Básico', 30, 250.00, 'Acceso irrestricto por 30 días con evaluación inicial de acondicionamiento físico.', true),
  ('plan-3', 'Trimestral Pro', 90, 650.00, 'Acceso por 90 días con descuento especial y 1 asesoría de suplementación.', true),
  ('plan-4', 'Anual VIP Black', 365, 2200.00, 'Año completo con pase para acompañante fin de semana y casillero privado.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productos (id, codigo_barras, nombre, categoria, precio_venta, costo, stock_actual, stock_minimo, imagen_tipo, activo)
VALUES
  ('prod-1', '75010001', 'Whey Protein Isolate 2kg', 'Suplementos', 480.00, 340.00, 24, 5, 'protein', true),
  ('prod-2', '75010002', 'Creatina Monohidratada Creapure 300g', 'Suplementos', 220.00, 140.00, 35, 8, 'protein', true),
  ('prod-3', '75010003', 'Bebida Isotónica Electrolitos 600ml', 'Bebidas', 15.00, 8.50, 60, 15, 'drink', true),
  ('prod-4', '75010004', 'Agua Mineral Alcalina 1L', 'Bebidas', 10.00, 4.50, 80, 20, 'drink', true),
  ('prod-5', '75010005', 'Barra de Proteína Caramelo & Nuez 60g', 'Snacks', 20.00, 11.00, 45, 10, 'snack', true),
  ('prod-6', '75010006', 'Pre-Workout Ultra Focus 30 serv.', 'Suplementos', 320.00, 210.00, 18, 5, 'protein', true),
  ('prod-7', '75010007', 'Shaker Pro Acero Inoxidable 700ml', 'Accesorios', 85.00, 45.00, 30, 6, 'gear', true),
  ('prod-8', '75010008', 'Toalla Deportiva Microfibra Antimicrobiana', 'Accesorios', 50.00, 22.00, 19, 5, 'gear', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.socios (id, codigo_socio, nombres, apellidos, dni, telefono, email, foto_url, fecha_nacimiento, genero, contacto_emergencia, notas_medicas, alergias, observaciones, activo)
VALUES
  ('soc-1', 'IC-100001', 'Carlos', 'Méndez Rivera', '2485 91823 0101', '+502 5412 8765', 'carlos.mendez@gmail.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '1992-05-14', 'M', 'Sofía Méndez +502 5912 3456', 'Sin lesiones previas. Apto para cargas pesadas. Peso 182 lb.', 'Ninguna', 'Asiste en turno matutino (6:30 AM). Zona 10, Ciudad de Guatemala.', true),
  ('soc-2', 'IC-100002', 'Valeria', 'Soto Morales', '1982 73645 0101', '+502 5987 6543', 'valeria.soto@outlook.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '1996-08-22', 'F', 'Mario Soto +502 5123 4567', 'Operación de menisco en 2024 en rodilla derecha. Realiza fortalecimiento. Peso 134 lb.', 'Penicilina', 'Entrena con preparador físico en Zona 14.', true),
  ('soc-3', 'IC-100003', 'Rodrigo', 'Paredes Luna', '3120 45892 0101', '+502 5321 0987', 'rodrigo.paredes@hotmail.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '1988-11-03', 'M', 'Laura Luna +502 5455 6677', 'Sin padecimientos crónicos. Peso 172 lb (78 kg).', 'Ninguna conocida', 'Membresía por vencer en 4 días.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.suscripciones (id, socio_id, plan_id, fecha_inicio, fecha_fin, estado, total_pagado)
VALUES
  ('sub-1', 'soc-1', 'plan-2', '2026-10-01', '2026-10-31', 'ACTIVA', 250.00),
  ('sub-2', 'soc-2', 'plan-4', '2026-05-01', '2027-04-30', 'ACTIVA', 2200.00),
  ('sub-3', 'soc-3', 'plan-3', '2026-07-20', '2026-10-24', 'ACTIVA', 650.00)
ON CONFLICT (id) DO NOTHING;

-- Fin de inicialización
