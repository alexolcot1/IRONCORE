import protein from "@/assets/p-protein.jpg";
import drink from "@/assets/p-drink.jpg";
import bar from "@/assets/p-bar.jpg";
import gear from "@/assets/p-gear.jpg";
import type { Role } from "./gym";

export interface NegocioConfig {
  id: string;
  nombre: string;
  slogan: string;
  direccion: string;
  telefono: string;
  email: string;
  rfc: string;
  moneda: string;
  iva_pct: number;
  aforo_max: number;
  sitio_web: string;
}

export interface PlanMembresia {
  id: string;
  nombre: string;
  duracion_dias: number;
  precio: number;
  descripcion: string;
  activo: boolean;
}

export interface Producto {
  id: string;
  codigo_barras: string;
  nombre: string;
  categoria: "Suplementos" | "Bebidas" | "Snacks" | "Accesorios";
  precio_venta: number;
  costo: number;
  stock_actual: number;
  stock_minimo: number;
  imagen_tipo: "protein" | "drink" | "bar" | "gear";
}

export interface VentaPOS {
  id: string;
  folio: string;
  fecha_hora: string;
  socio_id: string | null;
  socio_nombre: string;
  items: {
    producto_id: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  metodo_pago: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA";
  monto_recibido?: number;
  cambio?: number;
  cajero: string;
}

export interface CajaTurno {
  id: string;
  fecha_apertura: string;
  monto_inicial: number;
  fecha_cierre?: string | null;
  monto_cierre?: number | null;
  total_ventas: number;
  ventas_count: number;
  estado: "ABIERTA" | "CERRADA";
  cajero: string;
}

export interface RegistroAuditoria {
  id: string;
  fecha_hora: string;
  usuario: string;
  rol: Role;
  accion: string;
  tabla: string;
  detalle: string;
}

export interface UsuarioSistema {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  fecha_creacion: string;
  activo: boolean;
}

const STORAGE_KEYS = {
  CONFIG: "gymflow_config",
  PLANES: "gymflow_planes",
  PRODUCTOS: "gymflow_productos",
  VENTAS: "gymflow_ventas",
  CAJA: "gymflow_caja",
  AUDITORIA: "gymflow_auditoria",
  USUARIOS: "gymflow_usuarios",
};

export const INITIAL_CONFIG: NegocioConfig = {
  id: "cfg-1",
  nombre: "IronCore Fitness Guatemala",
  slogan: "Centro de Alto Rendimiento, Acondicionamiento Físico y Musculación",
  direccion: "Boulevard Los Próceres 18-50, Zona 10, Edificio Titanium, Nivel 1, Ciudad de Guatemala",
  telefono: "+502 2360-8000",
  email: "info@ironcore.com.gt",
  rfc: "9845210-3",
  moneda: "GTQ (Quetzales)",
  iva_pct: 12,
  aforo_max: 80,
  sitio_web: "https://ironcore.com.gt",
};

export const INITIAL_PLANES: PlanMembresia[] = [
  {
    id: "plan-1",
    nombre: "Pase Diario",
    duracion_dias: 1,
    precio: 40.0,
    descripcion: "Acceso ilimitado por un día a área de fuerza, cardio y vestidores.",
    activo: true,
  },
  {
    id: "plan-2",
    nombre: "Mensual Básico",
    duracion_dias: 30,
    precio: 250.0,
    descripcion: "Acceso mensual completo, incluye evaluación física antropométrica inicial.",
    activo: true,
  },
  {
    id: "plan-3",
    nombre: "Trimestral Pro",
    duracion_dias: 90,
    precio: 650.0,
    descripcion: "3 meses de acceso total + rutina personalizada mensual con coach.",
    activo: true,
  },
  {
    id: "plan-4",
    nombre: "Anual VIP Black",
    duracion_dias: 365,
    precio: 2200.0,
    descripcion: "Año completo con pase para acompañante fin de semana y casillero privado.",
    activo: true,
  },
];

export const INITIAL_PRODUCTOS: Producto[] = [
  {
    id: "prod-1",
    codigo_barras: "75010001",
    nombre: "Whey Protein Isolate 2kg",
    categoria: "Suplementos",
    precio_venta: 480.0,
    costo: 340.0,
    stock_actual: 24,
    stock_minimo: 5,
    imagen_tipo: "protein",
  },
  {
    id: "prod-2",
    codigo_barras: "75010002",
    nombre: "Creatina Monohidratada Micronizada 300g",
    categoria: "Suplementos",
    precio_venta: 220.0,
    costo: 140.0,
    stock_actual: 18,
    stock_minimo: 6,
    imagen_tipo: "protein",
  },
  {
    id: "prod-3",
    codigo_barras: "75010003",
    nombre: "Bebida Isotónica Electrolitos 600ml",
    categoria: "Bebidas",
    precio_venta: 15.0,
    costo: 8.5,
    stock_actual: 54,
    stock_minimo: 15,
    imagen_tipo: "drink",
  },
  {
    id: "prod-4",
    codigo_barras: "75010004",
    nombre: "Agua Pura Mineral 1L",
    categoria: "Bebidas",
    precio_venta: 10.0,
    costo: 4.5,
    stock_actual: 72,
    stock_minimo: 20,
    imagen_tipo: "drink",
  },
  {
    id: "prod-5",
    codigo_barras: "75010005",
    nombre: "Barra de Proteína Caramelo & Nuez 60g",
    categoria: "Snacks",
    precio_venta: 20.0,
    costo: 11.0,
    stock_actual: 85,
    stock_minimo: 20,
    imagen_tipo: "bar",
  },
  {
    id: "prod-6",
    codigo_barras: "75010006",
    nombre: "Guantes de Entrenamiento con Muñequera",
    categoria: "Accesorios",
    precio_venta: 125.0,
    costo: 65.0,
    stock_actual: 12,
    stock_minimo: 4,
    imagen_tipo: "gear",
  },
  {
    id: "prod-7",
    codigo_barras: "75010007",
    nombre: "Shaker Mezclador Pro 700ml con Compartimento",
    categoria: "Accesorios",
    precio_venta: 65.0,
    costo: 30.0,
    stock_actual: 32,
    stock_minimo: 8,
    imagen_tipo: "gear",
  },
  {
    id: "prod-8",
    codigo_barras: "75010008",
    nombre: "Toalla Deportiva Microfibra Antimicrobiana",
    categoria: "Accesorios",
    precio_venta: 50.0,
    costo: 22.0,
    stock_actual: 19,
    stock_minimo: 5,
    imagen_tipo: "gear",
  },
];

export const INITIAL_VENTAS: VentaPOS[] = [
  {
    id: "v-101",
    folio: "POS-2026-00101",
    fecha_hora: new Date(Date.now() - 3600000 * 2).toISOString(),
    socio_id: "soc-1",
    socio_nombre: "Carlos Méndez",
    items: [
      { producto_id: "prod-1", nombre: "Whey Protein Isolate 2kg", cantidad: 1, precio_unitario: 480.0, subtotal: 480.0 },
      { producto_id: "prod-3", nombre: "Bebida Isotónica Electrolitos 600ml", cantidad: 2, precio_unitario: 15.0, subtotal: 30.0 },
    ],
    subtotal: 510.0,
    descuento: 0,
    impuesto: 61.2,
    total: 571.2,
    metodo_pago: "TARJETA",
    cajero: "Recepción Central",
  },
  {
    id: "v-102",
    folio: "POS-2026-00102",
    fecha_hora: new Date(Date.now() - 3600000 * 5).toISOString(),
    socio_id: null,
    socio_nombre: "Cliente Mostrador",
    items: [
      { producto_id: "prod-5", nombre: "Barra de Proteína Caramelo & Nuez 60g", cantidad: 2, precio_unitario: 20.0, subtotal: 40.0 },
      { producto_id: "prod-4", nombre: "Agua Pura Mineral 1L", cantidad: 1, precio_unitario: 10.0, subtotal: 10.0 },
    ],
    subtotal: 50.0,
    descuento: 0,
    impuesto: 6.0,
    total: 56.0,
    metodo_pago: "EFECTIVO",
    monto_recibido: 100.0,
    cambio: 44.0,
    cajero: "Recepción Central",
  },
];

export const INITIAL_CAJA: CajaTurno = {
  id: "turno-hoy",
  fecha_apertura: new Date(new Date().setHours(6, 0, 0, 0)).toISOString(),
  monto_inicial: 500.0,
  total_ventas: 627.2,
  ventas_count: 2,
  estado: "ABIERTA",
  cajero: "Recepción Mañana",
};

export const INITIAL_USUARIOS: UsuarioSistema[] = [
  { id: "usr-1", nombre: "Administrador General", email: "admin@ironcore.com.gt", rol: "ADMIN", fecha_creacion: "2026-01-15", activo: true },
  { id: "usr-2", nombre: "María Fernández", email: "recepcion@ironcore.com.gt", rol: "RECEPCION", fecha_creacion: "2026-02-01", activo: true },
  { id: "usr-3", nombre: "Roberto Gómez (Coach)", email: "coach.roberto@ironcore.com.gt", rol: "ENTRENADOR", fecha_creacion: "2026-02-15", activo: true },
  { id: "usr-4", nombre: "Carlos Méndez (Socio)", email: "carlos.mendez@gmail.com", rol: "SOCIO", fecha_creacion: "2026-03-01", activo: true },
];

export const INITIAL_AUDITORIA: RegistroAuditoria[] = [
  { id: "aud-1", fecha_hora: new Date(Date.now() - 3600000 * 6).toISOString(), usuario: "admin@ironcore.com.gt", rol: "ADMIN", accion: "APERTURA_CAJA", tabla: "caja_turnos", detalle: "Apertura de turno matutino con fondo inicial de Q 500.00" },
  { id: "aud-2", fecha_hora: new Date(Date.now() - 3600000 * 5).toISOString(), usuario: "recepcion@ironcore.com.gt", rol: "RECEPCION", accion: "VENTA_POS", tabla: "ventas_pos", detalle: "Venta POS-2026-00102 por Q 56.00 en Efectivo a mostrador" },
  { id: "aud-3", fecha_hora: new Date(Date.now() - 3600000 * 2).toISOString(), usuario: "recepcion@ironcore.com.gt", rol: "RECEPCION", accion: "VENTA_POS", tabla: "ventas_pos", detalle: "Venta POS-2026-00101 por Q 571.20 en Tarjeta a socio Carlos Méndez" },
  { id: "aud-4", fecha_hora: new Date(Date.now() - 3600000 * 1).toISOString(), usuario: "admin@ironcore.com.gt", rol: "ADMIN", accion: "CONFIG_UPDATE", tabla: "negocio_config", detalle: "Actualización de información comercial y horario del gimnasio (Zona 10, Guatemala)" },
];

// Helper for local persistence
function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// Public API
export const GymDataStore = {
  getConfig(): NegocioConfig {
    return getStorage<NegocioConfig>(STORAGE_KEYS.CONFIG, INITIAL_CONFIG);
  },
  saveConfig(cfg: NegocioConfig): void {
    setStorage(STORAGE_KEYS.CONFIG, cfg);
    GymDataStore.addAuditoria("ADMIN", "CONFIG_UPDATE", "negocio_config", `Actualización de datos: ${cfg.nombre}`);
  },

  getPlanes(): PlanMembresia[] {
    return getStorage<PlanMembresia[]>(STORAGE_KEYS.PLANES, INITIAL_PLANES);
  },
  savePlan(plan: PlanMembresia): PlanMembresia[] {
    const list = GymDataStore.getPlanes();
    const idx = list.findIndex((p) => p.id === plan.id);
    let updated: PlanMembresia[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = plan;
    } else {
      updated = [{ ...plan, id: plan.id || `plan-${Date.now()}` }, ...list];
    }
    setStorage(STORAGE_KEYS.PLANES, updated);
    GymDataStore.addAuditoria("ADMIN", "PLAN_SAVE", "planes_membresia", `Plan guardado: ${plan.nombre} (Q ${plan.precio})`);
    return updated;
  },
  deletePlan(id: string): PlanMembresia[] {
    const list = GymDataStore.getPlanes().filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.PLANES, list);
    GymDataStore.addAuditoria("ADMIN", "PLAN_DELETE", "planes_membresia", `Plan eliminado: ${id}`);
    return list;
  },

