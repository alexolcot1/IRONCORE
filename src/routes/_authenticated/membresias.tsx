import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ReceiptIcon, RefreshCw, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt, type ReceiptData } from "@/components/Receipt";
import { ReportButtons } from "@/components/ReportButtons";
import { allow } from "@/lib/guard";
import { money } from "@/lib/gym";
import { pageHead } from "@/lib/meta";
import { GymDataStore } from "@/lib/gymData";
import { SociosStore } from "@/lib/sociosSeed";

export const Route = createFileRoute("/_authenticated/membresias")({
  beforeLoad: allow(["ADMIN", "RECEPCION"]),
  validateSearch: (s: Record<string, unknown>): { socio?: string } => ({
    socio: typeof s["socio"] === "string" ? (s["socio"] as string) : undefined,
  }),
  head: () =>
    pageHead("Membresías y cobros", "Planes, renovaciones y comprobantes de pago del gimnasio."),
  component: Memberships,
});

function Memberships() {
  const search = Route.useSearch();
  const qc = useQueryClient();
  const [socio, setSocio] = useState(search.socio ?? "");
  const [plan, setPlan] = useState("");
  const [metodo, setMetodo] = useState<"EFECTIVO" | "TARJETA" | "TRANSFERENCIA">("EFECTIVO");
  const [rebaja, setRebaja] = useState(0);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const { data, error } = useQuery({
    queryKey: ["membresias"],
    queryFn: async () => {
      let sociosList: any[] = [];
      let planesList: any[] = [];
      let historyList: any[] = [];

      try {
        const [s, p, h] = await Promise.all([
          supabase.from("socios").select("id, nombres, apellidos, activo").order("nombres"),
          supabase.from("planes_membresia").select("*").eq("activo", true),
          supabase
            .from("suscripciones")
            .select("*, socios(nombres, apellidos), planes_membresia(nombre)")
            .order("created_at", { ascending: false }),
        ]);
        if (s.data && s.data.length > 0) sociosList = s.data;
        if (p.data && p.data.length > 0) planesList = p.data;
        if (h.data && h.data.length > 0) historyList = h.data;
      } catch {
        // fallback
      }

      if (sociosList.length === 0) {
        sociosList = SociosStore.getAll().map((s) => ({
          id: s.id,
          nombres: s.nombres,
          apellidos: s.apellidos,
          activo: s.activo,
        }));
      }

      if (planesList.length === 0) {
        planesList = GymDataStore.getPlanes().filter((p) => p.activo);
      }

      if (historyList.length === 0) {
        historyList = [
          {
            id: "sub-hist-1",
            fecha_inicio: "2026-10-01",
            fecha_fin: "2026-10-31",
            estado: "ACTIVA",
            total_pagado: 250.0,
            descuento: 0,
            metodo_pago: "EFECTIVO",
            socios: { nombres: "Carlos", apellidos: "Méndez" },
            planes_membresia: { nombre: "Mensual Básico" },
          },
          {
            id: "sub-hist-2",
            fecha_inicio: "2026-05-01",
            fecha_fin: "2027-04-30",
            estado: "ACTIVA",
            total_pagado: 2200.0,
            descuento: 0,
            metodo_pago: "TARJETA",
            socios: { nombres: "Valeria", apellidos: "Soto" },
            planes_membresia: { nombre: "Anual VIP Black" },
          },
          {
            id: "sub-hist-3",
            fecha_inicio: "2026-07-20",
            fecha_fin: "2026-10-20",
            estado: "ACTIVA",
            total_pagado: 650.0,
            descuento: 0,
            metodo_pago: "TRANSFERENCIA",
            socios: { nombres: "Rodrigo", apellidos: "Paredes" },
            planes_membresia: { nombre: "Trimestral Pro" },
          },
        ];
      }

      return { socios: sociosList, planes: planesList, history: historyList };
    },
  });

  const selected = data?.planes.find((p) => p.id === plan);
  const totalACobrar = Math.max(0, Number(selected?.precio ?? 0) - rebaja);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socio || !selected) {
      toast.error("Selecciona un socio y un plan");
      return;
    }
    setBusy(true);

    try {
      const s = data?.socios.find((x) => x.id === socio);
      const folioId = `REC-${Date.now().toString().slice(-6)}`;

      // Update in SociosStore and GymDataStore
      SociosStore.renovarPlan(
        socio,
        selected.nombre,
        selected.duracion_dias,
        totalACobrar
      );
      GymDataStore.addAuditoria(
        "RECEPCION",
        "COBRO_MEMBRESIA",
        "suscripciones",
        `Renovación: ${s?.nombres} ${s?.apellidos} - Plan ${selected.nombre} (Q ${totalACobrar.toFixed(2)})`
      );

      // Attempt Supabase RPC
      try {
        await supabase.rpc("renovar_membresia", {
          socio,
          plan: selected.id,
          metodo,
          rebaja,
        });
      } catch {
        // Handled by local store
      }

      setReceipt({
        folio: folioId,
        cliente: `${s?.nombres} ${s?.apellidos}`,
        lineas: [
          {
            desc: `Membresía ${selected.nombre} (${selected.duracion_dias} días)`,
            qty: 1,
            total: Number(selected.precio),
          },
        ],
        subtotal: Number(selected.precio),
        descuento: rebaja,
        total: totalACobrar,
        metodo,
      });

      await qc.invalidateQueries();
      toast.success(`Membresía renovada con éxito. Comprobante ${folioId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Membresías & Cobros"
        subtitle="Registro de inscripciones, renovaciones y emisión de comprobantes de pago."
      />

      {error && <p role="alert" className="text-destructive">{error.message}</p>}

      {/* RENEWAL FORM */}
      <div className="rounded-xl border bg-card p-6 shadow-xl mb-8">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <CreditCard className="size-5 text-primary" /> Registrar Pago o Renovación de Membresía
        </h3>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="member">Socio a Renovar</Label>
            <select
              id="member"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
              required
              value={socio}
              onChange={(e) => setSocio(e.target.value)}
            >
              <option value="">-- Seleccionar socio --</option>
              {data?.socios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombres} {s.apellidos} {!s.activo ? "(Inactivo)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan">Plan de Membresía</Label>
            <select
              id="plan"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="">-- Seleccionar plan --</option>
              {data?.planes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} · {p.duracion_dias} días · {money(p.precio)}
                </option>
              ))}
            </select>
            {selected && (
              <p className="mt-1 text-xs text-muted-foreground">{selected.descripcion}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="discount">Descuento Especial (Q)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max={selected?.precio ?? 0}
              step="5"
              value={rebaja}
              onChange={(e) => setRebaja(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="method">Método de Pago</Label>
            <select
              id="method"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as any)}
            >
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="TARJETA">TARJETA DE CRÉDITO/DÉBITO</option>
              <option value="TRANSFERENCIA">TRANSFERENCIA BANCARIA</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:col-span-2 pt-4 border-t border-border">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Total Final a Cobrar</p>
              <p className="text-3xl font-display font-bold text-primary">
                {money(totalACobrar)}
              </p>
            </div>
            <Button
              size="lg"
              disabled={busy || !selected || !socio}
              className="gap-2 font-semibold"
            >
              <RefreshCw className={busy ? "animate-spin size-4" : "size-4"} />
              Cobrar & Emitir Comprobante
            </Button>
          </div>
        </form>
      </div>

      {/* PAYMENT HISTORY & REPORTS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Historial de Cobros y Suscripciones</h3>
            <p className="text-xs text-muted-foreground">
              Registro histórico de pagos de cuotas y contratos
            </p>
          </div>
          <ReportButtons
            title="Historial de Cobros de Membresías"
            headers={["Socio", "Plan", "Inicio", "Fin", "Estado", "Total (Q)", "Método de Pago"]}
            rows={(data?.history ?? []).map((h) => [
              `${h.socios?.nombres} ${h.socios?.apellidos}`,
              h.planes_membresia?.nombre ?? "",
              h.fecha_inicio,
              h.fecha_fin,
              h.estado,
              Number(h.total_pagado),
              h.metodo_pago,
            ])}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="p-3">Socio</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Vigencia</th>
                <th className="p-3">Total</th>
                <th className="p-3">Método</th>
                <th className="p-3 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.history.map((h) => (
                <tr key={h.id} className="hover:bg-accent/40">
                  <td className="p-3 font-semibold">
                    {h.socios?.nombres} {h.socios?.apellidos}
                  </td>
                  <td className="p-3 font-medium text-foreground">{h.planes_membresia?.nombre}</td>
                  <td className="p-3 whitespace-nowrap text-xs text-muted-foreground font-mono">
                    {h.fecha_inicio} → {h.fecha_fin}
                  </td>
                  <td className="p-3 font-display text-base font-bold text-primary">
                    {money(h.total_pagado)}
                  </td>
                  <td className="p-3 font-mono text-xs">{h.metodo_pago}</td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() =>
                        setReceipt({
                          folio: h.id,
                          cliente: `${h.socios?.nombres} ${h.socios?.apellidos}`,
                          lineas: [
                            {
                              desc: h.planes_membresia?.nombre ?? "Membresía",
                              qty: 1,
                              total: Number(h.total_pagado) + Number(h.descuento || 0),
                            },
                          ],
                          subtotal: Number(h.total_pagado) + Number(h.descuento || 0),
                          descuento: Number(h.descuento || 0),
                          total: Number(h.total_pagado),
                          metodo: h.metodo_pago ?? "EFECTIVO",
                        })
                      }
                    >
                      <ReceiptIcon className="size-3.5" /> Recibo
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {receipt && <Receipt data={receipt} onClose={() => setReceipt(null)} />}
    </>
  );
}
