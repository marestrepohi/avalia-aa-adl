import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';

const AumentoUso: React.FC = () => {
  const [filtro, setFiltro] = useState<'activos' | 'durmientes'>('activos');
  const [data, setData] = useState<Record<string, any>[]>([]);

  // Carga y parseo del CSV según filtro
  useEffect(() => {
    const path = filtro === 'activos'
      ? '/Metricas Negocio Activos.csv'
      : '/Metricas Negocio Durmientes.csv';
    fetch(path)
      .then(res => res.text())
      .then(text => {
        const parsed = Papa.parse(text, { header: true, delimiter: ',' });
        setData(parsed.data as Record<string, any>[]);
      });
  }, [filtro]);

  // Función para exportar a CSV
  const exportCsv = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || !rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Aumento de Uso</h1>
      <p className="text-muted-foreground mb-4">Métricas de negocio para usuarios activos y durmientes</p>
      <div className="flex space-x-2 mb-4">
        <Button variant={filtro === 'activos' ? 'primary' : 'outline'} onClick={() => setFiltro('activos')}>
          Activos
        </Button>
        <Button variant={filtro === 'durmientes' ? 'primary' : 'outline'} onClick={() => setFiltro('durmientes')}>
          Durmientes
        </Button>
        <Button onClick={() => exportCsv(`aumento-uso-${filtro}.csv`, data)}>
          Descargar CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            {data[0] && (
              <tr className="bg-gray-100">
                {Object.keys(data[0]).map(col => (
                  <th key={col} className="px-2 py-1 text-left font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {Object.values(row).map((val, j) => (
                  <td key={j} className="px-2 py-1 border-t">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AumentoUso;
