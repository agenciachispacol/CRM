import useSWR from 'swr';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../lib/api.js';
import { useAuth } from '../components/AuthContext.js';

const fetcher = (url) => apiClient().get(url).then((res) => res.data);

const TasksPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const { data: tasks, mutate } = useSWR(user ? '/tasks' : null, fetcher);

  const markAsDone = async (id) => {
    await apiClient().patch(`/tasks/${id}/status`, { estado: 'completada' });
    mutate();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Tareas</h2>
      <div className="bg-white shadow rounded">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Título</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Contacto</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Vencimiento</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(tasks || []).map((task) => (
              <tr key={task.id}>
                <td className="px-4 py-3 text-sm text-slate-700">{task.titulo}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{task.contacto_nombre}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{new Date(task.fecha_vencimiento).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{task.estado}</td>
                <td className="px-4 py-3 text-right">
                  {task.estado !== 'completada' && (
                    <button
                      onClick={() => markAsDone(task.id)}
                      className="px-3 py-1 text-xs bg-emerald-500 text-white rounded"
                    >
                      Completar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksPage;
