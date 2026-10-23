// Gestión de Rutinas y Evaluaciones Antropométricas con Persistencia Reactiva

export interface RutinaItem {
  id: string;
  socio_id: string;
  dia: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";
  fase: "Calentamiento" | "Fuerza Principal" | "Accesorios" | "Cardio / Core";
  grupo_muscular: string;
  ejercicio: string;
  series: number;
  repeticiones: string;
  carga_lb?: string | number;
  descanso_seg: number;
  notas?: string;
}

export interface EvaluacionFisica {
  id: string;
  socio_id: string;
  fecha: string;
  peso: number; // Libras (lb)
  grasa_pct: number;
  masa_muscular: number; // Libras (lb)
  pecho: number; // cm
  cintura: number; // cm
  cadera: number; // cm
  brazo: number; // cm
  pierna: number; // cm
  evaluador: string;
  notas?: string;
}

export interface EjercicioBiblioteca {
  nombre: string;
  grupo: string;
  equipo: string;
  dificultad: "Principiante" | "Intermedio" | "Avanzado";
}

export const BIBLIOTECA_EJERCICIOS: EjercicioBiblioteca[] = [
  // Pecho
  { nombre: "Press de Banca Plano con Barra", grupo: "Pecho", equipo: "Barra Olímpica", dificultad: "Intermedio" },
  { nombre: "Press Inclinado con Mancuernas", grupo: "Pecho", equipo: "Mancuernas", dificultad: "Intermedio" },
  { nombre: "Aperturas en Polea (Cruce de Cables)", grupo: "Pecho", equipo: "Poleas", dificultad: "Principiante" },
  { nombre: "Fondos en Paralelas (Dips)", grupo: "Pecho", equipo: "Barras Paralelas", dificultad: "Avanzado" },
  { nombre: "Press en Máquina Hammer", grupo: "Pecho", equipo: "Máquina", dificultad: "Principiante" },

  // Espalda
  { nombre: "Dominadas Pronas (Pull-ups)", grupo: "Espalda", equipo: "Barra Fija", dificultad: "Avanzado" },
  { nombre: "Jalón al Pecho en Polea", grupo: "Espalda", equipo: "Polea Alta", dificultad: "Principiante" },
  { nombre: "Remo con Barra 45°", grupo: "Espalda", equipo: "Barra Olímpica", dificultad: "Intermedio" },
  { nombre: "Remo Unilateral con Mancuerna", grupo: "Espalda", equipo: "Mancuerna", dificultad: "Principiante" },
  { nombre: "Remo en Polea Baja (Gironda)", grupo: "Espalda", equipo: "Polea Baja", dificultad: "Principiante" },

  // Piernas
  { nombre: "Sentadilla Libre Profunda", grupo: "Piernas", equipo: "Barra Olímpica", dificultad: "Avanzado" },
  { nombre: "Prensa Inclinada 45°", grupo: "Piernas", equipo: "Máquina Prensa", dificultad: "Principiante" },
  { nombre: "Peso Muerto Rumano (Isquios)", grupo: "Piernas", equipo: "Barra / Mancuernas", dificultad: "Intermedio" },
  { nombre: "Extensiones de Cuádriceps", grupo: "Piernas", equipo: "Máquina", dificultad: "Principiante" },
  { nombre: "Curl Femoral Tumbado", grupo: "Piernas", equipo: "Máquina", dificultad: "Principiante" },
  { nombre: "Elevación de Talones (Gemelos)", grupo: "Piernas", equipo: "Máquina Smith", dificultad: "Principiante" },

  // Hombros
  { nombre: "Press Militar de Pie con Barra", grupo: "Hombros", equipo: "Barra Olímpica", dificultad: "Avanzado" },
  { nombre: "Press Militar Sentado con Mancuernas", grupo: "Hombros", equipo: "Mancuernas", dificultad: "Intermedio" },
  { nombre: "Elevaciones Laterales con Mancuernas", grupo: "Hombros", equipo: "Mancuernas", dificultad: "Principiante" },
  { nombre: "Face Pulls en Polea con Cuerda", grupo: "Hombros", equipo: "Polea", dificultad: "Principiante" },

  // Brazos
  { nombre: "Curl de Bíceps con Barra Z", grupo: "Bíceps & Tríceps", equipo: "Barra Z", dificultad: "Principiante" },
  { nombre: "Curl Martillo con Mancuernas", grupo: "Bíceps & Tríceps", equipo: "Mancuernas", dificultad: "Principiante" },
  { nombre: "Extensiones de Tríceps en Polea", grupo: "Bíceps & Tríceps", equipo: "Polea Alta", dificultad: "Principiante" },
  { nombre: "Press Francés con Mancuernas", grupo: "Bíceps & Tríceps", equipo: "Mancuernas", dificultad: "Intermedio" },

  // Core & Cardio
  { nombre: "Plancha Abdominal Isométrica", grupo: "Core & Cardio", equipo: "Colchoneta", dificultad: "Principiante" },
  { nombre: "Elevación de Piernas Colgado", grupo: "Core & Cardio", equipo: "Barra Fija", dificultad: "Intermedio" },
  { nombre: "Rueda Abdominal (Ab Wheel)", grupo: "Core & Cardio", equipo: "Rueda", dificultad: "Avanzado" },
  { nombre: "Intervalos HIIT en Caminadora", grupo: "Core & Cardio", equipo: "Caminadora", dificultad: "Intermedio" },
];

