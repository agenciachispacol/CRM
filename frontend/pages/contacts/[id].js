import { useRouter } from 'next/router';
import useSWR from 'swr';
import WhatsAppButton from '../../components/WhatsAppButton.js';
import apiClient from '../../lib/api.js';

const fetcher = (url) => apiClient().get(url).then((res) => res.data);

const ContactDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: contact, mutate } = useSWR(() => (id ? `/contacts/${id}` : null), fetcher);

  if (!contact) {
    return <p className="text-slate-600">Cargando contacto...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold text-slate-800">{contact.nombre}</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <p><span className="font-semibold">Email:</span> {contact.email}</p>
          <p><span className="font-semibold">Teléfono:</span> {contact.telefono}</p>
          <p><span className="font-semibold">Empresa:</span> {contact.empresa}</p>
          <p><span className="font-semibold">Etiquetas:</span> {(contact.etiquetas || []).join(', ')}</p>
        </div>
        <p className="mt-4 text-sm text-slate-600">{contact.notas}</p>
        <WhatsAppButton contactoId={contact.id} onSent={() => mutate()} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white shadow rounded p-4">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">Historial de mensajes</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(contact.historial || []).map((message) => (
              <div key={message.id} className="border border-slate-200 rounded p-2">
                <p className="text-xs text-slate-500">{new Date(message.created_at).toLocaleString()} ({message.direccion})</p>
                <p className="text-sm text-slate-700">{message.contenido}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-white shadow rounded p-4">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">Tareas</h3>
          <ul className="space-y-2">
            {(contact.tareas || []).map((task) => (
              <li key={task.id} className="border border-slate-200 rounded p-3">
                <p className="text-sm font-medium text-slate-700">{task.titulo}</p>
                <p className="text-xs text-slate-500">Vence: {new Date(task.fecha_vencimiento).toLocaleDateString()}</p>
                <p className="text-xs text-slate-500">Estado: {task.estado}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ContactDetailPage;
