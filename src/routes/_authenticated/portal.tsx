import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { DataTools } from "@/components/DataTools";
import { socioStatus, statusStyle } from "@/lib/gym";
import { SociosStore } from "@/lib/sociosSeed";
import { cn } from "@/lib/utils";
import { allow } from "@/lib/guard";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/portal")({
  beforeLoad: allow(["SOCIO"]),
  head: () =>
    pageHead("Mi portal", "Membresía, QR de acceso, rutinas y progreso personal."),
  component: Portal,
});

const DEFAULT_RUTINAS = [
  { id: "r-1", dia: "Lunes (Día A)", grupo_muscular: "Pecho & Tríceps", ejercicio: "Press de Banca Plano", series: 4, repeticiones: "8-10", descanso_seg: 90 },
  { id: "r-2", dia: "Lunes (Día A)", grupo_muscular: "Pecho & Tríceps", ejercicio: "Aperturas con Mancuernas", series: 3, repeticiones: "12", descanso_seg: 60 },
  { id: "r-3", dia: "Lunes (Día A)", grupo_muscular: "Pecho & Tríceps", ejercicio: "Fondos en Paralelas", series: 3, repeticiones: "10-12", descanso_seg: 60 },
  { id: "r-4", dia: "Miércoles (Día B)", grupo_muscular: "Espalda & Bíceps", ejercicio: "Dominadas Lastradas", series: 4, repeticiones: "6-8", descanso_seg: 90 },
  { id: "r-5", dia: "Miércoles (Día B)", grupo_muscular: "Espalda & Bíceps", ejercicio: "Remo con Barra 45°", series: 4, repeticiones: "10", descanso_seg: 75 },
  { id: "r-6", dia: "Viernes (Día C)", grupo_muscular: "Pierna & Hombro", ejercicio: "Sentadilla Libre Profunda", series: 4, repeticiones: "8", descanso_seg: 120 },
];

const DEFAULT_EVALUACIONES = [
  { id: "ev-1", fecha: "2026-10-10", peso: 168.5, grasa_pct: 14.2, masa_muscular: 92.8, pecho: 104, cintura: 81, cadera: 98, brazo: 38, pierna: 59 },
  { id: "ev-2", fecha: "2026-09-10", peso: 171.5, grasa_pct: 15.6, masa_muscular: 91.5, pecho: 103, cintura: 83, cadera: 99, brazo: 37.5, pierna: 58.5 },
  { id: "ev-3", fecha: "2026-08-10", peso: 174.6, grasa_pct: 17.1, masa_muscular: 89.9, pecho: 102, cintura: 85, cadera: 100, brazo: 37, pierna: 58 },
];

