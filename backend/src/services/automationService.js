import db from '../config/db.js';

export const createDefaultFollowUpTask = async (contactId, companyId, userId) => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 2);
  const text = 'Seguimiento automático tras crear contacto';
  const query = `
    INSERT INTO tareas (empresa_id, contacto_id, asignado_a, titulo, descripcion, estado, fecha_vencimiento, creado_por)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $3)
    RETURNING *
  `;
  const values = [companyId, contactId, userId, 'Seguimiento inicial', text, 'pendiente', dueDate, userId];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const logWhatsAppMessage = async ({ companyId, contactId, userId, direction, content, providerMessageId }) => {
  const query = `
    INSERT INTO historial_mensajes (empresa_id, contacto_id, usuario_id, canal, direccion, contenido, proveedor_mensaje_id)
    VALUES ($1, $2, $3, 'whatsapp', $4, $5, $6)
    RETURNING *
  `;
  const values = [companyId, contactId, userId, direction, content, providerMessageId];
  const { rows } = await db.query(query, values);
  return rows[0];
};
