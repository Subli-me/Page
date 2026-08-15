import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Si todavía no se cargaron las credenciales reales de Supabase, usamos una URL
// válida-pero-falsa para que el cliente se pueda construir sin tirar error.
// Las queries van a fallar silenciosamente (data: null) en vez de romper el build.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

// Cliente para Server Components / Route Handlers, respeta la sesión del usuario.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // set() puede fallar en Server Components sin middleware — se ignora.
        }
      },
    },
  });
}

// Cliente con permisos totales, solo para uso en el servidor (API routes, admin).
// Nunca importar desde un componente cliente.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
