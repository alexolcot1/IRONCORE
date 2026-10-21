# MANUAL TÉCNICO DE ARQUITECTURA Y OPERACIÓN DE SOFTWARE
**Sistema:** IronCore Fitness Guatemala ERP & POS  
**Versión del Sistema:** 2.4.0 (Edición Guatemala - Localizada SAT / DPI / Quetzales)  
**Destinatario:** Administradores de Sistemas, Desarrolladores, Integradores de Hardware y Clientes Corporativos  
**Fecha de Publicación:** Octubre 2026  
**Documento ID:** DOC-TEC-ICGT-2026-V2.4  

---

## 1. RESUMEN EJECUTIVO Y FICHA TÉCNICA

IronCore Fitness Guatemala es una solución web empresarial (Enterprise SPA) concebida para la gestión integral de centros de acondicionamiento físico, gimnasios y complejos deportivos de alto rendimiento. El software orquesta en tiempo real el ciclo de vida de los socios, la facturación y venta en mostrador (POS), el control de acceso biométrico/QR a torniquetes, la gestión de inventario de suplementos y el seguimiento antropométrico y de entrenamiento.

### 1.1 Ficha Técnica de la Plataforma
| Parámetro | Detalle Técnico |
| :--- | :--- |
| **Tipo de Aplicación** | Single Page Application (SPA) Progresiva y Responsiva |
| **Arquitectura de Frontend** | React 19.x estructurado con TypeScript 5.x |
| **Herramienta de Compilación** | Vite 6.x con servidor HMR optimizado para producción |
| **Enrutamiento** | TanStack Router (Enrutamiento estático fuertemente tipado) |
| **Gestión de Estado y Servidor** | TanStack Query v5 + React Context reactivo |
| **Motor de Estilos y UI** | Tailwind CSS v4, Radix UI Primitives, Lucide Icons, tw-animate |
| **Visualización de Datos** | Recharts v3 (Gráficas vectoriales interactivas SVG) |
| **Motor de Exportación** | write-excel-file v4 (XLSX nativo binario), jsPDF & jsPDF-AutoTable (PDF) |
| **Generador de QR** | react-qr-code (SVG vectorial de alta densidad) |
| **Persistencia de Datos** | Arquitectura Híbrida: Supabase PostgreSQL + LocalStorage Observado |
| **Compatibilidad Fiscal** | Régimen Tributario SAT Guatemala (IVA 12% y campo NIT) |
| **Compatibilidad Monetaria** | Quetzal Guatemalteco (GTQ - Q) con formato `es-GT` |
| **Unidades de Medida** | Libras (lb) para peso corporal y cargas; centímetros (cm) para perímetros |

---

## 2. ARQUITECTURA DEL SOFTWARE Y PATRONES DE DISEÑO

### 2.1 Diagrama de Capas de la Aplicación
```
┌─────────────────────────────────────────────────────────────┐
│                       CAPA DE PRESENTACIÓN                  │
│  React 19 + Tailwind CSS v4 + Radix UI Primitives + Lucide  │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE ENRUTAMIENTO Y GUARDS            │
│    TanStack Router (_authenticated guard + Session Check)    │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE LÓGICA DE NEGOCIO                │
│  - Control de Membresías    - Motor de Ventas POS           │
│  - Validación Torniquete    - Antropometría y Rutinas       │
│  - Arqueo de Caja           - Reportería XLSX / CSV / PDF   │
├─────────────────────────────────────────────────────────────┤
│               CAPA DE ABSTRACCIÓN DE DATOS (DAL)            │
│  gymData.ts / gym.ts / sociosSeed.ts / previewAuthStorage   │
├──────────────────────────────┬──────────────────────────────┤
│       PERSISTENCIA LOCAL     │      PERSISTENCIA NUBE       │
│  LocalStorage (Event-Driven) │  Supabase Postgres (REST/WS) │
└──────────────────────────────┴──────────────────────────────┘
```

### 2.2 Estrategia de Persistencia Híbrida y Modo Fuera de Línea
El sistema implementa una arquitectura de tolerancia a fallos de red:
1. **Canal Primario (Cloud):** Conector con Supabase JavaScript SDK (`@supabase/supabase-js`) para bases de datos relacionales PostgreSQL en la nube con soporte RLS (Row Level Security).
2. **Canal Local (Fallback Ininterrumpido):** En caso de corte de conexión a internet o despliegue en entornos de caja autónoma, la capa DAL sincroniza y almacena de forma instantánea el estado en `localStorage` mediante eventos reactivos de ventana (`storage`). Ninguna venta, registro de socio o marcaje en torniquete se detiene por caídas del proveedor de internet.
3. **Shim Protector de Red:** En `index.html` se incluye un descriptor configurable de `window.fetch` para evitar bloqueos por parte de antivirus, firewalls corporativos o extensiones del navegador.

