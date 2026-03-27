# Plan: Club Wilier - Sistema de Autenticación y Base de Datos

## Objetivo

Implementar un sistema de autenticación con OTP por email para el Club Wilier, utilizando:
- **Base de datos**: SQLite local con Drizzle ORM (migración futura a PostgreSQL/Neon)
- **Autenticación**: Magic link/OTP por email usando Resend
- **Fuente de datos de usuarios**: API de BSale

---

## Arquitectura

### Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Base de datos | SQLite + Drizzle ORM |
| Auth | JWT en cookie HttpOnly + OTP |
| Email | Resend |
| API BSale | REST API con access_token |
| Framework | Next.js 16 (App Router) |

### Estructura de Archivos

```
src/
├── db/
│   ├── index.ts              # Conexión Drizzle + SQLite
│   ├── schema.ts             # Esquemas de tablas
│   └── migrations/
│       └── 0000_init.sql     # CREATE TABLE
│
├── lib/
│   └── auth/
│       ├── jwt.ts            # Crear/verificar JWT (jose)
│       ├── bsale.ts          # Cliente BSale API
│       ├── email.ts          # Envío con Resend
│       ├── otp.ts            # Generar/validar OTP
│       └── rut.ts            # Validar formato RUT chileno
│
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── request-otp/
│   │       │   └── route.ts  # POST: Solicitar OTP
│   │       ├── verify/
│   │       │   └── route.ts  # POST: Verificar OTP
│   │       └── logout/
│   │           └── route.ts  # POST: Cerrar sesión
│   │
│   ├── login/
│   │   └── page.tsx         # Página de login (modificar)
│   │
│   └── card/
│       └── page.tsx          # Página protegida (crear)
│
├── middleware.ts              # Verificar JWT en rutas protegidas
│
└── .env.local               # Variables de entorno
```

---

## Base de Datos

### Esquema (Drizzle + SQLite)

#### Tabla: `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| rut | text (PK) | RUT del cliente (ej: "25921801-2") |
| firstName | text | Nombre |
| lastName | text | Apellido |
| email | text | Email del cliente |
| clubWilierNumber | text | Número de socio (null si no es socio) |
| createdAt | integer | Timestamp de creación en BSale |
| updatedAt | integer | Timestamp de última actualización en BSale |
| lastSyncedAt | integer | Timestamp de última sincronización local |

#### Tabla: `otp_codes`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | integer (PK) | Auto-increment |
| rut | text | RUT asociado al código |
| codeHash | text | Hash SHA-256 del código OTP |
| expiresAt | integer | Timestamp de expiración (+5 min) |
| usedAt | integer | Timestamp de uso (null si no usado) |
| createdAt | integer | Timestamp de creación |

#### Tabla: `sessions`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | integer (PK) | Auto-increment |
| userRut | text (FK) | Referencia a users.rut |
| tokenHash | text | Hash del JWT para invalidación |
| expiresAt | integer | Timestamp de expiración del JWT |
| createdAt | integer | Timestamp de creación |

---

## API Endpoints

### POST /api/auth/request-otp

**Request:**
```json
{
  "email": "usuario@ejemplo.cl",
  "rut": "25921801-2"
}
```

**Flujo:**
1. Validar formato RUT chileno
2. Validar formato email
3. Consultar BSale: `GET /v1/clients.json?code={rut}&expand=[attributes]`
4. Verificar que el email de BSale coincida con el ingresado
5. Si email no coincide → Error 400 "El email no corresponde a este RUT"
6. Si coincide: generar OTP (6 dígitos aleatorios)
7. Guardar hash del OTP en `otp_codes` con `expiresAt = now + 5 min`
8. Enviar email con código vía Resend
9. Responder: `{ "success": true, "message": "Código enviado" }`

**Respuesta de error:**
```json
{
  "success": false,
  "error": "RUT no encontrado en BSale"
}
```

### POST /api/auth/verify

**Request:**
```json
{
  "rut": "25921801-2",
  "code": "123456"
}
```

**Flujo:**
1. Buscar OTP activo para el RUT donde `usedAt IS NULL` y `expiresAt > now`
2. Comparar código con hash almacenado
3. Si inválido → Error 400 "Código inválido o expirado"
4. Si válido:
   - Marcar OTP como usado (`usedAt = now`)
   - Consultar BSale para obtener datos actualizados
   - Extraer `clubWilierNumber` de `attributes.items[].value` donde `name === "Club Wilier"`
   - Upsert en tabla `users`
   - Generar JWT con `{ rut, email }`
   - Guardar hash de sesión en `sessions`
   - Set-Cookie: `session={jwt}; HttpOnly; Secure; SameSite=Lax; Path=/`
   - Responder: `{ "success": true }`

### POST /api/auth/logout

**Flujo:**
1. Leer cookie `session`
2. Extraer JWT y verificar firma
3. Invalidar sesión en DB (eliminar registro)
4. Clear cookie `session`
5. Responder: `{ "success": true }`

