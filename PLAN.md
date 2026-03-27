# Club Wilier - Plan del Proyecto

## Visión General

Club Wilier es una plataforma para gestionar la comunidad de ciclistas Wilier en Chile. Permite a los socios verificar su membresía, acceder a beneficios exclusivos y mantener su información actualizada.

### Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js 16 (App Router, React 19) |
| Estilos | Tailwind CSS v4, Shadcn UI |
| Base de datos | SQLite + Drizzle ORM (migración a Neon/PostgreSQL) |
| Autenticación | JWT + OTP por email |
| Email | Resend |
| API externa | BSale (ERP chileno) |

---

## Funcionalidades

### Fase 1: Autenticación y Perfil de Socio ✅ COMPLETADA

- [x] Login con RUT + email
- [x] Verificación OTP por email (6 dígitos)
- [x] Sincronización de datos con BSale
- [x] Visualización de estado de socio Club Wilier
- [x] Logout

### Fase 2: QR de Validación (Futuro)

- [ ] Generación automática de QR para socios Club Wilier
- [ ] Hash estático por usuario (generado una vez, regenera si datos cambian)
- [ ] API `/api/validate/{token}` pública
- [ ] Validación en tiempo real contra BSale
- [ ] Respuesta con timestamp

### Fase 3: Wallet (Futuro)

- [ ] Agregar tarjeta al Apple Wallet
- [ ] Agregar tarjeta al Google Wallet

### Fase 4: Perfil y Gestión (Futuro)

- [ ] Dashboard del socio
- [ ] Actualización de datos de contacto
- [ ] Historial de beneficios canjeados
- [ ] Notificaciones

### Fase 5: Beneficios y Club (Futuro)

- [ ] Catálogo de beneficios
- [ ] Sistema de puntos
- [ ] Canjes de beneficios
- [ ] Notificaciones de nuevas ofertas

---

## Modelo de Datos

### Users (de BSale)

```
 rut              | text PK       | RUT del cliente (ej: "25921801-2", con guion)
 firstName        | text          | Nombre
 lastName         | text          | Apellido
 email            | text          | Email del formulario de login
 clubWilierNumber | text (null)   | Número de socio Club Wilier
 qrToken          | text (null)   | Hash estático para QR
 createdAt        | integer       | Timestamp BSale
 updatedAt        | integer       | Timestamp BSale
 lastSyncedAt     | integer       | Timestamp sincronización local
```

### OTP Codes

```
 id       | integer PK      | Auto-increment
 rut      | text            | RUT asociado (formato: xxxxxxx-x)
 email    | text            | Email del formulario (no de BSale)
 codeHash | text            | Hash SHA-256 del código
 expiresAt| integer         | Expiración (+5 min)
 usedAt   | integer (null)  | Timestamp uso
 createdAt| integer         | Timestamp creación
```

### Sessions

```
 id         | integer PK     | Auto-increment
 userRut    | text FK        | Referencia a users.rut
 tokenHash  | text           | Hash del JWT
 expiresAt  | integer        | Expiración JWT
 createdAt  | integer        | Timestamp creación
```

---

## API Routes

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/request-otp` | Generar y enviar OTP |
| POST | `/api/auth/verify` | Verificar OTP, crear sesión |
| POST | `/api/auth/logout` | Invalidar sesión |
| GET | `/api/auth/session` | Obtener sesión actual |

### Validación QR (Futuro)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/validate/[token]` | Validar token QR, verificar en BSale |

---

## Flujo de Login

```
1. Usuario ingresa email + RUT en /login
         ↓
2. POST /api/auth/request-otp
   - Validar formato RUT y email
   - Limpiar RUT: "25.921.801-2" → "25921801-2" (sin puntos, con guion)
   - Consultar BSale: GET /v1/clients.json?code={rut}&expand=[attributes]
   - Generar OTP, guardar hash + email del formulario
   - Enviar OTP al email del formulario (NO al de BSale)
         ↓
3. Usuario recibe email con código OTP
         ↓
4. Usuario ingresa OTP → POST /api/auth/verify
   - Limpiar RUT del input
   - Validar OTP (hash + expiración)
   - Extraer clubWilierNumber de atributos BSale
   - Upsert en DB con email del formulario
   - Crear JWT, set cookie HttpOnly
   - Si es socio: generar QR token (hash del RUT)
         ↓
5. Redirigir a /card (página protegida)
```

### Flujo Sync al Login

```
Al hacer login:
- Consultar BSale: GET /v1/clients.json?code={rut}&expand=[attributes]
- ¿Datos cambiaron? (firstName, lastName, email, clubWilierNumber, state)
  - Sí → Actualizar en DB + regenerar QR si es socio
  - No → No hacer nada
```

---

## Flujo QR de Validación (Futuro)