const INITIAL_RUTINAS: RutinaItem[] = [
  // Rutina para Carlos Méndez (soc-1) - Hipertrofia Push-Pull-Legs
  {
    id: "rut-1",
    socio_id: "soc-1",
    dia: "Lunes",
    fase: "Fuerza Principal",
    grupo_muscular: "Pecho & Tríceps",
    ejercicio: "Press de Banca Plano con Barra",
    series: 4,
    repeticiones: "8-10",
    carga_lb: "185 lb",
    descanso_seg: 90,
    notas: "Calentar 2 series previas sin fatiga. Pausa controlada en el pecho.",
  },
  {
    id: "rut-2",
    socio_id: "soc-1",
    dia: "Lunes",
    fase: "Accesorios",
    grupo_muscular: "Pecho & Tríceps",
    ejercicio: "Press Inclinado con Mancuernas",
    series: 3,
    repeticiones: "10-12",
    carga_lb: "65 lb c/u",
    descanso_seg: 75,
    notas: "Enfoque en la porción clavicular.",
  },
  {
    id: "rut-3",
    socio_id: "soc-1",
    dia: "Lunes",
    fase: "Accesorios",
    grupo_muscular: "Pecho & Tríceps",
    ejercicio: "Extensiones de Tríceps en Polea con Cuerda",
    series: 4,
    repeticiones: "12-15",
    carga_lb: "45 lb",
    descanso_seg: 60,
    notas: "Bloqueo completo y apertura al final.",
  },
  {
    id: "rut-4",
    socio_id: "soc-1",
    dia: "Miércoles",
    fase: "Fuerza Principal",
    grupo_muscular: "Espalda & Bíceps",
    ejercicio: "Dominadas Pronas (Pull-ups)",
    series: 4,
    repeticiones: "8-10",
    carga_lb: "Peso corporal",
    descanso_seg: 90,
    notas: "Rango de recorrido completo.",
  },
  {
    id: "rut-5",
    socio_id: "soc-1",
    dia: "Miércoles",
    fase: "Accesorios",
    grupo_muscular: "Espalda & Bíceps",
    ejercicio: "Remo con Barra 45°",
    series: 4,
    repeticiones: "10",
    carga_lb: "155 lb",
    descanso_seg: 75,
    notas: "Mantener espalda recta y retracción escapular.",
  },
  {
    id: "rut-6",
    socio_id: "soc-1",
    dia: "Miércoles",
    fase: "Accesorios",
    grupo_muscular: "Espalda & Bíceps",
    ejercicio: "Curl de Bíceps con Barra Z",
    series: 3,
    repeticiones: "12",
    carga_lb: "60 lb",
    descanso_seg: 60,
    notas: "Codos pegados al torso.",
  },
  {
    id: "rut-7",
    socio_id: "soc-1",
    dia: "Viernes",
    fase: "Fuerza Principal",
    grupo_muscular: "Piernas & Hombros",
    ejercicio: "Sentadilla Libre Profunda",
    series: 4,
    repeticiones: "8",
    carga_lb: "225 lb",
    descanso_seg: 120,
    notas: "Cinturón de potencia recomendado.",
  },
  {
    id: "rut-8",
    socio_id: "soc-1",
    dia: "Viernes",
    fase: "Accesorios",
    grupo_muscular: "Piernas & Hombros",
    ejercicio: "Elevaciones Laterales con Mancuernas",
    series: 4,
    repeticiones: "15",
    carga_lb: "25 lb c/u",
    descanso_seg: 60,
    notas: "Control en la fase excéntrica.",
  },

  // Rutina para Valeria Soto (soc-2) - Fortalecimiento & Tonificación
  {
    id: "rut-9",
    socio_id: "soc-2",
    dia: "Martes",
    fase: "Fuerza Principal",
    grupo_muscular: "Piernas & Glúteos",
    ejercicio: "Prensa Inclinada 45°",
    series: 4,
    repeticiones: "12",
    carga_lb: "180 lb",
    descanso_seg: 90,
    notas: "Cuidar flexión de rodilla derecha por recuperación de menisco.",
  },
  {
    id: "rut-10",
    socio_id: "soc-2",
    dia: "Martes",
    fase: "Accesorios",
    grupo_muscular: "Piernas & Glúteos",
    ejercicio: "Peso Muerto Rumano (Isquios)",
    series: 3,
    repeticiones: "12",
    carga_lb: "85 lb",
    descanso_seg: 75,
    notas: "Espalda neutral y estiramiento de isquiotibiales.",
  },
  {
    id: "rut-11",
    socio_id: "soc-2",
    dia: "Jueves",
    fase: "Fuerza Principal",
    grupo_muscular: "Tren Superior & Core",
    ejercicio: "Jalón al Pecho en Polea",
    series: 3,
    repeticiones: "12",
    carga_lb: "70 lb",
    descanso_seg: 60,
    notas: "Postura erguida.",
  },
  {
    id: "rut-12",
    socio_id: "soc-2",
    dia: "Jueves",
    fase: "Cardio / Core",
    grupo_muscular: "Core & Cardio",
    ejercicio: "Plancha Abdominal Isométrica",
    series: 3,
    repeticiones: "45 seg",
    carga_lb: "Peso corporal",
    descanso_seg: 45,
    notas: "Activación abdominal continua.",
  },
];

