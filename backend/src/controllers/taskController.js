import db from '../config/db.js';

export const getTasks = async (req, res, next) => {
  const { companyId } = req.user;
  try {
    const { rows } = await db.query(
      `SELECT t.*, c.nombre AS contacto_nombre
       FROM tareas t
       LEFT JOIN contactos c ON c.id = t.contacto_id
       WHERE t.empresa_id = $1
       ORDER BY t.fecha_vencimiento`,
      [companyId]
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE tareas SET estado=$1, updated_at=NOW() WHERE id=$2 AND empresa_id=$3 RETURNING *`,
      [estado, id, companyId]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
};

export const createTask = async (req, res, next) => {
  const { companyId, id: userId } = req.user;
  const { contactoId, titulo, descripcion, fechaVencimiento, asignadoA } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO tareas (empresa_id, contacto_id, titulo, descripcion, fecha_vencimiento, estado, asignado_a, creado_por)
       VALUES ($1, $2, $3, $4, $5, 'pendiente', $6, $7)
       RETURNING *`,
      [companyId, contactoId, titulo, descripcion, fechaVencimiento, asignadoA || userId, userId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    return next(error);
  }
};
