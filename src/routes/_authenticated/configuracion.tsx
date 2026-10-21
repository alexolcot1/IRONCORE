import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  CreditCard,
  Package,
  Users,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { allow } from "@/lib/guard";
import { money, type Role } from "@/lib/gym";
import {
  GymDataStore,
  type NegocioConfig,
  type PlanMembresia,
  type Producto,
  type RegistroAuditoria,
  type UsuarioSistema,
} from "@/lib/gymData";

export const Route = createFileRoute("/_authenticated/configuracion")({
  beforeLoad: allow(["ADMIN"]),
  validateSearch: (s: Record<string, unknown>): { socio?: string } => ({
    socio: typeof s["socio"] === "string" ? (s["socio"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Configuración — IronCore" },
      { name: "description", content: "Administración general, datos del negocio, planes y auditoría." },
    ],
  }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  // Business config state
  const [config, setConfig] = useState<NegocioConfig>(() => GymDataStore.getConfig());
  const [planes, setPlanes] = useState<PlanMembresia[]>(() => GymDataStore.getPlanes());
  const [productos, setProductos] = useState<Producto[]>(() => GymDataStore.getProductos());
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>(() => GymDataStore.getUsuarios());
  const [auditoria, setAuditoria] = useState<RegistroAuditoria[]>(() => GymDataStore.getAuditoria());

  // Plan modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Partial<PlanMembresia> | null>(null);

  // Product modal
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editProd, setEditProd] = useState<Partial<Producto> | null>(null);

  // User modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<Partial<UsuarioSistema> | null>(null);

  // Save business info
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    GymDataStore.saveConfig(config);
    setAuditoria(GymDataStore.getAuditoria());
    toast.success("Información del negocio actualizada correctamente");
  };

  // Plan CRUD
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlan?.nombre || !editPlan?.precio || !editPlan?.duracion_dias) {
      toast.error("Por favor completa los campos requeridos del plan");
      return;
    }
    const updated = GymDataStore.savePlan({
      id: editPlan.id || `plan-${Date.now()}`,
      nombre: editPlan.nombre,
      duracion_dias: Number(editPlan.duracion_dias),
      precio: Number(editPlan.precio),
      descripcion: editPlan.descripcion || "",
      activo: editPlan.activo !== false,
    });
    setPlanes(updated);
    setAuditoria(GymDataStore.getAuditoria());
    setPlanModalOpen(false);
    toast.success(editPlan.id ? "Plan actualizado" : "Nuevo plan creado");
  };

  const handleDeletePlan = (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este plan de membresía?")) return;
    const updated = GymDataStore.deletePlan(id);
    setPlanes(updated);
    setAuditoria(GymDataStore.getAuditoria());
    toast.success("Plan eliminado");
  };

  // Product CRUD
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProd?.nombre || !editProd?.precio_venta || !editProd?.codigo_barras) {
      toast.error("Por favor completa los campos requeridos del producto");
      return;
    }
    const updated = GymDataStore.saveProducto({
      id: editProd.id || `prod-${Date.now()}`,
      codigo_barras: editProd.codigo_barras,
      nombre: editProd.nombre,
      categoria: editProd.categoria || "Suplementos",
      precio_venta: Number(editProd.precio_venta),
      costo: Number(editProd.costo || 0),
      stock_actual: Number(editProd.stock_actual ?? 0),
      stock_minimo: Number(editProd.stock_minimo ?? 5),
      imagen_tipo: editProd.imagen_tipo || "protein",
    });
    setProductos(updated);
    setAuditoria(GymDataStore.getAuditoria());
    setProdModalOpen(false);
    toast.success(editProd.id ? "Producto actualizado" : "Nuevo producto registrado");
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    const updated = GymDataStore.deleteProducto(id);
    setProductos(updated);
    setAuditoria(GymDataStore.getAuditoria());
    toast.success("Producto eliminado del inventario");
  };

  // User Save
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser?.nombre || !editUser?.email || !editUser?.rol) {
      toast.error("Completa todos los campos del usuario");
      return;
    }
    const updated = GymDataStore.saveUsuario({
      id: editUser.id || `usr-${Date.now()}`,
      nombre: editUser.nombre,
      email: editUser.email,
      rol: editUser.rol,
      fecha_creacion: editUser.fecha_creacion || new Date().toISOString().slice(0, 10),
      activo: editUser.activo !== false,
    });
    setUsuarios(updated);
    setAuditoria(GymDataStore.getAuditoria());
    setUserModalOpen(false);
    toast.success("Usuario del sistema actualizado");
  };

  return (
    <>
      <PageHeader
        title="Configuración & Auditoría"
        subtitle="Administra la información de tu negocio, catálogo de planes, inventario y registros del sistema."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="default" size="sm" asChild className="gap-2 shadow-sm">
            <a href="/MANUAL_DE_USUARIO_IRONCORE.docx" download="MANUAL_DE_USUARIO_IRONCORE.docx">
              <Download className="size-4" /> Manual de Usuario (.DOCX)
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
            <a href="/MANUAL_TECNICO_IRONCORE.docx" download="MANUAL_TECNICO_IRONCORE.docx">
              <FileText className="size-4" /> Manual Técnico (.DOCX)
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <a href="/INFORME_TECNICO_IRONCORE.docx" download="INFORME_TECNICO_IRONCORE.docx">
              <FileText className="size-4" /> Informe Técnico (.DOCX)
            </a>
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="negocio" className="space-y-6">
        <TabsList className="bg-card border flex flex-wrap w-full max-w-3xl justify-start h-auto p-1 gap-1">
          <TabsTrigger value="negocio" className="gap-2">
            <Building2 className="size-4" /> Datos del Negocio
          </TabsTrigger>
          <TabsTrigger value="planes" className="gap-2">
            <CreditCard className="size-4" /> Planes ({planes.length})
          </TabsTrigger>
          <TabsTrigger value="inventario" className="gap-2">
            <Package className="size-4" /> Inventario ({productos.length})
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="size-4" /> Usuarios & Roles ({usuarios.length})
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="gap-2">
            <ShieldCheck className="size-4" /> Auditoría ({auditoria.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. BUSINESS CONFIG FORM */}
        <TabsContent value="negocio">
          <form onSubmit={handleSaveConfig} className="max-w-4xl rounded-xl border bg-card p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold">Ficha de Información del Negocio</h3>
                <p className="text-xs text-muted-foreground">
                  Datos corporativos que aparecen en tickets, comprobantes y reportes
                </p>
              </div>
              <Button type="submit" className="gap-2">
                <Save className="size-4" /> Guardar Cambios
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cfg-nombre">Nombre Comercial del Negocio / Gimnasio</Label>
                <Input
                  id="cfg-nombre"
                  required
                  value={config.nombre}
                  onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-slogan">Slogan o Descripción Breve</Label>
                <Input
                  id="cfg-slogan"
                  value={config.slogan}
                  onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="cfg-dir">Dirección Física Completa</Label>
                <Input
                  id="cfg-dir"
                  required
                  value={config.direccion}
                  onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-tel">Teléfono de Contacto / WhatsApp</Label>
                <Input
                  id="cfg-tel"
                  required
                  value={config.telefono}
                  onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-email">Correo Electrónico Oficial</Label>
                <Input
                  id="cfg-email"
                  type="email"
                  required
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-rfc">NIT (Número de Identificación Tributaria - SAT Guatemala)</Label>
                <Input
                  id="cfg-rfc"
                  value={config.rfc}
                  onChange={(e) => setConfig({ ...config, rfc: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-web">Sitio Web / Redes</Label>
                <Input
                  id="cfg-web"
                  value={config.sitio_web}
                  onChange={(e) => setConfig({ ...config, sitio_web: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-iva">Tasa de Impuesto / IVA (%)</Label>
                <Input
                  id="cfg-iva"
                  type="number"
                  min={0}
                  max={50}
                  value={config.iva_pct}
                  onChange={(e) => setConfig({ ...config, iva_pct: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-aforo">Aforo Máximo de Sala</Label>
                <Input
                  id="cfg-aforo"
                  type="number"
                  min={10}
                  max={500}
                  value={config.aforo_max}
                  onChange={(e) => setConfig({ ...config, aforo_max: Number(e.target.value) })}
                />
              </div>
            </div>
          </form>
        </TabsContent>

        {/* 2. MEMBERSHIP PLANS CRUD */}
        <TabsContent value="planes" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Catálogo de Planes & Membresías</h3>
              <p className="text-xs text-muted-foreground">
                Planes que los socios pueden contratar y renovar
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ReportButtons
                title="Planes de Membresía"
                headers={["Nombre del Plan", "Duración (Días)", "Precio (Q)", "Descripción", "Estado"]}
                rows={planes.map((p) => [
                  p.nombre,
                  p.duracion_dias,
                  p.precio,
                  p.descripcion,
                  p.activo ? "Activo" : "Inactivo",
                ])}
              />
              <Button
                onClick={() => {
                  setEditPlan({ activo: true, duracion_dias: 30, precio: 35 });
                  setPlanModalOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="size-4" /> Nuevo Plan
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                <tr>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Duración</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Descripción</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {planes.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/40">
                    <td className="p-3 font-semibold text-foreground">{p.nombre}</td>
                    <td className="p-3 font-mono text-xs">{p.duracion_dias} días</td>
                    <td className="p-3 font-display text-base font-bold text-primary">
                      {money(p.precio)}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground max-w-xs">{p.descripcion}</td>
                    <td className="p-3">
                      <Badge variant={p.activo ? "default" : "outline"} className="text-xs">
                        {p.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Editar"
                          onClick={() => {
                            setEditPlan(p);
                            setPlanModalOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Eliminar"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeletePlan(p.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 3. PRODUCT INVENTORY CRUD */}
        <TabsContent value="inventario" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Control de Inventario & Stock</h3>
              <p className="text-xs text-muted-foreground">
                Artículos a la venta en el gimnasio con control de existencias mínimas
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ReportButtons
                title="Inventario de Productos"
                headers={["Código", "Producto", "Categoría", "Precio Venta (Q)", "Costo (Q)", "Stock Actual", "Stock Mínimo"]}
                rows={productos.map((pr) => [
                  pr.codigo_barras,
                  pr.nombre,
                  pr.categoria,
                  pr.precio_venta,
                  pr.costo,
                  pr.stock_actual,
                  pr.stock_minimo,
                ])}
              />
              <Button
                onClick={() => {
                  setEditProd({
                    categoria: "Suplementos",
                    stock_actual: 20,
                    stock_minimo: 5,
                    imagen_tipo: "protein",
                  });
                  setProdModalOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="size-4" /> Nuevo Producto
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Costo</th>
                  <th className="p-3">Stock Actual</th>
                  <th className="p-3">Alerta</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productos.map((pr) => {
                  const isLow = pr.stock_actual <= pr.stock_minimo;
                  return (
                    <tr key={pr.id} className="hover:bg-accent/40">
                      <td className="p-3 font-mono text-xs">{pr.codigo_barras}</td>
                      <td className="p-3 font-semibold">{pr.nombre}</td>
                      <td className="p-3">
                        <span className="rounded bg-surface px-2 py-0.5 text-xs font-mono text-muted-foreground">
                          {pr.categoria}
                        </span>
                      </td>
                      <td className="p-3 font-display text-base font-bold text-primary">
                        {money(pr.precio_venta)}
                      </td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{money(pr.costo)}</td>
                      <td className="p-3 font-mono font-bold">{pr.stock_actual} uds.</td>
                      <td className="p-3">
                        {isLow ? (
                          <span className="flex items-center gap-1 text-xs text-warning font-semibold">
                            <AlertTriangle className="size-3.5" /> Reordenar (&lt;{pr.stock_minimo})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="size-3.5" /> Óptimo
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Editar"
                            onClick={() => {
                              setEditProd(pr);
                              setProdModalOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Eliminar"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteProduct(pr.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 4. USERS & ROLES */}
        <TabsContent value="usuarios" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Control de Usuarios del Personal</h3>
              <p className="text-xs text-muted-foreground">
                Asignación de roles con permisos diferenciados
              </p>
            </div>
            <Button
              onClick={() => {
                setEditUser({ rol: "RECEPCION", activo: true });
                setUserModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="size-4" /> Nuevo Usuario
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Correo Electrónico</th>
                  <th className="p-3">Rol del Sistema</th>
                  <th className="p-3">Fecha Alta</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-accent/40">
                    <td className="p-3 font-semibold">{u.nombre}</td>
                    <td className="p-3 text-xs font-mono text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-xs",
                          u.rol === "ADMIN" && "border-primary text-primary",
                          u.rol === "RECEPCION" && "border-blue-400 text-blue-400",
                          u.rol === "ENTRENADOR" && "border-warning text-warning",
                          u.rol === "SOCIO" && "border-muted-foreground text-muted-foreground"
                        )}
                      >
                        {u.rol}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{u.fecha_creacion}</td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditUser(u);
                          setUserModalOpen(true);
                        }}
                      >
                        Modificar Rol
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 5. SYSTEM AUDIT LOG */}
        <TabsContent value="auditoria" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Bitácora de Auditoría del Sistema</h3>
              <p className="text-xs text-muted-foreground">
                Trazabilidad de operaciones críticas: altas, ventas, cobros y cambios de configuración
              </p>
            </div>
            <ReportButtons
              title="Registro de Auditoría"
              headers={["Fecha y Hora", "Usuario", "Rol", "Acción", "Módulo", "Detalle"]}
              rows={auditoria.map((a) => [
                new Date(a.fecha_hora).toLocaleString("es"),
                a.usuario,
                a.rol,
                a.accion,
                a.tabla,
                a.detalle,
              ])}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                <tr>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Acción</th>
                  <th className="p-3">Módulo</th>
                  <th className="p-3">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditoria.map((a) => (
                  <tr key={a.id} className="hover:bg-accent/40 font-mono text-xs">
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {new Date(a.fecha_hora).toLocaleString("es")}
                    </td>
                    <td className="p-3 font-sans font-medium text-foreground">{a.usuario}</td>
                    <td className="p-3">
                      <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-primary">
                        {a.rol}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-foreground">{a.accion}</td>
                    <td className="p-3 text-muted-foreground">{a.tabla}</td>
                    <td className="p-3 font-sans text-xs text-muted-foreground max-w-sm">{a.detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* PLAN MODAL */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editPlan?.id ? "Editar Plan" : "Nuevo Plan de Membresía"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePlan} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="plan-nom">Nombre del Plan</Label>
              <Input
                id="plan-nom"
                required
                placeholder="Ej. Semestral Avanzado"
                value={editPlan?.nombre ?? ""}
                onChange={(e) => setEditPlan({ ...editPlan, nombre: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="plan-dias">Duración (Días)</Label>
                <Input
                  id="plan-dias"
                  type="number"
                  min={1}
                  required
                  value={editPlan?.duracion_dias ?? 30}
                  onChange={(e) => setEditPlan({ ...editPlan, duracion_dias: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-precio">Precio (Q - Quetzales)</Label>
                <Input
                  id="plan-precio"
                  type="number"
                  step="5"
                  min={1}
                  required
                  value={editPlan?.precio ?? 250}
                  onChange={(e) => setEditPlan({ ...editPlan, precio: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="plan-desc">Descripción / Beneficios</Label>
              <Textarea
                id="plan-desc"
                placeholder="Beneficios incluidos, horarios permitidos..."
                value={editPlan?.descripcion ?? ""}
                onChange={(e) => setEditPlan({ ...editPlan, descripcion: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setPlanModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Plan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PRODUCT MODAL */}
      <Dialog open={prodModalOpen} onOpenChange={setProdModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editProd?.id ? "Editar Producto" : "Registrar Producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="prod-nom">Nombre del Producto</Label>
              <Input
                id="prod-nom"
                required
                placeholder="Ej. BCAA Aminoácidos 500g"
                value={editProd?.nombre ?? ""}
                onChange={(e) => setEditProd({ ...editProd, nombre: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="prod-bar">Código de Barras</Label>
                <Input
                  id="prod-bar"
                  required
                  placeholder="75010009"
                  value={editProd?.codigo_barras ?? ""}
                  onChange={(e) => setEditProd({ ...editProd, codigo_barras: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="prod-cat">Categoría</Label>
                <select
                  id="prod-cat"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  value={editProd?.categoria ?? "Suplementos"}
                  onChange={(e) =>
                    setEditProd({ ...editProd, categoria: e.target.value as Producto["categoria"] })
                  }
                >
                  <option value="Suplementos">Suplementos</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="prod-precio">Precio de Venta (Q - Quetzales)</Label>
                <Input
                  id="prod-precio"
                  type="number"
                  step="1"
                  min={1}
                  required
                  value={editProd?.precio_venta ?? 50}
                  onChange={(e) => setEditProd({ ...editProd, precio_venta: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="prod-costo">Costo (Q - Quetzales)</Label>
                <Input
                  id="prod-costo"
                  type="number"
                  step="1"
                  min={0}
                  value={editProd?.costo ?? 25}
                  onChange={(e) => setEditProd({ ...editProd, costo: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="prod-stock">Stock Actual</Label>
                <Input
                  id="prod-stock"
                  type="number"
                  min={0}
                  value={editProd?.stock_actual ?? 10}
                  onChange={(e) => setEditProd({ ...editProd, stock_actual: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="prod-min">Stock Mínimo</Label>
                <Input
                  id="prod-min"
                  type="number"
                  min={1}
                  value={editProd?.stock_minimo ?? 5}
                  onChange={(e) => setEditProd({ ...editProd, stock_minimo: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setProdModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Producto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* USER MODAL */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignación de Rol & Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="usr-nom">Nombre Completo</Label>
              <Input
                id="usr-nom"
                required
                value={editUser?.nombre ?? ""}
                onChange={(e) => setEditUser({ ...editUser, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="usr-email">Correo Electrónico</Label>
              <Input
                id="usr-email"
                type="email"
                required
                value={editUser?.email ?? ""}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="usr-rol">Rol en el Sistema</Label>
              <select
                id="usr-rol"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
                value={editUser?.rol ?? "RECEPCION"}
                onChange={(e) => setEditUser({ ...editUser, rol: e.target.value as Role })}
              >
                <option value="ADMIN">ADMIN (Control Total, Finanzas, Config)</option>
                <option value="RECEPCION">RECEPCION (Socios, Torniquete, POS)</option>
                <option value="ENTRENADOR">ENTRENADOR (Rutinas, Evaluaciones)</option>
                <option value="SOCIO">SOCIO (Portal del Cliente)</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setUserModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Usuario</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
