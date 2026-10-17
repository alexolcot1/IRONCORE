import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Receipt as ReceiptIcon,
  DollarSign,
  PackageCheck,
  AlertTriangle,
  History,
  Store,
  Printer,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { ReportButtons } from "@/components/ReportButtons";
import { Receipt, type ReceiptData } from "@/components/Receipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { allow } from "@/lib/guard";
import { beep, money } from "@/lib/gym";
import { GymDataStore, productImageMap, type Producto, type VentaPOS, type CajaTurno } from "@/lib/gymData";
import { SociosStore } from "@/lib/sociosSeed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pos")({
  beforeLoad: allow(["ADMIN", "RECEPCION"]),
  validateSearch: (s: Record<string, unknown>): { socio?: string } => ({
    socio: typeof s["socio"] === "string" ? (s["socio"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Tienda POS — IronCore" },
      { name: "description", content: "Punto de venta e inventario del gimnasio." },
    ],
  }),
  component: PosPage,
});

interface CartItem {
  producto: Producto;
  cantidad: number;
}

function PosPage() {
  const [productos, setProductos] = useState<Producto[]>(() => GymDataStore.getProductos());
  const [ventas, setVentas] = useState<VentaPOS[]>(() => GymDataStore.getVentas());
  const [caja, setCaja] = useState<CajaTurno>(() => GymDataStore.getCaja());
  const socios = useMemo(() => SociosStore.getAll(), []);

  // Filter & Search
  const [selectedCat, setSelectedCat] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSocioId, setSelectedSocioId] = useState<string>("");

  // Modals
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "TARJETA" | "TRANSFERENCIA">("EFECTIVO");
  const [montoRecibido, setMontoRecibido] = useState<string>("");
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);

  // Arqueo Modal
  const [cajaModalOpen, setCajaModalOpen] = useState(false);
  const [montoInicialInput, setMontoInicialInput] = useState<string>("500.00");
  const [montoFinalInput, setMontoFinalInput] = useState<string>("");

  const categories = ["TODOS", "Suplementos", "Bebidas", "Snacks", "Accesorios"];

  const filteredProductos = useMemo(() => {
    return productos.filter((p) => {
      const matchCat = selectedCat === "TODOS" || p.categoria === selectedCat;
      const matchSearch =
        !searchQuery ||
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.codigo_barras.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [productos, selectedCat, searchQuery]);

  // Calculations
  const config = GymDataStore.getConfig();
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.producto.precio_venta * item.cantidad, 0);
  }, [cart]);

  const taxRate = (config.iva_pct ?? 12) / 100;
  const impuesto = subtotal * taxRate;
  const total = subtotal + impuesto;

  const recibidoNum = parseFloat(montoRecibido) || 0;
  const cambio = Math.max(0, recibidoNum - total);
  const saldoFaltante = Math.max(0, total - recibidoNum);

  // Cart operations
  const addToCart = (prod: Producto) => {
    if (prod.stock_actual <= 0) {
      toast.error(`Sin existencias de ${prod.nombre}`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id === prod.id);
      if (existing) {
        if (existing.cantidad >= prod.stock_actual) {
          toast.warning(`Stock máximo disponible alcanzado (${prod.stock_actual})`);
          return prev;
        }
        return prev.map((item) =>
          item.producto.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { producto: prod, cantidad: 1 }];
    });
    toast.success(`Agregado: ${prod.nombre}`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.producto.id === id) {
            const nextQty = item.cantidad + delta;
            if (nextQty > item.producto.stock_actual) {
              toast.warning(`No hay más stock disponible de ${item.producto.nombre}`);
              return item;
            }
            return { ...item, cantidad: nextQty };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedSocioId("");
    setMontoRecibido("");
  };

  // Process Sale
  const handleConfirmSale = () => {
    if (cart.length === 0) return;

    if (metodoPago === "EFECTIVO" && recibidoNum < total) {
      toast.error("El monto en efectivo recibido es menor al total a pagar");
      return;
    }

    const socio = socios.find((s) => s.id === selectedSocioId);
    const socioNombre = socio ? `${socio.nombres} ${socio.apellidos}` : "Cliente Mostrador";

    const nuevaVenta = GymDataStore.registrarVenta({
      socio_id: selectedSocioId || null,
      socio_nombre: socioNombre,
      items: cart.map((i) => ({
        producto_id: i.producto.id,
        nombre: i.producto.nombre,
        cantidad: i.cantidad,
        precio_unitario: i.producto.precio_venta,
        subtotal: i.producto.precio_venta * i.cantidad,
      })),
      subtotal,
      descuento: 0,
      impuesto,
      total,
      metodo_pago: metodoPago,
      monto_recibido: metodoPago === "EFECTIVO" ? recibidoNum : undefined,
      cambio: metodoPago === "EFECTIVO" ? cambio : undefined,
      cajero: caja.cajero,
    });

    // Refresh state
    setProductos(GymDataStore.getProductos());
    setVentas(GymDataStore.getVentas());
    setCaja(GymDataStore.getCaja());

    beep(true);
    toast.success(`Venta completada con folio ${nuevaVenta.folio}`);

    // Generate receipt
    const receiptLines = cart.map((i) => ({
      desc: i.producto.nombre,
      qty: i.cantidad,
      total: i.producto.precio_venta * i.cantidad,
    }));

    setActiveReceipt({
      folio: nuevaVenta.folio,
      cliente: socioNombre,
      lineas: receiptLines,
      subtotal,
      descuento: 0,
      total,
      metodo: metodoPago,
      fecha: new Date().toLocaleString("es"),
    });

    setCheckoutOpen(false);
    clearCart();
  };

  return (
    <>
      <PageHeader
        title="Tienda POS & Arqueo"
        subtitle={`Turno: ${caja.estado === "ABIERTA" ? "🟢 Caja Abierta" : "🔴 Caja Cerrada"} · Ventas del turno: ${money(caja.total_ventas)}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCajaModalOpen(true)}
            className="border-primary/30 hover:bg-primary/10"
          >
            <DollarSign className="size-4 text-primary" />
            {caja.estado === "ABIERTA" ? "Arqueo / Cerrar Turno" : "Abrir Turno de Caja"}
          </Button>
          <ReportButtons
            title="Ventas de Tienda POS"
            headers={["Folio", "Fecha", "Cliente", "Total (Q)", "Método de Pago", "Cajero"]}
            rows={ventas.map((v) => [
              v.folio,
              new Date(v.fecha_hora).toLocaleString("es"),
              v.socio_nombre,
              v.total,
              v.metodo_pago,
              v.cajero,
            ])}
          />
        </div>
      </PageHeader>

      <Tabs defaultValue="pos" className="space-y-6">
        <TabsList className="bg-card border grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pos" className="gap-2">
            <Store className="size-4" /> Terminal de Venta
          </TabsTrigger>
          <TabsTrigger value="historial" className="gap-2">
            <History className="size-4" /> Historial de Ventas ({ventas.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: POS TERMINAL */}
        <TabsContent value="pos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: PRODUCTS CATALOG (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Search & Category filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto por nombre o código de barras (ej. 75010001)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-card border-border"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={selectedCat === cat ? "default" : "outline"}
                      onClick={() => setSelectedCat(cat)}
                      className={cn(
                        "text-xs font-mono",
                        selectedCat === cat
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProductos.map((p) => {
                  const imgSrc = productImageMap[p.imagen_tipo] || productImageMap.protein;
                  const isLowStock = p.stock_actual <= p.stock_minimo;
                  const isOutOfStock = p.stock_actual <= 0;

                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-lg",
                        isOutOfStock && "opacity-60 grayscale cursor-not-allowed"
                      )}
                    >
                      {/* Product Image */}
                      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-surface">
                        <img
                          src={imgSrc}
                          alt={p.nombre}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground backdrop-blur-xs">
                          {p.categoria}
                        </span>
                        {isOutOfStock ? (
                          <span className="absolute top-1.5 right-1.5 rounded bg-destructive/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Agotado
                          </span>
                        ) : isLowStock ? (
                          <span className="absolute top-1.5 right-1.5 rounded bg-warning/90 px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground">
                            Stock bajo: {p.stock_actual}
                          </span>
                        ) : (
                          <span className="absolute top-1.5 right-1.5 rounded bg-card/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                            Stock: {p.stock_actual}
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {p.nombre}
                          </h4>
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                            Ref: {p.codigo_barras}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="font-display text-lg font-bold text-primary">
                            {money(p.precio_venta)}
                          </span>
                          <Button
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => addToCart(p)}
                            className="size-8 p-0 rounded-md"
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredProductos.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl border-dashed">
                    <p className="text-sm">No se encontraron productos con el filtro aplicado.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: SHOPPING CART (4 cols) */}
            <div className="lg:col-span-4 rounded-xl border bg-card p-4 space-y-4 shadow-xl sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="size-5 text-primary" />
                  <h3 className="font-bold text-base">Carrito de Compra</h3>
                </div>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
                  >
                    Vaciar
                  </Button>
                )}
              </div>

              {/* Client / Member selector */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Asignar a Socio (Opcional)
                </Label>
                <select
                  aria-label="Asignar a socio"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={selectedSocioId}
                  onChange={(e) => setSelectedSocioId(e.target.value)}
                >
                  <option value="">Cliente Mostrador / Público General</option>
                  {socios
                    .filter((s) => s.activo)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombres} {s.apellidos} ({s.codigo_socio})
                      </option>
                    ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.producto.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg border bg-surface/50 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-xs">{item.producto.nombre}</p>
                      <p className="font-mono text-xs text-primary">{money(item.producto.precio_venta)} c/u</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-6 text-xs"
                        onClick={() => updateQuantity(item.producto.id, -1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center font-mono text-xs font-bold">
                        {item.cantidad}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-6 text-xs"
                        onClick={() => updateQuantity(item.producto.id, 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.producto.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    <PackageCheck className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                    <p className="text-xs">El carrito está vacío.</p>
                    <p className="text-[11px] text-muted-foreground/70">
                      Selecciona productos para iniciar una venta.
                    </p>
                  </div>
                )}
              </div>

              {/* Financial Totals */}
              <div className="space-y-2 pt-3 border-t border-border text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">{money(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA ({config.iva_pct ?? 12}%)</span>
                  <span className="font-mono">{money(impuesto)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border/60">
                  <span>Total</span>
                  <span className="font-display text-xl text-primary font-bold">
                    {money(total)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Button
                size="lg"
                disabled={cart.length === 0}
                onClick={() => {
                  setMontoRecibido(total.toFixed(2));
                  setCheckoutOpen(true);
                }}
                className="w-full font-semibold uppercase tracking-wider text-sm h-11"
              >
                Proceder al Cobro
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: HISTORIAL DE VENTAS */}
        <TabsContent value="historial" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Registro de Ventas en Mostrador</h3>
              <p className="text-xs text-muted-foreground">
                Consolidado histórico de transacciones del punto de venta
              </p>
            </div>
            <ReportButtons
              title="Ventas de Tienda POS"
              headers={["Folio", "Fecha", "Cliente", "Total (Q)", "Método de Pago", "Cajero"]}
              rows={ventas.map((v) => [
                v.folio,
                new Date(v.fecha_hora).toLocaleString("es"),
                v.socio_nombre,
                v.total,
                v.metodo_pago,
                v.cajero,
              ])}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                <tr>
                  <th className="p-3">Folio</th>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Cliente / Socio</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Método</th>
                  <th className="p-3 text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ventas.map((v) => (
                  <tr key={v.id} className="hover:bg-accent/40">
                    <td className="p-3 font-mono text-xs font-semibold text-primary">{v.folio}</td>
                    <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(v.fecha_hora).toLocaleString("es")}
                    </td>
                    <td className="p-3 font-medium">{v.socio_nombre}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {v.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(", ")}
                    </td>
                    <td className="p-3 font-display text-base font-bold text-foreground">
                      {money(v.total)}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs font-mono">
                        {v.metodo_pago}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => {
                          setActiveReceipt({
                            folio: v.folio,
                            cliente: v.socio_nombre,
                            lineas: v.items.map((i) => ({
                              desc: i.nombre,
                              qty: i.cantidad,
                              total: i.subtotal,
                            })),
                            subtotal: v.subtotal,
                            descuento: v.descuento,
                            total: v.total,
                            metodo: v.metodo_pago,
                            fecha: new Date(v.fecha_hora).toLocaleString("es"),
                          });
                        }}
                      >
                        <ReceiptIcon className="size-3.5" />
                        Ticket
                      </Button>
                    </td>
                  </tr>
                ))}
                {ventas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No hay ventas registradas aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* CHECKOUT MODAL */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" /> Cobrar Venta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Total display */}
            <div className="rounded-xl border bg-surface p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total a Cobrar</p>
              <p className="font-display text-4xl font-bold text-primary mt-1">{money(total)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {cart.reduce((a, b) => a + b.cantidad, 0)} artículos seleccionados
              </p>
            </div>

            {/* Payment Method selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider">Método de Pago</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={metodoPago === "EFECTIVO" ? "default" : "outline"}
                  onClick={() => setMetodoPago("EFECTIVO")}
                  className="gap-1.5 text-xs font-medium"
                >
                  <Banknote className="size-4" /> Efectivo
                </Button>
                <Button
                  type="button"
                  variant={metodoPago === "TARJETA" ? "default" : "outline"}
                  onClick={() => setMetodoPago("TARJETA")}
                  className="gap-1.5 text-xs font-medium"
                >
                  <CreditCard className="size-4" /> Tarjeta
                </Button>
                <Button
                  type="button"
                  variant={metodoPago === "TRANSFERENCIA" ? "default" : "outline"}
                  onClick={() => setMetodoPago("TRANSFERENCIA")}
                  className="gap-1.5 text-xs font-medium"
                >
                  <ArrowRightLeft className="size-4" /> Transfer
                </Button>
              </div>
            </div>

            {/* Cash Calculator */}
            {metodoPago === "EFECTIVO" && (
              <div className="space-y-3 rounded-lg border bg-card p-3">
                <div className="space-y-1">
                  <Label htmlFor="monto-recibido" className="text-xs">Monto Recibido en Efectivo (Q)</Label>
                  <Input
                    id="monto-recibido"
                    type="number"
                    step="5"
                    min={0}
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    className="font-mono text-lg font-bold"
                  />
                </div>

                {/* Quick denomination pills in Quetzales */}
                <div className="flex flex-wrap gap-1.5">
                  {[20, 50, 100, 200].map((bill) => (
                    <Button
                      key={bill}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs font-mono h-7 px-2"
                      onClick={() => setMontoRecibido(String(bill))}
                    >
                      Q {bill}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs font-mono h-7 px-2"
                    onClick={() => setMontoRecibido(total.toFixed(2))}
                  >
                    Exacto
                  </Button>
                </div>

                {/* Change or Missing Alert */}
                <div className="pt-2 border-t flex justify-between items-center text-sm">
                  {saldoFaltante > 0 ? (
                    <span className="text-destructive font-semibold flex items-center gap-1 text-xs">
                      <AlertTriangle className="size-3.5" /> Faltan: {money(saldoFaltante)}
                    </span>
                  ) : (
                    <span className="text-success font-semibold flex items-center gap-1 text-sm">
                      <CheckCircle2 className="size-4" /> Cambio a entregar:{" "}
                      <span className="font-display text-lg">{money(cambio)}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setCheckoutOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSale}
              disabled={metodoPago === "EFECTIVO" && saldoFaltante > 0}
              className="gap-2"
            >
              <Printer className="size-4" /> Confirmar & Imprimir Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ARQUEO DE CAJA MODAL */}
      <Dialog open={cajaModalOpen} onOpenChange={setCajaModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="size-5 text-primary" /> Arqueo y Control de Turno
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-surface p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado del Turno:</span>
                <span className="font-bold text-primary">{caja.estado}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fondo Inicial:</span>
                <span className="font-mono">{money(caja.monto_inicial)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ventas Acumuladas:</span>
                <span className="font-mono text-success font-semibold">{money(caja.total_ventas)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold">
                <span>Efectivo Total Estimado en Caja:</span>
                <span className="font-mono text-primary">
                  {money(caja.monto_inicial + caja.total_ventas)}
                </span>
              </div>
            </div>

            {caja.estado === "ABIERTA" ? (
              <div className="space-y-2">
                <Label htmlFor="monto-final-arqueo">Monto Físico Contado para Cierre (Q)</Label>
                <Input
                  id="monto-final-arqueo"
                  type="number"
                  step="5"
                  placeholder="Ej. 500.00"
                  value={montoFinalInput}
                  onChange={(e) => setMontoFinalInput(e.target.value)}
                />
                <Button
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={() => {
                    const finalVal = parseFloat(montoFinalInput) || (caja.monto_inicial + caja.total_ventas);
                    const updated = GymDataStore.cerrarCaja(finalVal);
                    setCaja(updated);
                    setCajaModalOpen(false);
                    toast.success("Turno de caja cerrado exitosamente");
                  }}
                >
                  Cerrar Turno de Caja
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="monto-inicial-apertura">Fondo Inicial de Apertura (Q)</Label>
                <Input
                  id="monto-inicial-apertura"
                  type="number"
                  step="10"
                  value={montoInicialInput}
                  onChange={(e) => setMontoInicialInput(e.target.value)}
                />
                <Button
                  className="w-full mt-2"
                  onClick={() => {
                    const val = parseFloat(montoInicialInput) || 150;
                    const updated = GymDataStore.abrirCaja(val, "Recepción Central");
                    setCaja(updated);
                    setCajaModalOpen(false);
                    toast.success("Nuevo turno de caja iniciado");
                  }}
                >
                  Abrir Nuevo Turno
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* RECEIPT PRINT MODAL */}
      {activeReceipt && (
        <Receipt data={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </>
  );
}
