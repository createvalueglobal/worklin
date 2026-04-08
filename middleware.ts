import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ["/", "/login", "/register"];

// Rutas por rol
const ROLE_ROUTES: Record<string, string> = {
  "/professional": "professional",
  "/company": "company",
  "/admin": "admin",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Crear respuesta base
  let response = NextResponse.next({
    request,
  });

  // Crear cliente Supabase para middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refrescar sesión (obligatorio en middleware con Supabase SSR)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si es ruta pública, dejar pasar
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Si ya está autenticado y va al login, redirigir a su área
    if (user && (pathname === "/login" || pathname === "/register")) {
      return redirectByRole(user.id, request, supabase);
    }
    return response;
  }

  // Si no está autenticado, redirigir al login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Obtener datos del usuario desde public.users
  const { data: userData } = await supabase
    .from("users")
    .select("role, onboarding_completed, is_active")
    .eq("id", user.id)
    .single();

  // Si la cuenta está desactivada por admin
  if (userData && !userData.is_active) {
    return NextResponse.redirect(new URL("/account-suspended", request.url));
  }

  // Si no ha completado onboarding, redirigir (excepto si ya está en onboarding)
  if (userData && !userData.onboarding_completed && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Protección de rutas por rol
  for (const [routePrefix, requiredRole] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      if (userData?.role !== requiredRole && userData?.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return response;
}

// Helper: redirigir según rol tras login
async function redirectByRole(
  userId: string,
  request: NextRequest,
  supabase: ReturnType<typeof createServerClient>
) {
  const { data: userData } = await supabase
    .from("users")
    .select("role, onboarding_completed")
    .eq("id", userId)
    .single();

  if (!userData) return NextResponse.redirect(new URL("/login", request.url));

  if (!userData.onboarding_completed) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const dashboardMap: Record<string, string> = {
    professional: "/professional/dashboard",
    company: "/company/dashboard",
    admin: "/admin/dashboard",
  };

  const destination = dashboardMap[userData.role] ?? "/";
  return NextResponse.redirect(new URL(destination, request.url));
}

// Configurar en qué rutas actúa el middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};