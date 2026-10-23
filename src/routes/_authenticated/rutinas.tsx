import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Dumbbell,
  Activity,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  Search,
  User,
  HeartPulse,
  Flame,
  CheckCircle2,
  Scale,
  Clock,
  Repeat,
  Layers,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { ReportButtons } from "@/components/ReportButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { allow } from "@/lib/guard";
import { pageHead } from "@/lib/meta";
import { todayISO } from "@/lib/gym";
import { SociosStore, type SocioRecord } from "@/lib/sociosSeed";
import {
  RutinasStore,
  BIBLIOTECA_EJERCICIOS,
  type RutinaItem,
  type EvaluacionFisica,
  type EjercicioBiblioteca,
} from "@/lib/rutinasData";

export const Route = createFileRoute("/_authenticated/rutinas")({
  beforeLoad: allow(["ADMIN", "ENTRENADOR"]),
  validateSearch: (s: Record<string, unknown>): { socio?: string } => ({
    socio: typeof s.socio === "string" ? s.socio : undefined,
  }),
  head: () =>
    pageHead(
      "Rutinas & Evaluaciones Físicas — IronCore",
      "Planificación de entrenamiento personalizado, ficha antropométrica en libras y seguimiento de atletas en Guatemala."
    ),
  component: RutinasPage,
});

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

