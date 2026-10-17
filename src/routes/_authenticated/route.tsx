import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import type { Role } from "@/lib/gym";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const demoRole = typeof window !== "undefined" ? localStorage.getItem("gymflow_demo_role") : null;
    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Supabase auth may be offline or credentials expired
    }

    if (!user && demoRole) {
      const role = demoRole as Role;
      const demoUser = {
        id: "demo-user-id",
        email: `demo-${role.toLowerCase()}@gymflow.local`,
        user_metadata: { full_name: `Usuario ${role}` },
      } as any;
      const demoProfile = {
        id: "demo-user-id",
        email: demoUser.email,
        full_name: `Usuario ${role}`,
        role,
        avatar_url: null,
      };
      return { user: demoUser, role, profile: demoProfile };
    }

    if (!user) throw redirect({ to: "/auth" });
    const [{ data: roles }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    ]);
    const list = (roles ?? []).map((r) => r.role as Role);
    const order: Role[] = ["ADMIN", "RECEPCION", "ENTRENADOR", "SOCIO"];
    const role: Role = order.find((r) => list.includes(r)) ?? "SOCIO";
    return { user, role, profile };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
