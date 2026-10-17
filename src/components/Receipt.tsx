import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { money } from "@/lib/gym";

export type ReceiptData = {
  folio: string;
  cliente?: string;
  lineas: { desc: string; qty: number; total: number }[];
  subtotal: number;
  descuento?: number;
  impuesto?: number;
  total: number;
  metodo: string;
  recibido?: number;
  cambio?: number;
  fecha?: string;
};

export function Receipt({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Comprobante</DialogTitle></DialogHeader>
        <div className="print-area rounded-md bg-foreground p-5 font-mono text-xs text-background">
          <p className="text-center text-base font-bold">IRONCORE FITNESS GUATEMALA</p>
          <p className="text-center text-[10px] text-background/80">NIT: 9845210-3 · Ciudad de Guatemala</p>
          <p className="text-center text-[11px] font-semibold mt-1">Comprobante de Pago (FEL)</p>
          <p className="mt-2">Folio: {data.folio}</p>
          <p>Fecha: {data.fecha || new Date().toLocaleString("es-GT")}</p>
          {data.cliente && <p>Cliente / NIT: {data.cliente}</p>}
          <div className="my-2 border-t border-dashed border-background" />
          {data.lineas.map((l, i) => (
            <div key={i} className="flex justify-between"><span>{l.qty}x {l.desc}</span><span>{money(l.total)}</span></div>
          ))}
          <div className="my-2 border-t border-dashed border-background" />
          <Row k="Subtotal" v={data.subtotal} />
          {!!data.descuento && <Row k="Descuento" v={-data.descuento} />}
          {data.impuesto !== undefined && <Row k="IVA (12%)" v={data.impuesto} />}
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-background/40"><span>TOTAL</span><span>{money(data.total)}</span></div>
          <p className="mt-1">Forma de pago: {data.metodo}</p>
          {data.recibido !== undefined && <><Row k="Efectivo recibido" v={data.recibido} /><Row k="Cambio" v={data.cambio ?? 0} /></>}
          <p className="mt-3 text-center text-[10px]">Documento Tributario Electrónico - SAT Guatemala</p>
          <p className="mt-1 text-center font-bold">¡Gracias por entrenar con nosotros!</p>
        </div>
        <Button onClick={() => window.print()}><Printer /> Imprimir / Exportar PDF</Button>
      </DialogContent>
    </Dialog>
  );
}
function Row({ k, v }: { k: string; v: number }) {
  return <div className="flex justify-between"><span>{k}</span><span>{money(v)}</span></div>;
}
