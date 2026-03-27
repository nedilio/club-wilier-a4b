# Fase 1: Autenticación OTP - Implementación Completada

## Resumen

Se implementó el sistema completo de autenticación con OTP por email para el Club Wilier.

## Funcionalidades Implementadas

- [x] Login con RUT + email
- [x] Verificación OTP por email (6 dígitos)
- [x] Sincronización de datos con BSale
- [x] Visualización de estado de socio Club Wilier
- [x] Logout

## Archivos Creados

### Base de Datos

```
src/db/
├── index.ts              # Conexión Drizzle + SQLite
├── schema.ts             # Esquemas: users, otp_codes, sessions
└── migrations/
    └── 0000_*.sql       # Migración inicial
```

### Librería Auth

```
src/lib/auth/
├── rut.ts               # Validación de RUT chileno
├── otp.ts               # Generación y verificación de OTP
├── jwt.ts               # Crear/verificar JWT, cookies
├── email.ts             # Envío con Resend
└── bsale.ts             # Cliente BSale API
```

### API Routes

```
src/app/api/auth/
├── request-otp/route.ts  # POST: Solicitar OTP
├── verify/route.ts       # POST: Verificar OTP, crear sesión
├── logout/route.ts       # POST: Cerrar sesión
└── session/route.ts      # GET: Obtener sesión actual
```

### Frontend

```
src/components/login-form.tsx  # Formulario con flujo OTP
src/app/card/page.tsx          # Página protegida del socio
src/middleware.ts             # Protección de rutas
```

## Flujo de Autenticación

```
1. Usuario ingresa email + RUT en /login
         ↓
2. POST /api/auth/request-otp
   - Validar formato RUT y email
   - Consultar BSale: GET /v1/clients.json?code={rut}&expand=[attributes]
   - Verificar que email coincida con BSale
   - Generar OTP, guardar hash, enviar por email
         ↓
3. Usuario recibe email con código OTP
         ↓
4. Usuario ingresa OTP → POST /api/auth/verify
   - Validar OTP (hash + expiración)
   - Extraer clubWilierNumber de atributos BSale
   - Upsert en DB, crear JWT, set cookie HttpOnly
         ↓
5. Redirigir a /card (página protegida)
```

## Modelo de Datos

### Users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| rut | text PK | RUT del cliente |
| firstName | text | Nombre |
| lastName | text | Apellido |
| email | text | Email |
| clubWilierNumber | text (null) | Número de socio |
| qrToken | text (null) | Token para QR (reservado) |
| createdAt | integer | Timestamp BSale |
| updatedAt | integer | Timestamp BSale |
| lastSyncedAt | integer | Timestamp sincronización |

### OTP Codes
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | integer PK | Auto-increment |
| rut | text | RUT asociado |
| codeHash | text | Hash SHA-256 del código |
| expiresAt | integer | Expiración (+5 min) |
| usedAt | integer (null) | Timestamp uso |
| createdAt | integer | Timestamp creación |

### Sessions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | integer PK | Auto-increment |
| userRut | text FK | Referencia a users.rut |
| tokenHash | text | Hash del JWT |
| expiresAt | integer | Expiración JWT |
| createdAt | integer | Timestamp creación |

## Dependencias Instaladas

```bash
drizzle-orm
better-sqlite3
jose
zod
resend
drizzle-kit
@types/better-sqlite3
```

## Variables de Entorno

```env
BSALE_ACCESS_TOKEN="..."
RESEND_API_KEY="..."
DATABASE_URL="./data/wilier.db"
JWT_SECRET="..."
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Seguridad Implementada

- [x] OTP hasheado con SHA-256
- [x] JWT con secret mínimo 32 caracteres
- [x] Cookie HttpOnly, Secure (prod), SameSite=Lax
- [x] Validación de dígito verificador RUT chileno
- [x] Verificación de email contra BSale
- [x] Expiración de OTP 5 minutos
- [x] Expiración de sesión 7 días

## Próximos Pasos

- Probar flujo completo con usuario real
- Implementar Fase 2: QR de validación
- Implementar Fase 3: Wallet (Apple/Google)