### GET /api/auth/session

**Flujo:**
1. Leer cookie `session`
2. Verificar JWT
3. Obtener usuario de DB
4. Responder: `{ "user": { rut, firstName, lastName, email, clubWilierNumber } }`

---

## Flujo de Autenticación

### Login Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                           /login                                     │
│  ┌──────────────┐    ┌──────────────┐                               │
│  │ Email input  │    │ RUT input    │    [Solicitar código]         │
│  └──────────────┘    └──────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    POST /api/auth/request-otp
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        BSale OK         BSale OK         BSale OK
        Email OK         Email OK         Email NO
              │               │               │
              ▼               ▼               ▼
        Email enviado    Email enviado    Error 400
              │               │          "Email no
              │               │          corresponde"
              ▼               ▼
        Mostrar input    Mostrar input
        OTP              OTP
              │               │
              └───────┬───────┘
                      ▼
           Ingresa código OTP
                      │
                      ▼
            POST /api/auth/verify
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
    Código válido           Código inválido
          │                       │
          ▼                       ▼
    Crear JWT,           Error "Código
    set cookie,          inválido o
    sync user,           expirado"
    redirect /card
```

---

## Página /card

### Usuario Socio del Club Wilier

```tsx
// SI clubWilierNumber existe
<div>
  <h1>Bienvenido, {firstName} {lastName}</h1>
  <p>RUT: {rut}</p>
  <p>Socio #{clubWilierNumber}</p>
  <button onClick={logout}>Cerrar sesión</button>
</div>
```

### Usuario No Socio

```tsx
// SI clubWilierNumber es null
<div>
  <h1>Bienvenido, {firstName} {lastName}</h1>
  <p>RUT: {rut}</p>
  <p>No eres socio del Club Wilier</p>
  <button onClick={logout}>Cerrar sesión</button>
</div>
```

---

## Middleware

```typescript
// middleware.ts
// Rutas protegidas: /card
// Si no hay cookie session válida → redirect /login
```

---

## Variables de Entorno (.env.local)

```env
# Existentes
BSALE_ACCESS_TOKEN="99285a6120a0efc55c20b536aaacf4e1d456ac3b"

# Nuevas
DATABASE_URL="./data/wilier.db"
JWT_SECRET="generar-secret-muy-largo-y-aleatorio-para-produccion"
JWT_EXPIRES_IN="7d"
RESEND_API_KEY="re_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Dependencias a Instalar

```bash
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3
pnpm add jose zod resend
```

---

## Orden de Implementación

1. **Infraestructura DB**
   - [ ] Instalar dependencias
   - [ ] Crear `src/db/schema.ts`
   - [ ] Crear `src/db/index.ts`
   - [ ] Configurar `drizzle.config.ts`
   - [ ] Generar y ejecutar migración inicial

2. **Librería Auth**
   - [ ] Crear `src/lib/auth/rut.ts` - Validación RUT chileno
   - [ ] Crear `src/lib/auth/otp.ts` - Generar/validar OTP
   - [ ] Crear `src/lib/auth/bsale.ts` - Cliente BSale API
   - [ ] Crear `src/lib/auth/email.ts` - Envío con Resend
   - [ ] Crear `src/lib/auth/jwt.ts` - JWT con jose

3. **API Routes**
   - [ ] Crear `/api/auth/request-otp/route.ts`
   - [ ] Crear `/api/auth/verify/route.ts`
   - [ ] Crear `/api/auth/logout/route.ts`
   - [ ] Crear `/api/auth/session/route.ts`

4. **Frontend**
   - [ ] Modificar `/login/page.tsx` - Formulario con flujo OTP
   - [ ] Crear `/card/page.tsx` - Página protegida
   - [ ] Crear `/card/components/` - Componentes de UI

5. **Middleware**
   - [ ] Crear `middleware.ts` - Proteger rutas

6. **Testing**
   - [ ] Probar flujo completo login
   - [ ] Verificar sync con BSale
   - [ ] Verificar logout

---

## Consideraciones de Seguridad

1. **OTP**: Hash SHA-256 antes de guardar en DB
2. **JWT**: Secret mínimo 32 caracteres, firma HS256
3. **Cookie**: HttpOnly, Secure (en producción), SameSite=Lax
4. **Validación RUT**: Verificar dígito verificador chileno
5. **Email matching**: Verificar que email del formulario coincida con BSale
6. **Rate limiting**: Opcional, considerar agregar más adelante

---

## Migración Futura a PostgreSQL/Neon

Drizzle ORM facilita la migración:
1. Cambiar driver: `better-sqlite3` → `postgres` o `@neondatabase/serverless`
2. Cambiar `DATABASE_URL` a connection string de Neon
3. Generar nuevas migraciones si hay cambios de schema
4. No requiere cambios en código de aplicación