  getProductos(): Producto[] {
    return getStorage<Producto[]>(STORAGE_KEYS.PRODUCTOS, INITIAL_PRODUCTOS);
  },
  saveProducto(prod: Producto): Producto[] {
    const list = GymDataStore.getProductos();
    const idx = list.findIndex((p) => p.id === prod.id);
    let updated: Producto[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = prod;
    } else {
      updated = [{ ...prod, id: prod.id || `prod-${Date.now()}` }, ...list];
    }
    setStorage(STORAGE_KEYS.PRODUCTOS, updated);
    GymDataStore.addAuditoria("ADMIN", "PRODUCTO_SAVE", "productos", `Producto guardado: ${prod.nombre} (Stock: ${prod.stock_actual})`);
    return updated;
  },
  deleteProducto(id: string): Producto[] {
    const list = GymDataStore.getProductos().filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.PRODUCTOS, list);
    GymDataStore.addAuditoria("ADMIN", "PRODUCTO_DELETE", "productos", `Producto eliminado: ${id}`);
    return list;
  },

  getVentas(): VentaPOS[] {
    return getStorage<VentaPOS[]>(STORAGE_KEYS.VENTAS, INITIAL_VENTAS);
  },
  registrarVenta(venta: Omit<VentaPOS, "id" | "folio" | "fecha_hora">): VentaPOS {
    const list = GymDataStore.getVentas();
    const folio = `POS-2026-${String(list.length + 101).padStart(5, "0")}`;
    const newVenta: VentaPOS = {
      ...venta,
      id: `v-${Date.now()}`,
      folio,
      fecha_hora: new Date().toISOString(),
    };
    const updated = [newVenta, ...list];
    setStorage(STORAGE_KEYS.VENTAS, updated);

    // Descontar stock de productos
    const prods = GymDataStore.getProductos();
    venta.items.forEach((item) => {
      const p = prods.find((x) => x.id === item.producto_id);
      if (p) {
        p.stock_actual = Math.max(0, p.stock_actual - item.cantidad);
      }
    });
    setStorage(STORAGE_KEYS.PRODUCTOS, prods);

    // Actualizar arqueo de caja
    const caja = GymDataStore.getCaja();
    if (caja.estado === "ABIERTA") {
      caja.total_ventas += newVenta.total;
      caja.ventas_count += 1;
      setStorage(STORAGE_KEYS.CAJA, caja);
    }

    GymDataStore.addAuditoria("RECEPCION", "VENTA_POS", "ventas_pos", `Venta registrada ${folio} por Q ${newVenta.total.toFixed(2)} (${newVenta.metodo_pago})`);
    return newVenta;
  },

  getCaja(): CajaTurno {
    return getStorage<CajaTurno>(STORAGE_KEYS.CAJA, INITIAL_CAJA);
  },
  abrirCaja(montoInicial: number, cajero: string): CajaTurno {
    const caja: CajaTurno = {
      id: `turno-${Date.now()}`,
      fecha_apertura: new Date().toISOString(),
      monto_inicial: montoInicial,
      total_ventas: 0,
      ventas_count: 0,
      estado: "ABIERTA",
      cajero,
    };
    setStorage(STORAGE_KEYS.CAJA, caja);
    GymDataStore.addAuditoria("RECEPCION", "APERTURA_CAJA", "caja_turnos", `Apertura con fondo de Q ${montoInicial.toFixed(2)}`);
    return caja;
  },
  cerrarCaja(montoFinal: number): CajaTurno {
    const caja = GymDataStore.getCaja();
    caja.estado = "CERRADA";
    caja.fecha_cierre = new Date().toISOString();
    caja.monto_cierre = montoFinal;
    setStorage(STORAGE_KEYS.CAJA, caja);
    GymDataStore.addAuditoria("RECEPCION", "CIERRE_CAJA", "caja_turnos", `Cierre de caja. Arqueo declarado: Q ${montoFinal.toFixed(2)} | Ventas registradas: Q ${caja.total_ventas.toFixed(2)}`);
    return caja;
  },

  getAuditoria(): RegistroAuditoria[] {
    return getStorage<RegistroAuditoria[]>(STORAGE_KEYS.AUDITORIA, INITIAL_AUDITORIA);
  },
  addAuditoria(rol: Role, accion: string, tabla: string, detalle: string): void {
    const list = getStorage<RegistroAuditoria[]>(STORAGE_KEYS.AUDITORIA, INITIAL_AUDITORIA);
    const item: RegistroAuditoria = {
      id: `aud-${Date.now()}`,
      fecha_hora: new Date().toISOString(),
      usuario: `Usuario (${rol})`,
      rol,
      accion,
      tabla,
      detalle,
    };
    setStorage(STORAGE_KEYS.AUDITORIA, [item, ...list].slice(0, 100));
  },

  getUsuarios(): UsuarioSistema[] {
    return getStorage<UsuarioSistema[]>(STORAGE_KEYS.USUARIOS, INITIAL_USUARIOS);
  },
  saveUsuario(usr: UsuarioSistema): UsuarioSistema[] {
    const list = GymDataStore.getUsuarios();
    const idx = list.findIndex((u) => u.id === usr.id);
    let updated: UsuarioSistema[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = usr;
    } else {
      updated = [{ ...usr, id: usr.id || `usr-${Date.now()}` }, ...list];
    }
    setStorage(STORAGE_KEYS.USUARIOS, updated);
    GymDataStore.addAuditoria("ADMIN", "USUARIO_UPDATE", "profiles", `Usuario actualizado: ${usr.email} con rol ${usr.rol}`);
    return updated;
  },
};

export const productImageMap: Record<string, string> = {
  protein,
  drink,
  bar,
  gear,
};
