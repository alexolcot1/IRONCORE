import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, DoorOpen, ScanLine, Search, XCircle, History } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { ReportButtons } from "@/components/ReportButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { allow } from "@/lib/guard";
import { beep, socioStatus } from "@/lib/gym";
import { SociosStore } from "@/lib/sociosSeed";
import { GymDataStore } from "@/lib/gymData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/acceso")({
  beforeLoad: allow(["ADMIN", "RECEPCION"]),
  head: () => ({
    meta: [
      { title: "Control de acceso — IronCore" },
      { name: "description", content: "Terminal de check-in y torniquete." },
    ],
  }),
  component: Acceso,
});

interface Result {
  ok: boolean;
  nombre: string;
  foto?: string | null | undefined;
  plan?: string | undefined;
  dias?: number | undefined;
  motivo?: string | undefined;
  codigo?: string;
}

interface LogAcceso {
  id: string;
  fecha_hora: string;
  codigo: string;
  nombre: string;
  estado: "PERMITIDO" | "DENEGADO";
  motivo: string;
}

const INITIAL_LOGS: LogAcceso[] = [
  { id: "log-1", fecha_hora: new Date(Date.now() - 3600000 * 2).toISOString(), codigo: "IC-100001", nombre: "Carlos Méndez", estado: "PERMITIDO", motivo: "Membresía Activa (22 días)" },
  { id: "log-2", fecha_hora: new Date(Date.now() - 3600000 * 3).toISOString(), codigo: "IC-100002", nombre: "Valeria Soto", estado: "PERMITIDO", motivo: "Membresía Activa (180 días)" },
  { id: "log-3", fecha_hora: new Date(Date.now() - 3600000 * 4).toISOString(), codigo: "IC-100007", nombre: "Elena Castillo", estado: "DENEGADO", motivo: "Membresía vencida" },
];

