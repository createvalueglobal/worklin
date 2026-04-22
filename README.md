# WorkLin

Plataforma SaaS que conecta profesionales del sector servicios con empresas que buscan contratar.

## Stack

- Next.js 15 (App Router) + TypeScript
- TailwindCSS + Framer Motion
- Supabase (Auth + PostgreSQL + Storage)
- Stripe (suscripciones)
- Resend (email transaccional)
- Vercel (hosting)

## Desarrollo local

1. Clona el repositorio
2. Copia `.env.local` con las variables necesarias
3. Instala dependencias: `npm install`
4. Arranca el servidor: `npm run dev`
5. Abre [http://localhost:3000](http://localhost:3000)

## Pruebas Stripe - Entorno TEST

1. En una terminal, lanzar el comando: stripe listen --forward-to localhost:3000/api/stripe/webhook
2. Copiar el whsec_... que genere en .env.local, variable STRIPE_WEBHOOK_SECRET
3. Ejecutar la app en otra terminal con: `npm run dev`
4. Datos para transacción exitosa:

- Número de tarjeta:  4242 4242 4242 4242
- Fecha:              cualquier mes/año futuro (ej: 12/26)
- CVC:                cualquier 3 dígitos (ej: 123)
- Nombre:             cualquier nombre

- Tarjeta Pago exitoso: 4242 4242 4242 4242
- Tarjeta rechazada: 4000 0000 0000 0002
- Tarjeta Requiere autenticación 3D Secure: 4000 0025 0000 3155