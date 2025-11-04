import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const payload = {
      id: user.id,
      companyId: user.empresa_id,
      role: user.rol,
      name: user.nombre
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, user: payload });
  } catch (error) {
    return next(error);
  }
};
