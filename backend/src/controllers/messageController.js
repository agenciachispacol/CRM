import db from '../config/db.js';

export const getMessages = async (req, res, next) => {
  const { companyId } = req.user;
  const { contactoId } = req.query;
  try {
    const { rows } = await db.query(
      `SELECT * FROM historial_mensajes
       WHERE empresa_id=$1 AND ($2::INT IS NULL OR contacto_id=$2)
       ORDER BY created_at DESC`,
      [companyId, contactoId || null]
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
};
