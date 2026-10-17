export interface SocioRecord {
  id: string;
  codigo_socio: string;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  foto_url: string | null;
  qr_code: string;
  contacto_emergencia: string | null;
  notas_medicas: string | null;
  alergias?: string | null;
  observaciones?: string | null;
  activo: boolean;
  created_at: string;
  suscripciones: {
    id: string;
    socio_id: string;
    fecha_fin: string;
    fecha_inicio: string;
    estado: string;
    plan_id: string;
    total_pagado: number;
    planes_membresia: { nombre: string } | null;
  }[];
}

const STORAGE_KEY = "gymflow_socios_data";

export const INITIAL_SOCIOS: SocioRecord[] = [
  {
    id: "soc-1",
    codigo_socio: "IC-100001",
    nombres: "Carlos",
    apellidos: "Méndez Rivera",
    dni: "2485 91823 0101",
    telefono: "+502 5412 8765",
    email: "carlos.mendez@gmail.com",
    foto_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    qr_code: "IC-100001",
    contacto_emergencia: "Ana Méndez (Hermana) +502 5988 7766",
    notas_medicas: "Apto para ejercicio de alta intensidad. Ligero dolor lumbar en sentadillas pesadas.",
    alergias: "Ninguna",
    observaciones: "Asiste en turno matutino (6:30 AM). Zona 10, Ciudad de Guatemala.",
    activo: true,
    created_at: "2026-01-10T10:00:00Z",
    suscripciones: [
      {
        id: "sub-1",
        socio_id: "soc-1",
        fecha_inicio: "2026-10-01",
        fecha_fin: "2026-10-31",
        estado: "ACTIVA",
        plan_id: "plan-2",
        total_pagado: 250.0,
        planes_membresia: { nombre: "Mensual Básico" },
      },
    ],
  },
  {
    id: "soc-2",
    codigo_socio: "IC-100002",
    nombres: "Valeria",
    apellidos: "Soto Morales",
    dni: "1982 74321 0101",
    telefono: "+502 4123 9876",
    email: "valeria.soto@outlook.com",
    foto_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    qr_code: "IC-100002",
    contacto_emergencia: "Javier Soto (Padre) +502 5322 1100",
    notas_medicas: "Hiperlaxitud articular leve en rodilla derecha. Realiza fortalecimiento.",
    alergias: "Penicilina",
    observaciones: "Entrena con preparador físico en Zona 14.",
    activo: true,
    created_at: "2026-02-14T11:30:00Z",
    suscripciones: [
      {
        id: "sub-2",
        socio_id: "soc-2",
        fecha_inicio: "2026-05-01",
        fecha_fin: "2027-04-30",
        estado: "ACTIVA",
        plan_id: "plan-4",
        total_pagado: 2200.0,
        planes_membresia: { nombre: "Anual VIP Black" },
      },
    ],
  },
  {
    id: "soc-3",
    codigo_socio: "IC-100003",
    nombres: "Rodrigo",
    apellidos: "Paredes Luna",
    dni: "3012 45678 0108",
    telefono: "+502 5987 3412",
    email: "rodrigo.paredes@yahoo.com",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    qr_code: "IC-100003",
    contacto_emergencia: "Laura Luna +502 5455 6677",
    notas_medicas: "Sin padecimientos crónicos. Peso 78 kg (172 lb).",
    alergias: "Ninguna conocida",
    observaciones: "Membresía por vencer en 4 días.",
    activo: true,
    created_at: "2026-03-01T09:15:00Z",
    suscripciones: [
      {
        id: "sub-3",
        socio_id: "soc-3",
        fecha_inicio: "2026-07-20",
        fecha_fin: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
        estado: "ACTIVA",
        plan_id: "plan-3",
        total_pagado: 650.0,
        planes_membresia: { nombre: "Trimestral Pro" },
      },
    ],
  },
  {
    id: "soc-4",
    codigo_socio: "IC-100007",
    nombres: "Elena",
    apellidos: "Castillo Peña",
    dni: "2741 85296 0101",
    telefono: "+502 4567 1234",
    email: "elena.castillo@gmail.com",
    foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    qr_code: "IC-100007",
    contacto_emergencia: "Marcos Peña +502 5788 9900",
    notas_medicas: "Control de asma por esfuerzo. Lleva inhalador.",
    alergias: "Polvo",
    observaciones: "Cuota mensual vencida hace 5 días. Pendiente de pago.",
    activo: true,
    created_at: "2026-03-12T16:00:00Z",
    suscripciones: [
      {
        id: "sub-4",
        socio_id: "soc-4",
        fecha_inicio: "2026-09-10",
        fecha_fin: "2026-10-10",
        estado: "VENCIDA",
        plan_id: "plan-2",
        total_pagado: 250.0,
        planes_membresia: { nombre: "Mensual Básico" },
      },
    ],
  },
  {
    id: "soc-5",
    codigo_socio: "IC-100009",
    nombres: "Andrés",
    apellidos: "Morales Vega",
    dni: "1854 96325 0101",
    telefono: "+502 5123 4567",
    email: "andres.morales@hotmail.com",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    qr_code: "IC-100009",
    contacto_emergencia: "Silvia Vega +502 5677 8899",
    notas_medicas: "Lesión de manguito rotador derecho en recuperación.",
    alergias: "Ninguna",
    observaciones: "Socio dado de baja voluntaria por viaje a Quetzaltenango.",
    activo: false,
    created_at: "2026-04-05T14:20:00Z",
    suscripciones: [],
  },
  {
    id: "soc-6",
    codigo_socio: "IC-100012",
    nombres: "Mariana",
    apellidos: "Ruiz Vargas",
    dni: "3125 78945 0101",
    telefono: "+502 4789 6541",
    email: "mariana.ruiz@gmail.com",
    foto_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    qr_code: "IC-100012",
    contacto_emergencia: "David Ruiz +502 5899 0011",
    notas_medicas: "Excelente condición física general. Peso 62 kg (136.6 lb).",
    alergias: "Ninguna",
    observaciones: "Pase diario para entrenamiento funcional.",
    activo: true,
    created_at: "2026-10-16T08:00:00Z",
    suscripciones: [
      {
        id: "sub-6",
        socio_id: "soc-6",
        fecha_inicio: new Date().toISOString().slice(0, 10),
        fecha_fin: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        estado: "ACTIVA",
        plan_id: "plan-1",
        total_pagado: 40.0,
        planes_membresia: { nombre: "Pase Diario" },
      },
    ],
  },
];

