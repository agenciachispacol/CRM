import db from '../config/db.js';

export const getOpportunities = async (req, res, next) => {
  const { companyId } = req.user;
  try {
    const { rows } = await db.query(
      `SELECT o.*, c.nombre AS contacto_nombre
       FROM oportunidades o
       INNER JOIN contactos c ON c.id = o.contacto_id
       WHERE o.empresa_id = $1
       ORDER BY o.updated_at DESC`,
      [companyId]
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
};

export const createOpportunity = async (req, res, next) => {
  const { companyId, id: userId } = req.user;
  const { contactoId, nombre, valor, etapa = 'Nuevo', notas } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO oportunidades (empresa_id, contacto_id, nombre, valor, etapa, notas, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [companyId, contactoId, nombre, valor, etapa, notas, userId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    return next(error);
  }
};

export const updateOpportunityStage = async (req, res, next) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { etapa } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE oportunidades SET etapa=$1, updated_at=NOW() WHERE id=$2 AND empresa_id=$3 RETURNING *`,
      [etapa, id, companyId]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Oportunidad no encontrada' });
    }
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
};

export const updateOpportunity = async (req, res, next) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nombre, valor, notas } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE oportunidades SET nombre=$1, valor=$2, notas=$3, updated_at=NOW()
       WHERE id=$4 AND empresa_id=$5 RETURNING *`,
      [nombre, valor, notas, id, companyId]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Oportunidad no encontrada' });
    }
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
};
