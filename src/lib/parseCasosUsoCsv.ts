import Papa from 'papaparse';

// Tipo de registro del CSV (campos principales – se pueden extender según necesidad)
export interface CasoUsoCsvRecord {
  Entidad: string;
  Proyecto: string;
  Etapa: string;
  Estado: string;
  Subtarea?: string;
  PROJECT_ID?: string;
  'Tipo Proyecto'?: string;
  DS1?: string;
  DS2?: string;
  DE?: string;
  MDS?: string;
  Maintance?: string; // (sic en fuente)
  Tallaje?: string;
  Observaciones?: string;
  'Fecha de Inicio'?: string;
  'Fecha de Entrega'?: string;
  Mantenimiento?: string;
  'DS Entidad'?: string;
  'Nivel Impacto Financiero'?: string;
  'Unidad del Impacto Financiero'?: string;
  'Impacto Financiero'?: string;
  'Financiero Aval Digital Labs'?: string;
  'Financiero Entidad'?: string;
  Sponsor?: string;
  'Main Contact'?: string;
  Sandbox?: string;
  'Sharepoint Link'?: string;
  'Sharepoint Actividades'?: string;
  'Jira Link'?: string;
  'Confluence Link'?: string;
  [key: string]: any; // fallback
}

export interface ParseResult {
  records: CasoUsoCsvRecord[];
  porEntidad: Record<string, CasoUsoCsvRecord[]>;
}

// Normaliza headers y valores (trim + elimina espacios dobles)
const normalize = (value: any) =>
  typeof value === 'string'
    ? value.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '')
    : value;

export async function loadCasosUsoCsv(path: string = '/casos_uso.csv'): Promise<ParseResult> {
  const res = await fetch(path);
  if (!res.ok) throw new Error('No se pudo cargar el CSV de casos de uso');
  const text = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse<CasoUsoCsvRecord>(text, {
      header: true,
      delimiter: ';',
      skipEmptyLines: 'greedy',
      transformHeader: (h) => normalize(h.replace(/\uFEFF/g, '')).replace(/;$/, '').replace(/\s+$/,'').replace(/^Entidad$/,'Entidad'),
      transform: (value) => normalize(value),
      complete: (results) => {
        const records = (results.data || []).filter(r => r.Entidad && r.Proyecto);
        const porEntidad: Record<string, CasoUsoCsvRecord[]> = {};
        for (const r of records) {
          const key = r.Entidad;
          if (!porEntidad[key]) porEntidad[key] = [];
          porEntidad[key].push(r);
        }
        resolve({ records, porEntidad });
      },
      error: (err) => reject(err),
    });
  });
}

// Deriva métricas homogéneas para la UI (similar a tarjetas KPI)
export function buildKpis(caso: CasoUsoCsvRecord) {
  const formatoMonto = (m?: string) => {
    if (!m) return 'N/A';
    return m;
  };
  return [
    {
      id: 'estado',
      label: 'Estado',
      value: caso.Estado || 'N/A',
      variant: 'default',
    },
    {
      id: 'etapa',
      label: 'Etapa',
      value: caso.Etapa || 'N/A',
      variant: 'secondary',
    },
    {
      id: 'impacto-nivel',
      label: 'Nivel Impacto',
      value: caso['Nivel Impacto Financiero'] || 'N/D',
      variant: 'outline',
    },
    {
      id: 'impacto',
      label: 'Impacto Financiero',
      value: formatoMonto(caso['Impacto Financiero']),
      variant: 'outline',
    },
    {
      id: 'unidad-impacto',
      label: 'Unidad',
      value: caso['Unidad del Impacto Financiero'] || '—',
      variant: 'outline',
    },
  ];
}

export function classifyCasoTipo(caso: CasoUsoCsvRecord): string {
  const proyecto = (caso.Proyecto || '').toLowerCase();
  if (/churn|retenci/.test(proyecto)) return 'churn';
  if (/top|mejores|customer/.test(proyecto)) return 'tc';
  if (/next|nba|action/.test(proyecto)) return 'nba';
  if (/uso|aumento/.test(proyecto)) return 'aumento-uso';
  return 'generico';
}
