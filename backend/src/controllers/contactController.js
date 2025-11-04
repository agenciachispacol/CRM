import db from '../config/db.js';
import { createDefaultFollowUpTask } from '../services/automationService.js';

export const getContacts = async (req, res, next) => {
  const { companyId } = req.user;
  const { search = '', etiqueta, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const params = [companyId];
    let query = `
      SELECT c.*, COALESCE(json_agg(DISTINCT o.*) FILTER (WHERE o.id IS NOT NULL), '[]') AS oportunidades
      FROM contactos c
      LEFT JOIN oportunidades o ON o.contacto_id = c.id
      WHERE c.empresa_id = $1
    `;
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query += ` AND (LOWER(c.nombre) LIKE $${params.length} OR LOWER(c.email) LIKE $${params.length} OR LOWER(c.telefono) LIKE $${params.length})`;
    }
    if (etiqueta) {
      params.push(etiqueta);
      query += ` AND $${params.length} = ANY (c.etiquetas)`;
    }
    query += ' GROUP BY c.id ORDER BY c.created_at DESC LIMIT ' + parseInt(limit) + ' OFFSET ' + offset;
    const { rows } = await db.query(query, params);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
};

export const getContactById = async (req, res, next) => {
  const { companyId } = req.user;
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT c.*, 
        COALESCE((
          SELECT json_agg(hm ORDER BY hm.created_at DESC)
          FROM historial_mensajes hm
          WHERE hm.contacto_id = c.id
        ), '[]') AS historial,
        COALESCE((
          SELECT json_agg(t ORDER BY t.fecha_vencimiento)
          FROM tareas t
          WHERE t.contacto_id = c.id
        ), '[]') AS tareas
      FROM contactos c
      WHERE c.empresa_id = $1 AND c.id = $2`,
      [companyId, id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
};

export const createContact = async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { companyId, id: userId } = req.user;
    const { nombre, email, telefono, empresa, notas, etiquetas = [] } = req.body;
    const insertContact = `
      INSERT INTO contactos (empresa_id, nombre, email, telefono, empresa, notas, etiquetas, creado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const { rows } = await client.query(insertContact, [companyId, nombre, email, telefono, empresa, notas, etiquetas, userId]);
    const contact = rows[0];
    await createDefaultFollowUpTask(contact.id, companyId, userId);
    await client.query('COMMIT');
    return res.status(201).json(contact);
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
};

export const updateContact = async (req, res, next) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nombre, email, telefono, empresa, notas, etiquetas = [] } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE contactos SET nombre=$1, email=$2, telefono=$3, empresa=$4, notas=$5, etiquetas=$6, updated_at=NOW()
      WHERE id=$7 AND empresa_id=$8 RETURNING *`,
      [nombre, email, telefono, empresa, notas, etiquetas, id, companyId]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  const { companyId } = req.user;
  const { id } = req.params;
  try {
    await db.query('DELETE FROM contactos WHERE id=$1 AND empresa_id=$2', [id, companyId]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
