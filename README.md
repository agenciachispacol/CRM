# SaaS CRM - Plataforma completa

Proyecto CRM web multiempresa diseñado como SaaS listo para desplegar en un VPS. Incluye frontend en Next.js, backend en Express, base de datos PostgreSQL, integración con API de WhatsApp y automatizaciones de tareas.

## Características principales

- **Autenticación segura** con JWT, roles de usuario (admin, vendedor) y aislamiento por empresa.
- **Gestión de contactos** con filtros, etiquetas, paginación y ficha detallada con notas, tareas e historial de mensajes.
- **Pipeline de ventas tipo Kanban** con etapas personalizadas (Nuevo, Contactado, Negociación, Cerrado) y acciones rápidas para mover oportunidades.
- **Integración con WhatsApp** mediante endpoint `/api/send-whatsapp` que consume WaSender (o WhatsApp Cloud API) y registra la interacción automáticamente.
- **Automatizaciones**: creación de tarea de seguimiento al registrar un contacto y guardado automático de mensajes enviados por WhatsApp.
- **Frontend responsive** basado en Next.js + Tailwind CSS.
- **Backend Express** con conexión PostgreSQL, capa de servicios y middlewares de seguridad.
- **Infraestructura lista para producción** con scripts de despliegue, configuración Nginx/PM2 y certificados SSL con Let’s Encrypt.

## Requisitos previos

- Node.js 18+
- PostgreSQL 14+
- Cuenta y API key de WaSender (o adaptar a WhatsApp Cloud API)

## Variables de entorno

### Backend (`backend/.env`)
```
PORT=4000
DATABASE_URL=postgresql://crm_user:securepassword@localhost:5432/crm_saas
JWT_SECRET=supersecret
WASENDER_KEY=your_wasender_api_key
WASENDER_URL=https://api.wasender.com/send
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`frontend/.env`)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Instalación local

```bash
# Backend
yarn --cwd backend install # o npm install --prefix backend
cp backend/.env.example backend/.env
npm run --prefix backend dev

# Frontend
yarn --cwd frontend install # o npm install --prefix frontend
cp frontend/.env.example frontend/.env
npm run --prefix frontend dev
```

La API estará disponible en `http://localhost:4000/api` y la interfaz en `http://localhost:3000`.

## Base de datos

Ejecuta el script inicial `database/init.sql` para crear tablas y datos demo:

```bash
psql -U postgres -d crm_saas -f database/init.sql
```

Estructura de tablas:

- `empresas`: Organizaciones registradas.
- `usuarios`: Usuarios con roles y contraseña hasheada.
- `contactos`: Leads/Clientes con etiquetas.
- `oportunidades`: Registro del pipeline comercial.
- `tareas`: Acciones y seguimientos asignados.
- `historial_mensajes`: Mensajes enviados/recibidos (WhatsApp, email, etc.).

## Endpoints destacados

- `POST /api/auth/login`: Inicio de sesión, retorna JWT.
- `GET /api/contacts`: Listado con filtros `search`, `etiqueta`, `page`, `limit`.
- `POST /api/contacts`: Crea contacto y genera tarea automática.
- `GET /api/contacts/:id`: Ficha del contacto con historial y tareas.
- `GET/POST/PATCH /api/opportunities`: Gestión de pipeline.
- `GET/POST/PATCH /api/tasks`: Tareas y cambios de estado.
- `GET /api/messages`: Historial de mensajes.
- `POST /api/send-whatsapp`: Enviar mensajes vía WaSender y registrar la interacción.

## Automatizaciones incluidas

- `createDefaultFollowUpTask`: crea una tarea de seguimiento 48h después de registrar un nuevo contacto.
- `logWhatsAppMessage`: almacena cada mensaje enviado desde la API para mantener el historial centralizado.

## Despliegue en VPS

1. **Clonar el repositorio** en `/var/www/crm` (o ruta preferida).
2. **Ejecutar script de preparación** (revisar variables antes de ejecutar):
   ```bash
   bash scripts/setup_server.sh
   ```
