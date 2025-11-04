import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import apiClient from '../../lib/api.js';

const fetcher = (url) => apiClient().get(url).then((res) => res.data);

const ContactsPage = () => {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const { data: contacts, mutate } = useSWR(`/contacts?search=${search}&etiqueta=${tag}&page=${page}`, fetcher);

  const handleSearch = (event) => {
    event.preventDefault();
    mutate();
  };

  return (
    <div>
      <div className="bg-white shadow rounded p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600">Buscar</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded px-3 py-2"
              placeholder="Nombre, email o teléfono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Etiqueta</label>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded px-3 py-2"
              placeholder="Etiqueta"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded">Filtrar</button>
        </form>
      </div>
      <div className="bg-white shadow rounded">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Nombre</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Teléfono</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Etiquetas</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(contacts || []).map((contact) => (
              <tr key={contact.id}>
                <td className="px-4 py-3 text-sm text-slate-700">{contact.nombre}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{contact.email}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{contact.telefono}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{(contact.etiquetas || []).join(', ')}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/contacts/${contact.id}`} className="text-sm text-slate-600 hover:text-slate-900">
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center px-4 py-3">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 border border-slate-200 rounded"
            disabled={page === 1}
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">Página {page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 border border-slate-200 rounded"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