---

## 3. MODELO DE DATOS Y DEFINICIÓN DE ENTIDADES

### 3.1 Entidades Principales (Esquema TypeScript)

```typescript
// Entidad de Socio (Localizada a Guatemala)
export interface Socio {
  id: string;
  codigo_socio: string;       // Formato: IC-100001
  nombres: string;
  apellidos: string;
  dni: string;                 // DPI / CUI (13 dígitos: XXXX XXXXX 0101)
  telefono: string;            // Prefijo Guatemala +502
  email: string;
  foto_url: string;
  fecha_nacimiento: string;
  genero: "M" | "F" | "OTRO";
  contacto_emergencia: string; // Nombre y teléfono de contacto
  notas_medicas: string;       // Historial, peso en lb/kg, condiciones
  alergias: string;
  observaciones: string;
  activo: boolean;
  created_at: string;
  suscripciones?: Suscripcion[];
}

// Entidad de Planes de Membresía
export interface PlanMembresia {
  id: string;
  nombre: string;              // Ej: "Mensual Básico", "Anual VIP Black"
  duracion_dias: number;       // 1, 30, 90, 365
  precio: number;              // Valor en Quetzales (Q)
  descripcion: string;
  activo: boolean;
}

// Entidad de Ventas en Punto de Venta (POS)
export interface Venta {
  id: string;
  folio: string;               // Folio fiscal interno (Ej: VTA-2026-0042)
  fecha_hora: string;
  socio_id: string | null;
  socio_nombre: string;
  items: Array<{
    producto_id: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;   // Precio unitario en Q (IVA incluido)
    subtotal: number;
  }>;
  subtotal: number;            // Monto neto en Q
  descuento: number;
  impuesto: number;             // IVA 12% SAT Guatemala
  total: number;                // Monto final en Quetzales
  metodo_pago: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA";
  cajero: string;
}

// Entidad de Control de Acceso
export interface AccesoRegistro {
  id: string;
  socio_id: string;
  socio_nombre: string;
  codigo_socio: string;
  fecha_hora: string;
  resultado: "PERMITIDO" | "DENEGADO";
  motivo?: string;             // "Membresía Activa", "Membresía Vencida", etc.
}

// Parámetros de Configuración del Negocio
export interface NegocioConfig {
  id: string;
  nombre: string;              // "IronCore Fitness Guatemala"
  slogan: string;
  direccion: string;           // Dirección física en Ciudad de Guatemala
  telefono: string;            // PBX / WhatsApp con código de país +502
  email: string;
  rfc: string;                 // NIT SAT Guatemala
  moneda: string;              // "GTQ" ("Q")
  iva_porcentaje: number;      // 12% oficial SAT
  costo_pase_diario: number;   // Q 40.00
  control_aforo: boolean;
  capacidad_maxima: number;
}
```

---

## 4. ESTRUCTURA DEL PROYECTO Y ÁRBOL DE DIRECTORIOS

```
├── docs/                             # Documentación técnica y manuales
│   ├── INFORME_TECNICO.md            # Informe de evidencias y auditoría
│   ├── MANUAL_TECNICO.md             # Este documento técnico
│   └── MANUAL_DE_USUARIO.md          # Manual del usuario final
├── public/                           # Activos estáticos, iconos y manifest
├── src/
│   ├── components/                   # Componentes reutilizables de UI
│   │   ├── ui/                       # Primitivas Radix UI estilizadas con Tailwind
│   │   ├── AppShell.tsx              # Barra de navegación lateral y encabezado
│   │   ├── DataTools.tsx             # Herramientas de backup, restore y seed
│   │   ├── Receipt.tsx               # Plantilla de impresión de ticket térmico 80mm
│   │   └── ReportButtons.tsx         # Botones unificados XLSX / CSV / PDF
│   ├── integrations/
│   │   └── supabase/                 # Conector y clientes de base de datos Postgres
│   ├── lib/
│   │   ├── gym.ts                    # Helpers de moneda (Q), fechas y utilidades
│   │   ├── gymData.ts                # Repositorio de datos, estados iniciales y catálogo
│   │   ├── reports.ts                # Motor de exportación binaria XLSX y PDF
│   │   ├── sociosSeed.ts             # Semilla de datos de socios en Guatemala
│   │   └── utils.ts                  # Utilidades de combinación de clases CSS (cn)
│   ├── routes/
│   │   ├── __root.tsx                # Contenedor raíz con proveedores y Toasters
│   │   ├── auth.tsx                  # Pantalla de autenticación y selección de roles
│   │   ├── index.tsx                 # Redirección automática de landing a dashboard
│   │   └── _authenticated/           # Vistas protegidas por guardia de sesión
│   │       ├── acceso.tsx            # Terminal de torniquete y validador QR
│   │       ├── configuracion.tsx     # Ajustes del gimnasio, NIT, inventario y auditoría
│   │       ├── dashboard.tsx         # Tablero ejecutivo con KPIs e ingresos
│   │       ├── membresias.tsx        # Catálogo y registro de suscripciones
│   │       ├── portal.tsx            # Vista de autoservicio para el socio
│   │       ├── pos.tsx               # Terminal de punto de venta y arqueo de caja
│   │       ├── rutinas.tsx           # Antropometría física y planes de entrenamiento
│   │       └── socios.tsx            # Directorio, alta y credenciales con DPI
├── index.html                        # Entrada HTML con inyección de shim de red
├── package.json                      # Definición de dependencias y scripts de construcción
├── tsconfig.json                     # Configuración estricta de compilador TypeScript
└── vite.config.ts                    # Configuración de compilación con plugin de React y Tailwind
```

