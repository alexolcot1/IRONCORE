# MANUAL DE USUARIO Y GUÍA DE OPERACIONES
**Sistema:** IronCore Fitness Guatemala  
**Versión:** 2.4.0 (Edición Guatemala - Quetzales, DPI y SAT)  
**Destinatario:** Administradores, Cajeros, Recepcionistas, Entrenadores y Personal del Gimnasio  
**Fecha de Emisión:** Octubre 2026  
**Documento ID:** DOC-USR-ICGT-2026-V2.4  

---

## 1. INTRODUCCIÓN Y BIENVENIDA

Bienvenido al **Sistema de Gestión Integral IronCore Fitness Guatemala**. Este software ha sido diseñado con tecnología de vanguardia para agilizar y profesionalizar la administración diaria de tu gimnasio: desde el cobro rápido en punto de venta con emisión de comprobantes, control de acceso a torniquetes en milisegundos mediante código QR o DPI, hasta la gestión de membresías, rutinas y reportes contables exportables a Excel (XLSX).

### 1.1 Requisitos Básicos para el Personal
* **Dispositivo:** Cualquier computadora de escritorio, laptop, tablet o terminal táctil con acceso a internet o en red local.
* **Navegador Recomendado:** Google Chrome, Microsoft Edge, Brave, Mozilla Firefox o Safari en sus versiones más recientes.
* **Periféricos Compatibles:**
  - Lector de código de barras / QR USB o inalámbrico.
  - Impresora térmica para tickets de 58mm u 80mm.

---

## 2. PANTALLA DE INICIO DE SESIÓN (LOGIN)

Para ingresar al sistema, dirígete a la dirección web de la aplicación o a la ruta `/auth`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #1: Pantalla de Autenticación y Acceso al Sistema     │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 2 (Inicio de Sesión)                   │
│ • Qué capturar: Pantalla limpia de Login con las tarjetas de credenciales  │
│   rápidas (Admin, Recepción, Entrenador) y el formulario de usuario/clave.  │
│ • Elementos a resaltar: Recuadro en color naranja sobre los botones de     │
│   acceso rápido demo para demostración al cliente.                          │
│ • Resolución sugerida: 1280x720 px (formato 16:9) en PNG.                   │
│ • Pie de foto sugerido: "Figura 1: Pantalla de acceso al sistema con        │
│   perfiles preconfigurados según el rol del empleado."                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Pasos para Iniciar Sesión:
1. Ingresa tu correo electrónico corporativo registrado (ejemplo: `admin@ironcore.com.gt`).
2. Digita tu contraseña de seguridad.
3. Haz clic en el botón **"Iniciar Sesión"**.
4. *(Opcional para pruebas o demostraciones)*: Puedes hacer clic en cualquiera de los botones de acceso rápido: **"Administrador General"**, **"Cajero / Recepción"** o **"Entrenador"** para rellenar automáticamente los datos y entrar con un solo clic.

---

## 3. MÓDULO 1: TABLERO PRINCIPAL (DASHBOARD)

El Dashboard es el centro de mando del gimnasio. Aquí podrás visualizar el pulso operativo y financiero del negocio en tiempo real.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #2: Tablero Ejecutivo de Mando (Dashboard)           │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 3 (Tablero Principal)                  │
│ • Qué capturar: Vista completa del Dashboard mostrando las 4 tarjetas de    │
│   KPIs superiores, la gráfica de barras de Ingresos Mensuales en Quetzales  │
│   y el listado de Accesos Recientes al gimnasio.                            │
│ • Elementos a resaltar: Recuadro rojo sobre la tarjeta "Ingresos del Mes"   │
│   con el símbolo de Quetzales (Q) y la gráfica de barras de ingresos.       │
│ • Resolución sugerida: 1920x1080 px o 1440x900 px en PNG de alta nitidez.   │
│ • Pie de foto sugerido: "Figura 2: Dashboard operativo con métricas clave   │
│   en tiempo real, ingresos en Quetzales y control de aforo."                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Indicadores Clave (Tarjetas Superiores):
1. **Socios Activos:** Muestra la cantidad total de miembros con membresía vigente al día de hoy.
2. **Ingresos del Mes (Q):** Monto acumulado facturado en el mes calendario en **Quetzales**, sumando cuotas de membresías y ventas de la tienda.
3. **Ocupación Actual / Aforo:** Número de atletas entrenando en sala en este instante respecto a la capacidad máxima del establecimiento.
4. **Asistencias Hoy:** Total de ingresos registrados por el torniquete o recepción durante la jornada actual.

