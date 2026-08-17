import { createClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/admin-allowlist";

// Estar logueado en Supabase NO alcanza por sí solo: Supabase permite
// registro público por defecto (la anon key está expuesta en el navegador
// a propósito), así que cualquiera podría crearse una cuenta si solo
// chequeáramos "hay un usuario". Acá se valida además que sea
// específicamente uno de los emails de ADMIN_ALLOWED_EMAILS.
export async function getAuthorizedAdminEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !isEmailAllowed(user.email)) return null;
  return user.email;
}

export async function isAuthorizedAdmin(): Promise<boolean> {
  return (await getAuthorizedAdminEmail()) !== null;
}