const INITIAL_EVALUACIONES: EvaluacionFisica[] = [
  // Evaluaciones de Carlos Méndez
  {
    id: "ev-1",
    socio_id: "soc-1",
    fecha: "2026-10-15",
    peso: 182.0, // lb
    grasa_pct: 14.2,
    masa_muscular: 102.5, // lb
    pecho: 108.0,
    cintura: 84.0,
    cadera: 101.0,
    brazo: 40.5,
    pierna: 62.0,
    evaluador: "Coach Roberto Gómez",
    notas: "Notable ganancia de densidad en pectoral y brazos. Continuar ciclo de hipertrofia.",
  },
  {
    id: "ev-2",
    socio_id: "soc-1",
    fecha: "2026-09-15",
    peso: 184.5,
    grasa_pct: 15.6,
    masa_muscular: 100.8,
    pecho: 107.0,
    cintura: 86.0,
    cadera: 102.0,
    brazo: 39.8,
    pierna: 61.5,
    evaluador: "Coach Roberto Gómez",
    notas: "Mejora en resistencia cardiovascular y fuerza en sentadillas.",
  },
  {
    id: "ev-3",
    socio_id: "soc-1",
    fecha: "2026-08-15",
    peso: 187.0,
    grasa_pct: 17.1,
    masa_muscular: 99.0,
    pecho: 105.5,
    cintura: 88.0,
    cadera: 103.0,
    brazo: 39.0,
    pierna: 60.8,
    evaluador: "Coach Roberto Gómez",
    notas: "Evaluación inicial de ingreso. Plan nutricional alto en proteína.",
  },

  // Evaluaciones de Valeria Soto
  {
    id: "ev-4",
    socio_id: "soc-2",
    fecha: "2026-10-10",
    peso: 134.0,
    grasa_pct: 21.5,
    masa_muscular: 74.0,
    pecho: 89.0,
    cintura: 67.0,
    cadera: 96.0,
    brazo: 28.5,
    pierna: 54.0,
    evaluador: "Coach Andrea Morales",
    notas: "Excelente progreso en fuerza de cuadriceps sin dolor articular.",
  },
  {
    id: "ev-5",
    socio_id: "soc-2",
    fecha: "2026-09-08",
    peso: 136.5,
    grasa_pct: 22.8,
    masa_muscular: 72.8,
    pecho: 90.0,
    cintura: 69.0,
    cadera: 97.0,
    brazo: 28.0,
    pierna: 53.5,
    evaluador: "Coach Andrea Morales",
    notas: "Rehabilitación activa de rodilla completada satisfactoriamente.",
  },
];

