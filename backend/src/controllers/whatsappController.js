import axios from 'axios';
import db from '../config/db.js';
import { logWhatsAppMessage } from '../services/automationService.js';

export const sendWhatsApp = async (req, res, next) => {
  const { companyId, id: userId } = req.user;
  const { contactoId, mensaje } = req.body;

  try {
    const { rows } = await db.query('SELECT telefono FROM contactos WHERE id=$1 AND empresa_id=$2', [contactoId, companyId]);
    const contact = rows[0];
    if (!contact) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }

    const payload = {
      apiKey: process.env.WASENDER_KEY,
      to: contact.telefono,
      message: mensaje
    };

    const response = await axios.post(process.env.WASENDER_URL || 'https://api.wasender.com/send', payload);
    const providerMessageId = response.data?.messageId || null;

    await logWhatsAppMessage({
      companyId,
      contactId: contactoId,
      userId,
      direction: 'outbound',
      content: mensaje,
      providerMessageId
    });

    return res.json({ success: true, providerMessageId });
  } catch (error) {
    if (error.response) {
      error.status = error.response.status;
      error.message = error.response.data?.message || error.message;
    }
    return next(error);
  }
};