```
Comercio escanea QR
        ↓
QR contiene: https://clubwilier.cl/validate/{token}
        ↓
GET /api/validate/{token}
        ↓
Buscar token en DB → obtener RUT
        ↓
Consultar BSale: GET /v1/clients.json?code={rut}&expand=[attributes]
        ↓
Verificar:
- Cliente existe en BSale
- Cliente activo (state = 0)
        ↓
Respuesta:
{
  "valid": true,
  "timestamp": "2026-03-19T15:30:00Z"
}

{
  "valid": false,
  "error": "Token no válido",
  "timestamp": "2026-03-19T15:30:00Z"
}
```

---

## Páginas

### /login

Formulario con dos pasos:
1. **Paso 1**: Inputs email + RUT, botón "Solicitar código"
2. **Paso 2**: Input OTP de 6 dígitos, botón "Ingresar"

### /card (Protegida)

```
┌─────────────────────────────────────┐
│  CLUB WILIER                        │
│                                     │
│  Bienvenido, Nelson Izquierdo       │
│  RUT: 25.921.801-2                 │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Socio #23                 │    │
│  │  Club Wilier Activo        │    │
│  └─────────────────────────────┘    │
│                                     │
│  [QR Code]  ← Solo si es socio     │
│                                     │
│  [Cerrar sesión]                    │
└─────────────────────────────────────┘
```

Para usuarios no socios:
```
┌─────────────────────────────────────┐
│  CLUB WILIER                        │
│                                     │
│  Bienvenido, Juan Pérez             │
│  RUT: 12.345.678-9                  │
│                                     │
│  No eres socio del Club Wilier      │
│                                     │
│  [Cerrar sesión]                    │
└─────────────────────────────────────┘
```

---

## Variables de Entorno

```env
# BSale
BSALE_ACCESS_TOKEN="..."

# Base de datos
DATABASE_URL="./data/wilier.db"

# Auth
JWT_SECRET="..."
JWT_EXPIRES_IN="7d"

# Email
RESEND_API_KEY="re_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Dependencias

```bash
# Base de datos
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3

# Auth
pnpm add jose zod

# Email
pnpm add resend

# QR (Futuro)
pnpm add qrcode @types/qrcode
```

---

## Estructura de Archivos

```
src/
├── db/
│   ├── index.ts              # Conexión Drizzle
│   ├── schema.ts             # Esquemas de tablas
│   └── migrations/          # Migraciones SQL
│
├── lib/
│   └── auth/
│       ├── jwt.ts            # Crear/verificar JWT
│       ├── bsale.ts          # Cliente BSale API
│       ├── email.ts          # Envío con Resend
│       ├── otp.ts            # Generar/validar OTP
│       └── rut.ts            # Validación RUT
│
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── request-otp/route.ts
│   │       ├── verify/route.ts
│   │       └── logout/route.ts
│   │
│   ├── login/page.tsx
│   └── card/page.tsx
│
└── middleware.ts             # Proteger rutas
```

---

## Seguridad

- [x] OTP hasheado con SHA-256 antes de guardar
- [x] JWT con secret mínimo 32 caracteres
- [x] Cookie HttpOnly, Secure (prod), SameSite=Lax
- [x] Validación de dígito verificador RUT chileno
- [x] Validación de formato RUT: 7-8 dígitos + guion + DV (1-9 o K)
- [x] Limpieza de RUT: elimina puntos, espacios, mantiene guion y K
- [x] Email del formulario usado para OTP (no se verifica contra BSale)
- [x] Expiración de OTP 5 minutos
- [x] Expiración de sesión 7 días

---

## Migración a Producción

### Neon PostgreSQL

1. Crear proyecto en Neon
2. Obtener connection string
3. Cambiar `DATABASE_URL`
4. Cambiar driver: `better-sqlite3` → `@neondatabase/serverless`
5. Generar migraciones si hay cambios
6. Deployar

### Email del Cliente

1. Configurar dominio de sending en Resend
2. Actualizar `RESEND_API_KEY` con dominio verificado
3. Actualizar from address en templates de email

---

## Roadmap

- [x] Configuración inicial del proyecto
- [x] Implementar autenticación OTP (Fase 1)
  - [x] Instalar dependencias
  - [x] Crear schema de base de datos
  - [x] Crear cliente BSale
  - [x] Crear utilidades de auth (RUT, OTP, JWT, email)
  - [x] Crear API routes (request-otp, verify, logout, session)
  - [x] Modificar página /login
  - [x] Crear página /card
  - [x] Crear middleware
  - [x] Implementar validación RUT chileno con formato flexible (con/sin puntos)
  - [x] Implementar limpieza de RUT (mantiene guion)
  - [x] Implementar envío de OTP al email del formulario
  - [x] Probar flujo completo
- [ ] QR de validación (Fase 2)
- [ ] Wallet Apple/Google (Fase 3)
- [ ] Dashboard del socio (Fase 4)
- [ ] Beneficios y catálogos (Fase 5)
- [ ] Deploy a staging
- [ ] Migración a Neon PostgreSQL
