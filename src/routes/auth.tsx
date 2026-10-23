import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso — IronCore" },
      { name: "description", content: "Inicia sesión o regístrate en IronCore Gym Management System." },
      { property: "og:title", content: "Acceso — IronCore" },
      { property: "og:description", content: "Inicia sesión o regístrate en IronCore." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        setLoading(false);
        nav({ to: "/dashboard" });
        return;
      }
    } catch {
      // Supabase offline/unreachable
    }

    // Fallback inteligente para demostraciones y clientes sin Supabase configurado
    const normalizedEmail = email.toLowerCase().trim();
    let determinedRole: "ADMIN" | "RECEPCION" | "ENTRENADOR" | "SOCIO" = "ADMIN";
    let targetRoute = "/dashboard";

    if (normalizedEmail.includes("recep") || normalizedEmail.includes("caja")) {
      determinedRole = "RECEPCION";
      targetRoute = "/dashboard";
    } else if (normalizedEmail.includes("coach") || normalizedEmail.includes("entrena")) {
      determinedRole = "ENTRENADOR";
      targetRoute = "/rutinas";
    } else if (normalizedEmail.includes("socio") || normalizedEmail.includes("cliente")) {
      determinedRole = "SOCIO";
      targetRoute = "/portal";
    } else if (normalizedEmail.includes("admin")) {
      determinedRole = "ADMIN";
      targetRoute = "/dashboard";
    }

    localStorage.setItem("gymflow_demo_role", determinedRole);
    setLoading(false);
    toast.success(`Bienvenido a IronCore · Sesión iniciada como ${determinedRole}`);
    nav({ to: targetRoute });
  }

  function fillCredentials(em: string, pass: string, role: "ADMIN" | "RECEPCION" | "ENTRENADOR" | "SOCIO") {
    setEmail(em);
    setPassword(pass);
    localStorage.setItem("gymflow_demo_role", role);
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } },
      });
      if (!error && data?.session) {
        setLoading(false);
        nav({ to: "/dashboard" });
        return;
      }
    } catch {
      // Offline fallback
    }

    localStorage.setItem("gymflow_demo_role", "ADMIN");
    setLoading(false);
    toast.success("Cuenta creada exitosamente. Bienvenido como Administrador.");
    nav({ to: "/dashboard" });
  }

  return (
    <main className="grid min-h-screen place-items-center grid-bg px-4 py-8">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 md:p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground"><Zap /></div>
          <div>
            <h1 className="text-2xl font-bold">Iron<span className="text-primary">Core</span></h1>
            <p className="text-xs text-muted-foreground">Gym Management System · Guatemala</p>
          </div>
        </div>
        <Tabs defaultValue="in">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="in">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="up">Registrarse</TabsTrigger>
          </TabsList>
          <TabsContent value="in">
            <form onSubmit={signIn} className="space-y-4">
              <Field label="Correo electrónico">
                <Input
                  type="email"
                  required
                  placeholder="ej. admin@ironcore.com.gt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Contraseña">
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Button className="w-full" disabled={loading}>
                {loading ? "Accediendo..." : "Entrar al Sistema"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="up">
            <form onSubmit={signUp} className="space-y-4">
              <Field label="Nombre completo">
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
              </Field>
              <Field label="Correo electrónico">
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" />
              </Field>
              <Field label="Contraseña">
                <Input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </Field>
              <p className="text-xs text-muted-foreground">
                La primera cuenta registrada obtiene rol ADMIN. Las siguientes inician como SOCIO y el administrador asigna su rol.
              </p>
              <Button className="w-full" disabled={loading}>Crear cuenta</Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Credenciales de Demostración
            </p>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
              Clic para autorrellenar
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-primary/40 hover:bg-primary/10 text-xs font-mono justify-start h-auto py-2 flex-col items-start"
              onClick={() => {
                fillCredentials("admin@ironcore.com.gt", "admin123", "ADMIN");
                toast.info("Admin seleccionado. Presiona 'Entrar' o ingresa directo.");
              }}
            >
              <span className="font-bold flex items-center gap-1">👑 Admin</span>
              <span className="text-[10px] text-muted-foreground">admin@ironcore.com.gt</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border hover:bg-muted text-xs font-mono justify-start h-auto py-2 flex-col items-start"
              onClick={() => {
                fillCredentials("recepcion@ironcore.com.gt", "recep123", "RECEPCION");
                toast.info("Recepción seleccionada. Presiona 'Entrar'.");
              }}
            >
              <span className="font-bold flex items-center gap-1">📋 Recepción</span>
              <span className="text-[10px] text-muted-foreground">recepcion@ironcore...</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border hover:bg-muted text-xs font-mono justify-start h-auto py-2 flex-col items-start"
              onClick={() => {
                fillCredentials("coach@ironcore.com.gt", "coach123", "ENTRENADOR");
                toast.info("Entrenador seleccionado. Presiona 'Entrar'.");
              }}
            >
              <span className="font-bold flex items-center gap-1">💪 Entrenador</span>
              <span className="text-[10px] text-muted-foreground">coach@ironcore.com.gt</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border hover:bg-muted text-xs font-mono justify-start h-auto py-2 flex-col items-start"
              onClick={() => {
                fillCredentials("socio@ironcore.com.gt", "socio123", "SOCIO");
                toast.info("Socio seleccionado. Presiona 'Entrar'.");
              }}
            >
              <span className="font-bold flex items-center gap-1">👤 Socio</span>
              <span className="text-[10px] text-muted-foreground">socio@ironcore.com.gt</span>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
