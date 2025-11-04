import { useMemo } from 'react';

const stages = ['Nuevo', 'Contactado', 'Negociación', 'Cerrado'];

const PipelineBoard = ({ opportunities = [], onMove }) => {
  const grouped = useMemo(() => {
    const result = {};
    stages.forEach((stage) => { result[stage] = []; });
    opportunities.forEach((opp) => {
      const stage = stages.includes(opp.etapa) ? opp.etapa : 'Nuevo';
      result[stage].push(opp);
    });
    return result;
  }, [opportunities]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stages.map((stage) => (
        <div key={stage} className="bg-white shadow rounded p-4">
          <h2 className="font-semibold text-slate-700 mb-2">{stage}</h2>
          <div className="space-y-3">
            {grouped[stage].map((opp) => (
              <div key={opp.id} className="border border-slate-200 rounded p-3 bg-slate-50">
                <h3 className="font-medium text-slate-700">{opp.nombre}</h3>
                <p className="text-sm text-slate-500">Contacto: {opp.contacto_nombre}</p>
                <p className="text-sm text-slate-500">Valor: ${opp.valor}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {stages.filter((s) => s !== stage).map((s) => (
                    <button
                      key={s}
                      onClick={() => onMove(opp.id, s)}
                      className="text-xs px-2 py-1 bg-slate-200 rounded hover:bg-slate-300"
                    >
                      Mover a {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PipelineBoard;
