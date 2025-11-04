import useSWR from 'swr';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import PipelineBoard from '../components/PipelineBoard.js';
import apiClient from '../lib/api.js';
import { useAuth } from '../components/AuthContext.js';

const fetcher = (url) => apiClient().get(url).then((res) => res.data);

const PipelinePage = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const { data: opportunities, mutate } = useSWR(user ? '/opportunities' : null, fetcher);

  const handleMove = async (id, stage) => {
    await apiClient().patch(`/opportunities/${id}/stage`, { etapa: stage });
    mutate();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Pipeline de ventas</h2>
      <PipelineBoard opportunities={opportunities || []} onMove={handleMove} />
    </div>
  );
};

export default PipelinePage;
