import '../styles/globals.css';
import { AuthProvider, useAuth } from '../components/AuthContext.js';
import Layout from '../components/Layout.js';

const AppLayout = ({ Component, pageProps }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center text-slate-600">Cargando...</div>;
  }

  if (!user && Component.publicPage) {
    return <Component {...pageProps} />;
  }

  if (!user) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppLayout Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