---

## 5. REQUISITOS DE HARDWARE, SOFTWARE E INSTALACIÓN

### 5.1 Requisitos Mínimos de Servidor / Estación de Trabajo
* **Sistema Operativo:** Windows 10/11, macOS 12+, Ubuntu 20.04+ o cualquier distribución Linux moderna.
* **Procesador:** Dual Core 2.0 GHz o superior (Quad-Core recomendado para recepción con escáner de alta frecuencia).
* **Memoria RAM:** 4 GB mínimo (8 GB recomendado para estaciones con pantalla táctil e impresión concurrente).
* **Conectividad:** Tarjeta de red Ethernet Gigabit o Wi-Fi 802.11ac estable.

### 5.2 Requisitos de Periféricos en Recepción y Caja
1. **Lector de Códigos de Barra y QR:** Cualquier escáner USB o Bluetooth compatible con emulación de teclado HID (Human Interface Device). Se recomienda escáner 2D omnidireccional con lectura sobre pantallas de teléfonos móviles.
2. **Impresora Térmica de Recibos:** Impresora térmica estándar de 58 mm u 80 mm (Epson TM-T20, Bixolon, Xprinter o genérica ESC/POS). La aplicación utiliza el motor de impresión del navegador con estilos optimizados `@media print`.
3. **Mecanismo de Torniquete / Molinete:**
   - La vista `/acceso` provee señales visuales de alta visibilidad (Verde/Rojo) y eventos de validación listos para acoplarse con tarjetas de relé USB (como KMTronic o Numato) o microcontroladores ESP32/Raspberry Pi mediante llamada HTTP/WebSocket.

### 5.3 Proceso de Instalación y Despliegue

```bash
# 1. Clonar el repositorio del proyecto
git clone <URL_DEL_REPOSITORIO> ironcore-gym
cd ironcore-gym

# 2. Instalar dependencias del proyecto
npm install
# o con bun:
# bun install

# 3. Configurar variables de entorno (Opcional para modo Supabase Cloud)
cp .env.example .env
# Completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY si se conecta a base de datos externa

# 4. Iniciar en entorno de desarrollo local
npm run dev

# 5. Generar compilación optimizada para producción
npm run build

# 6. Probar compilación de producción localmente
npm run preview
```

---

## 6. SEGURIDAD, ROLES Y AUDITORÍA DE ACCIONES

### 6.1 Matriz de Control de Acceso Basado en Roles (RBAC)

| Módulo / Acción | ADMIN (Gerencia) | RECEPCION (Caja) | ENTRENADOR (Coach) | SOCIO (Autoservicio) |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard y Métricas Financieras** | **Total** | Solo KPIs operativos | Solo Aforo | Sin acceso |
| **Directorio de Socios (Alta/Edición)** | **Total** | **Total** | Solo lectura médica | Ficha propia |
| **Punto de Venta (POS) y Cobros** | **Total** | **Total** | Sin acceso | Sin acceso |
| **Apertura y Arqueo de Caja** | **Total** | **Total** | Sin acceso | Sin acceso |
| **Control de Acceso / Torniquete** | **Total** | **Total** | Consulta | Escaneo de su QR |
| **Catálogo de Membresías (Precios)** | **Total** | Solo lectura | Sin acceso | Solo lectura |
| **Rutinas y Evaluaciones Antropométricas** | **Total** | Solo lectura | **Total** | Consulta propia |
| **Configuración del Negocio, NIT y Datos** | **Total** | Sin acceso | Sin acceso | Sin acceso |
| **Bitácora de Auditoría y Backups** | **Total** | Sin acceso | Sin acceso | Sin acceso |

