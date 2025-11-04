import useSWR from 'swr';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../lib/api.js';
import { useAuth } from '../components/AuthContext.js';

const fetcher = (url) => apiClient().get(url).then((res) => res.data);

const DashboardPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const { data: contacts } = useSWR(user ? '/contacts?limit=5' : null, fetcher);
  const { data: tasks } = useSWR(user ? '/tasks?limit=5' : null, fetcher);
  const { data: opportunities } = useSWR(user ? '/opportunities' : null, fetcher);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Resumen</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded p-4">
            <p className="text-sm text-slate-500">Contactos</p>
            <p className="text-3xl font-bold text-slate-800">{contacts?.length || 0}</p>
          </div>
          <div className="bg-white shadow rounded p-4">
            <p className="text-sm text-slate-500">Tareas</p>
            <p className="text-3xl font-bold text-slate-800">{tasks?.length || 0}</p>
          </div>
          <div className="bg-white shadow rounded p-4">
            <p className="text-sm text-slate-500">Oportunidades</p>
            <p className="text-3xl font-bold text-slate-800">{opportunities?.length || 0}</p>
          </div>
        </div>
      </section>
      <section className="bg-white shadow rounded p-4">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Últimos contactos</h3>
        <div className="space-y-2">
          {(contacts || []).map((contact) => (
            <div key={contact.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <p className="text-slate-700 font-medium">{contact.nombre}</p>
                <p className="text-xs text-slate-500">{contact.email}</p>
              </div>
              <span className="text-xs text-slate-500">{contact.telefono}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