### 3.2 Gráfica de Ingresos y Distribución:
* Visualiza la tendencia de facturación de los últimos 6 meses.
* Permite auditar el desglose de ventas por plan (Mensual Básico, Trimestral Pro, Anual VIP Black y Pases Diarios).

---

## 4. MÓDULO 2: GESTIÓN INTEGRAL DE SOCIOS

En este módulo (`/socios`) se centraliza la base de datos de todos los atletas y clientes del gimnasio.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #3: Directorio de Socios y Herramientas de Filtro     │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 4.1 (Directorio de Socios)             │
│ • Qué capturar: Listado general de socios con sus fotos de perfil, nombres, │
│   DPI guatemalteco, badges de estado (Activo, Por Vencer, Vencido) y los    │
│   botones de exportación (XLSX, CSV, PDF) en la esquina superior derecha.   │
│ • Elementos a resaltar: Flecha señalando el campo de búsqueda con DPI y el  │
│   botón verde "Descargar XLSX".                                             │
│ • Resolución sugerida: 1600x900 px en PNG.                                  │
│ • Pie de foto sugerido: "Figura 3: Directorio de socios con filtros rápidos │
│   y exportación directa a hojas de cálculo de Excel."                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Cómo Buscar a un Socio
El buscador superior es inteligente y universal. Puedes localizar a cualquier cliente digitando:
* Nombres o apellidos (ej. "Carlos Méndez").
* Número de DPI o CUI guatemalteco (ej. "2485 91823 0101").
* Número de teléfono con prefijo nacional (ej. "5412 8765").
* Código de socio impreso en su carnet (ej. "IC-100001").

### 4.2 Registro de un Nuevo Socio (Paso a Paso)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #4: Formulario Modal de Alta de Nuevo Socio           │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 4.2 (Registro de Nuevo Socio)          │
│ • Qué capturar: El modal abierto de "Nuevo Socio" con los campos de DPI,    │
│   teléfono (+502), contacto de emergencia, notas médicas y plan asignado.   │
│ • Elementos a resaltar: Recuadro en el campo "DPI / Documento de            │
│   Identificación" y en el selector de "Plan Inicial".                       │
│ • Resolución sugerida: 900x750 px (recorte enfocado del modal) en PNG.      │
│ • Pie de foto sugerido: "Figura 4: Formulario de inscripción de socio con    │
│   validaciones oficiales de Guatemala y ficha médica."                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. Haz clic en el botón negro superior **"+ Nuevo Socio"**.
2. **Datos Personales:**
   - Ingresa Nombres y Apellidos completos.
   - Digita el **DPI (CUI de 13 dígitos)** extendido por RENAP.
   - Proporciona un número de teléfono móvil (formato de Guatemala: +502 XXXX-XXXX).
   - Ingresa el correo electrónico para el envío de comprobantes y credencial digital.
3. **Ficha de Salud y Contacto:**
   - Nombre y teléfono del contacto de emergencia (ej. "Laura Luna +502 5455 6677").
   - Notas médicas relevantes (condiciones crónicas, peso en libras `lb`).
   - Alergias conocidas o indicaciones para los entrenadores.
4. **Membresía Inicial:** Selecciona el plan contratado (Pase Diario, Mensual, Trimestral o Anual).
5. Haz clic en **"Guardar y Emitir Carnet"**. El socio quedará inmediatamente habilitado para ingresar al gimnasio.

---