### 6.2 Bitácora de Auditoría (Audit Log)
Todas las operaciones críticas (modificación de precios, cobros anulados, altas de socios, cambios de parámetros fiscales de SAT) se registran automáticamente con:
* `timestamp`: Fecha y hora ISO exacta.
* `usuario`: Correo del operador autenticado.
* `rol`: Rol que autorizó la acción.
* `accion`: Código de evento (ej. `SOCIO_CREATE`, `VENTA_POS`, `CONFIG_UPDATE`).
* `detalle`: Descripción pormenorizada del registro modificado.

---

## 7. ESPECIFICACIÓN DETALLADA DE SCREENSHOTS TÉCNICAS RECOMENDADAS

Para la entrega formal al cliente en formato manual encuadernado o Google Docs, se aconseja incorporar las siguientes capturas técnicas de arquitectura y soporte:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA TÉCNICA #T1: Diagrama de Inspección de Red y Respuesta del Servidor │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 2.2 (Persistencia y Tolerancia a Fallos)│
│ • Qué capturar: Pantalla con DevTools de Chrome abierta en la pestaña       │
│   "Network" (Red) mostrando peticiones HTTP status 200 y el estado          │
│   de almacenamiento de LocalStorage en la pestaña "Application".            │
│ • Elementos a resaltar: Recuadro rojo sobre la clave 'ironcore_config'      │
│   y 'ironcore_socios' confirmando la estructura JSON local íntegra.         │
│ • Resolución sugerida: 1440x900 px a 72 DPI en formato PNG nítido.          │
│ • Pie de foto sugerido: "Figura T-1: Arquitectura de persistencia local y   │
│   tolerancia a caídas de conectividad en el cliente web."                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA TÉCNICA #T2: Consola de Auditoría y Registro de Eventos del Sistema │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 6.2 (Bitácora de Auditoría y Logs)     │
│ • Qué capturar: Sección inferior de la vista /configuracion donde se lista  │
│   la tabla de auditoría con columnas: Fecha/Hora, Usuario, Rol, Acción y   │
│   Detalle técnico del evento.                                               │
│ • Elementos a resaltar: Flecha indicando el registro del evento de cambio   │
│   de configuración comercial y arqueo de caja con rol ADMIN.                │
│ • Resolución sugerida: 1280x720 px en formato PNG.                          │
│ • Pie de foto sugerido: "Figura T-2: Registro estructurado e inmutable de   │
│   auditoría para trazabilidad de operaciones de usuarios."                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA TÉCNICA #T3: Formato Binario Generado en Exportación XLSX (Excel)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 1.1 y 4 (Motor de Exportación de Datos) │
│ • Qué capturar: Hoja de cálculo abierta en Microsoft Excel generada por el  │
│   sistema mediante el botón XLSX, mostrando cabeceras estilizadas y las     │
│   columnas formateadas con precios en Quetzales y números de DPI limpios.   │
│ • Elementos a resaltar: Celdas con encabezados en negrita y formato de moneda│
│   guatemalteca (Q) correcto sin truncamiento de ceros a la izquierda.       │
│ • Resolución sugerida: 1280x800 px en formato PNG.                          │
│ • Pie de foto sugerido: "Figura T-3: Archivo XLSX binario exportado         │
│   satisfactoriamente con estructura de columnas tipadas y limpias."         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. RESOLUCIÓN DE PROBLEMAS FRECUENTES (TROUBLESHOOTING)

| Síntoma / Incidencia | Causa Raíz Probable | Solución Técnica Inmediata |
| :--- | :--- | :--- |
| **Error en consola: `Cannot set property fetch of #<Window>`** | Extensión de navegador o firewall de terceros intentando inyectar un interceptor sobre `window.fetch`. | Resuelto de forma permanente mediante el guard shim configurado en `<head>` de `index.html`. Si persiste, actualizar el navegador a su versión más reciente. |
| **No se imprimen los tickets en la impresora térmica** | El navegador tiene bloqueada la ventana emergente de impresión o no está seleccionada la impresora por defecto. | Permitir diálogos del sitio en el navegador. En la vista de impresión, seleccionar la impresora térmica y definir ancho de papel en 80 mm o 58 mm con márgenes mínimos. |
| **El lector de código de barras no envía el escaneo** | El escáner no está configurado para emitir un sufijo `ENTER` (retorno de carro) tras la lectura. | Escanear el código de configuración del manual del fabricante para añadir sufijo "CR / Enter" a cada lectura. |
| **Discrepancia en el monto de ventas en Quetzales** | Se ingresó un saldo manual fuera de catálogo o no se ejecutó el arqueo de cierre de caja del turno previo. | Consultar la bitácora de auditoría en `/configuracion` y conciliar la tabla de ventas contra el folio del ticket emitido. |
