import Link from 'next/link';
import { useAuth } from './AuthContext.js';

const navigation = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/contacts', label: 'Contactos' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/tasks', label: 'Tareas' }
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">SaaS CRM</h1>
          <nav className="space-x-4">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-900">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">{user?.name} ({user?.role})</span>
            <button onClick={logout} className="px-3 py-1 rounded bg-slate-800 text-white text-sm">Salir</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
