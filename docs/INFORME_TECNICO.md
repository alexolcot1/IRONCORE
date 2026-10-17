# INFORME TÉCNICO DE AUDITORÍA, DESARROLLO Y LOCALIZACIÓN
**Proyecto:** IronCore Fitness Guatemala (Sistema de Gestión Integral para Gimnasios)  
**Fecha:** 16 de octubre de 2026  
**Entorno:** React SPA · Vite · TypeScript · TanStack Router & Query · Tailwind CSS  

---

## 1. INFORME DE EVIDENCIAS

- **Falla de exportación XLSX:** Al hacer clic en el botón XLSX en las distintas pantallas del sistema, el navegador no disparaba ninguna descarga. El análisis técnico confirmó que la función constructora de `write-excel-file/browser` devolvía un objeto con métodos `toBlob()` y `toFile()` sin resolver el blob ni invocar el elemento de descarga en el DOM.
- **Conflicto con `window.fetch`:** Se detectó la excepción `TypeError: Cannot set property fetch of #<Window> which has only a getter` ocasionada por extensiones de Chrome/navegador o proxies que intentaban sobreescribir `window.fetch` sin existir un setter en el descriptor del objeto global.
- **Desalineación regional (Moneda e Identificación):** El sistema operaba con referencias a dólares (`$`), tasas tributarias genéricas, identificación foránea (DNI de 8 dígitos y RFC mexicano) y unidades de peso exclusivamente en kilogramos, requiriendo alineación con las normas comerciales de Guatemala (Quetzales `Q`, DPI, NIT, IVA 12% y libras).

---

## 2. INCONSISTENCIAS ENCONTRADAS

1. **Desfase de consumo en la API de Excel:** Falta de invocación del método asíncrono `toBlob()`, ausencia de tipificación por celda y carencia de normalización de columnas entre filas.
2. **Ausencia de setter en el objeto window:** Imposibilidad de que interceptores de red o complementos del usuario asignen `window.fetch` sin generar un error fatal de JavaScript.
3. **Precios y denominaciones no representativas:** Membresías con valores no reales de mercado ($35 mensual) y botones rápidos en caja POS que no correspondían con los billetes oficiales en circulación de Guatemala.
4. **Terminología legal y médica ajena:** Uso de DNI en lugar de DPI (CUI 13 dígitos) y omisión del sistema de libras (`lb`) habitual en las básculas de gimnasios guatemaltecos.

---

## 3. MEJORAS REALIZADAS

### Mejora 1: Reparación del motor de exportación XLSX (Excel)
- **Problema encontrado:** Los botones XLSX no generaban ni descargaban archivos en ninguna sección.
- **Cambio solicitado:** Habilitar la generación y descarga efectiva de hojas de cálculo Excel en todas las vistas.
- **Resultado obtenido:** Se implementó la resolución con `toBlob()`, tipado estricto por celda (texto, número, booleanos), descarga mediante `downloadBlob` y notificaciones toast de éxito.

### Mejora 2: Corrección de excepción en `window.fetch`
- **Problema encontrado:** Error fatal al cargar por extensiones que intentaban asignar `window.fetch`.
- **Cambio solicitado:** Corregir el error para garantizar estabilidad universal.
- **Resultado obtenido:** Se inyectó un shim en `index.html` con getter y setter configurable en `window.fetch`, permitiendo la asignación limpia.

### Mejora 3: Conversión monetaria total a Quetzales (Q / GTQ)
- **Problema encontrado:** Todo el sistema operaba con dólares y valores no ajustados a Guatemala.
- **Cambio solicitado:** Convertir precios, planes, tienda y balances a Quetzales.
- **Resultado obtenido:** Función `money()` formateada en `es-GT` (`Q 0.00`). Planes ajustados (Pase Diario: Q 40.00, Mensual: Q 250.00, Trimestral: Q 650.00, Anual: Q 2,200.00) y productos en Quetzales.

### Mejora 4: Adaptación de la caja POS a denominaciones de Guatemala
- **Problema encontrado:** Botones de pago rápido en efectivo y arqueo con valores no acordes al cono monetario de Guatemala.
- **Cambio solicitado:** Adaptar las opciones de efectivo a la realidad guatemalteca.
- **Resultado obtenido:** Billetes rápidos de `Q 20`, `Q 50`, `Q 100` y `Q 200`, fondo de caja estándar de Q 500.00 y cálculo exacto de cambio.

### Mejora 5: Localización de documentos de identidad (DPI y NIT)
- **Problema encontrado:** Se utilizaban términos como DNI y RFC incompatibles con Guatemala.
- **Cambio solicitado:** Relacionar los identificadores con las entidades oficiales de Guatemala.
- **Resultado obtenido:** Implementación de DPI (CUI de 13 dígitos) para socios y torniquete, y NIT de la SAT para comprobantes fiscales.

### Mejora 6: Régimen fiscal con IVA del 12%
- **Problema encontrado:** Cálculo tributario genérico sin identificación del estándar guatemalteco.
- **Cambio solicitado:** Alinear la facturación con los requerimientos SAT.
- **Resultado obtenido:** Cálculo de IVA con la tasa oficial del 12% y tickets compatibles con formato de Factura Electrónica en Línea (FEL).

### Mejora 7: Adaptación de mediciones físicas a libras y centímetros
- **Problema encontrado:** Métricas corporales expresadas solo en kilogramos.
- **Cambio solicitado:** Relacionar las mediciones corporales con el uso customary de Guatemala.
- **Resultado obtenido:** Fichas antropométricas en Rutinas y Portal del Socio calibradas en Libras (`lb`) para peso y masa muscular, y centímetros (`cm`) para perímetros.

---

## 4. RESULTADOS

1. **Exportación XLSX 100% funcional:** Generación inmediata de archivos de Excel descargables en todos los módulos con formato y cabeceras enriquecidas.
2. **Cero errores de compilación y tipado:** Validación completa con TypeScript (`tsc --noEmit`) y empaquetado de producción exitoso con Vite (`vite build`).
3. **Integración contextual con Guatemala:** Plataforma homogénea en Quetzales, DPI, NIT, IVA 12% y peso en libras.

---

## 5. CONCLUSIONES

El sistema IronCore Fitness Guatemala ha alcanzado un estado de madurez técnica y operativa óptimo. Los bloqueos de exportación XLSX e inicialización de red fueron neutralizados a nivel de arquitectura. La localización al entorno de Guatemala aporta una experiencia nativa y profesional para administradores, cajeros, entrenadores y atletas.