3. **Configurar variables de entorno**:
   - Backend: `/var/www/crm/backend/.env`
   - Frontend: `/var/www/crm/frontend/.env`
4. **Instalar dependencias y construir**:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   npm run --prefix frontend build
   ```
5. **Migrar base de datos**:
   ```bash
   psql -U crm_user -d crm_saas -f database/init.sql
   ```
6. **Iniciar servicios con PM2**:
   ```bash
   pm2 start backend/src/server.js --name crm-api --env production
   pm2 start npm --name crm-frontend -- start --prefix frontend
   pm2 save
   pm2 startup systemd
   ```
7. **Configurar Nginx y SSL**:
   - Editar `deploy/nginx.conf` con el dominio real.
   - Activar configuración: `sudo ln -sf /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/crm`
   - Reiniciar Nginx: `sudo systemctl reload nginx`
   - Certificados con Let’s Encrypt ya incluidos en `scripts/setup_server.sh` (usa Certbot webroot).

### Mantenimiento con PM2

- Ver procesos: `pm2 ls`
- Logs: `pm2 logs crm-api`
- Reinicio tras despliegue: `pm2 restart crm-api crm-frontend`
- Persistencia tras reinicio: `pm2 save`

## Árbol del proyecto

```
.
├── backend
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── package.json
│   └── src
│       ├── app.js
│       ├── config
│       │   └── db.js
│       ├── controllers
│       │   ├── authController.js
│       │   ├── contactController.js
│       │   ├── messageController.js
│       │   ├── opportunityController.js
│       │   ├── taskController.js
│       │   └── whatsappController.js
│       ├── middleware
│       │   └── authMiddleware.js
│       ├── routes
│       │   ├── authRoutes.js
│       │   ├── contactRoutes.js
│       │   ├── messageRoutes.js
│       │   ├── opportunityRoutes.js
│       │   ├── taskRoutes.js
│       │   └── whatsappRoutes.js
│       ├── server.js
│       └── services
│           └── automationService.js
├── database
│   └── init.sql
├── deploy
│   └── nginx.conf
├── frontend
│   ├── .env.example
│   ├── components
│   │   ├── AuthContext.js
│   │   ├── Layout.js
│   │   ├── PipelineBoard.js
│   │   └── WhatsAppButton.js
│   ├── lib
│   │   └── api.js
│   ├── next.config.js
│   ├── package.json
│   ├── pages
│   │   ├── _app.js
│   │   ├── contacts
│   │   │   ├── [id].js
│   │   │   └── index.js
│   │   ├── dashboard.js
│   │   ├── index.js
│   │   ├── pipeline.js
│   │   └── tasks.js
│   ├── postcss.config.js
│   ├── styles
│   │   └── globals.css
│   └── tailwind.config.js
├── scripts
│   └── setup_server.sh
└── README.md
```

## Diagrama de flujo

```mermaid
flowchart LR
  subgraph Frontend
    A[Next.js App] -->|JWT| B[AuthContext]
    A --> C[Contactos UI]
    A --> D[Pipeline UI]
    A --> E[WhatsApp Button]
  end

  subgraph Backend
    F[Express API]
    F --> G[(PostgreSQL)]
    F --> H[WaSender API]
    F --> I[Automatizaciones]
  end

  B -->|/api/auth/login| F
  C -->|/api/contacts| F
  D -->|/api/opportunities| F
  E -->|/api/send-whatsapp| F
  F -->|INSERT/SELECT| G
  F -->|Webhook futuro| H
  F -->|Tareas automáticas| I
```

## Próximos pasos sugeridos

- Configurar dominios reales en `deploy/nginx.conf` y `scripts/setup_server.sh`.
- Integrar webhooks de WhatsApp para registrar mensajes entrantes.
- Añadir tests automatizados y CI/CD.
- Implementar facturación y planes dentro del modelo SaaS.

¡Listo! Con estos recursos puedes desplegar y vender el CRM como servicio a empresas.