function Acceso() {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<LogAcceso[]>(() => {
    try {
      const stored = localStorage.getItem("gymflow_access_logs");
      return stored ? JSON.parse(stored) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);

  function saveLog(entry: LogAcceso) {
    setLogs((prev) => {
      const updated = [entry, ...prev].slice(0, 50);
      try {
        localStorage.setItem("gymflow_access_logs", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }

  async function check(codeToCheck?: string) {
    const term = (codeToCheck || q).trim();
    if (!term) return;
    setBusy(true);

    let socio: any = null;
    try {
      const { data } = await supabase
        .from("socios")
        .select("*, suscripciones(id, socio_id, fecha_fin, estado, plan_id, planes_membresia(nombre))")
        .or(`codigo_socio.eq.${term},dni.eq.${term},qr_code.eq.${term}`)
        .maybeSingle();
      socio = data;
    } catch {
      // Supabase RLS / network
    }

    if (!socio) {
      const localSocios = SociosStore.getAll();
      socio = localSocios.find(
        (s) =>
          s.codigo_socio.toLowerCase() === term.toLowerCase() ||
          s.dni === term ||
          s.qr_code.toLowerCase() === term.toLowerCase()
      );
    }

    setBusy(false);
    setQ("");

    if (!socio) {
      setRes({ ok: false, nombre: "No encontrado", motivo: "Código, DPI o QR no registrado" });
      beep(false);
      saveLog({
        id: `acc-${Date.now()}`,
        fecha_hora: new Date().toISOString(),
        codigo: term,
        nombre: "Desconocido",
        estado: "DENEGADO",
        motivo: "Código o DPI no registrado",
      });
      return;
    }

    const st = socioStatus(socio.activo, socio.suscripciones);
    const ok = st.status === "ACTIVO" || st.status === "POR_VENCER";
    const motivo = !socio.activo
      ? "Socio inactivo / dado de baja"
      : !ok
      ? "Membresía vencida"
      : undefined;

    try {
      await supabase.from("registros_acceso").insert({
        socio_id: socio.id,
        estado: ok ? "PERMITIDO" : "DENEGADO",
        motivo_denegado: motivo ?? null,
      });
    } catch {
      // fallback
    }

    GymDataStore.addAuditoria(
      "RECEPCION",
      ok ? "ACCESO_PERMITIDO" : "ACCESO_DENEGADO",
      "registros_acceso",
      `Torniquete: ${socio.nombres} ${socio.apellidos} (${socio.codigo_socio}) - ${ok ? "Aprobado" : motivo}`
    );

    saveLog({
      id: `acc-${Date.now()}`,
      fecha_hora: new Date().toISOString(),
      codigo: socio.codigo_socio,
      nombre: `${socio.nombres} ${socio.apellidos}`,
      estado: ok ? "PERMITIDO" : "DENEGADO",
      motivo: ok ? `Plan ${st.sub?.planes_membresia?.nombre ?? "Activo"}` : motivo || "Denegado",
    });

    setRes({
      ok,
      nombre: `${socio.nombres} ${socio.apellidos}`,
      foto: socio.foto_url,
      plan: st.sub?.planes_membresia?.nombre,
      dias: st.days,
      motivo,
      codigo: socio.codigo_socio,
    });

    beep(ok);
    if (ok) openGate();
  }

  function openGate() {
    setOpen(true);
    setTimeout(() => setOpen(false), 3000);
  }

  return (
    <>
      <PageHeader title="Terminal de acceso" subtitle="Escanea código QR, tarjeta o ingresa DPI (Guatemala)">
        <Button
          variant="promo"
          onClick={() => {
            openGate();
            beep(true);
            toast.success("Torniquete abierto manualmente");
            GymDataStore.addAuditoria("RECEPCION", "APERTURA_MANUAL", "registros_acceso", "Apertura manual desde recepción");
          }}
        >
          <DoorOpen /> Apertura manual
        </Button>
      </PageHeader>

      {/* SEARCH FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
        className="mx-auto mb-4 flex max-w-2xl gap-2"
      >
        <div className="relative flex-1">
          <ScanLine className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-primary" />
          <Input
            ref={ref}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Escribe código (IC-100001) o DPI..."
            className="h-14 pl-11 font-mono text-lg focus-visible:ring-primary"
          />
        </div>
        <Button className="h-14 px-6" disabled={busy}>
          <Search /> Validar
        </Button>
      </form>

      {/* Quick Test Chips */}
      <div className="mx-auto mb-8 flex flex-wrap items-center justify-center gap-2 max-w-2xl text-xs">
        <span className="text-muted-foreground">Prueba rápida:</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-success/40 text-success hover:bg-success/10 font-mono text-xs h-7 px-2"
          onClick={() => check("IC-100001")}
        >
          IC-100001 (Activo)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-warning/40 text-warning hover:bg-warning/10 font-mono text-xs h-7 px-2"
          onClick={() => check("IC-100003")}
        >
          IC-100003 (Por vencer)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-destructive/40 text-destructive hover:bg-destructive/10 font-mono text-xs h-7 px-2"
          onClick={() => check("IC-100007")}
        >
          IC-100007 (Vencido)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-border text-muted-foreground hover:bg-muted font-mono text-xs h-7 px-2"
          onClick={() => check("IC-100009")}
        >
          IC-100009 (Inactivo)
        </Button>
      </div>

      {/* SEMAFORO CARD */}
      <div
        className={cn(
          "mx-auto grid max-w-2xl place-items-center rounded-2xl border-2 p-8 text-center transition-all duration-500 md:p-12",
          !res && "border-dashed",
          res?.ok && "border-success bg-success/10 glow-success",
          res && !res.ok && "border-destructive bg-destructive/10 glow-danger"
        )}
      >
        {!res ? (
          <div className="py-10 text-muted-foreground">
            <ScanLine className="mx-auto mb-4 size-16 animate-pulse text-primary" />
            <p className="font-display text-xl">Esperando lectura…</p>
            <p className="mt-2 text-sm">Escanea con lector láser o presiona un socio de prueba arriba</p>
          </div>
        ) : (
          <div className="animate-in zoom-in-95">
            {res.ok ? (
              <CheckCircle2 className="mx-auto size-16 text-success" />
            ) : (
              <XCircle className="mx-auto size-16 text-destructive" />
            )}
            <p
              className={cn(
                "mt-2 font-display text-4xl font-bold md:text-5xl",
                res.ok ? "text-success" : "text-destructive"
              )}
            >
              {res.ok ? "Acceso aprobado" : "Acceso denegado"}
            </p>
            {res.foto && (
              <img
                src={res.foto}
                alt=""
                className={cn(
                  "mx-auto mt-6 size-32 rounded-full border-4 object-cover shadow-xl",
                  res.ok ? "border-success" : "border-destructive"
                )}
              />
            )}
            <p className="mt-4 text-2xl font-semibold">{res.nombre}</p>
            {res.codigo && <p className="font-mono text-sm text-muted-foreground">{res.codigo}</p>}
            {res.ok ? (
              <div className="mt-4 flex justify-center gap-6">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Plan Vigente</p>
                  <p className="font-semibold">{res.plan || "Pase General"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Días restantes</p>
                  <p
                    className={cn(
                      "font-display text-2xl font-bold",
                      (res.dias ?? 0) <= 7 ? "text-warning" : "text-success"
                    )}
                  >
                    {res.dias}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-md bg-destructive/20 px-4 py-2 font-semibold text-destructive">
                {res.motivo}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Torniquete State */}
      <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-3 text-sm">
        <span
          className={cn(
            "size-3 rounded-full transition-colors",
            open ? "bg-success glow-success" : "bg-destructive"
          )}
        />
        Torniquete Físico:{" "}
        <b className={open ? "text-success" : "text-muted-foreground"}>
          {open ? "ABIERTO" : "CERRADO"}
        </b>
      </div>

      {/* ACCESS LOG TABLE WITH REPORT EXPORT */}
      <div className="mx-auto mt-12 max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            <h3 className="font-bold text-base">Historial de Accesos al Torniquete</h3>
          </div>
          <ReportButtons
            title="Historial de Accesos"
            headers={["Fecha y Hora", "Código", "Nombre", "Estado", "Motivo"]}
            rows={logs.map((l) => [
              new Date(l.fecha_hora).toLocaleString("es"),
              l.codigo,
              l.nombre,
              l.estado,
              l.motivo,
            ])}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">Código</th>
                <th className="p-3">Socio</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-accent/40">
                  <td className="p-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {new Date(l.fecha_hora).toLocaleString("es")}
                  </td>
                  <td className="p-3 font-mono text-xs">{l.codigo}</td>
                  <td className="p-3 font-medium">{l.nombre}</td>
                  <td className="p-3">
                    <Badge
                      variant={l.estado === "PERMITIDO" ? "default" : "destructive"}
                      className={cn(
                        "text-xs",
                        l.estado === "PERMITIDO" && "bg-success text-success-foreground"
                      )}
                    >
                      {l.estado}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{l.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
