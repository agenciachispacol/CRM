CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE empresas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  dominio VARCHAR(150) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  rol VARCHAR(30) NOT NULL CHECK (rol IN ('admin', 'vendedor')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contactos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  telefono VARCHAR(30),
  empresa VARCHAR(150),
  notas TEXT,
  etiquetas TEXT[],
  creado_por INTEGER REFERENCES usuarios(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE oportunidades (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  contacto_id INTEGER REFERENCES contactos(id) ON DELETE CASCADE,
  nombre VARCHAR(150) NOT NULL,
  valor NUMERIC(12,2) DEFAULT 0,
  etapa VARCHAR(30) NOT NULL CHECK (etapa IN ('Nuevo', 'Contactado', 'Negociación', 'Cerrado')),
  notas TEXT,
  creado_por INTEGER REFERENCES usuarios(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tareas (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  contacto_id INTEGER REFERENCES contactos(id) ON DELETE SET NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(30) DEFAULT 'pendiente',
  fecha_vencimiento TIMESTAMP,
  asignado_a INTEGER REFERENCES usuarios(id),
  creado_por INTEGER REFERENCES usuarios(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE historial_mensajes (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  contacto_id INTEGER REFERENCES contactos(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id),
  canal VARCHAR(30) NOT NULL,
  direccion VARCHAR(30) NOT NULL,
  contenido TEXT NOT NULL,
  proveedor_mensaje_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Datos de prueba
INSERT INTO empresas (nombre, dominio) VALUES ('Empresa Demo', 'demo.crm');

INSERT INTO usuarios (empresa_id, nombre, email, password_hash, rol)
VALUES
  (1, 'Ana Admin', 'admin@demo.com', '$2b$10$0vn0k8Z9W1h58ynkbuOnLuFGUpYPhBD0dwg9hhaE1MCvB0axN6K3O', 'admin'),
  (1, 'Carlos Vendedor', 'sales@demo.com', '$2b$10$0vn0k8Z9W1h58ynkbuOnLuFGUpYPhBD0dwg9hhaE1MCvB0axN6K3O', 'vendedor');
-- La contraseña encriptada corresponde a "password123"

INSERT INTO contactos (empresa_id, nombre, email, telefono, empresa, notas, etiquetas, creado_por)
VALUES
  (1, 'Juan Pérez', 'juan@example.com', '+34123456789', 'Acme Corp', 'Cliente interesado en plan premium', ARRAY['cliente','premium'], 1),
  (1, 'María García', 'maria@example.com', '+34111222333', 'Globex', 'Solicitó demo del producto', ARRAY['lead'], 1);

INSERT INTO oportunidades (empresa_id, contacto_id, nombre, valor, etapa, notas, creado_por)
VALUES
  (1, 1, 'Upsell Plan Premium', 1200.00, 'Negociación', 'Esperando aprobación', 1),
  (1, 2, 'Nueva implementación', 800.00, 'Contactado', 'Agendar demo', 2);

INSERT INTO tareas (empresa_id, contacto_id, titulo, descripcion, estado, fecha_vencimiento, asignado_a, creado_por)
VALUES
  (1, 1, 'Llamada de seguimiento', 'Revisar dudas del cliente', 'pendiente', NOW() + INTERVAL '2 days', 2, 1);

INSERT INTO historial_mensajes (empresa_id, contacto_id, usuario_id, canal, direccion, contenido)
VALUES
  (1, 1, 2, 'whatsapp', 'outbound', 'Hola Juan, ¿tienes un momento para hablar del plan premium?'),
  (1, 2, 1, 'email', 'outbound', 'Hola María, confirmamos la demo para mañana.');