function Portal() {
  const { user } = Route.useRouteContext();
  const { data, error, isLoading } = useQuery({
    queryKey: ["portal", user.id],
    queryFn: async () => {
      let socioData: any = null;
      let rutinasData: any[] = [];
      let evalData: any[] = [];
      let accesoData: any[] = [];

      try {
        const s = await supabase
          .from("socios")
          .select("*, suscripciones(*, planes_membresia(nombre))")
          .eq("profile_id", user.id)
          .maybeSingle();
        if (s.data) socioData = s.data;
      } catch {
        // fallback
      }

      if (!socioData) {
        const localList = SociosStore.getAll();
        socioData = localList[0]; // Default demo socio
      }

      if (socioData) {
        try {
          const [r, e, a] = await Promise.all([
            supabase.from("rutinas").select("*").eq("socio_id", socioData.id),
            supabase.from("evaluaciones").select("*").eq("socio_id", socioData.id).order("fecha", { ascending: false }),
            supabase.from("registros_acceso").select("*").eq("socio_id", socioData.id).order("fecha_hora", { ascending: false }).limit(20),
          ]);
          if (r.data && r.data.length > 0) rutinasData = r.data;
          if (e.data && e.data.length > 0) evalData = e.data;
          if (a.data && a.data.length > 0) accesoData = a.data;
        } catch {
          // fallback
        }

        if (rutinasData.length === 0) rutinasData = DEFAULT_RUTINAS;
        if (evalData.length === 0) evalData = DEFAULT_EVALUACIONES;
        if (accesoData.length === 0) {
          accesoData = [
            { id: "a-1", fecha_hora: new Date(Date.now() - 3600000 * 4).toISOString(), estado: "PERMITIDO" },
            { id: "a-2", fecha_hora: new Date(Date.now() - 86400000).toISOString(), estado: "PERMITIDO" },
            { id: "a-3", fecha_hora: new Date(Date.now() - 86400000 * 2).toISOString(), estado: "PERMITIDO" },
          ];
        }
      }

      return { s: socioData, r: rutinasData, e: evalData, a: accesoData };
    },
  });

  if (isLoading) return <p className="p-6 text-muted-foreground">Cargando portal del socio…</p>;
  if (error) return <p role="alert" className="text-destructive">{error.message}</p>;
  if (!data || !data.s) {
    return (
      <>
        <PageHeader title="Mi portal" />
        <p className="text-muted-foreground">
          Tu cuenta aún no tiene un expediente vinculado. Solicita a recepción vincular tu correo.
        </p>
      </>
    );
  }

  const st = socioStatus(data.s.activo, data.s.suscripciones);

  return (
    <>
      <PageHeader
        title={`Bienvenido, ${data.s.nombres} ${data.s.apellidos}`}
        subtitle={`Socio ID: ${data.s.codigo_socio} · DPI: ${data.s.dni}`}
      />

      {/* Member Banner Card */}
      <div className="mb-8 flex flex-col md:flex-row items-center gap-6 rounded-2xl border bg-card p-6 shadow-xl">
        <div className="rounded-xl bg-foreground p-3 shadow-md shrink-0">
          <QRCode value={data.s.qr_code} size={140} />
          <p className="mt-1 text-center font-mono text-[10px] text-background font-bold">
            {data.s.codigo_socio}
          </p>
        </div>

        <div className="space-y-3 flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className={cn("rounded-md border px-3 py-1 text-xs font-semibold", statusStyle[st.status].cls)}>
              {statusStyle[st.status].label}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              QR de Entrada al Torniquete
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-display text-primary">
            {st.sub?.planes_membresia?.nombre ?? "Membresía Mensual Activa"}
          </h2>

          <p className="text-sm text-muted-foreground">
            {st.sub
              ? `Vigente hasta el ${st.sub.fecha_fin} · Te quedan ${st.days} días de entrenamiento`
              : "Acércate a recepción para renovar tu membresía."}
          </p>
        </div>
      </div>

      {/* Data sections */}
      <div className="space-y-8">
        <DataTools
          title="Mi Rutina de Entrenamiento"
          fields={[
            { key: "dia", label: "Día" },
            { key: "grupo_muscular", label: "Grupo Muscular" },
            { key: "ejercicio", label: "Ejercicio" },
            { key: "series", label: "Series" },
            { key: "repeticiones", label: "Reps" },
            { key: "descanso_seg", label: "Descanso (seg)" },
          ]}
          rows={data.r}
        />

        <DataTools
          title="Mi Evolución Corporal"
          fields={[
            { key: "fecha", label: "Fecha" },
            { key: "peso", label: "Peso (libras / lb)" },
            { key: "grasa_pct", label: "Grasa (%)" },
            { key: "masa_muscular", label: "Músculo (lb)" },
            { key: "pecho", label: "Pecho (cm)" },
            { key: "cintura", label: "Cintura (cm)" },
            { key: "brazo", label: "Brazo (cm)" },
          ]}
          rows={data.e}
        />

        <DataTools
          title="Mis Pagos y Suscripciones"
          fields={[
            { key: "fecha_inicio", label: "Fecha Inicio" },
            { key: "fecha_fin", label: "Fecha Vencimiento" },
            { key: "total_pagado", label: "Total Pagado (Q)" },
            { key: "metodo_pago", label: "Método de Pago" },
            { key: "estado", label: "Estado" },
          ]}
          rows={data.s.suscripciones}
        />

        <DataTools
          title="Historial de Check-in & Accesos"
          fields={[
            { key: "fecha_hora", label: "Fecha y Hora" },
            { key: "estado", label: "Resultado del Torniquete" },
          ]}
          rows={data.a}
        />
      </div>
    </>
  );
}