const STORAGE_RUTINAS = "ironcore_rutinas_data";
const STORAGE_EVALUACIONES = "ironcore_evaluaciones_data";

export const RutinasStore = {
  getRutinas(socioId?: string): RutinaItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_RUTINAS);
      const list: RutinaItem[] = raw ? JSON.parse(raw) : INITIAL_RUTINAS;
      return socioId ? list.filter((r) => r.socio_id === socioId) : list;
    } catch {
      return INITIAL_RUTINAS.filter((r) => !socioId || r.socio_id === socioId);
    }
  },

  saveRutinas(items: RutinaItem[]): void {
    localStorage.setItem(STORAGE_RUTINAS, JSON.stringify(items));
    window.dispatchEvent(new Event("storage"));
  },

  addRutina(item: Omit<RutinaItem, "id">): RutinaItem {
    const all = this.getRutinas();
    const newItem: RutinaItem = {
      ...item,
      id: "rut-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    };
    const updated = [newItem, ...all];
    this.saveRutinas(updated);
    return newItem;
  },

  updateRutina(id: string, patch: Partial<RutinaItem>): void {
    const all = this.getRutinas();
    const updated = all.map((r) => (r.id === id ? { ...r, ...patch } : r));
    this.saveRutinas(updated);
  },

  deleteRutina(id: string): void {
    const all = this.getRutinas();
    const updated = all.filter((r) => r.id !== id);
    this.saveRutinas(updated);
  },

  getEvaluaciones(socioId?: string): EvaluacionFisica[] {
    try {
      const raw = localStorage.getItem(STORAGE_EVALUACIONES);
      const list: EvaluacionFisica[] = raw ? JSON.parse(raw) : INITIAL_EVALUACIONES;
      const sorted = list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      return socioId ? sorted.filter((e) => e.socio_id === socioId) : sorted;
    } catch {
      return INITIAL_EVALUACIONES.filter((e) => !socioId || e.socio_id === socioId);
    }
  },

  saveEvaluaciones(items: EvaluacionFisica[]): void {
    localStorage.setItem(STORAGE_EVALUACIONES, JSON.stringify(items));
    window.dispatchEvent(new Event("storage"));
  },

  addEvaluacion(item: Omit<EvaluacionFisica, "id">): EvaluacionFisica {
    const all = this.getEvaluaciones();
    const newItem: EvaluacionFisica = {
      ...item,
      id: "ev-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    };
    const updated = [newItem, ...all];
    this.saveEvaluaciones(updated);
    return newItem;
  },

  deleteEvaluacion(id: string): void {
    const all = this.getEvaluaciones();
    const updated = all.filter((e) => e.id !== id);
    this.saveEvaluaciones(updated);
  },

  // Genera rutinas predefinidas completas para un socio
  aplicarPlantilla(socioId: string, tipo: "hipertrofia" | "fuerza" | "definicion"): void {
    const existentes = this.getRutinas().filter((r) => r.socio_id !== socioId);
    let nuevos: RutinaItem[] = [];

    if (tipo === "hipertrofia") {
      nuevos = [
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Lunes", fase: "Fuerza Principal", grupo_muscular: "Pecho & Tríceps", ejercicio: "Press de Banca Plano", series: 4, repeticiones: "8-10", carga_lb: "135 lb", descanso_seg: 90, notas: "Fase de volumen." },
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Lunes", fase: "Accesorios", grupo_muscular: "Pecho & Tríceps", ejercicio: "Aperturas con Mancuernas", series: 3, repeticiones: "12", carga_lb: "35 lb", descanso_seg: 60 },
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Miércoles", fase: "Fuerza Principal", grupo_muscular: "Espalda & Bíceps", ejercicio: "Jalón al Pecho en Polea", series: 4, repeticiones: "10-12", carga_lb: "120 lb", descanso_seg: 75 },
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Miércoles", fase: "Accesorios", grupo_muscular: "Espalda & Bíceps", ejercicio: "Curl con Barra Z", series: 3, repeticiones: "12", carga_lb: "50 lb", descanso_seg: 60 },
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Viernes", fase: "Fuerza Principal", grupo_muscular: "Piernas & Hombros", ejercicio: "Prensa Inclinada 45°", series: 4, repeticiones: "10", carga_lb: "250 lb", descanso_seg: 90 },
      ];
    } else if (tipo === "definicion") {
      nuevos = [
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Lunes", fase: "Fuerza Principal", grupo_muscular: "Torso Completo", ejercicio: "Press Plano con Mancuernas", series: 4, repeticiones: "15", carga_lb: "40 lb", descanso_seg: 45 },
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Lunes", fase: "Cardio / Core", grupo_muscular: "Core & Cardio", ejercicio: "Intervalos HIIT en Caminadora", series: 5, repeticiones: "1 min", descanso_seg: 30 },
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Miércoles", fase: "Fuerza Principal", grupo_muscular: "Piernas & Glúteos", ejercicio: "Sentadilla Goblet", series: 4, repeticiones: "15", carga_lb: "45 lb", descanso_seg: 45 },
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Viernes", fase: "Fuerza Principal", grupo_muscular: "Espalda & Hombros", ejercicio: "Remo Gironda en Polea", series: 4, repeticiones: "15", carga_lb: "85 lb", descanso_seg: 45 },
      ];
    } else {
      // Fuerza 5x5
      nuevos = [
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Lunes", fase: "Fuerza Principal", grupo_muscular: "Fuerza Básicos", ejercicio: "Sentadilla Libre Profunda", series: 5, repeticiones: "5", carga_lb: "205 lb", descanso_seg: 180 },
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Lunes", fase: "Fuerza Principal", grupo_muscular: "Fuerza Básicos", ejercicio: "Press de Banca Plano", series: 5, repeticiones: "5", carga_lb: "165 lb", descanso_seg: 180 },
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Miércoles", fase: "Fuerza Principal", grupo_muscular: "Fuerza Básicos", ejercicio: "Peso Muerto Convencional", series: 5, repeticiones: "5", carga_lb: "245 lb", descanso_seg: 180 },
        { id: "rut-tpl-" + Math.random(), socio_id: socioId, dia: "Viernes", fase: "Fuerza Principal", grupo_muscular: "Fuerza Básicos", ejercicio: "Press Militar con Barra", series: 5, repeticiones: "5", carga_lb: "115 lb", descanso_seg: 180 },
      ];
    }

    this.saveRutinas([...nuevos, ...existentes]);
  },
};