export const SociosStore = {
  getAll(): SocioRecord[] {
    if (typeof window === "undefined") return INITIAL_SOCIOS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SOCIOS));
        return INITIAL_SOCIOS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_SOCIOS;
    }
  },

  save(socio: Partial<SocioRecord>): SocioRecord {
    const list = SociosStore.getAll();
    let result: SocioRecord;
    const now = new Date().toISOString();

    if (socio.id) {
      const idx = list.findIndex((s) => s.id === socio.id);
      if (idx >= 0) {
        result = {
          ...list[idx]!,
          ...socio,
          nombres: socio.nombres || list[idx]!.nombres,
          apellidos: socio.apellidos || list[idx]!.apellidos,
          dni: socio.dni || list[idx]!.dni,
          telefono: socio.telefono || list[idx]!.telefono,
          email: socio.email || list[idx]!.email,
          qr_code: socio.qr_code || list[idx]!.qr_code,
        };
        list[idx] = result;
      } else {
        result = socio as SocioRecord;
        list.unshift(result);
      }
    } else {
      const nextCode = `IC-${String(100000 + list.length + 1).slice(1)}`;
      result = {
        id: `soc-${Date.now()}`,
        codigo_socio: socio.codigo_socio || nextCode,
        nombres: socio.nombres || "",
        apellidos: socio.apellidos || "",
        dni: socio.dni || "",
        telefono: socio.telefono || "",
        email: socio.email || "",
        foto_url: socio.foto_url || null,
        qr_code: socio.qr_code || nextCode,
        contacto_emergencia: socio.contacto_emergencia || null,
        notas_medicas: socio.notas_medicas || null,
        alergias: socio.alergias || null,
        observaciones: socio.observaciones || null,
        activo: true,
        created_at: now,
        suscripciones: socio.suscripciones || [],
      };
      list.unshift(result);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
    return result;
  },

  toggleActivo(id: string): boolean {
    const list = SociosStore.getAll();
    const socio = list.find((s) => s.id === id);
    if (!socio) return false;
    socio.activo = !socio.activo;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
    return socio.activo;
  },

  renovarPlan(socioId: string, planNombre: string, dias: number, precio: number): void {
    const list = SociosStore.getAll();
    const socio = list.find((s) => s.id === socioId);
    if (!socio) return;
    const inicio = new Date().toISOString().slice(0, 10);
    const fin = new Date(Date.now() + dias * 86400000).toISOString().slice(0, 10);
    socio.activo = true;
    socio.suscripciones = [
      {
        id: `sub-${Date.now()}`,
        socio_id: socioId,
        fecha_inicio: inicio,
        fecha_fin: fin,
        estado: "ACTIVA",
        plan_id: `plan-${dias}`,
        total_pagado: precio,
        planes_membresia: { nombre: planNombre },
      },
      ...socio.suscripciones,
    ];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  },
};
