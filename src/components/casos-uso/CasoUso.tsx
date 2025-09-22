import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Cpu, BarChart3, Zap, Activity, Clock, CheckCircle, AlertCircle, CreditCard, Home, Car, Building, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, ComposedChart, Legend, Scatter, PieChart, Pie } from 'recharts';
import Papa from 'papaparse';

interface CasoUsoProps {
  tipo: 'churn' | 'tc' | 'nba' | 'aumento-uso' | 'generico';
  displayTitle?: string; // título temporal personalizado
  csvRecord?: Record<string, any>; // registro CSV del caso
}

const CasoUso: React.FC<CasoUsoProps> = ({ tipo, displayTitle, csvRecord }) => {
  const [modeloSeleccionado, setModeloSeleccionado] = useState('tarjeta-credito');
  const [filtroUsuario, setFiltroUsuario] = useState<'activos' | 'durmientes'>('activos');
  const esCastigadaBdB = !!(csvRecord?.Proyecto?.toLowerCase?.().includes('cobranzas cartera castigada bdb'));

  const [camposDesc, setCamposDesc] = useState<Record<string, string>>({});
  // Backtesting (BdB) state
  type BtRow = {
    decil_probabilidad: number;
    marca_bueno_evidente: number;
    clientes: number;
    respuesta: number;
    tasa_buenos: number;
    distribucion: number;
    lift: number;
    saldo_total: number;
    // pagos por horizonte
    sum_pagos_1m_total?: number;
    sum_pagos_2m_total?: number;
    sum_pagos_3m_total: number;
    // acumulados (opcionales en algunas filas)
    sum_pagos_3m_acum?: number;
    tasa_recu_3m_acum?: number;
    psi?: number;
    ks?: number;
    roc?: number;
    fecha: string; // ej: 202503
    segmento: string; // ej: 1_Alto_p1
  };
  const [btRows, setBtRows] = useState<BtRow[] | null>(null);
  const [btFecha, setBtFecha] = useState<string | null>(null);
  const [btSegmento, setBtSegmento] = useState<string | null>(null);
  const [btHorizon, setBtHorizon] = useState<'1m' | '2m' | '3m'>('3m');
  const [btTechMetric, setBtTechMetric] = useState<'auc' | 'ks' | 'psi'>('auc');
  // Pilot negocio (BdB)
  // Estado pilotDeciles removido junto con el formulario de métricas de negocio BdB
  const [pilotCostoContacto, setPilotCostoContacto] = useState<number>(0);
  // Negocio (BdB) agrupaciones
  const [negGroupBy, setNegGroupBy] = useState<'segmento' | 'fecha' | 'decil' | 'marca'>('segmento');


  useEffect(() => {
    // Cargar descripciones de campos para tooltips del backtesting (si aplica)
    const cargarCampos = async () => {
      if (!esCastigadaBdB) return;
      const base = (import.meta as any)?.env?.BASE_URL || '/';
      const candidatos = [
        `${base}campos_backtesting_Cobranzas Cartera Castigada BdB.csv`,
        `${base}campos_backtestig_Cobranzas Cartera Castigada BdB.csv` // fallback con posible typo
      ];
      for (const url of candidatos) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const text = await res.text();
          const parsed = Papa.parse<{ Campo: string; Descripcion?: string }>(text, {
            header: true,
            delimiter: ';',
            skipEmptyLines: true
          });
          const map: Record<string, string> = {};
          parsed.data.forEach((row) => {
            if (row.Campo) map[row.Campo.trim()] = (row.Descripcion || '').trim();
          });
          if (Object.keys(map).length) {
            setCamposDesc(map);
            break;
          }
        } catch {}
      }
    };
    cargarCampos();
  }, [esCastigadaBdB]);

  // Helper: parse numbers from CSV with comma decimals, thousand dots, spaces and scientific notation
  const parseCsvNumber = (v: any): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    let s = String(v).trim();
    if (!s) return 0;
    // remove spaces
    s = s.replace(/\s+/g, '');
    // detect comma decimals or scientific notation with comma
    const hasComma = /,/.test(s);
    if (hasComma) {
      // remove thousand dots then replace comma with dot
      s = s.replace(/\./g, '').replace(/,/g, '.');
    } else {
      // no comma, just drop thousand separators
      s = s.replace(/\./g, '');
    }
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  // Cargar datos de backtesting reales
  useEffect(() => {
    const cargarBacktesting = async () => {
      if (!esCastigadaBdB) return;
      try {
        const base = (import.meta as any)?.env?.BASE_URL || '/';
        const res = await fetch(`${base}backtesting_Cobranzas Cartera Castigada BdB.csv`);
        if (!res.ok) return;
        const text = await res.text();
        const parsed = Papa.parse(text, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true
        });
        const rows: BtRow[] = (parsed.data as any[])
          .map((r) => {
            // normalizar llaves con espacios
            const get = (key: string) => r[key] ?? r[key.trim()] ?? r[key.replace(/\s+/g, ' ')] ?? r[key.replace(/\s+/g, '')];
            return {
              decil_probabilidad: parseCsvNumber(get('decil_probabilidad')),
              marca_bueno_evidente: parseCsvNumber(get('marca_bueno_evidente')),
              clientes: parseCsvNumber(get('clientes')),
              respuesta: parseCsvNumber(get('respuesta')),
              tasa_buenos: parseCsvNumber(get('tasa_buenos')),
              distribucion: parseCsvNumber(get('distribucion')),
              lift: parseCsvNumber(get('lift')),
              saldo_total: parseCsvNumber(get('saldo_total')),
              sum_pagos_1m_total: parseCsvNumber(get('sum_pagos_1m_total')),
              sum_pagos_2m_total: parseCsvNumber(get('sum_pagos_2m_total')),
              sum_pagos_3m_total: parseCsvNumber(get('sum_pagos_3m_total')),
              sum_pagos_3m_acum: parseCsvNumber(get('sum_pagos_3m_acum')),
              tasa_recu_3m_acum: parseCsvNumber(get('tasa_recu_3m_acum')),
              psi: parseCsvNumber(get('psi')),
              ks: parseCsvNumber(get('ks')),
              roc: parseCsvNumber(get('roc')),
              fecha: String(get('fecha') ?? ''),
              segmento: ((): string => {
                const raw = String(get('segmento') ?? '').trim();
                if (!raw) return '';
                // Normalizar guiones y espacios
                const norm = raw.replace(/\s+/g, '_').replace(/__+/g, '_');
                // Asegurar prefijo numero_ si viene separado por espacio
                // Mantener mayúsculas tal como llegan en la porción de riesgo (Alto/Medio/Bajo)
                return norm;
              })()
            } as BtRow;
          })
          .filter((r) => r.segmento && r.fecha);

        if (!rows.length) return;
        setBtRows(rows);

        // fechas disponibles y selección por defecto (máxima)
        const fechas = Array.from(new Set(rows.map((r) => r.fecha))).sort();
        const fechaDefault = fechas[fechas.length - 1];
        setBtFecha(fechaDefault);

        // seleccionar segmento con mayor pagado en esa fecha por defecto
        const porFecha = rows.filter((r) => r.fecha === fechaDefault);
        const porSegmentoMap = new Map<string, { pagado: number }>();
        porFecha.forEach((r) => {
          const acc = porSegmentoMap.get(r.segmento) || { pagado: 0 };
          acc.pagado += r.sum_pagos_3m_total;
          porSegmentoMap.set(r.segmento, acc);
        });
        const segmentoDefault = Array.from(porSegmentoMap.entries()).sort((a, b) => b[1].pagado - a[1].pagado)[0]?.[0] || porFecha[0].segmento;
        setBtSegmento(segmentoDefault);
      } catch (e) {
        // noop
      }
    };
    cargarBacktesting();
  }, [esCastigadaBdB]);


  const getDesc = (campo: string, fallback?: string) =>
    camposDesc[campo] || fallback || '';
  const defaultTab = csvRecord ? 'info' : 'financieras';
  // Función para exportar datos a CSV
  const exportToCsv = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || !rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(h => JSON.stringify(row[h] == null ? '' : row[h])).join(',')
      )
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const casosInfo = {
    churn: {
      nombre: 'Churn Prediction',
      descripcion: 'Predicción de abandono de clientes',
      color: 'bg-red-500'
    },
    tc: {
      nombre: 'Top Customers',
      descripcion: 'Identificación de mejores clientes',
      color: 'bg-green-500'
    },
    nba: {
      nombre: 'Next Best Action',
      descripcion: 'Próxima mejor acción comercial',
      color: 'bg-blue-500'
    },
    'aumento-uso': {
      nombre: 'Aumento de Uso',
      descripcion: 'Incremento en utilización de productos',
      color: 'bg-purple-500'
    },
    generico: {
      nombre: 'Caso de Uso Genérico',
      descripcion: 'Vista temporal basada en plantilla Churn',
      color: 'bg-slate-500'
    }
  };

  // Ensure tipo is valid
  const tipoValido = casosInfo[tipo] ? tipo : 'generico';
  const tipoFinal = tipoValido || 'generico';

  const metricas = {
    financieras: [
      { titulo: 'ROI del Modelo', valor: '342%', icono: DollarSign, tendencia: 'up' },
      { titulo: 'Ahorro Anual', valor: '$2.4M', icono: TrendingUp, tendencia: 'up' },
      { titulo: 'Costo por Predicción', valor: '$0.15', icono: DollarSign, tendencia: 'down' },
      { titulo: 'Revenue Protegido', valor: '$8.7M', icono: TrendingUp, tendencia: 'up' }
    ],
    negocio: [
      { titulo: 'Precisión del Modelo', valor: '94.2%', icono: Target, tendencia: 'up' },
      { titulo: 'Clientes Retenidos', valor: '2,847', icono: Users, tendencia: 'up' },
      { titulo: 'Tasa de Conversión', valor: '67.8%', icono: TrendingUp, tendencia: 'up' },
      { titulo: 'Tiempo de Respuesta', valor: '< 2h', icono: Zap, tendencia: 'up' }
    ],
    tecnicas: [
      { titulo: 'AUC Score', valor: '0.92', icono: BarChart3, tendencia: 'up' },
      { titulo: 'F1 Score', valor: '0.89', icono: BarChart3, tendencia: 'up' },
      { titulo: 'Latencia API', valor: '45ms', icono: Cpu, tendencia: 'down' },
      { titulo: 'Uptime', valor: '99.9%', icono: Zap, tendencia: 'up' }
    ]
  };

  // Modelos específicos para NBA
  const modelos = {
    'tarjeta-credito': {
      nombre: 'Tarjeta de Crédito',
      icono: CreditCard,
      metricas: {
        precision: '96.4%',
        recall: '93.2%',
        f1Score: '94.8%',
        auc: '0.967',
        latencia: '32ms',
        throughput: '15.2k/min'
      },
      datos: [
        { mes: 'Ene', precision: 95.1, recall: 92.8, f1: 93.9 },
        { mes: 'Feb', precision: 95.8, recall: 93.1, f1: 94.4 },
        { mes: 'Mar', precision: 96.2, recall: 93.0, f1: 94.6 },
        { mes: 'Abr', precision: 96.0, recall: 93.5, f1: 94.7 },
        { mes: 'May', precision: 96.3, recall: 93.2, f1: 94.7 },
        { mes: 'Jun', precision: 96.4, recall: 93.2, f1: 94.8 }
      ]
    },
    'libranza': {
      nombre: 'Libranza',
      icono: Building,
      metricas: {
        precision: '94.7%',
        recall: '91.8%',
        f1Score: '93.2%',
        auc: '0.952',
        latencia: '28ms',
        throughput: '18.5k/min'
      },
      datos: [
        { mes: 'Ene', precision: 93.8, recall: 91.2, f1: 92.5 },
        { mes: 'Feb', precision: 94.1, recall: 91.5, f1: 92.8 },
        { mes: 'Mar', precision: 94.3, recall: 91.6, f1: 92.9 },
        { mes: 'Abr', precision: 94.5, recall: 91.7, f1: 93.1 },
        { mes: 'May', precision: 94.6, recall: 91.8, f1: 93.2 },
        { mes: 'Jun', precision: 94.7, recall: 91.8, f1: 93.2 }
      ]
    },
    'hipotecario': {
      nombre: 'Hipotecario',
      icono: Home,
      metricas: {
        precision: '92.1%',
        recall: '89.4%',
        f1Score: '90.7%',
        auc: '0.934',
        latencia: '45ms',
        throughput: '8.2k/min'
      },
      datos: [
        { mes: 'Ene', precision: 91.2, recall: 88.9, f1: 90.0 },
        { mes: 'Feb', precision: 91.5, recall: 89.1, f1: 90.3 },
        { mes: 'Mar', precision: 91.8, recall: 89.2, f1: 90.5 },
        { mes: 'Abr', precision: 91.9, recall: 89.3, f1: 90.6 },
        { mes: 'May', precision: 92.0, recall: 89.4, f1: 90.7 },
        { mes: 'Jun', precision: 92.1, recall: 89.4, f1: 90.7 }
      ]
    },
    'credito-vehiculos': {
      nombre: 'Crédito Vehículos',
      icono: Car,
      metricas: {
        precision: '93.8%',
        recall: '90.6%',
        f1Score: '92.2%',
        auc: '0.946',
        latencia: '38ms',
        throughput: '12.1k/min'
      },
      datos: [
        { mes: 'Ene', precision: 93.1, recall: 90.1, f1: 91.6 },
        { mes: 'Feb', precision: 93.3, recall: 90.3, f1: 91.8 },
        { mes: 'Mar', precision: 93.5, recall: 90.4, f1: 91.9 },
        { mes: 'Abr', precision: 93.6, recall: 90.5, f1: 92.0 },
        { mes: 'May', precision: 93.7, recall: 90.6, f1: 92.1 },
        { mes: 'Jun', precision: 93.8, recall: 90.6, f1: 92.2 }
      ]
    }
  };

  // Datos para gráficos de series de tiempo
  const seriesTemporales = [
    { fecha: 'Ene', precision: 92.1, latencia: 48, roi: 320 },
    { fecha: 'Feb', precision: 93.5, latencia: 46, roi: 335 },
    { fecha: 'Mar', precision: 94.2, latencia: 45, roi: 342 },
    { fecha: 'Abr', precision: 93.8, latencia: 44, roi: 338 },
    { fecha: 'May', precision: 94.5, latencia: 43, roi: 348 },
    { fecha: 'Jun', precision: 95.1, latencia: 42, roi: 355 }
  ];

  // Datos para gráfico de barras
  const datosBarras = [
    { mes: 'Ene', predicciones: 1850, correctas: 1702 },
    { mes: 'Feb', predicciones: 2100, correctas: 1963 },
    { mes: 'Mar', predicciones: 2350, correctas: 2214 },
    { mes: 'Abr', predicciones: 2200, correctas: 2064 },
    { mes: 'May', predicciones: 2500, correctas: 2363 },
    { mes: 'Jun', predicciones: 2700, correctas: 2568 }
  ];

  // Datos para pie chart
  const datosPie = [
    { name: 'Precisas', value: 94.2, color: '#10b981' },
    { name: 'Falsos Positivos', value: 3.8, color: '#f59e0b' },
    { name: 'Falsos Negativos', value: 2.0, color: '#ef4444' }
  ];

  // Series de tiempo para secciones de Aumento de Uso
  const activosTimeSeriesData = [
    { periodo: 'May-25', contactables: 79.14, compra: 20.05, efectividad: 20.05 },
    { periodo: 'Abr-25', contactables: 77.06, compra: 17.25, efectividad: 17.25 },
    { periodo: 'Mar-25', contactables: 76.12, compra: 20.08, efectividad: 20.08 }
  ];
  const durmientesTimeSeriesData = [
    { periodo: 'May-Jul 25', contactables: 66, compra: 23, efectividad: 23.12 },
    { periodo: 'Mar-May 25', contactables: 58, compra: 24, efectividad: 24.26 },
    { periodo: 'Feb-Abr 25', contactables: 61, compra: 24, efectividad: 24.06 },
    { periodo: 'Ene-Mar 25', contactables: 44, compra: 15, efectividad: 15.2 },
    { periodo: 'Dic-Feb 25', contactables: 53, compra: 20, efectividad: 19.73 },
    { periodo: 'Nov-Ene 25', contactables: 47, compra: 31, efectividad: 30.58 }
  ];

  // Datos técnicos para "Aumento de Uso"
  const aumentoUsoTechnicalData = {
    durmientes: {
      estado: 'Operativo',
      frecuenciaRecalibracion: 'Mensual',
      ultimaRecalibracion: '2025-05-10',
      ultimaEjecucion: '2025-06-01',
      metricas: {
        precision: '0.88',
        recall: '0.24',
        auc: '0.85',
        ks: '42',
        psi: '0.08',
        tasaVO: '4.2%'
      }
    },
    activos: {
      segmentacion: [
        { modelo: 'TC Plata', inercia: '1,234' },
        { modelo: 'TC Oro', inercia: '1,187' },
        { modelo: 'TC Black', inercia: '1,092' }
      ],
      recomendacion: [
        { modelo: 'TC Plata', rmse: '0.54' },
        { modelo: 'TC Oro', rmse: '0.57' },
        { modelo: 'TC Black', rmse: 'Sin población' }
      ]
    }
  } as const;

  // Datos para tabla de métricas detalladas genéricas
  const datosTabla = [
    { metrica: 'Tiempo de Respuesta', valor: '1.8s', benchmark: '< 2s', estado: 'Excelente' },
    { metrica: 'Disponibilidad', valor: '99.9%', benchmark: '99.5%', estado: 'Excelente' },
    { metrica: 'Costo por Predicción', valor: '$0.15', benchmark: '$0.20', estado: 'Excelente' },
    { metrica: 'Precisión', valor: '94.2%', benchmark: '92%', estado: 'Excelente' }
  ];

  const renderMetricas = (tipoMetrica: 'financieras' | 'negocio' | 'tecnicas') => {
    // Vista especializada para BdB - Métricas de Negocio
    if (tipoMetrica === 'negocio' && esCastigadaBdB) {
      const formatoDinero = (v: number) => `$${(v / 1000000).toFixed(1)}M`;
      const formatoPorcentaje = (v: number) => `${(v * 100).toFixed(1)}%`;
      
      const fechas = btRows ? Array.from(new Set(btRows.map((r) => r.fecha))).sort() : [];
      // Función para ordenar segmentos correctamente
      const ordenarSegmentos = (segmentos: string[]) => {
        return segmentos.sort((a, b) => {
          // Extraer el número inicial del segmento
          const numA = parseInt(a.split('_')[0]) || 0;
          const numB = parseInt(b.split('_')[0]) || 0;
          return numA - numB;
        });
      };
      
      const segmentosDisponibles = btRows ? Array.from(new Set(btRows.map((r) => r.segmento))) : [];
      const segmentosOrdenados = ordenarSegmentos(segmentosDisponibles);
      // Función auxiliar para extraer número de segmento
      const prefijoNumero = (seg: string) => {
        const m = seg.match(/^(\d+)/);
        return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
      };
      
      const segmentos = btRows
        ? ordenarSegmentos(Array.from(new Set(btRows.map((r) => r.segmento))))
        : [];
      const allRows = btRows || [];

      // Función para agrupar datos según la selección
      const agruparDatos = () => {
        const grupos = new Map<string, { clientes: number; respuesta: number; saldo: number; pagos: number }>();
        
        allRows.forEach((r) => {
          let clave = '';
          switch (negGroupBy) {
            case 'segmento': clave = r.segmento; break;
            case 'fecha': clave = r.fecha; break;
            case 'decil': clave = `Decil ${r.decil_probabilidad}`; break;
            case 'marca': clave = r.marca_bueno_evidente ? 'Buenos Evidentes' : 'Requieren Gestión'; break;
          }
          
          const actual = grupos.get(clave) || { clientes: 0, respuesta: 0, saldo: 0, pagos: 0 };
          actual.clientes += r.clientes || 0;
          actual.respuesta += r.respuesta || 0;
          actual.saldo += r.saldo_total || 0;
          actual.pagos += r.sum_pagos_3m_total || 0;
          grupos.set(clave, actual);
        });
        
        const arr = Array.from(grupos.entries()).map(([nombre, datos]) => ({
          nombre,
            ...datos,
            tasaExito: datos.clientes ? datos.respuesta / datos.clientes : 0,
            tasaRecuperacion: datos.saldo ? datos.pagos / datos.saldo : 0
        }));
        if (negGroupBy === 'segmento') {
          // Caso BdB: usar orden fijo; caso general: orden alfabético
          if (esCastigadaBdB) {
            return arr.sort((a, b) => {
              const na = parseInt(a.nombre.split('_')[0]) || 0;
              const nb = parseInt(b.nombre.split('_')[0]) || 0;
              return na - nb;
            });
          }
          return arr.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        }
        // Otros groupBy mantienen orden por tasa de éxito
        return arr.sort((a, b) => b.tasaExito - a.tasaExito);
      };

      let datosAgrupados = agruparDatos();
      
      // KPIs principales
      const totalClientes = allRows.reduce((sum, r) => sum + (r.clientes || 0), 0);
      const totalRespuesta = allRows.reduce((sum, r) => sum + (r.respuesta || 0), 0);
      const totalSaldo = allRows.reduce((sum, r) => sum + (r.saldo_total || 0), 0);
      const totalPagos = allRows.reduce((sum, r) => sum + (r.sum_pagos_3m_total || 0), 0);
      const tasaExitoGlobal = totalClientes ? totalRespuesta / totalClientes : 0;
      const tasaRecuperacionGlobal = totalSaldo ? totalPagos / totalSaldo : 0;

      return (
        <div className="space-y-6">
          {/* Controles de agrupación */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Vista de Métricas de Negocio</h3>
                  <p className="text-sm text-blue-700">Análisis de recuperación basado en backtesting real</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={negGroupBy === 'segmento' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNegGroupBy('segmento')}
                    className="text-xs"
                  >
                    Por Segmento
                  </Button>
                  <Button
                    variant={negGroupBy === 'fecha' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNegGroupBy('fecha')}
                    className="text-xs"
                  >
                    Por Fecha
                  </Button>
                  <Button
                    variant={negGroupBy === 'decil' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNegGroupBy('decil')}
                    className="text-xs"
                  >
                    Por Decil
                  </Button>
                  <Button
                    variant={negGroupBy === 'marca' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNegGroupBy('marca')}
                    className="text-xs"
                  >
                    Por Marca Bueno
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced KPIs Globales */}
          {/* Leyenda de colores por segmento removida para usar esquema neutro */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-green-900">{totalClientes.toLocaleString()}</div>
                    <div className="text-sm text-green-700">Total Clientes</div>
                    <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-blue-900">{formatoPorcentaje(tasaExitoGlobal)}</div>
                    <div className="text-sm text-blue-700">Tasa de Éxito</div>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${Math.min(tasaExitoGlobal * 100, 100)}%`}}></div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {tasaExitoGlobal > 0.1 ? 'Excelente' : tasaExitoGlobal > 0.05 ? 'Bueno' : 'Mejorable'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-amber-900">{formatoDinero(totalSaldo)}</div>
                    <div className="text-sm text-amber-700">Saldo Total</div>
                    <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
                      <div className="bg-amber-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-purple-900">{formatoPorcentaje(tasaRecuperacionGlobal)}</div>
                    <div className="text-sm text-purple-700">Tasa Recuperación</div>
                    <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: `${Math.min(tasaRecuperacionGlobal * 100, 100)}%`}}></div>
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {tasaRecuperacionGlobal > 0.02 ? 'Excelente' : tasaRecuperacionGlobal > 0.01 ? 'Bueno' : 'Mejorable'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Comparación Principal Mejorados */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Efectividad por {negGroupBy.charAt(0).toUpperCase() + negGroupBy.slice(1)}
                </CardTitle>
                <CardDescription>Análisis de clientes vs respuesta y tasa de éxito</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={datosAgrupados} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <defs>
                      <linearGradient id="clientesGradientNeg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="respuestaGradientNeg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="nombre" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                      fontSize={10}
                      stroke="#64748b"
                    />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} 
                      stroke="#ef4444"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'Tasa Éxito') return [`${(Number(value) * 100).toFixed(1)}%`, name];
                        return [Number(value).toLocaleString(), name];
                      }} 
                    />
                    <Bar yAxisId="left" dataKey="clientes" fill="url(#clientesGradientNeg)" name="Clientes" radius={[2, 2, 0, 0]} />
                    <Bar yAxisId="left" dataKey="respuesta" fill="url(#respuestaGradientNeg)" name="Respuesta" radius={[2, 2, 0, 0]} />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="tasaExito" 
                      stroke="#ef4444" 
                      strokeWidth={3} 
                      name="Tasa Éxito"
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#ef4444', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Rendimiento Financiero por {negGroupBy.charAt(0).toUpperCase() + negGroupBy.slice(1)}
                </CardTitle>
                <CardDescription>Saldo total vs pagos recuperados y tasa de recuperación</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={datosAgrupados} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <defs>
                      <linearGradient id="saldoGradientNeg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="pagosGradientNeg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="nombre" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                      fontSize={10}
                      stroke="#64748b"
                    />
                    <YAxis 
                      yAxisId="left" 
                      tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} 
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} 
                      stroke="#7c3aed"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'Tasa Recuperación') return [`${(Number(value) * 100).toFixed(2)}%`, name];
                        return [`$${(Number(value) / 1000000).toFixed(1)}M`, name];
                      }} 
                    />
                    <Bar yAxisId="left" dataKey="saldo" fill="url(#saldoGradientNeg)" name="Saldo Total" radius={[2, 2, 0, 0]} />
                    <Bar yAxisId="left" dataKey="pagos" fill="url(#pagosGradientNeg)" name="Pagos 3M" radius={[2, 2, 0, 0]} />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="tasaRecuperacion" 
                      stroke="#7c3aed" 
                      strokeWidth={3} 
                      name="Tasa Recuperación"
                      dot={{ fill: '#7c3aed', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#7c3aed', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Nuevo gráfico de análisis por marca_bueno_evidente */}
          {(() => {
            const marcaData = (() => {
              const marcaMap = new Map<string, { clientes: number; respuesta: number; saldo: number; pagos: number }>();
              const filteredRows = btRows?.filter((r) => 
                (!btFecha || r.fecha === btFecha) && 
                (!btSegmento || r.segmento === btSegmento)
              ) || [];
              
              filteredRows.forEach((r) => {
                const marca = r.marca_bueno_evidente === 1 ? 'Buenos Evidentes' : 'Requieren Gestión';
                const acc = marcaMap.get(marca) || { clientes: 0, respuesta: 0, saldo: 0, pagos: 0 };
                acc.clientes += r.clientes;
                acc.respuesta += r.respuesta;
                acc.saldo += r.saldo_total;
                acc.pagos += r.sum_pagos_3m_total;
                marcaMap.set(marca, acc);
              });
              
              return Array.from(marcaMap.entries()).map(([nombre, data]) => ({
                nombre,
                ...data,
                tasaExito: data.clientes ? data.respuesta / data.clientes : 0,
                tasaRecuperacion: data.saldo ? data.pagos / data.saldo : 0
              }));
            })();

            return marcaData.length > 0 ? (
              <div className="mt-6">
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle>Análisis por Tipo de Cliente</CardTitle>
                    <CardDescription>Comparativa entre Buenos Evidentes vs Clientes que Requieren Gestión</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={marcaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="marcaClientesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                          </linearGradient>
                          <linearGradient id="marcaRespuestaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="nombre" stroke="#64748b" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} 
                          stroke="#dc2626"
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value, name) => {
                            if (name === 'Tasa Éxito') return [`${(Number(value) * 100).toFixed(1)}%`, name];
                            return [Number(value).toLocaleString(), name];
                          }} 
                        />
                        <Bar yAxisId="left" dataKey="clientes" fill="url(#marcaClientesGradient)" name="Clientes" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="respuesta" fill="url(#marcaRespuestaGradient)" name="Respuesta" radius={[4, 4, 0, 0]} />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="tasaExito" 
                          stroke="#dc2626" 
                          strokeWidth={3} 
                          name="Tasa Éxito"
                          dot={{ fill: '#dc2626', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: '#dc2626', strokeWidth: 2 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : null;
          })()}

          {/* Time Series Trend Chart */}
          <div className="grid grid-cols-1 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tendencia Temporal de Recuperación
                </CardTitle>
                <CardDescription>Evolución de pagos y recuperación por fecha</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={datosAgrupados.filter(d => negGroupBy === 'fecha')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis yAxisId="left" tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'Tasa Recuperación') return [`${(Number(value) * 100).toFixed(2)}%`, name];
                        return [`$${(Number(value) / 1000000).toFixed(1)}M`, name];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="pagos" fill="#10b981" name="Pagos 3M" />
                    <Line yAxisId="right" type="monotone" dataKey="tasaRecuperacion" stroke="#7c3aed" strokeWidth={3} name="Tasa Recuperación" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* New Enhanced Visualizations */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Balance vs Payments Scatter
                </CardTitle>
                <CardDescription>Relación entre saldo total y pagos por segmento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={datosAgrupados}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="saldo"
                      tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`}
                      label={{ value: 'Saldo Total', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="pagos"
                      tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`}
                      label={{ value: 'Pagos 3M', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        return [`$${(Number(value) / 1000000).toFixed(1)}M`, name];
                      }}
                      labelFormatter={(label) => `Saldo: $${(Number(label) / 1000000).toFixed(1)}M`}
                    />
                    <Scatter
                      name="Saldo vs Pagos"
                      data={datosAgrupados}
                      fill="#3b82f6"
                      shape="circle"
                    />
                    <Line
                      type="monotone"
                      dataKey={(entry) => entry.saldo}
                      stroke="#ef4444"
                      strokeWidth={1}
                      dot={false}
                      name="Tendencia"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recovery Rate by Decile
                </CardTitle>
                <CardDescription>Tasa de recuperación por decil de probabilidad</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosAgrupados.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    <Tooltip
                      formatter={(value, name) => [`${(Number(value) * 100).toFixed(2)}%`, name]}
                    />
                    <Bar dataKey="tasaRecuperacion" fill="#10b981" name="Tasa Recuperación" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-900">Mejor Segmento</div>
                    <div className="text-lg font-bold text-green-800">
                      {datosAgrupados.sort((a, b) => b.tasaRecuperacion - a.tasaRecuperacion)[0]?.nombre || 'N/A'}
                    </div>
                    <div className="text-xs text-green-700">
                      {formatoPorcentaje(datosAgrupados.sort((a, b) => b.tasaRecuperacion - a.tasaRecuperacion)[0]?.tasaRecuperacion || 0)} recuperación
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">Tasa Promedio</div>
                    <div className="text-lg font-bold text-blue-800">
                      {formatoPorcentaje(datosAgrupados.reduce((sum, d) => sum + d.tasaRecuperacion, 0) / datosAgrupados.length)}
                    </div>
                    <div className="text-xs text-blue-700">
                      Recuperación promedio
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium text-purple-900">Oportunidad</div>
                    <div className="text-lg font-bold text-purple-800">
                      {formatoDinero(totalSaldo - totalPagos)}
                    </div>
                    <div className="text-xs text-purple-700">
                      Saldo pendiente por recuperar
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla detallada */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado por {negGroupBy}</CardTitle>
              <CardDescription>Métricas completas de rendimiento del modelo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">{negGroupBy.charAt(0).toUpperCase() + negGroupBy.slice(1)}</TableHead>
                    <TableHead className="text-right">Clientes</TableHead>
                    <TableHead className="text-right">Respuesta</TableHead>
                    <TableHead className="text-right">Tasa Éxito</TableHead>
                    <TableHead className="text-right">Saldo Total</TableHead>
                    <TableHead className="text-right">Pagos 3M</TableHead>
                    <TableHead className="text-right">Tasa Recup.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datosAgrupados.map((row, idx) => (
                    <TableRow key={row.nombre} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                      <TableCell className="font-medium">{row.nombre}</TableCell>
                      <TableCell className="text-right">{row.clientes.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.respuesta.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={row.tasaExito > tasaExitoGlobal ? 'default' : 'secondary'}>
                          {formatoPorcentaje(row.tasaExito)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatoDinero(row.saldo)}</TableCell>
                      <TableCell className="text-right">{formatoDinero(row.pagos)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={row.tasaRecuperacion > tasaRecuperacionGlobal ? 'default' : 'outline'}>
                          {formatoPorcentaje(row.tasaRecuperacion)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Vista especializada para BdB - Métricas Técnicas
    if (tipoMetrica === 'tecnicas' && esCastigadaBdB) {
      // Mostrar análisis de backtesting siempre para BdB (sin selector de vista)
      if (!btRows?.length) {
        return (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="text-sm text-muted-foreground">Cargando datos de backtesting...</div>
            </div>
          </div>
        );
      }

      const fechas = Array.from(new Set(btRows.map((r) => r.fecha))).sort();
      const segmentos = Array.from(new Set(btRows.map((r) => r.segmento))).sort((a, b) => {
        const numA = parseInt(a.split('_')[0]) || 0;
        const numB = parseInt(b.split('_')[0]) || 0;
        return numA - numB;
      });

      // Filtros aplicados
      const rowsActuales = btRows.filter((r) => 
        (!btFecha || r.fecha === btFecha) && 
        (!btSegmento || r.segmento === btSegmento)
      );

      // Análisis por decil
      const decilMap = new Map<number, BtRow[]>();
      rowsActuales.forEach((r) => {
        const arr = decilMap.get(r.decil_probabilidad) || [];
        arr.push(r);
        decilMap.set(r.decil_probabilidad, arr);
      });

      const decilData = Array.from(decilMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([decil, rows]) => {
          const clientes = rows.reduce((s, r) => s + (r.clientes || 0), 0);
          const respuesta = rows.reduce((s, r) => s + (r.respuesta || 0), 0);
          const tasaBuenos = clientes ? respuesta / clientes : 0;
          const lift = rows[0]?.lift || 0;
          const distribucion = rows[0]?.distribucion || 0;
          const saldo = rows.reduce((s, r) => s + (r.saldo_total || 0), 0);
          const pagos = rows.reduce((s, r) => s + (r.sum_pagos_3m_total || 0), 0);
          return {
            decil,
            clientes,
            respuesta,
            tasaBuenos,
            lift,
            distribucion: distribucion * 100,
            saldo: saldo / 1000000,
            pagos: pagos / 1000000,
            roc: rows[0]?.roc || 0,
            ks: rows[0]?.ks || 0,
            psi: rows[0]?.psi || 0,
            recuperacion: saldo ? (rows.reduce((s, r) => s + (r.sum_pagos_3m_total || 0), 0) / saldo) : 0
          };
        });

      // Métricas técnicas consolidadas
      const metricas = decilData.length ? {
        roc: decilData[0].roc,
        ks: decilData[0].ks,
        psi: decilData[0].psi,
        gini: decilData[0].roc ? (2 * decilData[0].roc - 1) : 0
      } : { roc: 0, ks: 0, psi: 0, gini: 0 };

      return (
        <div className="space-y-6">
          {/* Header con controles */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Análisis Técnico - Backtesting</h3>
                  <p className="text-sm text-muted-foreground">Modelo: Cobranzas Cartera Castigada BdB</p>
                </div>
                <Badge variant="outline">
                  {rowsActuales.length} registros analizados
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Fecha</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={btFecha === '' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBtFecha('')}
                      className="text-xs"
                    >
                      Todas las fechas
                    </Button>
                    {fechas.map((f) => (
                      <Button
                        key={f}
                        variant={btFecha === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBtFecha(f)}
                        className="text-xs"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Segmento</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={btSegmento === '' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBtSegmento('')}
                      className="text-xs"
                    >
                      Todos los segmentos
                    </Button>
                    {segmentos.map((s) => (
                      <Button
                        key={s}
                        variant={btSegmento === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBtSegmento(s)}
                        className="text-xs"
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Horizonte</label>
                  <div className="flex gap-2">
                    <Button
                      variant={btHorizon === '1m' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBtHorizon('1m')}
                      className="text-xs"
                    >
                      1 Mes
                    </Button>
                    <Button
                      variant={btHorizon === '2m' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBtHorizon('2m')}
                      className="text-xs"
                    >
                      2 Meses
                    </Button>
                    <Button
                      variant={btHorizon === '3m' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBtHorizon('3m')}
                      className="text-xs"
                    >
                      3 Meses
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs Técnicos Principales */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <div>
                      <div className="text-2xl font-bold" title={getDesc('roc', 'Área bajo la curva ROC')}>
                        {metricas.roc.toFixed(3)}
                      </div>
                      <div className="text-sm text-muted-foreground">AUC Score</div>
                    <div className="text-xs text-green-600">
                      {metricas.roc > 0.8 ? 'Excelente' : metricas.roc > 0.7 ? 'Bueno' : 'Regular'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <div>
                      <div className="text-2xl font-bold" title={getDesc('ks', 'Kolmogorov-Smirnov statistic')}>
                        {metricas.ks.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">KS Score</div>
                    <div className="text-xs text-green-600">
                      {metricas.ks > 40 ? 'Excelente' : metricas.ks > 20 ? 'Bueno' : 'Regular'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <div>
                      <div className="text-2xl font-bold" title={getDesc('psi', 'Population Stability Index')}>
                        {metricas.psi.toFixed(3)}
                      </div>
                      <div className="text-sm text-muted-foreground">PSI</div>
                    <div className="text-xs text-green-600">
                      {metricas.psi < 0.1 ? 'Estable' : metricas.psi < 0.25 ? 'Moderado' : 'Inestable'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <div>
                      <div className="text-2xl font-bold">
                        {(metricas.gini * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Gini</div>
                    <div className="text-xs text-green-600">
                      {metricas.gini > 0.6 ? 'Excelente' : metricas.gini > 0.4 ? 'Bueno' : 'Regular'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Análisis Mejorados */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Poder Discriminatorio por Decil
                </CardTitle>
                <CardDescription>Lift y distribución poblacional del modelo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={decilData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="liftGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="decil" 
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `D${value}`}
                    />
                    <YAxis yAxisId="left" stroke="#3b82f6" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'Distribución') return [`${Number(value).toFixed(1)}%`, name];
                        if (name === 'Lift') return [`${Number(value).toFixed(2)}x`, name];
                        return [Number(value).toFixed(2), name];
                      }}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="distribucion" 
                      fill="url(#liftGradient)" 
                      name="Distribución %" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="lift" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      name="Lift" 
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Análisis Financiero por Decil
                </CardTitle>
                <CardDescription>Saldo vs Recuperación efectiva</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={decilData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="pagosGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="decil" 
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `D${value}`}
                    />
                    <YAxis yAxisId="left" tickFormatter={(v) => `$${v.toFixed(0)}M`} stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} stroke="#7c3aed" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'Tasa Recuperación') return [`${(Number(value) * 100).toFixed(2)}%`, name];
                        return [`$${Number(value).toFixed(1)}M`, name];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="saldo" fill="url(#saldoGradient)" name="Saldo" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="pagos" fill="url(#pagosGradient)" name="Pagos" radius={[4, 4, 0, 0]} />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="recuperacion" 
                      stroke="#7c3aed" 
                      strokeWidth={4} 
                      name="Tasa Recuperación"
                      dot={{ fill: '#7c3aed', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#7c3aed', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Nuevos Gráficos de Análisis de Segmentos */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Distribución de Clientes por Decil
                </CardTitle>
                <CardDescription>Concentración poblacional y respuesta</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={decilData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="clientesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="respuestaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="decil" 
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `D${value}`}
                    />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [Number(value).toLocaleString(), name]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clientes" 
                      stackId="1" 
                      stroke="#8b5cf6" 
                      fill="url(#clientesGradient)" 
                      name="Clientes Total"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="respuesta" 
                      stackId="2" 
                      stroke="#06b6d4" 
                      fill="url(#respuestaGradient)" 
                      name="Clientes con Respuesta"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tasa de Buenos por Decil
                </CardTitle>
                <CardDescription>Efectividad del modelo de predicción</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={decilData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="tasaBuenosGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="decil" 
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `D${value}`}
                    />
                    <YAxis 
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} 
                      stroke="#64748b" 
                      tick={{ fontSize: 12 }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [`${(Number(value) * 100).toFixed(2)}%`, name]}
                    />
                    <Bar 
                      dataKey="tasaBuenos" 
                      fill="url(#tasaBuenosGradient)" 
                      name="Tasa de Buenos"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de análisis detallado */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado por Decil</CardTitle>
              <CardDescription>Métricas completas de rendimiento del modelo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Decil</TableHead>
                    <TableHead className="text-right">Clientes</TableHead>
                    <TableHead className="text-right">Respuesta</TableHead>
                    <TableHead className="text-right">Tasa Buenos</TableHead>
                    <TableHead className="text-right">Lift</TableHead>
                    <TableHead className="text-right">Distribución</TableHead>
                    <TableHead className="text-right">Saldo (MM)</TableHead>
                    <TableHead className="text-right">Pagos (MM)</TableHead>
                    <TableHead className="text-right">Recuperación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decilData.map((row, idx) => (
                    <TableRow key={row.decil} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                      <TableCell>
                        <Badge variant={row.decil >= 8 ? 'default' : row.decil >= 5 ? 'secondary' : 'outline'}>
                          D{row.decil}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{row.clientes.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.respuesta.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={row.tasaBuenos > 0.1 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                          {(row.tasaBuenos * 100).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={row.lift > 1.5 ? 'text-blue-600 font-medium' : 'text-muted-foreground'}>
                          {row.lift.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{row.distribucion.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">${row.saldo.toFixed(1)}M</TableCell>
                      <TableCell className="text-right">${row.pagos.toFixed(1)}M</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={row.recuperacion > 0.02 ? 'default' : 'outline'}>
                          {(row.recuperacion * 100).toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Última actualización: {fechas[fechas.length - 1] || 'N/A'}
            </div>
            <Button 
              onClick={() => exportToCsv('backtesting_tecnico.csv', decilData)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Exportar Análisis
            </Button>
          </div>
        </div>
      );
    }

    // Vista genérica según tipo
    const metricasEjemplo = metricas[tipoMetrica];
    
    return (
      <div className="space-y-6">
        {/* KPIs cards */}
        <div className="grid grid-cols-4 gap-4">
          {metricasEjemplo.map((metrica) => {
            const IconoComponent = metrica.icono;
            return (
              <Card key={metrica.titulo} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <IconoComponent className={`h-5 w-5 ${metrica.tendencia === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <div className="text-2xl font-bold">{metrica.valor}</div>
                      <div className="text-sm text-muted-foreground">{metrica.titulo}</div>
                      <div className="flex items-center gap-1 text-xs">
                        {metrica.tendencia === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={metrica.tendencia === 'up' ? 'text-green-600' : 'text-red-600'}>
                          {metrica.tendencia === 'up' ? 'Mejorando' : 'Optimizando'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Gráficos según tipo */}
        {tipoMetrica === 'financieras' && (
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ROI Mensual</CardTitle>
                <CardDescription>Retorno de inversión por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={seriesTemporales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'ROI']} />
                    <Line type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Costos</CardTitle>
                <CardDescription>Desglose de gastos del modelo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={datosPie}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {datosPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {tipoMetrica === 'negocio' && (
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Predicciones Mensuales</CardTitle>
                <CardDescription>Volumen de predicciones correctas vs totales</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosBarras}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="predicciones" fill="#e2e8f0" name="Total Predicciones" />
                    <Bar dataKey="correctas" fill="#3b82f6" name="Correctas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolución de Precisión</CardTitle>
                <CardDescription>Tendencia de precisión y latencia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={seriesTemporales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="precision" fill="#10b981" name="Precisión %" />
                    <Line yAxisId="right" type="monotone" dataKey="latencia" stroke="#ef4444" strokeWidth={2} name="Latencia ms" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {tipoMetrica === 'tecnicas' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Detalladas</CardTitle>
                <CardDescription>Comparación con benchmarks de la industria</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Métrica</TableHead>
                      <TableHead>Valor Actual</TableHead>
                      <TableHead>Benchmark</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datosTabla.map((row) => (
                      <TableRow key={row.metrica}>
                        <TableCell className="font-medium">{row.metrica}</TableCell>
                        <TableCell>{row.valor}</TableCell>
                        <TableCell>{row.benchmark}</TableCell>
                        <TableCell>
                          <Badge variant="default">{row.estado}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };


  const info = casosInfo[tipoFinal];
  const nombreCaso = displayTitle || csvRecord?.['Caso de Uso'] || csvRecord?.Proyecto || info.nombre;

  // Error handling
  if (!info) {
    console.error('Invalid tipo:', tipo, 'falling back to generico');
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-red-500 flex items-center justify-center text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Error: Tipo Inválido</h1>
            <p className="text-muted-foreground">El tipo de caso de uso especificado no es válido.</p>
          </div>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        {!displayTitle && (
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-lg ${info.color} flex items-center justify-center text-white`}>
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{nombreCaso || 'Caso de Uso'}</h1>
              <p className="text-muted-foreground">{csvRecord?.Descripcion || info.descripcion}</p>
            </div>
          </div>
        )}

        {csvRecord ? (
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="financieras">Métricas Financieras</TabsTrigger>
              <TabsTrigger value="negocio">Métricas de Negocio</TabsTrigger>
              <TabsTrigger value="tecnicas">Métricas Técnicas</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              {/* Individual Case Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Caso de Uso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Proyecto:</span>
                        <p className="font-medium">{csvRecord.Proyecto || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Entidad:</span>
                        <p className="font-medium">{csvRecord.Entidad || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Industria:</span>
                        <p className="font-medium">{csvRecord.Industria || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Estado:</span>
                        <Badge variant="default">{csvRecord.Estado || 'Activo'}</Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Tipo:</span>
                        <p className="font-medium">{csvRecord.Tipo || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Fecha Implementación:</span>
                        <p className="font-medium">{csvRecord['Fecha Implementacion'] || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {csvRecord.Descripcion && (
                    <div className="pt-4 border-t">
                      <span className="text-sm font-medium text-muted-foreground">Descripción:</span>
                      <p className="mt-2 text-sm leading-relaxed">{csvRecord.Descripcion}</p>
                    </div>
                  )}

                  {(csvRecord.SharePoint || csvRecord.Jira || csvRecord.Confluence) && (
                    <div className="pt-4 border-t">
                      <span className="text-sm font-medium text-muted-foreground">Enlaces:</span>
                      <div className="flex gap-2 mt-2">
                        {csvRecord.SharePoint && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={csvRecord.SharePoint} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              SharePoint
                            </a>
                          </Button>
                        )}
                        {csvRecord.Jira && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={csvRecord.Jira} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Jira
                            </a>
                          </Button>
                        )}
                        {csvRecord.Confluence && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={csvRecord.Confluence} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Confluence
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financieras">
              {renderMetricas('financieras')}
            </TabsContent>

            <TabsContent value="negocio" className="space-y-6">
              {/* Formulario de métricas de negocio removido para caso BdB según requerimiento */}
              {renderMetricas('negocio')}
            </TabsContent>

            <TabsContent value="tecnicas">
              {renderMetricas('tecnicas')}
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="financieras" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="financieras">Métricas Financieras</TabsTrigger>
              <TabsTrigger value="negocio">Métricas de Negocio</TabsTrigger>
              <TabsTrigger value="tecnicas">Métricas Técnicas</TabsTrigger>
            </TabsList>

            <TabsContent value="financieras">
              {renderMetricas('financieras')}
            </TabsContent>

            <TabsContent value="negocio">
              {renderMetricas('negocio')}
            </TabsContent>

            <TabsContent value="tecnicas">
              {renderMetricas('tecnicas')}
            </TabsContent>
          </Tabs>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering CasoUso:', error);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-red-500 flex items-center justify-center text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Error de Renderizado</h1>
            <p className="text-muted-foreground">Ha ocurrido un error al renderizar el componente.</p>
            <p className="text-sm text-red-600 mt-2">{error instanceof Error ? error.message : 'Error desconocido'}</p>
          </div>
        </div>
      </div>
    );
  }
};

export default CasoUso;
