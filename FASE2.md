# Club Wilier Chile - Fase 2: UI/UX + Migración Neon

## Descripción General

Plataforma Next.js 16 para gestionar la comunidad de ciclistas Wilier en Chile. Wilier es marca italiana de bicicletas premium; All4Bikers es el distribuidor oficial en Chile.

**Stack**: Next.js 16 (App Router), Tailwind CSS v4, Shadcn UI, **Neon PostgreSQL** + Drizzle ORM, JWT + OTP, BSale API

---

## Fase 2: UI/UX - Completada

### Branding

| Elemento | Color | Descripción |
|----------|-------|-------------|
| Primary | `#121c2b` | Navy oscuro Wilier |
| Secondary | `#1e2f42` | Navy más claro |
| Accent | `#e63946` | Rojo energético |

### Logos Disponibles

- `/public/wilier.svg` - Logo icónico "W" montaña (usado en UI)
- `/public/logo_wilier_500_x_500-3_180x.avif` - Logo Wilier
- `/public/All4Bikers_Logotipo_2020_4-10_180x.avif` - Logo All4Bikers

---

## Migración a Neon PostgreSQL

### Cambios Realizados

| Componente | Antes | Después |
|------------|-------|---------|
| Driver | `better-sqlite3` | `pg` (Node.js driver) |
| Dialect | `sqlite` | `postgresql` |
| Schema | `sqliteTable` + `integer` | `pgTable` + `timestamp` |
| Auto-increment | `integer().primaryKey({ autoIncrement: true })` | `integer().primaryKey().generatedAlwaysAsIdentity()` |
| Timestamps | `integer` (epoch ms) | `timestamp` (mode: "date") |

### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `drizzle.config.ts` | dialect: "postgresql" |
| `src/db/index.ts` | Driver pg con Pool |
| `src/db/schema.ts` | pgTable + timestamp + identity |
| `.env` | NEONDB_CONNECTION_STRING |

### Corrección BSale

- Removido `createdAt` y `updatedAt` de interface BSaleClient (BSale no los devuelve)
- Corregido `extractClubWilierNumber()` - bug en lógica condicional
- `createdAt` y `updatedAt` ahora se generan localmente con `new Date()`

---

## Archivos Creados/Modificados (UI)

### Nuevos Componentes

| Archivo | Descripción |
|---------|-------------|
| `src/components/login/login-container.tsx` | Container con gradiente navy + patrón sutil |
| `src/components/login/login-card-wrapper.tsx` | Card con glassmorphism oscuro |
| `src/components/login/brand-logo.tsx` | Logo Wilier SVG reusable |
| `src/components/card/membership-card.tsx` | Tarjeta premium estilo crédito |

### Archivos Modificados

| Archivo | Descripción |
|---------|-------------|
| `src/app/globals.css` | Variables de tema Wilier agregadas |
| `src/components/login-form.tsx` | Formulario con nuevos estilos oscuros |
| `src/app/login/page.tsx` | Usa nuevos componentes |
| `src/app/card/page.tsx` | Usa nuevo componente de tarjeta |
| `src/lib/auth/bsale.ts` | Interface corregida, función extractClubWilierNumber corregida |
| `src/app/api/auth/verify/route.ts` | Timestamps generados localmente |

---

## Diseño Login

- **Fondo**: Gradiente navy (#121c2b → #1e2f42) con patrón diagonal sutil
- **Card**: Glassmorphism con blur 16px, fondo rgba, borde semi-transparente
- **Logo**: Wilier SVG en blanco
- **Inputs**: Fondo blanco/10, texto blanco, placeholder gris
- **Botón CTA**: Gradiente rojo (#e63946 → #c1121f)
- **Footer**: "by All4Bikers Chile"

---

## Diseño Tarjeta de Socio

- **Proporción**: Tarjeta crédito (85.6/53.98mm ratio ~1.585)
- **Fondo**: Navy con gradiente diagonal y patrón sutil
- **Elementos**:
  - Logo Wilier esquina superior
  - Avatar circular con ícono usuario
  - Nombre en mayúsculas bold
  - RUT en tipografía mono
  - Número de socio destacado (ej: #3041)
  - Borde sutil y efectos glow
- **Estado no-socio**: Mensaje con link a all4bikers.cl

---

## Lo Que Funciona

- [x] Login OTP completo
- [x] Nueva UI Login
- [x] Nueva UI Tarjeta de Socio
- [x] Migración a Neon PostgreSQL
- [x] Corrección datos BSale

---

## Pendiente / Siguientes Pasos

1. **QR de validación** - Para que locales comerciales verifiquen socios
2. **Dashboard admin** - Panel para Wilier gestionar usuarios
3. **Testing** - Tests unitarios

---

## Para Continuar

El proyecto está en `/Users/nedilio/Dev/personal/wilier-chile`.

```bash
pnpm dev
```

- Login: http://localhost:3000/login
- Tarjeta: http://localhost:3000/card
