// Lista blanca de emails que pueden administrar el sitio (ADMIN_ALLOWED_EMAILS,
// separados por comas). Sin dependencias de cookies/Next, así que se puede
// usar tanto en Route Handlers/Server Components como en el middleware (Edge).
export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return false; // sin lista configurada, se niega todo por seguridad
  return allowed.includes(email.toLowerCase());
}