## 5. MÓDULO 3: PUNTO DE VENTA (POS) Y TIENDA

La terminal POS (`/pos`) está diseñada para realizar cobros ultra rápidos en mostrador sin fricción.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #5: Terminal de Punto de Venta (POS)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 5.1 (Punto de Venta)                   │
│ • Qué capturar: Pantalla completa del POS con la cuadrícula de productos a  │
│   la izquierda (Proteínas, Bebidas, Shakers con precios en Q) y el carrito  │
│   de compras a la derecha con el desglose de subtotal, IVA 12% y total.     │
│ • Elementos a resaltar: Precios de los productos con "Q" y el botón grande  │
│   "Completar Venta".                                                        │
│ • Resolución sugerida: 1920x1080 px en PNG.                                 │
│ • Pie de foto sugerido: "Figura 5: Terminal de Punto de Venta con catálogo  │
│   visual de suplementos y cálculo automático de IVA del 12%."               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Apertura y Arqueo de Caja
1. Al iniciar la jornada, haz clic en **"Caja / Arqueo"**.
2. Ingresa el fondo de caja inicial en efectivo (ej. **Q 500.00** para dar cambio a primera hora).
3. Al finalizar el turno, el sistema mostrará el total de cobros en efectivo, tarjeta y transferencias para realizar el cuadre final contra el dinero físico existente en la gaveta.

### 5.2 Realizar una Venta en Mostrador
1. **Seleccionar Productos:** Haz clic sobre los productos del catálogo o escanea su código de barras con el lector láser.
2. **Asignar Cliente:** Puedes buscar a un socio registrado o dejar la venta asignada a **"Cliente Mostrador / Ocasional"**.
3. **Elegir Método de Pago:**
   - **EFECTIVO:** El sistema desplegará botones rápidos con los billetes de curso legal en Guatemala (**Q 20**, **Q 50**, **Q 100**, **Q 200**). Al hacer clic en un billete o escribir el monto recibido, la pantalla calculará al instante el **Vuelto / Cambio a Entregar**.
   - **TARJETA:** Para pagos con tarjeta de débito o crédito en el POS bancario (Visa / Mastercard).
   - **TRANSFERENCIA:** Para transferencias electrónicas bancarias directas (Banrural, Banco Industrial, G&T Continental, BAC).
