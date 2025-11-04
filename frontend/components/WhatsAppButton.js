import { useState } from 'react';
import apiClient from '../lib/api.js';

const WhatsAppButton = ({ contactoId, onSent }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const sendMessage = async () => {
    if (!message) return;
    setLoading(true);
    setFeedback(null);
    try {
      const client = apiClient();
      await client.post('/send-whatsapp', { contactoId, mensaje: message });
      setFeedback('Mensaje enviado');
      setMessage('');
      onSent?.();
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Error enviando mensaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border border-emerald-200 rounded p-3 bg-emerald-50">
      <textarea
        className="w-full border border-emerald-200 rounded p-2 text-sm"
        rows={3}
        placeholder="Escribe un mensaje de WhatsApp"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex justify-between items-center mt-2">
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-3 py-1 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar WhatsApp'}
        </button>
        {feedback && <span className="text-xs text-emerald-700">{feedback}</span>}
      </div>
    </div>
  );
};

export default WhatsAppButton;
