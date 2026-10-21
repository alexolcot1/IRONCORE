const fs = require('fs');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} = require('docx');

function createDoc() {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  };

  const cellPadding = { top: 120, bottom: 120, left: 160, right: 160 };

  const screenshotCallout = (number, title, desc, captureDetails, highlight) => [
    new Paragraph({
      children: [
        new TextRun({
          text: `📷 [UBICACIÓN DE SCREENSHOT #${number}: ${title}]`,
          bold: true,
          color: "D97706", // Amber / Orange
          size: 22,
        }),
      ],
      spacing: { before: 180, after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "• Vista a capturar: ", bold: true }),
        new TextRun(desc),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "• Datos recomendados en pantalla: ", bold: true }),
        new TextRun(captureDetails),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "• Elementos a resaltar (recuadro o flecha): ", bold: true }),
        new TextRun(highlight),
      ],
      spacing: { after: 180 },
    }),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: "1F2937" },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          // PORTADA
          new Paragraph({
            text: "IRONCORE FITNESS GUATEMALA",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "MANUAL TÉCNICO Y MANUAL DE USUARIO",
                bold: true,
                size: 28,
                color: "111827",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Documento Maestro de Operación, Arquitectura e Implementación",
                size: 24,
                color: "4B5563",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Versión:", bold: true })] })],
                    borders: tableBorder,
                    margins: cellPadding,
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "2.4.0 (Edición Producción Guatemala)" })],
                    borders: tableBorder,
                    margins: cellPadding,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Fecha:", bold: true })] })],
                    borders: tableBorder,
                    margins: cellPadding,
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Octubre de 2026" })],
                    borders: tableBorder,
                    margins: cellPadding,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Destinatario:", bold: true })] })],
                    borders: tableBorder,
                    margins: cellPadding,
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Cliente Corporativo / Administradores de Gimnasio / Personal Técnico" })],
                    borders: tableBorder,
                    margins: cellPadding,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Entorno Base:", bold: true })] })],
                    borders: tableBorder,
                    margins: cellPadding,
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "React 19 SPA, TypeScript 5, Vite 8, Tailwind CSS, TanStack Router" })],
                    borders: tableBorder,
                    margins: cellPadding,
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 400 } }),

          // ==========================================
          // PARTE I: MANUAL TÉCNICO
          // ==========================================
          new Paragraph({
            text: "PARTE I: MANUAL TÉCNICO (DESARROLLO Y ARQUITECTURA)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),

          new Paragraph({
            text: "1.1 Visión General del Sistema",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "IronCore Fitness Guatemala es un sistema empresarial integral (ERP/POS) de arquitectura moderna para gimnasios, clubes deportivos y boxes de entrenamiento funcional. La plataforma opera como una Single Page Application (SPA) de alto rendimiento, optimizada para funcionar con conectividad a la nube (Supabase) o de manera 100% autónoma en modo resiliente (almacenamiento local estructurado mediante LocalStore)."
              ),
            ],
            spacing: { after: 120 },
          }),

          new Paragraph({
            text: "1.2 Stack Tecnológico y Dependencias Clave",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Motor de Construcción: ", bold: true }),
              new TextRun("Vite 8.3 con soporte de HMR y compilador optimizado para TypeScript."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Capa de UI & Estilos: ", bold: true }),
              new TextRun("React 19, Tailwind CSS 4 con paleta Industrial Dark Pro (#0D1117, #161B22, acentos #E5FE40 y #FF5A1F), Radix UI para componentes accesibles."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Enrutamiento y Datos: ", bold: true }),
              new TextRun("@tanstack/react-router (enrutamiento seguro con tipado estricto) y @tanstack/react-query para sincronización de estado asíncrono y caché."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Motor de Reportes: ", bold: true }),
              new TextRun("write-excel-file/browser (generación de hojas XLSX nativas), jsPDF + jspdf-autotable (PDF vectoriales estructurados) y generador RFC 4180 (CSV UTF-8)."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Backend & Datos: ", bold: true }),
              new TextRun("@supabase/supabase-js con controlador híbrido resiliente y respaldo continuo en navegador."),
            ],
            spacing: { after: 150 },
          }),

          new Paragraph({
            text: "1.3 Estructura de Directorios y Módulos",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• /src/routes/: ", bold: true }),
              new TextRun("Rutas de la aplicación divididas en públicas (/ y /auth) y autenticadas (/dashboard, /acceso, /socios, /membresias, /pos, /rutinas, /configuracion, /portal)."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• /src/lib/: ", bold: true }),
              new TextRun("Lógica de negocio: gym.ts (cálculos de moneda, aforo y acústica de torniquete), gymData.ts (almacén de productos, ventas, caja, configuración), sociosSeed.ts (expedientes de socios con DPI), reports.ts (motor de exportación XLSX/PDF) y guard.ts (RBAC)."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• /src/components/: ", bold: true }),
              new TextRun("Componentes transversales: AppShell.tsx (barra lateral colapsable y barra de título), Receipt.tsx (comprobante térmico FEL), ReportButtons.tsx (selector de exportaciones) y /ui/ (componentes de diseño atómico)."),
            ],
            spacing: { after: 150 },
          }),

          new Paragraph({
            text: "1.4 Modelo de Seguridad y Roles (RBAC)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "El sistema implementa control de acceso basado en roles (Role-Based Access Control) verificado a nivel de rutas antes de su montaje mediante guard.ts:"
              ),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. ADMIN: ", bold: true }),
              new TextRun("Acceso total al sistema, estados financieros, arqueo de caja, configuración tributaria (NIT/IVA), catálogo de planes y auditoría."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "2. RECEPCION: ", bold: true }),
              new TextRun("Control de torniquete, alta y edición de socios, cobro de cuotas, punto de venta de mostrador y apertura/cierre de turnos de caja."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "3. ENTRENADOR: ", bold: true }),
              new TextRun("Visualización de expediente deportivo, creación y asignación de rutinas de entrenamiento, y registro de evaluaciones antropométricas."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "4. SOCIO: ", bold: true }),
              new TextRun("Portal personal de autogestión, consulta de su código QR de acceso al torniquete, estado de membresía, rutina y progreso físico."),
            ],
            spacing: { after: 150 },
          }),

          new Paragraph({
            text: "1.5 Motor de Reportes y Descargas",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "El módulo src/lib/reports.ts centraliza la generación de archivos sin requerir procesamiento en backend. Para XLSX, convierte las matrices de datos en un objeto OpenXML con estilo y cabeceras contrastadas (#1E222B / #E5FE40), resolviendo el blob binario y forzando la descarga en el navegador con nombres sanitizados (IronCore-[Titulo].xlsx)."
              ),
            ],
            spacing: { after: 150 },
          }),

          new Paragraph({
            text: "1.6 Compilación y Despliegue",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Compilar producción: ", bold: true }),
              new TextRun("npm run build (Genera la distribución lista en /dist)."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Validar sintaxis y tipos: ", bold: true }),
              new TextRun("npm run lint (Ejecuta tsc --noEmit con tipado 100% estricto)."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Servidor de desarrollo: ", bold: true }),
              new TextRun("npm run dev (Inicia Vite en puerto 3000 con bind 0.0.0.0)."),
            ],
            spacing: { after: 300 },
          }),

          // ==========================================
          // PARTE II: MANUAL DE USUARIO
          // ==========================================
          new Paragraph({
            text: "PARTE II: MANUAL DE USUARIO (GUÍA OPERATIVA PASO A PASO)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),

          new Paragraph({
            text: "2.1 Inicio de Sesión y Selección de Perfil",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "Al ingresar al sistema a través de la dirección web, se presenta la pantalla de autenticación. El usuario puede iniciar sesión mediante correo electrónico y contraseña, o bien utilizar los accesos rápidos de demostración (Admin, Recepción, Entrenador o Socio) para pruebas inmediatas."
              ),
            ],
            spacing: { after: 100 },
          }),

          ...screenshotCallout(
            "01",
            "Pantalla de Inicio de Sesión y Acceso Rápido",
            "Vista de la pantalla de inicio (/auth) con formulario de login.",
            "Formulario con pestañas 'Iniciar sesión' y 'Registrarse', junto con los botones de acceso rápido (Admin, Recepción, Entrenador, Socio).",
            "Recuadro rojo sobre la botonera de 'Acceso Rápido / Modo Demo' en la parte inferior."
          ),

          new Paragraph({
            text: "2.2 Dashboard Ejecutivo y Métricas en Tiempo Real",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "El panel principal proporciona una visión integral instantánea del gimnasio: Socios activos hoy, Aforo en sala con barra de capacidad (máximo 80 atletas), Ingresos del día en Quetzales (cuotas + ventas POS), y membresías próximas a vencer en 7 días."
              ),
            ],
            spacing: { after: 100 },
          }),

          ...screenshotCallout(
            "02",
            "Dashboard Ejecutivo y Tarjetas KPI",
            "Vista principal del Dashboard (/dashboard) con métricas y gráficas.",
            "Tarjetas KPI activas con cifras en Quetzales (Q), gráfica de afluencia horaria (curva de 6:00 AM a 10:00 PM) y gráfica de ingresos mensuales.",
            "Recuadro en la barra superior destacando el botón 'Informe Técnico (.DOCX)' y el botón 'Reportes (PDF/XLSX/CSV)'."
          ),

          ...screenshotCallout(
            "03",
            "Feed de Check-in en Vivo",
            "Columna derecha del Dashboard mostrando los últimos accesos.",
            "Tres registros de socios con fotos, hora de ingreso y estatus en verde (Acceso permitido) o rojo (Denegado por membresía vencida).",
            "Recuadro sobre la etiqueta pulsante 'En vivo' y el estado del socio denegado."
          ),

          new Paragraph({
            text: "2.3 Terminal de Control de Acceso y Torniquete",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "Diseñado para colocarse en la computadora de recepción o en una tableta junto al torniquete físico. Permite validar a los socios mediante:"
              ),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("1. "),
              new TextRun({ text: "Escaneo de Código QR: ", bold: true }),
              new TextRun("El socio muestra su carnet digital desde su teléfono móvil frente a la cámara/lector."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("2. "),
              new TextRun({ text: "Ingreso de DPI (Guatemala): ", bold: true }),
              new TextRun("El recepcionista o socio ingresa su número de DPI (13 dígitos) en el teclado numérico."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("3. "),
              new TextRun({ text: "Apertura Manual de Emergencia: ", bold: true }),
              new TextRun("Botón para desbloquear el torniquete ante cualquier eventualidad con registro automático en auditoría."),
            ],
            spacing: { after: 100 },
          }),

          ...screenshotCallout(
            "04",
            "Terminal de Torniquete y Validación de Acceso",
            "Pantalla completa de /acceso con campo de búsqueda principal.",
            "Tarjeta verde de acceso exitoso desplegada con nombre del socio, foto grande, días restantes de membresía y animación de torniquete abierto.",
            "Recuadro sobre la barra de entrada con el placeholder 'Escribe código o DPI...' y el botón 'Apertura manual'."
          ),

          new Paragraph({
            text: "2.4 Gestión de Socios y Expediente Digital",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "Permite administrar el padrón de socios del gimnasio. Incluye búsqueda en tiempo real por nombre, teléfono, código único o DPI, filtros por estado (Activos, Por Vencer, Vencidos, Inactivos) y emisión de reportes descargables."
              ),
            ],
            spacing: { after: 100 },
          }),

          ...screenshotCallout(
            "05",
            "Listado de Socios y Filtros de Estado",
            "Módulo de Socios (/socios) con tabla de socios completa.",
            "Al menos 5 socios visibles con código IC-10000X, DPI de 13 dígitos, foto, plan activo y botón de acciones.",
            "Recuadro sobre la barra de búsqueda y los botones de filtro rápido 'Por vencer' y 'Vencidos'."
          ),

          ...screenshotCallout(
            "06",
            "Formulario de Registro / Edición de Socio",
            "Ventana modal que se abre al pulsar 'Nuevo socio' o 'Editar'.",
            "Pestañas 'Datos personales', 'Foto & QR' y 'Ficha médica'. Mostrar pestaña de foto con la cámara web lista y el código QR generado.",
            "Recuadro en el campo 'DPI / CUI (Guatemala)' y en la captura por webcam."
          ),

          ...screenshotCallout(
            "07",
            "Expediente Digital del Socio",
            "Modal de expediente al hacer clic en 'Ver expediente'.",
            "Fotografía del socio, QR de gran tamaño, ficha médica con alergias, historial cronológico de cuotas pagadas en Quetzales y bitácora de últimos check-ins.",
            "Recuadro sobre el historial de suscripciones y el botón de comprobante."
          ),

          new Paragraph({
            text: "2.5 Membresías, Cobros y Comprobantes FEL",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "Módulo financiero para el registro de suscripciones y renovaciones. Se selecciona el socio, el plan contratado (Pase Diario Q 40, Mensual Q 250, Trimestral Q 650, Anual Q 2,200), se aplica descuento opcional en Quetzales y el método de pago (Efectivo, Tarjeta o Transferencia)."
              ),
            ],
            spacing: { after: 100 },
          }),

          ...screenshotCallout(
            "08",
            "Formulario de Cobro y Renovación de Membresía",
            "Vista superior de /membresias.",
            "Formulario con socio seleccionado, plan 'Mensual Básico · 30 días · Q 250.00', campo de descuento y cálculo automático del Total Final a Cobrar.",
            "Recuadro sobre el monto en grande 'Q 250.00' y el botón 'Cobrar & Emitir Comprobante'."
          ),

          ...screenshotCallout(
            "09",
            "Comprobante Térmico de Pago (Formato FEL SAT)",
            "Modal emergente con el ticket de pago generado.",
            "Ticket de fondo oscuro o blanco para imprimir: Cabecera 'IRONCORE FITNESS GUATEMALA', NIT 9845210-3, folio REC-XXXXXX, desglose de IVA (12%) y mensaje fiscal SAT.",
            "Recuadro sobre el botón 'Imprimir / Exportar PDF' y el detalle del IVA."
          ),

          new Paragraph({
            text: "2.6 Punto de Venta (POS), Inventario y Arqueo de Caja",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "Tienda integrada para la comercialización de suplementos, bebidas, barras energéticas y accesorios. Posee carrito interactivo, control de existencias en tiempo real, alertas de stock mínimo y calculadora de cambio con denominaciones oficiales de Guatemala (Q 20, Q 50, Q 100, Q 200)."
              ),
            ],
            spacing: { after: 100 },
          }),

          ...screenshotCallout(
            "10",
            "Punto de Venta e Inventario Visual",
            "Vista principal de /pos con catálogo en cuadrícula.",
            "Tarjetas de productos con imágenes (Proteína Isolate Q 480.00, Creatina Q 220.00, Bebidas Q 15.00), insignias de stock actual y carrito lateral derecho con artículos agregados.",
            "Recuadro sobre el resumen del carrito con Subtotal, IVA (12%) y botón 'Proceder al Cobro'."
          ),

          ...screenshotCallout(
            "11",
            "Calculadora de Efectivo y Denominaciones de Guatemala",
            "Modal de cobro en efectivo al pulsar 'Proceder al Cobro'.",
            "Campo de monto recibido, botones rápidos de billetes 'Q 20', 'Q 50', 'Q 100', 'Q 200' y visualización de 'Cambio a entregar: Q XX.XX' en verde.",
            "Recuadro sobre las píldoras de billetes de Quetzales y el botón 'Confirmar & Imprimir Ticket'."
          ),

          ...screenshotCallout(
            "12",
            "Arqueo y Control de Turnos de Caja",
            "Modal de apertura / cierre de turno desde el botón 'Control de Caja'.",
            "Estado del turno 'ABIERTO', Fondo Inicial de Q 500.00, Ventas acumuladas en tiempo real y campo para arqueo físico de cierre.",
            "Recuadro sobre el botón 'Cerrar Turno de Caja' y el efectivo total estimado."
          ),

          new Paragraph({
            text: "2.7 Rutinas y Evaluaciones Antropométricas (Coaches)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "Diseñado para entrenadores. Permite planificar rutinas divididas por día (Lunes Día A, etc.), ejercicios, series, repeticiones y descanso. Asimismo, almacena el historial corporal del atleta: peso en Libras (lb), porcentaje de grasa corporal, masa muscular (lb) y perímetros en centímetros (pecho, cintura, brazo, pierna)."
              ),
            ],
            spacing: { after: 100 },
          }),

          ...screenshotCallout(
            "13",
            "Módulo de Rutinas y Evolución Corporal",
            "Vista de /rutinas con socio seleccionado.",
            "Tabla de ejercicios con series/reps y pestaña de 'Evaluaciones' con pesos en libras (ej. 168.5 lb) y grasa (14.2%).",
            "Recuadro sobre las columnas 'Peso (libras / lb)' y 'Músculo (lb)'."
          ),

          new Paragraph({
            text: "2.8 Portal del Socio (Autogestión en Móvil)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "Los socios acceden a su propio carnet virtual con código QR para ingresar en el torniquete, consultan cuántos días de entrenamiento les restan antes de vencer su cuota, visualizan la rutina del día asignada por su entrenador y el gráfico de sus pagos."
              ),
            ],
            spacing: { after: 100 },
          }),

          ...screenshotCallout(
            "14",
            "Portal del Socio y Carnet Digital QR",
            "Vista de /portal con perfil de socio activo.",
            "Banner superior con código QR de acceso al torniquete, días de entrenamiento restantes ('Te quedan 22 días'), rutina del día y tabla de evolución física.",
            "Recuadro en el carnet QR y en la vigencia del plan."
          ),

          new Paragraph({
            text: "2.9 Configuración, Fiscalidad y Bitácora de Auditoría",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                "El Administrador define los datos legales de la sede: Razón Social, Dirección física (Zona 10, Guatemala), Teléfono (+502), NIT ante la SAT, tasa de IVA del 12% y Aforo máximo. Además, administra el catálogo de planes, productos con costos/precios en Quetzales, usuarios del sistema y la bitácora inmutable de auditoría donde queda registrado cada cobro, venta y apertura de caja."
              ),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "3. RESUMEN DE ARCHIVOS Y DOCUMENTACIÓN ENTREGADA",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Manual en Formato Word/Google Docs: ", bold: true }),
              new TextRun("/public/MANUAL_SISTEMA_IRONCORE.docx (Listo para abrir directamente en Google Docs o Microsoft Word)."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Manual en Formato Markdown: ", bold: true }),
              new TextRun("/docs/MANUAL_SISTEMA_IRONCORE.md (Para repositorios y lectura rápida en código)."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Informe Técnico de Auditoría: ", bold: true }),
              new TextRun("/public/INFORME_TECNICO_IRONCORE.docx y /docs/INFORME_TECNICO.md."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Respaldo Integral de Código (.zip): ", bold: true }),
              new TextRun("/public/proyecto-actualizado-guatemala.zip (Código fuente completo listo para producción)."),
            ],
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  });

  return doc;
}

const doc = createDoc();
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('public/MANUAL_SISTEMA_IRONCORE.docx', buffer);
  console.log('MANUAL_SISTEMA_IRONCORE.docx created successfully! Size:', buffer.length);
});