function RutinasPage() {
  const search = Route.useSearch();
  const [socios, setSocios] = useState<SocioRecord[]>(() => SociosStore.getAll());
  const [selectedSocioId, setSelectedSocioId] = useState<string>(() => {
    if (search.socio) return search.socio;
    const all = SociosStore.getAll();
    return all[0]?.id || "soc-1";
  });

  const [searchSocioTerm, setSearchSocioTerm] = useState("");
  const [rutinas, setRutinas] = useState<RutinaItem[]>(() => RutinasStore.getRutinas());
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionFisica[]>(() => RutinasStore.getEvaluaciones());

  // Listen to storage changes to keep synced
  useEffect(() => {
    const handleStorage = () => {
      setSocios(SociosStore.getAll());
      setRutinas(RutinasStore.getRutinas());
      setEvaluaciones(RutinasStore.getEvaluaciones());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const currentSocio = useMemo(() => {
    return socios.find((s) => s.id === selectedSocioId) || socios[0];
  }, [socios, selectedSocioId]);

  // Rutinas and evaluaciones for selected member
  const socioRutinas = useMemo(() => {
    if (!currentSocio) return [];
    return rutinas.filter((r) => r.socio_id === currentSocio.id);
  }, [rutinas, currentSocio]);

  const socioEvaluaciones = useMemo(() => {
    if (!currentSocio) return [];
    return evaluaciones
      .filter((e) => e.socio_id === currentSocio.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [evaluaciones, currentSocio]);

  const ultimaEvaluacion = socioEvaluaciones[0];
  const penultimaEvaluacion = socioEvaluaciones[1];

  // Group rutinas by day
  const rutinasPorDia = useMemo(() => {
    const map: Record<string, RutinaItem[]> = {};
    for (const d of DIAS_SEMANA) {
      map[d] = socioRutinas.filter((r) => r.dia === d);
    }
    return map;
  }, [socioRutinas]);

  // Filtered socios for dropdown / search
  const filteredSocios = useMemo(() => {
    if (!searchSocioTerm.trim()) return socios;
    const t = searchSocioTerm.toLowerCase();
    return socios.filter(
      (s) =>
        s.nombres.toLowerCase().includes(t) ||
        s.apellidos.toLowerCase().includes(t) ||
        s.codigo_socio.toLowerCase().includes(t) ||
        s.dni.includes(t)
    );
  }, [socios, searchSocioTerm]);

  // Modal: Agregar / Editar Rutina
  const [rutinaModalOpen, setRutinaModalOpen] = useState(false);
  const [editingRutinaId, setEditingRutinaId] = useState<string | null>(null);
  const [rutinaForm, setRutinaForm] = useState({
    dia: "Lunes" as RutinaItem["dia"],
    fase: "Fuerza Principal" as RutinaItem["fase"],
    grupo_muscular: "Pecho & Tríceps",
    ejercicio: "",
    series: 4,
    repeticiones: "10-12",
    carga_lb: "",
    descanso_seg: 90,
    notas: "",
  });

  // Modal: Nueva Evaluación
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalForm, setEvalForm] = useState({
    fecha: todayISO(),
    peso: 180,
    grasa_pct: 15.0,
    masa_muscular: 100.0,
    pecho: 105,
    cintura: 85,
    cadera: 100,
    brazo: 39,
    pierna: 60,
    evaluador: "Coach Principal",
    notas: "",
  });

  // Library search and filter
  const [libGrupo, setLibGrupo] = useState("TODOS");
  const [libSearch, setLibSearch] = useState("");

  const ejerciciosFiltrados = useMemo(() => {
    return BIBLIOTECA_EJERCICIOS.filter((ej) => {
      const matchGrupo = libGrupo === "TODOS" || ej.grupo.toLowerCase().includes(libGrupo.toLowerCase());
      const matchSearch =
        !libSearch.trim() ||
        ej.nombre.toLowerCase().includes(libSearch.toLowerCase()) ||
        ej.equipo.toLowerCase().includes(libSearch.toLowerCase());
      return matchGrupo && matchSearch;
    });
  }, [libGrupo, libSearch]);

  // Handlers for rutinas
  const handleOpenAddRutina = (presetDia?: RutinaItem["dia"], presetGrupo?: string) => {
    setEditingRutinaId(null);
    setRutinaForm({
      dia: presetDia || "Lunes",
      fase: "Fuerza Principal",
      grupo_muscular: presetGrupo || "Pecho & Tríceps",
      ejercicio: "",
      series: 4,
      repeticiones: "10-12",
      carga_lb: "",
      descanso_seg: 90,
      notas: "",
    });
    setRutinaModalOpen(true);
  };

  const handleOpenEditRutina = (item: RutinaItem) => {
    setEditingRutinaId(item.id);
    setRutinaForm({
      dia: item.dia,
      fase: item.fase,
      grupo_muscular: item.grupo_muscular,
      ejercicio: item.ejercicio,
      series: item.series,
      repeticiones: item.repeticiones,
      carga_lb: item.carga_lb ? String(item.carga_lb) : "",
      descanso_seg: item.descanso_seg,
      notas: item.notas || "",
    });
    setRutinaModalOpen(true);
  };

  const handleSaveRutina = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSocio) return;
    if (!rutinaForm.ejercicio.trim()) {
      toast.error("Por favor ingresa el nombre del ejercicio");
      return;
    }

    if (editingRutinaId) {
      RutinasStore.updateRutina(editingRutinaId, {
        ...rutinaForm,
        socio_id: currentSocio.id,
      });
      toast.success("Ejercicio actualizado correctamente");
    } else {
      RutinasStore.addRutina({
        ...rutinaForm,
        socio_id: currentSocio.id,
      });
      toast.success("Ejercicio añadido a la rutina");
    }

    setRutinas(RutinasStore.getRutinas());
    setRutinaModalOpen(false);
  };

  const handleDeleteRutina = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar "${nombre}" de la rutina?`)) {
      RutinasStore.deleteRutina(id);
      setRutinas(RutinasStore.getRutinas());
      toast.success("Ejercicio eliminado");
    }
  };

  const handleAplicarPlantilla = (tipo: "hipertrofia" | "fuerza" | "definicion") => {
    if (!currentSocio) return;
    const nombreTipo =
      tipo === "hipertrofia" ? "Hipertrofia Push-Pull" : tipo === "definicion" ? "Definición & HIIT" : "Fuerza 5x5";

    if (confirm(`¿Deseas aplicar la plantilla de "${nombreTipo}" para ${currentSocio.nombres}?`)) {
      RutinasStore.aplicarPlantilla(currentSocio.id, tipo);
      setRutinas(RutinasStore.getRutinas());
      toast.success(`Plantilla "${nombreTipo}" asignada a ${currentSocio.nombres}`);
    }
  };

  // Handlers for evaluaciones
  const handleOpenAddEval = () => {
    setEvalForm({
      fecha: todayISO(),
      peso: ultimaEvaluacion ? ultimaEvaluacion.peso : 180,
      grasa_pct: ultimaEvaluacion ? ultimaEvaluacion.grasa_pct : 15.0,
      masa_muscular: ultimaEvaluacion ? ultimaEvaluacion.masa_muscular : 100.0,
      pecho: ultimaEvaluacion ? ultimaEvaluacion.pecho : 105,
      cintura: ultimaEvaluacion ? ultimaEvaluacion.cintura : 85,
      cadera: ultimaEvaluacion ? ultimaEvaluacion.cadera : 100,
      brazo: ultimaEvaluacion ? ultimaEvaluacion.brazo : 39,
      pierna: ultimaEvaluacion ? ultimaEvaluacion.pierna : 60,
      evaluador: "Coach Responsable",
      notas: "",
    });
    setEvalModalOpen(true);
  };

  const handleSaveEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSocio) return;

    RutinasStore.addEvaluacion({
      ...evalForm,
      socio_id: currentSocio.id,
      peso: Number(evalForm.peso),
      grasa_pct: Number(evalForm.grasa_pct),
      masa_muscular: Number(evalForm.masa_muscular),
      pecho: Number(evalForm.pecho),
      cintura: Number(evalForm.cintura),
      cadera: Number(evalForm.cadera),
      brazo: Number(evalForm.brazo),
      pierna: Number(evalForm.pierna),
    });

    setEvaluaciones(RutinasStore.getEvaluaciones());
    setEvalModalOpen(false);
    toast.success("Nueva evaluación antropométrica registrada");
  };

  const handleDeleteEval = (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este registro de evaluación?")) {
      RutinasStore.deleteEvaluacion(id);
      setEvaluaciones(RutinasStore.getEvaluaciones());
      toast.success("Evaluación eliminada");
    }
  };

  const handleAsignarDesdeBiblioteca = (ej: EjercicioBiblioteca) => {
    if (!currentSocio) return;
    setRutinaForm({
      dia: "Lunes",
      fase: "Fuerza Principal",
      grupo_muscular: ej.grupo,
      ejercicio: ej.nombre,
      series: 4,
      repeticiones: "10-12",
      carga_lb: "",
      descanso_seg: 90,
      notas: `Equipo: ${ej.equipo}. Nivel: ${ej.dificultad}.`,
    });
    setEditingRutinaId(null);
    setRutinaModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 1. Header con botones de reporte */}
      <PageHeader
        title="Rutinas & Evaluaciones Físicas"
        subtitle="Diseño de programas de entrenamiento, mediciones antropométricas y evolución de los socios en Guatemala."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => handleOpenAddRutina()} className="gap-2 shadow-sm">
            <Plus className="size-4" /> Agregar Ejercicio
          </Button>
          <Button variant="outline" onClick={handleOpenAddEval} className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
            <Scale className="size-4" /> Nueva Medición
          </Button>
        </div>
      </PageHeader>

      {/* 2. Barra de Selección de Socio y Tarjeta de Perfil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector de Socio */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="size-4 text-primary" /> Seleccionar Atleta / Socio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrar por nombre o DPI..."
                className="pl-9 text-xs"
                value={searchSocioTerm}
                onChange={(e) => setSearchSocioTerm(e.target.value)}
              />
            </div>

            <div className="max-h-[170px] overflow-y-auto space-y-1 pr-1">
              {filteredSocios.map((s) => {
                const isSelected = s.id === currentSocio?.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSocioId(s.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="truncate">
                      <p className="truncate">{s.nombres} {s.apellidos}</p>
                      <p className={`text-[10px] ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        DPI: {s.dni}
                      </p>
                    </div>
                    <Badge variant={isSelected ? "secondary" : "outline"} className="text-[10px] font-mono shrink-0 ml-2">
                      {s.codigo_socio}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ficha Rápida del Atleta Seleccionado */}
        {currentSocio && (
          <Card className="lg:col-span-2 border bg-card/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-3">
                  {currentSocio.foto_url ? (
                    <img
                      src={currentSocio.foto_url}
                      alt={currentSocio.nombres}
                      className="size-14 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="size-14 rounded-full bg-primary/20 text-primary grid place-items-center font-bold text-lg">
                      {currentSocio.nombres[0]}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{currentSocio.nombres} {currentSocio.apellidos}</h2>
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                        {currentSocio.suscripciones?.[0]?.planes_membresia?.nombre || "Membresía Activa"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Código: <span className="font-mono font-bold text-foreground">{currentSocio.codigo_socio}</span> · 
                      DPI: <span className="font-mono text-foreground">{currentSocio.dni}</span> · 
                      Tel: <span className="text-foreground">{currentSocio.telefono}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={currentSocio.activo ? "default" : "destructive"} className="text-xs">
                    {currentSocio.activo ? "Atleta Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              {/* Indicadores Físicos Actuales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="p-2.5 rounded-lg border bg-background/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Peso Actual</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <p className="text-lg font-bold font-mono text-primary">
                      {ultimaEvaluacion ? `${ultimaEvaluacion.peso} lb` : "182.0 lb"}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      ({ultimaEvaluacion ? (ultimaEvaluacion.peso / 2.20462).toFixed(1) : "82.5"} kg)
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border bg-background/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">% Grasa Corporal</span>
                  <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {ultimaEvaluacion ? `${ultimaEvaluacion.grasa_pct}%` : "14.2%"}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border bg-background/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Masa Muscular</span>
                  <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {ultimaEvaluacion ? `${ultimaEvaluacion.masa_muscular} lb` : "102.5 lb"}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border bg-background/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Ejercicios en Plan</span>
                  <p className="text-lg font-bold font-mono text-primary mt-0.5">
                    {socioRutinas.length} asignados
                  </p>
                </div>
              </div>

              {currentSocio.notas_medicas && (
                <div className="mt-3 text-xs bg-muted/60 p-2 rounded-md text-muted-foreground">
                  <span className="font-semibold text-foreground">Ficha médica / Observaciones:</span> {currentSocio.notas_medicas}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 3. Pestañas Principales: Rutinas, Evaluaciones y Biblioteca */}
      <Tabs defaultValue="rutinas" className="space-y-6">
        <TabsList className="bg-card border flex flex-wrap w-full max-w-xl justify-start h-auto p-1 gap-1">
          <TabsTrigger value="rutinas" className="gap-2">
            <Dumbbell className="size-4" /> Plan de Rutinas ({socioRutinas.length})
          </TabsTrigger>
          <TabsTrigger value="evaluaciones" className="gap-2">
            <Activity className="size-4" /> Evaluaciones Físicas ({socioEvaluaciones.length})
          </TabsTrigger>
          <TabsTrigger value="biblioteca" className="gap-2">
            <Layers className="size-4" /> Biblioteca del Gimnasio
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* PESTAÑA 1: PLAN DE RUTINAS */}
        {/* ============================================================ */}
        <TabsContent value="rutinas" className="space-y-6">
          {/* Barra de utilidades y plantillas rápidas */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Plantillas Predefinidas para {currentSocio?.nombres}
              </h3>
              <p className="text-xs text-muted-foreground">
                Carga un programa completo de entrenamiento estructurado en un solo clic
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAplicarPlantilla("hipertrofia")}
                className="text-xs gap-1 border-primary/30 hover:bg-primary/10"
              >
                <Flame className="size-3.5 text-primary" /> Hipertrofia (Push-Pull)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAplicarPlantilla("definicion")}
                className="text-xs gap-1"
              >
                <TrendingDown className="size-3.5 text-amber-500" /> Definición & HIIT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAplicarPlantilla("fuerza")}
                className="text-xs gap-1"
              >
                <Dumbbell className="size-3.5 text-blue-500" /> Fuerza 5x5
              </Button>
            </div>
          </div>

          {/* Exportación de la rutina */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Distribución Semanal de Ejercicios</h3>
            <ReportButtons
              title={`Rutina de Entrenamiento - ${currentSocio?.nombres} ${currentSocio?.apellidos}`}
              headers={["Día", "Fase", "Grupo Muscular", "Ejercicio", "Series", "Repeticiones", "Carga (lb)", "Descanso (seg)", "Notas"]}
              rows={socioRutinas.map((r) => [
                r.dia,
                r.fase,
                r.grupo_muscular,
                r.ejercicio,
                r.series,
                r.repeticiones,
                r.carga_lb || "P. Corporal",
                `${r.descanso_seg}s`,
                r.notas || "-",
              ])}
            />
          </div>

          {/* Cuadrícula de días de la semana */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {DIAS_SEMANA.map((dia) => {
              const items = rutinasPorDia[dia] || [];
              const isRestDay = items.length === 0;

              return (
                <Card key={dia} className={`border transition-all ${isRestDay ? "bg-card/40 border-dashed" : "bg-card shadow-sm"}`}>
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Calendar className="size-4 text-primary" /> {dia}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground">
                        {isRestDay ? "Día de descanso o cardio libre" : `${items.length} ejercicio(s) programado(s)`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAddRutina(dia)}
                      className="size-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full"
                      title={`Agregar ejercicio al ${dia}`}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3">
                    {isRestDay ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <HeartPulse className="size-8 mx-auto opacity-30 mb-1" />
                        <p className="text-xs">Sin ejercicios programados</p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleOpenAddRutina(dia)}
                          className="text-xs text-primary p-0 h-auto mt-1"
                        >
                          + Asignar rutina a este día
                        </Button>
                      </div>
                    ) : (
                      items.map((ej) => (
                        <div
                          key={ej.id}
                          className="group relative rounded-lg border bg-background/60 p-3 hover:border-primary/50 transition-colors space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <Badge variant="outline" className="text-[10px] font-medium py-0 px-1.5 bg-primary/5 border-primary/20 text-primary">
                                  {ej.fase}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground font-medium">
                                  {ej.grupo_muscular}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-foreground leading-tight">{ej.ejercicio}</h4>
                            </div>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditRutina(ej)}
                                className="size-7 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRutina(ej.id, ej.ejercicio)}
                                className="size-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1 pt-1 border-t text-[11px] font-mono">
                            <div className="flex items-center gap-1">
                              <Repeat className="size-3 text-muted-foreground" />
                              <span>{ej.series} × {ej.repeticiones}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Scale className="size-3 text-muted-foreground" />
                              <span className="truncate">{ej.carga_lb || "P. Corp."}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-3 text-muted-foreground" />
                              <span>{ej.descanso_seg}s</span>
                            </div>
                          </div>

                          {ej.notas && (
                            <p className="text-[10px] text-muted-foreground bg-muted/40 p-1.5 rounded italic">
                              "{ej.notas}"
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* PESTAÑA 2: EVALUACIONES ANTROPOMÉTRICAS */}
        {/* ============================================================ */}
        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Historial Antropométrico & Composición Corporal</h3>
              <p className="text-xs text-muted-foreground">
                Monitoreo de peso en Libras (lb), grasa y circunferencias corporales en centímetros (cm)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleOpenAddEval} className="gap-2 shadow-sm">
                <Plus className="size-4" /> Registrar Medición
              </Button>
              <ReportButtons
                title={`Evaluaciones Antropométricas - ${currentSocio?.nombres} ${currentSocio?.apellidos}`}
                headers={[
                  "Fecha",
                  "Peso (lb)",
                  "Grasa (%)",
                  "Masa Muscular (lb)",
                  "Pecho (cm)",
                  "Cintura (cm)",
                  "Cadera (cm)",
                  "Brazo (cm)",
                  "Pierna (cm)",
                  "Evaluador",
                ]}
                rows={socioEvaluaciones.map((e) => [
                  new Date(e.fecha).toLocaleDateString("es-GT"),
                  `${e.peso} lb`,
                  `${e.grasa_pct}%`,
                  `${e.masa_muscular} lb`,
                  `${e.pecho} cm`,
                  `${e.cintura} cm`,
                  `${e.cadera} cm`,
                  `${e.brazo} cm`,
                  `${e.pierna} cm`,
                  e.evaluador,
                ])}
              />
            </div>
          </div>

          {/* Comparativa última medición vs anterior */}
          {ultimaEvaluacion && penultimaEvaluacion && (
            <Card className="border bg-gradient-to-r from-primary/10 via-card to-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Evolución de Rendimiento</span>
                  <p className="text-sm text-foreground mt-0.5">
                    Variación entre {new Date(penultimaEvaluacion.fecha).toLocaleDateString("es-GT")} y {new Date(ultimaEvaluacion.fecha).toLocaleDateString("es-GT")}:
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 bg-background p-2 rounded-md border">
                    <span>Peso:</span>
                    <span className="font-bold">
                      {(ultimaEvaluacion.peso - penultimaEvaluacion.peso).toFixed(1)} lb
                    </span>
                    {ultimaEvaluacion.peso < penultimaEvaluacion.peso ? (
                      <TrendingDown className="size-4 text-emerald-500" />
                    ) : (
                      <TrendingUp className="size-4 text-amber-500" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 bg-background p-2 rounded-md border">
                    <span>Grasa:</span>
                    <span className="font-bold">
                      {(ultimaEvaluacion.grasa_pct - penultimaEvaluacion.grasa_pct).toFixed(1)}%
                    </span>
                    {ultimaEvaluacion.grasa_pct <= penultimaEvaluacion.grasa_pct ? (
                      <TrendingDown className="size-4 text-emerald-500" />
                    ) : (
                      <TrendingUp className="size-4 text-red-500" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 bg-background p-2 rounded-md border">
                    <span>Músculo:</span>
                    <span className="font-bold text-primary">
                      +{(ultimaEvaluacion.masa_muscular - penultimaEvaluacion.masa_muscular).toFixed(1)} lb
                    </span>
                    <TrendingUp className="size-4 text-primary" />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tabla de Evaluaciones */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted border-b text-muted-foreground font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Peso Corporal</th>
                    <th className="p-3">% Grasa</th>
                    <th className="p-3">Masa Muscular</th>
                    <th className="p-3">Pecho</th>
                    <th className="p-3">Cintura</th>
                    <th className="p-3">Cadera</th>
                    <th className="p-3">Brazo</th>
                    <th className="p-3">Pierna</th>
                    <th className="p-3">Evaluador</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {socioEvaluaciones.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-muted-foreground font-sans">
                        No hay evaluaciones registradas para este atleta. Haz clic en "Registrar Medición".
                      </td>
                    </tr>
                  ) : (
                    socioEvaluaciones.map((ev) => (
                      <tr key={ev.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-semibold text-foreground font-sans">
                          {new Date(ev.fecha).toLocaleDateString("es-GT")}
                        </td>
                        <td className="p-3 font-bold text-primary">
                          {ev.peso} lb <span className="text-[10px] text-muted-foreground">({(ev.peso / 2.20462).toFixed(1)} kg)</span>
                        </td>
                        <td className="p-3">{ev.grasa_pct}%</td>
                        <td className="p-3">{ev.masa_muscular} lb</td>
                        <td className="p-3">{ev.pecho} cm</td>
                        <td className="p-3">{ev.cintura} cm</td>
                        <td className="p-3">{ev.cadera} cm</td>
                        <td className="p-3">{ev.brazo} cm</td>
                        <td className="p-3">{ev.pierna} cm</td>
                        <td className="p-3 font-sans text-muted-foreground">{ev.evaluador}</td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEval(ev.id)}
                            className="size-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* PESTAÑA 3: BIBLIOTECA GENERAL DE EJERCICIOS */}
        {/* ============================================================ */}
        <TabsContent value="biblioteca" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Biblioteca de Ejercicios del Gimnasio</h3>
              <p className="text-xs text-muted-foreground">
                Catálogo técnico de movimientos clasificados por grupo muscular y equipamiento disponible
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar ejercicio o equipo..."
                  className="pl-9 text-xs"
                  value={libSearch}
                  onChange={(e) => setLibSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filtros de grupos musculares */}
          <div className="flex flex-wrap gap-1.5">
            {["TODOS", "Pecho", "Espalda", "Piernas", "Hombros", "Bíceps & Tríceps", "Core & Cardio"].map((grp) => (
              <Button
                key={grp}
                variant={libGrupo === grp ? "default" : "outline"}
                size="sm"
                onClick={() => setLibGrupo(grp)}
                className="text-xs h-7 px-3"
              >
                {grp}
              </Button>
            ))}
          </div>

          {/* Cuadrícula de ejercicios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ejerciciosFiltrados.map((ej) => (
              <Card key={ej.nombre} className="border hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px] font-medium bg-muted">
                      {ej.grupo}
                    </Badge>
                    <span
                      className={`text-[10px] font-bold ${
                        ej.dificultad === "Principiante"
                          ? "text-emerald-500"
                          : ej.dificultad === "Intermedio"
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {ej.dificultad}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-bold leading-snug">{ej.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground mb-3">
                    Equipamiento: <span className="font-semibold text-foreground">{ej.equipo}</span>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAsignarDesdeBiblioteca(ej)}
                    className="w-full text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Plus className="size-3.5" /> Asignar a {currentSocio?.nombres.split(" ")[0]}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ============================================================ */}
      {/* MODAL: AGREGAR / EDITAR EJERCICIO DE RUTINA */}
      {/* ============================================================ */}
      <Dialog open={rutinaModalOpen} onOpenChange={setRutinaModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="size-5 text-primary" />
              {editingRutinaId ? "Modificar Ejercicio" : "Asignar Nuevo Ejercicio"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveRutina} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dia-select" className="text-xs">Día de la semana</Label>
                <select
                  id="dia-select"
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={rutinaForm.dia}
                  onChange={(e) => setRutinaForm({ ...rutinaForm, dia: e.target.value as RutinaItem["dia"] })}
                >
                  {DIAS_SEMANA.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fase-select" className="text-xs">Fase del entrenamiento</Label>
                <select
                  id="fase-select"
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={rutinaForm.fase}
                  onChange={(e) => setRutinaForm({ ...rutinaForm, fase: e.target.value as RutinaItem["fase"] })}
                >
                  <option value="Calentamiento">Calentamiento</option>
                  <option value="Fuerza Principal">Fuerza Principal</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="Cardio / Core">Cardio / Core</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ej-nombre" className="text-xs">Nombre del ejercicio</Label>
              <Input
                id="ej-nombre"
                required
                placeholder="ej. Press de Banca Plano con Barra"
                value={rutinaForm.ejercicio}
                onChange={(e) => setRutinaForm({ ...rutinaForm, ejercicio: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ej-grupo" className="text-xs">Grupo muscular</Label>
              <Input
                id="ej-grupo"
                placeholder="ej. Pecho & Tríceps"
                value={rutinaForm.grupo_muscular}
                onChange={(e) => setRutinaForm({ ...rutinaForm, grupo_muscular: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ej-series" className="text-xs">Series</Label>
                <Input
                  id="ej-series"
                  type="number"
                  min={1}
                  max={20}
                  value={rutinaForm.series}
                  onChange={(e) => setRutinaForm({ ...rutinaForm, series: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ej-reps" className="text-xs">Repeticiones</Label>
                <Input
                  id="ej-reps"
                  placeholder="ej. 8-10"
                  value={rutinaForm.repeticiones}
                  onChange={(e) => setRutinaForm({ ...rutinaForm, repeticiones: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ej-carga" className="text-xs">Carga sugerida</Label>
                <Input
                  id="ej-carga"
                  placeholder="ej. 135 lb"
                  value={rutinaForm.carga_lb}
                  onChange={(e) => setRutinaForm({ ...rutinaForm, carga_lb: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ej-descanso" className="text-xs">Descanso entre series (segundos)</Label>
              <Input
                id="ej-descanso"
                type="number"
                min={0}
                step={15}
                value={rutinaForm.descanso_seg}
                onChange={(e) => setRutinaForm({ ...rutinaForm, descanso_seg: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ej-notas" className="text-xs">Notas técnicas / Indicaciones del Coach</Label>
              <Textarea
                id="ej-notas"
                rows={2}
                placeholder="ej. Pausa de 1 seg en contracción. Cuidar retracción escapular."
                value={rutinaForm.notas}
                onChange={(e) => setRutinaForm({ ...rutinaForm, notas: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setRutinaModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingRutinaId ? "Guardar Cambios" : "Agregar a la Rutina"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* MODAL: NUEVA EVALUACIÓN ANTROPOMÉTRICA */}
      {/* ============================================================ */}
      <Dialog open={evalModalOpen} onOpenChange={setEvalModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="size-5 text-primary" />
              Nueva Medición Antropométrica para {currentSocio?.nombres}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEval} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="eval-fecha" className="text-xs">Fecha de medición</Label>
                <Input
                  id="eval-fecha"
                  type="date"
                  required
                  value={evalForm.fecha}
                  onChange={(e) => setEvalForm({ ...evalForm, fecha: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eval-coach" className="text-xs">Coach Evaluador</Label>
                <Input
                  id="eval-coach"
                  required
                  value={evalForm.evaluador}
                  onChange={(e) => setEvalForm({ ...evalForm, evaluador: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="eval-peso" className="text-xs">Peso (Libras / lb)</Label>
                <Input
                  id="eval-peso"
                  type="number"
                  step="0.1"
                  required
                  value={evalForm.peso}
                  onChange={(e) => setEvalForm({ ...evalForm, peso: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eval-grasa" className="text-xs">% Grasa Corporal</Label>
                <Input
                  id="eval-grasa"
                  type="number"
                  step="0.1"
                  required
                  value={evalForm.grasa_pct}
                  onChange={(e) => setEvalForm({ ...evalForm, grasa_pct: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eval-musculo" className="text-xs">Masa Muscular (lb)</Label>
                <Input
                  id="eval-musculo"
                  type="number"
                  step="0.1"
                  required
                  value={evalForm.masa_muscular}
                  onChange={(e) => setEvalForm({ ...evalForm, masa_muscular: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Perímetros Corporales (Centímetros / cm)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="eval-pecho" className="text-[11px]">Pecho</Label>
                  <Input
                    id="eval-pecho"
                    type="number"
                    step="0.5"
                    value={evalForm.pecho}
                    onChange={(e) => setEvalForm({ ...evalForm, pecho: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="eval-cintura" className="text-[11px]">Cintura</Label>
                  <Input
                    id="eval-cintura"
                    type="number"
                    step="0.5"
                    value={evalForm.cintura}
                    onChange={(e) => setEvalForm({ ...evalForm, cintura: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="eval-cadera" className="text-[11px]">Cadera</Label>
                  <Input
                    id="eval-cadera"
                    type="number"
                    step="0.5"
                    value={evalForm.cadera}
                    onChange={(e) => setEvalForm({ ...evalForm, cadera: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="eval-brazo" className="text-[11px]">Brazo</Label>
                  <Input
                    id="eval-brazo"
                    type="number"
                    step="0.5"
                    value={evalForm.brazo}
                    onChange={(e) => setEvalForm({ ...evalForm, brazo: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="eval-pierna" className="text-[11px]">Muslo</Label>
                  <Input
                    id="eval-pierna"
                    type="number"
                    step="0.5"
                    value={evalForm.pierna}
                    onChange={(e) => setEvalForm({ ...evalForm, pierna: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eval-notas" className="text-xs">Observaciones / Metas para el siguiente mes</Label>
              <Textarea
                id="eval-notas"
                rows={2}
                placeholder="ej. Reducción sostenida de grasa abdominal. Incrementar ingesta proteica."
                value={evalForm.notas}
                onChange={(e) => setEvalForm({ ...evalForm, notas: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEvalModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Evaluación
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