4. Haz clic en **"Confirmar y Cobrar"**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #6: Ventana de Cobro en Efectivo y Billetes Rápidos   │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 5.2 (Cobro en Mostrador)               │
│ • Qué capturar: Sección inferior derecha del POS con el método "EFECTIVO"   │
│   seleccionado, mostrando los botones [Q 20], [Q 50], [Q 100], [Q 200] y el │
│   cálculo en verde del "Cambio / Vuelto a Entregar".                        │
│ • Elementos a resaltar: Recuadro sobre los botones de billetes en Quetzales.│
│ • Resolución sugerida: 800x600 px en PNG.                                   │
│ • Pie de foto sugerido: "Figura 6: Panel de cobro en efectivo con cálculo   │
│   automático de cambio y denominaciones oficiales de Guatemala."            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Impresión de Comprobante / Ticket Térmico

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #7: Ticket Térmico de Venta con Formato SAT          │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 5.3 (Emisión de Comprobantes)          │
│ • Qué capturar: Diálogo emergente del recibo impreso con el logotipo de     │
│   IronCore Fitness Guatemala, NIT del gimnasio, desglose de IVA (12%)       │
│   y la leyenda de cumplimiento fiscal SAT.                                  │
│ • Elementos a resaltar: Flecha en el campo del NIT y en el desglose del     │
│   IVA del 12%.                                                              │
│ • Resolución sugerida: 600x700 px en PNG.                                   │
│ • Pie de foto sugerido: "Figura 7: Vista previa del ticket térmico de 80mm  │
│   con datos fiscales y desglose de IVA listo para impresión inmediata."     │
└─────────────────────────────────────────────────────────────────────────────┘
```

Tras confirmar la venta, pulsa **"Imprimir Comprobante"**. Se abrirá el formato listo para impresora térmica de 80 mm o para guardar en archivo PDF con firma y datos de la transacción.

---

## 6. MÓDULO 4: CONTROL DE ACCESO Y TORNIQUETE

La pantalla de torniquete (`/acceso`) se ubica en la entrada principal del gimnasio para validar el ingreso de los socios.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #8: Pantalla de Control de Acceso y Torniquete        │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 6 (Control de Acceso)                  │
│ • Qué capturar: Pantalla de validación de acceso mostrando el lector de QR, │
│   el estado verde "ACCESO PERMITIDO" de un socio con membresía activa y la  │
│   alerta roja "ACCESO DENEGADO" cuando una cuota se encuentra vencida.      │
│ • Elementos a resaltar: Los dos estados visuales (Verde vs Rojo) y la foto  │
│   del socio en pantalla.                                                    │
│ • Resolución sugerida: 1920x1080 px en PNG.                                 │
│ • Pie de foto sugerido: "Figura 8: Terminal de acceso rápido con respuesta  │
│   inmediata para control de torniquetes y validación de membresías."        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Cómo Funciona la Validación
1. El socio presenta su carnet físico, código QR desde su teléfono o digita su número de DPI.
2. El sistema analiza el estado de su membresía en menos de **0.2 segundos**:
   - **Luz Verde - ACCESO AUTORIZADO:** La membresía está al día. El torniquete libera el paso y la pantalla muestra la foto del atleta, su nombre y los días restantes de vigencia.
   - **Luz Roja - ACCESO DENEGADO:** La membresía expiró o el socio está inactivo. La pantalla advierte el motivo del bloqueo e invita al cliente a pasar a recepción a regularizar su pago.

---

## 7. MÓDULO 5: CATÁLOGO DE PLANES Y MEMBRESÍAS

En `/membresias` se configuran las modalidades de suscripción que ofrece el gimnasio.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #9: Catálogo de Planes de Membresía                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 7 (Planes y Membresías)                │
│ • Qué capturar: Vista de las tarjetas de planes: Pase Diario (Q 40),        │
│   Mensual Básico (Q 250), Trimestral Pro (Q 650) y Anual VIP Black (Q 2,200)│
│   junto con el botón "+ Crear Nuevo Plan".                                  │
│ • Elementos a resaltar: Precios en Quetzales de cada membresía y la lista   │
│   de beneficios incluidos.                                                  │
│ • Resolución sugerida: 1600x900 px en PNG.                                  │
│ • Pie de foto sugerido: "Figura 9: Administración de planes de membresía    │
│   con tarifas expresadas en Quetzales y control de días de vigencia."       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Planes Preconfigurados en el Sistema:
* **Pase Diario (Q 40.00):** Acceso libre por 1 día completo a pesas y cardio.
* **Mensual Básico (Q 250.00):** 30 días de acceso total con evaluación física inicial.
* **Trimestral Pro (Q 650.00):** 90 días con descuento especial y 1 sesión de asesoría de suplementación.
* **Anual VIP Black (Q 2,200.00):** 365 días con casillero privado, toalla deportiva y pase para acompañante en fines de semana.

---

## 8. MÓDULO 6: RUTINAS Y EVALUACIONES ANTROPOMÉTRICAS

En `/rutinas` los entrenadores registran las mediciones corporales de los atletas y elaboran sus programas de entrenamiento.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #10: Ficha de Evaluación Antropométrica y Rutinas    │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 8 (Rutinas y Evaluaciones)             │
│ • Qué capturar: Ficha de progreso físico con las mediciones en Libras (lb)  │
│   y perímetros en centímetros (cm), acompañada del plan de rutina asignado  │
│   (Hipertrofia, Fuerza o Pérdida de Grasa).                                 │
│ • Elementos a resaltar: Campos de "Peso Corporal (lb)" y "Grasa Corporal (%)"│
│ • Resolución sugerida: 1440x900 px en PNG.                                  │
│ • Pie de foto sugerido: "Figura 10: Ficha antropométrica personalizada con  │
│   sistema de peso en libras y asignación de rutinas por objetivos."         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.1 Registro de Métricas Físicas
* **Peso Corporal:** Expresado en **Libras (lb)** según la costumbre de los gimnasios de Guatemala (con equivalencia en kg).
* **Composición Corporal:** Porcentaje de grasa corporal (%) y porcentaje de masa muscular esquelética (%).
* **Perímetros Antropométricos (cm):** Pecho, cintura, cadera, brazo relajado y muslo.
* **Objetivos y Notas del Coach:** Observaciones sobre cargas, descansos y técnica.

---

## 9. MÓDULO 7: PORTAL MÓVIL DEL SOCIO

El portal (`/portal`) ofrece una experiencia tipo aplicación móvil para que el atleta consulte su progreso y presente su código QR desde su propio celular.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #11: Carnet Digital del Socio en Pantalla Móvil      │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 9 (Portal Móvil del Socio)             │
│ • Qué capturar: Vista del carnet digital con el código QR dinámico, nombre, │
│   número de DPI, días de membresía restantes y gráfica de peso en libras.   │
│ • Elementos a resaltar: El código QR nítido para escanear en torniquete.    │
│ • Resolución sugerida: 450x850 px (captura vertical tipo smartphone) en PNG.│
│ • Pie de foto sugerido: "Figura 11: Carnet virtual de socio accesible desde │
│   cualquier teléfono inteligente para autoservicio e ingreso ágil."         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. MÓDULO 8: CONFIGURACIÓN, INVENTARIO Y EXPORTACIÓN EXCEL

En `/configuracion` el administrador define los parámetros centrales del gimnasio.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 CAPTURA RECOMENDADA #12: Configuración del Negocio, NIT SAT e Inventario  │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ubicación en el documento: Sección 10 (Configuración y Reportes)          │
│ • Qué capturar: Pantalla de configuración comercial con el campo "NIT (SAT  │
│   Guatemala)", tasa de IVA (12%), catálogo de inventario con precios en Q   │
│   y la tabla de auditoría de seguridad.                                     │
│ • Elementos a resaltar: El botón verde "Descargar XLSX" de la tabla de      │
│   inventario y el campo de NIT SAT.                                         │
│ • Resolución sugerida: 1600x900 px en PNG.                                  │
│ • Pie de foto sugerido: "Figura 12: Módulo de configuración comercial con   │
│   control de inventario de suplementos y bitácora de auditoría."            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.1 Exportación de Datos a Microsoft Excel (XLSX):
En todas las tablas del sistema encontrarás los botones:
* **[XLSX]:** Descarga inmediata de un archivo `.xlsx` nativo, ordenado y formateado por columnas, ideal para contabilidad o auditorías del negocio.
* **[CSV]:** Exportación en texto plano separado por comas para integración con otros sistemas o bases de datos externas.
* **[PDF]:** Reporte ejecutivo con encabezados, fechas y numeración de páginas listo para enviar por correo o imprimir.

---

## 11. PREGUNTAS FRECUENTES (FAQ) Y MEJORES PRÁCTICAS

1. **¿Qué hago si un socio olvidó su carnet físico?**  
   Puedes buscarlo en la terminal de acceso o en el directorio digitando su número de DPI o su nombre completo. El sistema autorizará su acceso manual en un clic.
2. **¿Cómo anular una venta errónea en el POS?**  
   Ingresa a `/pos`, localiza la venta en el historial del día y utiliza la opción de anulación con autorización de usuario Administrador.
3. **¿Cómo cambiar el precio de una membresía o de un suplemento?**  
   Los precios se modifican directamente desde el catálogo de membresías (`/membresias`) o desde el catálogo de inventario (`/configuracion`) por parte de usuarios con rol de Administrador.
4. **¿Los datos se pierden si se va la luz o el internet?**  
   No. El sistema cuenta con memoria local reactiva automática. Al restablecerse la conexión, toda la información se mantiene intacta.
