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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Legend } from 'recharts';
import Papa from 'papaparse';

interface CasoUsoProps {
  tipo: 'churn' | 'tc' | 'nba' | 'aumento-uso' | 'generico';
  displayTitle?: string; // título temporal personalizado
  csvRecord?: Record<string, any>; // registro CSV del caso
}

const CasoUso: React.FC<CasoUsoProps> = ({ tipo, displayTitle, csvRecord }) => {
  const [modeloSeleccionado, setModeloSeleccionado] = useState('tarjeta-credito');
  const [filtroUsuario, setFiltroUsuario] = useState<'activos' | 'durmientes'>('activos');
  const [vistaTecnica, setVistaTecnica] = useState<'modelo' | 'backtesting'>('modelo');
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
  const [pilotDeciles, setPilotDeciles] = useState<number>(3);
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
              segmento: String(get('segmento') ?? '')
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
    // Vista especializada para BdB - Métricas de Negocio (Piloto)
    if (tipoMetrica === 'negocio' && esCastigadaBdB) {
      const formatoDineroMM = (v: number) => `$${v.toLocaleString('es-CO')} MM`;
      // Negocio: usar pagos a 3 meses por defecto
      const getPagos = (r: BtRow): number => r.sum_pagos_3m_total ?? 0;
  const fechas = btRows ? Array.from(new Set(btRows.map((r) => r.fecha))).sort() : [];
  const rowsSelFecha = btRows?.filter((r) => !btFecha || r.fecha === btFecha) || [];
  const segmentosDisponibles = Array.from(new Set(rowsSelFecha.map((r) => r.segmento))).sort();
  const rowsSegSel = rowsSelFecha.filter((r) => !btSegmento || r.segmento === btSegmento);

      // Agregación por decil del segmento
      const decilMap = new Map<number, { clientes: number; saldo: number; pagado: number }>();
      rowsSegSel.forEach((r) => {
        const d = r.decil_probabilidad;
        const cur = decilMap.get(d) || { clientes: 0, saldo: 0, pagado: 0 };
        cur.clientes += r.clientes || 0;
        cur.saldo += r.saldo_total || 0;
        cur.pagado += getPagos(r) || 0;
        decilMap.set(d, cur);
      });
      const deciles = Array.from(decilMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([decil0, v]) => ({
          decil: decil0 + 1,
          clientes: v.clientes,
          saldo: v.saldo / 1_000_000,
          pagado: v.pagado / 1_000_000,
          tasa: v.saldo > 0 ? (v.pagado / v.saldo) * 100 : 0
        }));

      // Totales
      const totalSaldoSeg = rowsSegSel.reduce((s, r) => s + r.saldo_total, 0);
      const totalPagadoSeg = rowsSegSel.reduce((s, r) => s + getPagos(r), 0);

      // Pilot cutoff (deciles a intervenir)
      const k = Math.min(Math.max(1, pilotDeciles), 10);
      const contactados = deciles.filter(d => d.decil <= k);
      const noContactados = deciles.filter(d => d.decil > k);
      const clientesContactados = contactados.reduce((s, d) => s + d.clientes, 0);
      const pagadoContactados = contactados.reduce((s, d) => s + d.pagado * 1_000_000, 0);
      const saldoContactados = contactados.reduce((s, d) => s + d.saldo * 1_000_000, 0);
      const tasaRecContactados = saldoContactados > 0 ? (pagadoContactados / saldoContactados) * 100 : 0;
      const sharePagadoContactados = totalPagadoSeg > 0 ? (pagadoContactados / totalPagadoSeg) * 100 : 0;

      const costoTotal = clientesContactados * (pilotCostoContacto || 0);
      const ingresoNeto = pagadoContactados - costoTotal;
      const roi = costoTotal > 0 ? (ingresoNeto / costoTotal) : 0;

      // Dataset para barras comparativas
      const comparativa = [{
        grupo: 'Contactados',
        saldoMM: saldoContactados / 1_000_000,
        pagadoMM: pagadoContactados / 1_000_000
      }, {
        grupo: 'No contactados',
        saldoMM: (totalSaldoSeg - saldoContactados) / 1_000_000,
        pagadoMM: (totalPagadoSeg - pagadoContactados) / 1_000_000
      }];

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold">Piloto de Negocio — Cobranzas Castigada BdB</h4>
              <p className="text-muted-foreground text-sm">Simula el impacto de intervenir los primeros deciles</p>
            </div>
          </div>

          {/* Controles piloto */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Fecha</span>
              <Select value={btFecha ?? 'todas'} onValueChange={(v) => setBtFecha(v === 'todas' ? null : v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Selecciona fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {fechas.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Segmento</span>
              <Select value={btSegmento ?? 'todos'} onValueChange={(v) => setBtSegmento(v === 'todos' ? null : v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecciona segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {segmentosDisponibles.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Horizonte — removido en negocio */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Agrupar por</span>
              <Select value={negGroupBy} onValueChange={(v) => setNegGroupBy(v as any)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Dimensión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="segmento">Segmento</SelectItem>
                  <SelectItem value="fecha">Fecha</SelectItem>
                  <SelectItem value="decil">Decil</SelectItem>
                  <SelectItem value="marca">Marca bueno evidente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Deciles a intervenir y Costo — removidos en negocio */}
          </div>

          {/* KPIs del piloto — removidos para negocio basado en CSV */}

          {/* Comparativa por contacto — removida según requerimiento */}

          {/* Segmentos: Saldo vs Pagado (migrado desde Técnicas) */}
          {(() => {
            const segmentosAgg2 = rowsSelFecha.reduce((acc: Record<string, { saldo: number; pagado: number }>, r) => {
              acc[r.segmento] = acc[r.segmento] || { saldo: 0, pagado: 0 };
              acc[r.segmento].saldo += r.saldo_total || 0;
              acc[r.segmento].pagado += getPagos(r) || 0;
              return acc;
            }, {});
            const segRank = (s: string) => {
              const m = s?.match?.(/^(\d+)_/);
              return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
            };
            const segmentosNeg = Object.entries(segmentosAgg2)
              .map(([segmento, v]) => ({ segmento, saldo: v.saldo / 1_000_000, pagado: v.pagado / 1_000_000 }))
              .sort((a, b) => {
                const ra = segRank(a.segmento);
                const rb = segRank(b.segmento);
                if (ra !== rb) return ra - rb;
                return a.segmento.localeCompare(b.segmento);
              });
            return (
              <Card>
                <CardHeader>
                  <CardTitle>Segmentos: Saldo vs Pagado</CardTitle>
                  <CardDescription>Comparativa por segmento — unidades en millones COP</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={segmentosNeg}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segmento" />
                      <YAxis />
                      <Tooltip formatter={(v: any, name) => [formatoDineroMM(Number(v)), name]} />
                      <Legend />
                      <Bar dataKey="saldo" name="Saldo" fill="#60a5fa" />
                      <Bar dataKey="pagado" name="Pagado" fill="#34d399" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          })()}

          {/* Comparaciones negocio por dimensión seleccionada */}
          {(() => {
            // source rows: filtro fecha/segmento ya aplicado (rowsSegSel)
            const keyFn = (r: BtRow) => {
              if (negGroupBy === 'segmento') return r.segmento || 'N/D';
              if (negGroupBy === 'fecha') return r.fecha || 'N/D';
              if (negGroupBy === 'decil') return `D${(r.decil_probabilidad ?? 0) + 1}`;
              return String(r.marca_bueno_evidente ?? '0');
            };
            const agg = new Map<string, { clientes: number; respuesta: number; saldo: number; pagos: number }>();
            rowsSegSel.forEach(r => {
              const k = keyFn(r);
              const cur = agg.get(k) || { clientes: 0, respuesta: 0, saldo: 0, pagos: 0 };
              cur.clientes += r.clientes || 0;
              cur.respuesta += r.respuesta || 0;
              cur.saldo += r.saldo_total || 0;
              cur.pagos += getPagos(r) || 0;
              agg.set(k, cur);
            });
            const rows = Array.from(agg.entries()).map(([grupo, v]) => ({
              grupo,
              clientes: v.clientes,
              respuesta: v.respuesta,
              tasa_exito: v.clientes > 0 ? (v.respuesta / v.clientes) * 100 : 0,
              saldoMM: v.saldo / 1_000_000,
              pagosMM: v.pagos / 1_000_000,
              tasa_rec: v.saldo > 0 ? (v.pagos / v.saldo) * 100 : 0
            }));
            // ordenar por pagos desc
            rows.sort((a, b) => b.pagosMM - a.pagosMM);

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Clientes vs Respuesta</CardTitle>
                    <CardDescription>Éxito % por {negGroupBy}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart data={rows}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grupo" interval={0} angle={-30} textAnchor="end" height={80} />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(v: any, name: any, ctx: any) => {
                          if (ctx?.dataKey === 'tasa_exito') return [`${Number(v).toFixed(2)}%`, 'Tasa de éxito'];
                          return [v, name];
                        }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="clientes" name="Clientes" fill="#60a5fa" />
                        <Bar yAxisId="left" dataKey="respuesta" name="Respuesta" fill="#a78bfa" />
                        <Line yAxisId="right" type="monotone" dataKey="tasa_exito" name="Éxito %" stroke="#ef4444" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Saldo vs Pagos</CardTitle>
                    <CardDescription>Recuperación % por {negGroupBy}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart data={rows}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grupo" interval={0} angle={-30} textAnchor="end" height={80} />
                        <YAxis yAxisId="left" label={{ value: 'MM', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(v: any, name: any, ctx: any) => {
                          if (ctx?.dataKey === 'tasa_rec') return [`${Number(v).toFixed(2)}%`, 'Tasa rec.'];
                          return [formatoDineroMM(Number(v)), name];
                        }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="saldoMM" name="Saldo (MM)" fill="#60a5fa" />
                        <Bar yAxisId="left" dataKey="pagosMM" name="Pagos (MM)" fill="#34d399" />
                        <Line yAxisId="right" type="monotone" dataKey="tasa_rec" name="Recuperación %" stroke="#f59e0b" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* Tabla resumen + export */}
          {(() => {
            const keyFn = (r: BtRow) => {
              if (negGroupBy === 'segmento') return r.segmento || 'N/D';
              if (negGroupBy === 'fecha') return r.fecha || 'N/D';
              if (negGroupBy === 'decil') return `D${(r.decil_probabilidad ?? 0) + 1}`;
              return String(r.marca_bueno_evidente ?? '0');
            };
            const agg = new Map<string, { clientes: number; respuesta: number; saldo: number; pagos: number }>();
            rowsSegSel.forEach(r => {
              const k = keyFn(r);
              const cur = agg.get(k) || { clientes: 0, respuesta: 0, saldo: 0, pagos: 0 };
              cur.clientes += r.clientes || 0;
              cur.respuesta += r.respuesta || 0;
              cur.saldo += r.saldo_total || 0;
              cur.pagos += getPagos(r) || 0;
              agg.set(k, cur);
            });
            const rows = Array.from(agg.entries()).map(([grupo, v]) => ({
              grupo,
              clientes: v.clientes,
              respuesta: v.respuesta,
              tasa_exito: v.clientes > 0 ? (v.respuesta / v.clientes) * 100 : 0,
              saldoMM: v.saldo / 1_000_000,
              pagosMM: v.pagos / 1_000_000,
              tasa_rec: v.saldo > 0 ? (v.pagos / v.saldo) * 100 : 0
            })).sort((a, b) => b.pagosMM - a.pagosMM);

            return (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Resumen por {negGroupBy}</CardTitle>
                      <CardDescription>Clientes/Respuesta y Saldo/Pagos</CardDescription>
                    </div>
                    <Button onClick={() => exportToCsv(`bdb_negocio_resumen_${negGroupBy}.csv`, rows.map(r => ({
                      Grupo: r.grupo,
                      Clientes: r.clientes,
                      Respuesta: r.respuesta,
                      'Tasa Éxito %': Number(r.tasa_exito.toFixed(2)),
                      'Saldo (MM)': Number(r.saldoMM.toFixed(2)),
                      'Pagos (MM)': Number(r.pagosMM.toFixed(2)),
                      'Tasa Rec. %': Number(r.tasa_rec.toFixed(2))
                    })))}>
                      Descargar CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Clientes</TableHead>
                        <TableHead>Respuesta</TableHead>
                        <TableHead>Tasa Éxito %</TableHead>
                        <TableHead>Saldo (MM)</TableHead>
                        <TableHead>Pagos (MM)</TableHead>
                        <TableHead>Tasa Rec. %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.grupo}>
                          <TableCell className="font-medium">{r.grupo}</TableCell>
                          <TableCell>{r.clientes.toLocaleString('es-CO')}</TableCell>
                          <TableCell>{r.respuesta.toLocaleString('es-CO')}</TableCell>
                          <TableCell>{r.tasa_exito.toFixed(2)}%</TableCell>
                          <TableCell>{r.saldoMM.toLocaleString('es-CO')}</TableCell>
                          <TableCell>{r.pagosMM.toLocaleString('es-CO')}</TableCell>
                          <TableCell>{r.tasa_rec.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })()}

          {/* Export resumen — removido (dependía de deciles/horizonte/costo) */}
        </div>
      );
    }
    // Vista especializada para BdB - Cartera Castigada en pestaña técnicas
    if (tipoMetrica === 'tecnicas' && esCastigadaBdB) {
      // Derivados a partir de CSV real
      const formatoDineroMM = (v: number) => `$${v.toLocaleString('es-CO')} MM`;

      // Preparar listas para selects
      const fechas = btRows ? Array.from(new Set(btRows.map((r) => r.fecha))).sort() : [];
      const rowsSelFecha = btRows?.filter((r) => !btFecha || r.fecha === btFecha) || [];
      const segmentosDisponibles = Array.from(new Set(rowsSelFecha.map((r) => r.segmento))).sort();
      // util: selector de pagos por horizonte
      const getPagos = (r: BtRow): number => {
        if (btHorizon === '1m') return r.sum_pagos_1m_total ?? 0;
        if (btHorizon === '2m') return r.sum_pagos_2m_total ?? 0;
        return r.sum_pagos_3m_total ?? 0;
      };

      // Agregación por segmento (saldo y pagado en MM) para la fecha seleccionada
      const segmentosAgg = rowsSelFecha.reduce((acc: Record<string, { saldo: number; pagado: number; clientes: number }>, r) => {
        acc[r.segmento] = acc[r.segmento] || { saldo: 0, pagado: 0, clientes: 0 };
        acc[r.segmento].saldo += r.saldo_total;
        acc[r.segmento].pagado += getPagos(r);
        acc[r.segmento].clientes += r.clientes || 0;
        return acc;
      }, {});
      const segmentos = Object.entries(segmentosAgg)
        .map(([segmento, v]) => ({ segmento, saldo: v.saldo / 1_000_000, pagado: v.pagado / 1_000_000 }))
        .sort((a, b) => b.pagado - a.pagado);

      // Totales por fecha (para shares y lift segmental)
      const totalSaldoFecha = rowsSelFecha.reduce((s, r) => s + r.saldo_total, 0);
      const totalPagadoFecha = rowsSelFecha.reduce((s, r) => s + getPagos(r), 0);
      const tasaGlobalFecha = totalSaldoFecha > 0 ? (totalPagadoFecha / totalSaldoFecha) * 100 : 0;
      const segmentosTable = Object.entries(segmentosAgg)
        .map(([segmento, v]) => ({
          segmento,
          clientes: v.clientes,
          saldoMM: v.saldo / 1_000_000,
          pagadoMM: v.pagado / 1_000_000,
          tasa: v.saldo > 0 ? (v.pagado / v.saldo) * 100 : 0,
          sharePagado: totalPagadoFecha > 0 ? (v.pagado / totalPagadoFecha) * 100 : 0,
          liftSeg: tasaGlobalFecha > 0 ? ((v.saldo > 0 ? (v.pagado / v.saldo) * 100 : 0) / tasaGlobalFecha) : 0
        }))
        .sort((a, b) => b.pagadoMM - a.pagadoMM);

      // Agregación por decil del segmento seleccionado
      const rowsSegSel = rowsSelFecha.filter((r) => !btSegmento || r.segmento === btSegmento);
      const totalPagadoSeg = rowsSegSel.reduce((s, r) => s + getPagos(r), 0);
      const totalSaldoSeg = rowsSegSel.reduce((s, r) => s + r.saldo_total, 0);
      const decilMap = new Map<number, { clientes: number; saldo: number; pagado: number }>();
      rowsSegSel.forEach((r) => {
        const d = r.decil_probabilidad;
        const cur = decilMap.get(d) || { clientes: 0, saldo: 0, pagado: 0 };
        cur.clientes += r.clientes || 0;
        cur.saldo += r.saldo_total || 0;
        cur.pagado += getPagos(r) || 0;
        decilMap.set(d, cur);
      });
      const decilesRaw = Array.from(decilMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([decil0, v]) => ({
          decil: decil0 + 1,
          clientes: v.clientes,
          saldo: v.saldo / 1_000_000,
          pagado: v.pagado / 1_000_000,
          tasa: v.saldo > 0 ? (v.pagado / v.saldo) * 100 : 0
        }));
      // recall acumulado y lift aproximado
      let acumPag = 0;
      const totalPag = totalPagadoSeg || decilesRaw.reduce((s, d) => s + d.pagado * 1_000_000, 0);
      const tasaGlobal = totalSaldoSeg > 0 ? (totalPagadoSeg / totalSaldoSeg) * 100 : 0;
      const totalClientes = decilesRaw.reduce((s, d) => s + d.clientes, 0) || 1;
      const deciles = decilesRaw.map((d) => {
        acumPag += d.pagado * 1_000_000;
        const recallAcum = totalPag > 0 ? (acumPag / totalPag) * 100 : 0;
        const lift = tasaGlobal > 0 ? d.tasa / tasaGlobal : 0;
        return { ...d, recallAcum, lift };
      });
      // fila de referencia y métricas adicionales
      const anyRow = rowsSegSel[0];
      const auc = anyRow?.roc ?? 0;
      const ks = anyRow?.ks ?? 0;
      const psi = anyRow?.psi ?? 0;
      const gini = Math.max(0, Math.min(1, 2 * auc - 1));
      const liftTop1 = deciles[0]?.lift ?? 0;
      const top3Pagado = deciles.slice(0, 3).reduce((s, d) => s + d.pagado * 1_000_000, 0);
      const top3Share = totalPag > 0 ? (top3Pagado / totalPag) * 100 : 0;
      const recomendadoCut = (() => {
        const target = 80; // 80% recall acumulado
        const idx = deciles.findIndex((d) => d.recallAcum >= target);
        return idx >= 0 ? deciles[idx].decil : deciles[deciles.length - 1]?.decil ?? 10;
      })();

      // (se eliminan curvas avanzadas a petición)

      // KPIs del header (Periodo, Tasa, AUC, KS, PSI)
      const periodoStr = btFecha ? `${btFecha.slice(0, 4)}-${btFecha.slice(4)}` : '—';
      const tasaRecuperacion = totalSaldoSeg > 0 ? (totalPagadoSeg / totalSaldoSeg) * 100 : 0;

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold">Cobranzas Cartera Castigada - Banco de Bogotá</h4>
              <p className="text-muted-foreground text-sm">Analítica técnica del modelo y resultados de backtesting</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Vista</span>
              <Select value={vistaTecnica} onValueChange={(v) => setVistaTecnica(v as any)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecciona vista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modelo">Modelo actual</SelectItem>
                  <SelectItem value="backtesting">Resultados Backtesting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {vistaTecnica === 'modelo' && (
            <>
              {/* KPIs del modelo actual */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricas.tecnicas.map((m, i) => (
                  <Card key={i} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{m.titulo}</p>
                          <p className="text-2xl font-bold">{m.valor}</p>
                        </div>
                        <m.icono className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Gráficos genéricos del modelo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Latencia API</CardTitle>
                    <CardDescription>Tiempo de respuesta promedio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={seriesTemporales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis domain={[40, 50]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="latencia" stroke="#ef4444" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Predicciones</CardTitle>
                    <CardDescription>Exactitud del modelo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={datosPie}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
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
            </>
          )}

          {vistaTecnica === 'backtesting' && (
            <>
              {/* Filtros de Fecha, Segmento y Horizonte */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Fecha</span>
                  <Select value={btFecha ?? undefined} onValueChange={(v) => setBtFecha(v)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Selecciona fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      {fechas.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Segmento</span>
                  <Select value={btSegmento ?? undefined} onValueChange={(v) => setBtSegmento(v)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Selecciona segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {segmentosDisponibles.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Horizonte</span>
                  <Select value={btHorizon} onValueChange={(v) => setBtHorizon(v as any)}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Horizonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 mes</SelectItem>
                      <SelectItem value="2m">2 meses</SelectItem>
                      <SelectItem value="3m">3 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* KPIs del backtesting (extendidos) */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-4">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">Periodo evaluado</p>
                    <p className="text-2xl font-bold" title={getDesc('Periodo', 'Periodo del backtesting')}>{periodoStr}</p>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">Tasa de recuperación</p>
                    <p className="text-2xl font-bold" title={getDesc('Tasa recuperación', 'Pagado / Saldo')}>{tasaRecuperacion.toFixed(2)}%</p>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">AUC</p>
                    <p className="text-2xl font-bold" title={getDesc('AUC', 'Área bajo la curva ROC')}>{(auc ?? 0).toFixed(3)}</p>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">KS</p>
                    <p className="text-2xl font-bold" title={getDesc('KS', 'Kolmogorov-Smirnov')}>{(ks ?? 0).toFixed(3)}</p>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">PSI</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold" title={getDesc('PSI', 'Population Stability Index')}>{(psi ?? 0).toFixed(3)}</p>
                      <Badge variant="outline" className={psi < 0.1 ? 'text-emerald-600 border-emerald-300' : psi < 0.25 ? 'text-amber-600 border-amber-300' : 'text-red-600 border-red-300'}>
                        {psi < 0.1 ? 'Estable' : psi < 0.25 ? 'Alerta' : 'Alto'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">Gini</p>
                    <p className="text-2xl font-bold" title={getDesc('Gini', '2*AUC - 1')}>{gini.toFixed(3)}</p>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">Lift @D1</p>
                    <p className="text-2xl font-bold" title={getDesc('Lift', 'Lift en el mejor decil (D1)')}>{liftTop1.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">Top 3 captura</p>
                    <p className="text-2xl font-bold" title={getDesc('Top3', '% del pagado capturado en top 3 deciles')}>{top3Share.toFixed(1)}%</p>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">Corte sugerido</p>
                    <p className="text-2xl font-bold" title={getDesc('Corte 80% recall', 'Decil mínimo para alcanzar 80% de recall acumulado')}>D{recomendadoCut}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Segmentos: Saldo vs Pagado — movido a Métricas de Negocio */}

              {/* Distribución por deciles: Pagado y Tasa */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Deciles</CardTitle>
                  <CardDescription>Pagado por decil y tasa de recuperación</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={deciles}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="decil" />
                      <YAxis yAxisId="left" label={{ value: 'Pagado (MM)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Tasa %', angle: 90, position: 'insideRight' }} />
                      <Tooltip formatter={(v: any, name, ctx: any) => {
                        if (ctx?.dataKey === 'tasa') return [`${Number(v).toFixed(1)}%`, 'Tasa recuperación'];
                        if (ctx?.dataKey === 'pagado') return [formatoDineroMM(Number(v)), 'Pagado'];
                        return [v, name];
                      }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="pagado" name="Pagado (MM)" fill="#a78bfa" />
                      <Line yAxisId="right" type="monotone" dataKey="tasa" name="Tasa %" stroke="#f59e0b" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>


              {/* Resumen por Segmento (tabla) */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen por Segmento</CardTitle>
                  <CardDescription>Clientes, saldos, pagado y métricas clave por segmento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end mb-2">
                    <Button onClick={() => exportToCsv('castigada_bdb_segmentos.csv', segmentosTable.map(s => ({
                      Segmento: s.segmento,
                      Clientes: s.clientes,
                      'Saldo (MM)': Number(s.saldoMM.toFixed(2)),
                      'Pagado (MM)': Number(s.pagadoMM.toFixed(2)),
                      'Tasa rec. %': Number(s.tasa.toFixed(2)),
                      'Participación pagado %': Number(s.sharePagado.toFixed(1)),
                      'Lift seg.': Number(s.liftSeg.toFixed(2))
                    })))}>Descargar CSV</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Segmento</TableHead>
                        <TableHead>Clientes</TableHead>
                        <TableHead>Saldo (MM)</TableHead>
                        <TableHead>Pagado (MM)</TableHead>
                        <TableHead>Tasa rec. %</TableHead>
                        <TableHead>Part. pagado %</TableHead>
                        <TableHead>Lift seg.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {segmentosTable.map((s) => (
                        <TableRow key={s.segmento} className={s.segmento === btSegmento ? 'bg-muted/30' : ''}>
                          <TableCell className="font-medium">{s.segmento}</TableCell>
                          <TableCell>{s.clientes.toLocaleString('es-CO')}</TableCell>
                          <TableCell>{s.saldoMM.toLocaleString('es-CO')}</TableCell>
                          <TableCell>{s.pagadoMM.toLocaleString('es-CO')}</TableCell>
                          <TableCell>{s.tasa.toFixed(2)}%</TableCell>
                          <TableCell>{s.sharePagado.toFixed(1)}%</TableCell>
                          <TableCell>{s.liftSeg.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Tendencias técnicas por fecha (segmento seleccionado) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tendencias Técnicas</CardTitle>
                      <CardDescription>Comportamiento en el tiempo por segmento</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Métrica</span>
                      <Select value={btTechMetric} onValueChange={(v) => setBtTechMetric(v as any)}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Selecciona métrica" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auc">AUC</SelectItem>
                          <SelectItem value="ks">KS</SelectItem>
                          <SelectItem value="psi">PSI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const trendRows = (btRows || []).filter(r => !btSegmento || r.segmento === btSegmento);
                    const fechasT = Array.from(new Set(trendRows.map(r => r.fecha))).sort();
                    const data = fechasT.map(f => {
                      const rs = trendRows.filter(r => r.fecha === f);
                      return {
                        fecha: `${f.slice(0,4)}-${f.slice(4)}`,
                        auc: rs[0]?.roc ?? 0,
                        ks: rs[0]?.ks ?? 0,
                        psi: rs[0]?.psi ?? 0
                      };
                    });
                    const maxVal = (data.length ? Math.max(...data.map(d => (d as any)[btTechMetric] || 0)) : 0);
                    const domainMax = Math.max(0.5, Math.min(1, maxVal + 0.1));
                    const color = btTechMetric === 'auc' ? '#6366f1' : btTechMetric === 'ks' ? '#f97316' : '#ef4444';
                    const name = btTechMetric.toUpperCase();
                    return (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fecha" />
                          <YAxis domain={[0, domainMax]} />
                          <Tooltip formatter={(v: any) => [Number(v).toFixed(3), name]} />
                          <Line type="monotone" dataKey={btTechMetric} name={name} stroke={color} strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Tabla resumen por decil con exportación */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen por Decil</CardTitle>
                  <CardDescription>Clientes, saldos, pagado y métricas clave</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end mb-2">
                    <Button onClick={() => exportToCsv('castigada_bdb_backtesting_deciles.csv', deciles.map(d => ({
                      Decil: d.decil,
                      Clientes: d.clientes,
                      'Saldo (MM)': d.saldo,
                      'Pagado (MM)': d.pagado,
                      'Tasa recuperación %': Number(d.tasa.toFixed(2)),
                      'Recall acumulado %': Number(d.recallAcum.toFixed(1)),
                      'Lift': Number(d.lift.toFixed(2))
                    })))}>Descargar CSV</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead title={getDesc('Decil', 'Ordenamiento por score (1=mejor)')}>Decil</TableHead>
                        <TableHead title={getDesc('Clientes', 'Número de clientes / cuentas en el decil')}>Clientes</TableHead>
                        <TableHead title={getDesc('Saldo', 'Saldo de cartera castigada (MM COP)')}>Saldo (MM)</TableHead>
                        <TableHead title={getDesc('Pagado', 'Valor pagado durante ventana de observación (MM COP)')}>Pagado (MM)</TableHead>
                        <TableHead title={getDesc('Tasa recuperación', 'Pagado / Saldo por decil')}>Tasa recuperación</TableHead>
                        <TableHead title={getDesc('Recall acumulado', 'Porcentaje acumulado capturado hasta el decil')}>Recall acum.</TableHead>
                        <TableHead title={getDesc('Lift', 'Mejora vs azar en el decil')}>Lift</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deciles.map((d) => (
                        <TableRow key={d.decil}>
                          <TableCell className="font-medium">{d.decil}</TableCell>
                          <TableCell>{d.clientes.toLocaleString('es-CO')}</TableCell>
                          <TableCell>{d.saldo.toLocaleString('es-CO')}</TableCell>
                          <TableCell>{d.pagado.toLocaleString('es-CO')}</TableCell>
                          <TableCell>{d.tasa.toFixed(1)}%</TableCell>
                          <TableCell>{d.recallAcum.toFixed(1)}%</TableCell>
                          <TableCell>{d.lift.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricas[tipoMetrica].map((metrica, index) => (
            <Card key={index} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metrica.titulo}
                    </p>
                    <p className="text-2xl font-bold">{metrica.valor}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <metrica.icono className="h-5 w-5 text-muted-foreground" />
                    {metrica.tendencia === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

            {/* Tabla comparativa de todos los modelos */}
            <Card>
              <CardHeader>
                <CardTitle>Comparativa de Modelos</CardTitle>
                <CardDescription>Rendimiento actual de todos los modelos de productos</CardDescription>
              </CardHeader>
              <CardContent>
              {/* Botón para descargar comparativa */}
              <div className="flex justify-end mb-2">
                <Button onClick={() => exportToCsv(
                  'comparativa_modelos.csv',
                  Object.entries(modelos).map(([key, m]) => ({
                    Modelo: m.nombre,
                    Precision: m.metricas.precision,
                    Recall: m.metricas.recall,
                    'F1-Score': m.metricas.f1Score,
                    AUC: m.metricas.auc,
                    Latencia: m.metricas.latencia
                  }))
                )}>
                  Descargar CSV
                </Button>
              </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Precisión</TableHead>
                      <TableHead>Recall</TableHead>
                      <TableHead>F1-Score</TableHead>
                      <TableHead>AUC</TableHead>
                      <TableHead>Latencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(modelos).map(([key, modelo]) => {
                      const IconComponent = modelo.icono;
                      return (
                        <TableRow key={key} className={modeloSeleccionado === key ? 'bg-muted/50' : ''}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{modelo.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell>{modelo.metricas.precision}</TableCell>
                          <TableCell>{modelo.metricas.recall}</TableCell>
                          <TableCell>{modelo.metricas.f1Score}</TableCell>
                          <TableCell>{modelo.metricas.auc}</TableCell>
                          <TableCell>{modelo.metricas.latencia}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          

        {/* Sección especial para Aumento de Uso - Filtro Activos/Durmientes */}
        {tipoMetrica === 'negocio' && tipo === 'aumento-uso' && (
          <div className="space-y-6">
            {/* Filtro Activos/Durmientes */}
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Tipo de Usuario:</label>
              <div className="flex gap-2">
                <Button 
                  variant={filtroUsuario === 'activos' ? 'default' : 'outline'} 
                  onClick={() => setFiltroUsuario('activos')}
                  size="sm"
                >
                  Activos
                </Button>
                <Button 
                  variant={filtroUsuario === 'durmientes' ? 'default' : 'outline'} 
                  onClick={() => setFiltroUsuario('durmientes')}
                  size="sm"
                >
                  Durmientes
                </Button>
              </div>
            </div>

            {/* KPIs basados en datos CSV */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Usuarios Contactables</p>
                      <p className="text-2xl font-bold">{filtroUsuario === 'activos' ? '34,197' : '9,871'}</p>
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">{filtroUsuario === 'activos' ? '79.14%' : '66%'}</p>
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Usuarios Compra</p>
                      <p className="text-2xl font-bold">{filtroUsuario === 'activos' ? '6,855' : '2,224'}</p>
                    </div>
                    <Target className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">{filtroUsuario === 'activos' ? '20.05%' : '23%'}</p>
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Efectividad</p>
                      <p className="text-2xl font-bold">{filtroUsuario === 'activos' ? '20.05%' : '23.12%'}</p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">+2.1%</p>
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cuota Promedio</p>
                      <p className="text-2xl font-bold">{filtroUsuario === 'activos' ? '$11.21' : '$14.45'}</p>
                    </div>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">+$1.2</p>
                </CardContent>
              </Card>
            </div>

            {/* Serie de tiempo de evolución */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Métricas - Usuarios {filtroUsuario}</CardTitle>
                <CardDescription>Tendencias temporales de las métricas principales</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filtroUsuario === 'activos' ? activosTimeSeriesData : durmientesTimeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="contactables" stroke="#8884d8" strokeWidth={2} name="Contactables %" />
                    <Line type="monotone" dataKey="compra" stroke="#82ca9d" strokeWidth={2} name="Compra %" />
                    <Line type="monotone" dataKey="efectividad" stroke="#ffc658" strokeWidth={2} name="Efectividad %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tabla de métricas detalladas */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas Detalladas - {filtroUsuario}</CardTitle>
                <CardDescription>Datos históricos comparativos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-2">
                  <Button onClick={() => exportToCsv(
                    `aumento-uso-${filtroUsuario}.csv`,
                    (filtroUsuario === 'activos' ? 
                      [
                        { periodo: 'May-25', iniciales: '43,211', contactables: '34,197', pctContactables: '79.14%', compras: '6,855', pctCompras: '20.05%', efectividad: '20.05%' },
                        { periodo: 'Abr-25', iniciales: '42,649', contactables: '32,864', pctContactables: '77.06%', compras: '5,669', pctCompras: '17.25%', efectividad: '17.25%' },
                        { periodo: 'Mar-25', iniciales: '43,624', contactables: '33,206', pctContactables: '76.12%', compras: '6,667', pctCompras: '20.08%', efectividad: '20.08%' }
                      ] : 
                      [
                        { periodo: 'May-Jul 25', iniciales: '15,069', contactables: '9,871', pctContactables: '66%', compras: '2,224', pctCompras: '23%', efectividad: '23.12%' },
                        { periodo: 'Mar-May 25', iniciales: '7,290', contactables: '4,193', pctContactables: '58%', compras: '980', pctCompras: '24%', efectividad: '24.26%' },
                        { periodo: 'Feb-Abr 25', iniciales: '8,842', contactables: '5,379', pctContactables: '61%', compras: '1,294', pctCompras: '24%', efectividad: '24.06%' }
                      ]
                    )
                  )}>
                    Descargar CSV
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Usuarios Iniciales</TableHead>
                      <TableHead>Contactables</TableHead>
                      <TableHead>% Contactables</TableHead>
                      <TableHead>Compras</TableHead>
                      <TableHead>% Compras</TableHead>
                      <TableHead>Efectividad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(filtroUsuario === 'activos' ? 
                      [
                        { periodo: 'May-25', iniciales: '43,211', contactables: '34,197', pctContactables: '79.14%', compras: '6,855', pctCompras: '20.05%', efectividad: '20.05%' },
                        { periodo: 'Abr-25', iniciales: '42,649', contactables: '32,864', pctContactables: '77.06%', compras: '5,669', pctCompras: '17.25%', efectividad: '17.25%' },
                        { periodo: 'Mar-25', iniciales: '43,624', contactables: '33,206', pctContactables: '76.12%', compras: '6,667', pctCompras: '20.08%', efectividad: '20.08%' }
                      ] : 
                      [
                        { periodo: 'May-Jul 25', iniciales: '15,069', contactables: '9,871', pctContactables: '66%', compras: '2,224', pctCompras: '23%', efectividad: '23.12%' },
                        { periodo: 'Mar-May 25', iniciales: '7,290', contactables: '4,193', pctContactables: '58%', compras: '980', pctCompras: '24%', efectividad: '24.26%' },
                        { periodo: 'Feb-Abr 25', iniciales: '8,842', contactables: '5,379', pctContactables: '61%', compras: '1,294', pctCompras: '24%', efectividad: '24.06%' }
                      ]
                    ).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.periodo}</TableCell>
                        <TableCell>{row.iniciales}</TableCell>
                        <TableCell>{row.contactables}</TableCell>
                        <TableCell>{row.pctContactables}</TableCell>
                        <TableCell>{row.compras}</TableCell>
                        <TableCell>{row.pctCompras}</TableCell>
                        <TableCell>{row.efectividad}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sección especial para Aumento de Uso - Métricas Financieras */}
        {tipoMetrica === 'financieras' && tipo === 'aumento-uso' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ROI TDC</p>
                      <p className="text-2xl font-bold">572%</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">+45%</p>
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Margen Incremental</p>
                      <p className="text-2xl font-bold">$2.5M</p>
                    </div>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">+15%</p>
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Costo por Activación</p>
                      <p className="text-2xl font-bold">$4.80</p>
                    </div>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">-$0.50</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolución Financiera TDC</CardTitle>
                  <CardDescription>Margen anual por aumento de uso</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={[
                      { año: '2020', margen: 1357 },
                      { año: '2021', margen: 2504 },
                      { año: '2022', margen: 2504 },
                      { año: '2023', margen: 2504 },
                      { año: '2024', margen: 5073 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="año" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}K`, 'Margen']} />
                      <Area type="monotone" dataKey="margen" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Impacto</CardTitle>
                  <CardDescription>Por tipo de producto</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tarjetas de Crédito', value: 45, fill: '#8884d8' },
                          { name: 'Cuentas Ahorro', value: 25, fill: '#82ca9d' },
                          { name: 'CDT', value: 20, fill: '#ffc658' },
                          { name: 'Otros Productos', value: 10, fill: '#ff7300' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabla específica del caso TDC */}
            <Card>
              <CardHeader>
                <CardTitle>Detalle Financiero - Aumento de uso TDC</CardTitle>
                <CardDescription>Basado en registro L5;Popular;572809;Aumento de uso TDC</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-2">
                  <Button onClick={() => exportToCsv(
                    'detalle_financiero_tdc.csv',
                    [
                      { metrica: 'Cantidad Productos', '2020': '26,241', '2021': '116,742', '2022-2024': '116,742', 'Proyección 2025': '150,000' },
                      { metrica: 'Margen (Miles $)', '2020': '$1,357', '2021': '$2,504', '2022-2024': '$2,504', 'Proyección 2025': '$5,073' },
                      { metrica: 'ROI', '2020': '345%', '2021': '572%', '2022-2024': '572%', 'Proyección 2025': '750%' }
                    ]
                  )}>
                    Descargar Detalle Financiero
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Métrica</TableHead>
                      <TableHead>2020</TableHead>
                      <TableHead>2021</TableHead>
                      <TableHead>2022-2024</TableHead>
                      <TableHead>Proyección 2025</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Cantidad Productos</TableCell>
                      <TableCell>26,241</TableCell>
                      <TableCell>116,742</TableCell>
                      <TableCell>116,742</TableCell>
                      <TableCell>150,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Margen (Miles $)</TableCell>
                      <TableCell>$1,357</TableCell>
                      <TableCell>$2,504</TableCell>
                      <TableCell>$2,504</TableCell>
                      <TableCell>$5,073</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">ROI</TableCell>
                      <TableCell>345%</TableCell>
                      <TableCell>572%</TableCell>
                      <TableCell>572%</TableCell>
                      <TableCell>750%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sección especial para Aumento de Uso - Métricas Técnicas */}
        {tipoMetrica === 'tecnicas' && tipo === 'aumento-uso' && (
          <div className="space-y-6">
            {/* Filtro Activos/Durmientes para métricas técnicas */}
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Tipo de Usuario:</label>
              <div className="flex gap-2">
                <Button 
                  variant={filtroUsuario === 'activos' ? 'default' : 'outline'} 
                  onClick={() => setFiltroUsuario('activos')}
                  size="sm"
                >
                  Activos
                </Button>
                <Button 
                  variant={filtroUsuario === 'durmientes' ? 'default' : 'outline'} 
                  onClick={() => setFiltroUsuario('durmientes')}
                  size="sm"
                >
                  Durmientes
                </Button>
              </div>
            </div>

            {filtroUsuario === 'durmientes' && (
              <div className="space-y-6">
                {/* KPIs para modelo de durmientes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Precisión</p>
                          <p className="text-2xl font-bold">{aumentoUsoTechnicalData.durmientes.metricas.precision}</p>
                        </div>
                        <Target className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Recall</p>
                          <p className="text-2xl font-bold">{aumentoUsoTechnicalData.durmientes.metricas.recall}</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">AUC</p>
                          <p className="text-2xl font-bold">{aumentoUsoTechnicalData.durmientes.metricas.auc}</p>
                        </div>
                        <Activity className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">KS Test</p>
                          <p className="text-2xl font-bold">{aumentoUsoTechnicalData.durmientes.metricas.ks}</p>
                        </div>
                        <Cpu className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Información del modelo de durmientes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Modelo de Clasificación - Reactivación Uso TC</CardTitle>
                    <CardDescription>Estado operativo y configuración del modelo para usuarios durmientes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="font-medium">Estado:</span>
                          <Badge variant="default">{aumentoUsoTechnicalData.durmientes.estado}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Frecuencia Recalibración:</span>
                          <span>{aumentoUsoTechnicalData.durmientes.frecuenciaRecalibracion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Última Recalibración:</span>
                          <span>{aumentoUsoTechnicalData.durmientes.ultimaRecalibracion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Última Ejecución:</span>
                          <span>{aumentoUsoTechnicalData.durmientes.ultimaEjecucion}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="font-medium">PSI:</span>
                          <Badge variant="outline">{aumentoUsoTechnicalData.durmientes.metricas.psi}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Tasa V.O.:</span>
                          <Badge variant="secondary">{aumentoUsoTechnicalData.durmientes.metricas.tasaVO}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gráfico de evolución temporal para durmientes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Evolución de Métricas - Modelo Durmientes</CardTitle>
                    <CardDescription>Tendencia histórica de performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[
                        { fecha: 'Ene', precision: 0.8, recall: 22.1, auc: 82.3 },
                        { fecha: 'Feb', precision: 0.85, recall: 23.5, auc: 83.8 },
                        { fecha: 'Mar', precision: 0.9, recall: 24.2, auc: 84.9 },
                        { fecha: 'Abr', precision: 0.9, recall: 24.2, auc: 84.9 },
                        { fecha: 'May', precision: 0.9, recall: 24.2, auc: 84.9 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="precision" stroke="#8884d8" strokeWidth={2} name="Precisión %" />
                        <Line type="monotone" dataKey="recall" stroke="#82ca9d" strokeWidth={2} name="Recall %" />
                        <Line type="monotone" dataKey="auc" stroke="#ffc658" strokeWidth={2} name="AUC %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {filtroUsuario === 'activos' && (
              <div className="space-y-6">
                {/* Modelos de Segmentación */}
                <Card>
                  <CardHeader>
                    <CardTitle>Modelos K-means - Segmentación por Tipo de TC</CardTitle>
                    <CardDescription>Inercia de cada modelo de segmentación por tipo de tarjeta</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end mb-2">
                      <Button onClick={() => exportToCsv(
                        'segmentacion_tc_activos.csv',
                        aumentoUsoTechnicalData.activos.segmentacion.map(s => ({
                          Modelo: s.modelo,
                          Inercia: s.inercia
                        }))
                      )}>
                        Descargar Segmentación
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {aumentoUsoTechnicalData.activos.segmentacion.map((seg, i) => (
                        <Card key={i} className="p-4">
                          <CardContent className="p-0">
                            <div className="text-center">
                              <p className="text-sm font-medium text-muted-foreground">{seg.modelo}</p>
                              <p className="text-xl font-bold">{seg.inercia}</p>
                              <p className="text-xs text-muted-foreground">Inercia</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={aumentoUsoTechnicalData.activos.segmentacion.map(s => ({
                        modelo: s.modelo.replace('TC ', ''),
                        inercia: parseFloat(s.inercia.replace(',', ''))
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="modelo" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value) => [value.toLocaleString(), 'Inercia']} />
                        <Bar dataKey="inercia" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Modelos de Recomendación */}
                <Card>
                  <CardHeader>
                    <CardTitle>Modelos Sistema de Recomendación - Propensión Uso TC</CardTitle>
                    <CardDescription>RMSE (Root Mean Square Error) por tipo de tarjeta</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end mb-2">
                      <Button onClick={() => exportToCsv(
                        'recomendacion_tc_activos.csv',
                        aumentoUsoTechnicalData.activos.recomendacion.map(r => ({
                          Modelo: r.modelo,
                          RMSE: r.rmse
                        }))
                      )}>
                        Descargar Recomendación
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo de TC</TableHead>
                          <TableHead>RMSE</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aumentoUsoTechnicalData.activos.recomendacion.map((rec, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{rec.modelo}</TableCell>
                            <TableCell>{rec.rmse}</TableCell>
                            <TableCell>
                              <Badge variant={rec.rmse === 'Sin población' ? 'secondary' : 'default'}>
                                {rec.rmse === 'Sin población' ? 'Sin datos' : 'Operativo'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Gráfico RMSE */}
                    <div className="mt-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={aumentoUsoTechnicalData.activos.recomendacion
                          .filter(r => r.rmse !== 'Sin población')
                          .map(r => ({
                            modelo: r.modelo.replace('TC ', ''),
                            rmse: parseFloat(r.rmse)
                          }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="modelo" angle={-45} textAnchor="end" height={80} />
                          <YAxis domain={[0.5, 0.6]} />
                          <Tooltip formatter={(value) => [value, 'RMSE']} />
                          <Bar dataKey="rmse" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Gráficos según el tipo - Solo si NO es NBA con métricas de negocio ni Aumento de Uso */}
        {!(tipoMetrica === 'negocio' && (tipo === 'nba' || tipo === 'aumento-uso')) && !(tipoMetrica === 'financieras' && tipo === 'aumento-uso') && !(tipoMetrica === 'tecnicas' && tipo === 'aumento-uso') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tipoMetrica === 'financieras' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>ROI Evolutivo</CardTitle>
                    <CardDescription>Retorno de inversión por mes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={seriesTemporales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="roi" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Costos</CardTitle>
                    <CardDescription>Desglose de inversión</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Infraestructura', value: 35, color: '#3b82f6' },
                            { name: 'Desarrollo', value: 45, color: '#10b981' },
                            { name: 'Mantenimiento', value: 20, color: '#f59e0b' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label
                        >
                          {[
                            { name: 'Infraestructura', value: 35, color: '#3b82f6' },
                            { name: 'Desarrollo', value: 45, color: '#10b981' },
                            { name: 'Mantenimiento', value: 20, color: '#f59e0b' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}

            {tipoMetrica === 'negocio' && tipo !== 'nba' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Precisión del Modelo</CardTitle>
                    <CardDescription>Evolución mensual de la precisión</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={seriesTemporales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis domain={[90, 96]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Predicciones vs Correctas</CardTitle>
                    <CardDescription>Comparación mensual</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={datosBarras}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="predicciones" fill="#3b82f6" name="Total Predicciones" />
                        <Bar dataKey="correctas" fill="#10b981" name="Predicciones Correctas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}

            {tipoMetrica === 'tecnicas' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Latencia API</CardTitle>
                    <CardDescription>Tiempo de respuesta promedio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={seriesTemporales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis domain={[40, 50]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="latencia" stroke="#ef4444" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Predicciones</CardTitle>
                    <CardDescription>Exactitud del modelo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={datosPie}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
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
              </>
            )}
          </div>
        )}

        {/* Tabla de métricas detalladas - NO mostrar para aumento-uso en financieras */}
        {!(tipo === 'aumento-uso' && tipoMetrica === 'financieras') && (
          <Card>
            <CardHeader>
              <CardTitle>Métricas Detalladas</CardTitle>
              <CardDescription>Comparación con benchmarks de la industria</CardDescription>
            </CardHeader>
            <CardContent>
            {/* Botón para descargar métricas detalladas */}
            <div className="flex justify-end mb-2">
              <Button onClick={() => exportToCsv(
                'metricas_detalladas.csv',
                datosTabla.map(row => ({
                  Metrica: row.metrica,
                  ValorActual: row.valor,
                  Benchmark: row.benchmark,
                  Estado: row.estado
                }))
              )}>
                Descargar Métricas Detalladas
              </Button>
            </div>
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
                {datosTabla.map((fila, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{fila.metrica}</TableCell>
                    <TableCell>{fila.valor}</TableCell>
                    <TableCell>{fila.benchmark}</TableCell>
                    <TableCell>
                      <Badge variant={fila.estado === 'Excelente' ? 'default' : 'secondary'}>
                        {fila.estado === 'Excelente' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {fila.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        )}
      </div>
    );
  };

  const casoInfo = casosInfo[tipo] || casosInfo['churn'];
  const tituloVisible = displayTitle || casoInfo.nombre;

  return (
    <div className="container mx-auto p-6 space-y-6 h-full">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          {!displayTitle && (
            <div className={`w-4 h-4 rounded-full ${casoInfo.color}`} />
          )}
          {!displayTitle && (
            <div>
              <h1 className="text-3xl font-bold" title={casoInfo.nombre}>{tituloVisible}</h1>
              <p className="text-muted-foreground">{displayTitle ? `Vista temporal basada en plantilla ${casoInfo.nombre}` : casoInfo.descripcion}</p>
            </div>
          )}
          {!displayTitle && (
            <Badge variant="outline" className="text-green-600 border-green-600 ml-auto">
              Activo
            </Badge>
          )}
        </div>

        {/* Métricas por Pestañas - Ocupando todo el espacio */}
        <div className="flex-1">
          <Tabs defaultValue={defaultTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="financieras">Métricas Financieras</TabsTrigger>
              <TabsTrigger value="negocio">Métricas de Negocio</TabsTrigger>
              <TabsTrigger value="tecnicas">Métricas Técnicas</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4 mt-6">
              {csvRecord ? (
                <div className="space-y-6">
                  {/* KPI strip */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <div className="border rounded-md p-3 bg-background/60">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</p>
                      <div className="mt-1">
                        {(() => {
                          const estado = (csvRecord.Estado || '').toLowerCase();
                          let cls = 'bg-gray-100 text-gray-700 border-gray-300';
                          if (estado.includes('sin uso') || estado.includes('deprecado')) cls = 'bg-red-100 text-red-700 border-red-300';
                          else if (estado.includes('desarrollo') || estado.includes('pilotaje')) cls = 'bg-blue-100 text-blue-700 border-blue-300';
                          else if ((estado.includes('entregado') && estado.includes('con uso')) || (estado.includes('finalizado') && estado.includes('con uso'))) cls = 'bg-green-100 text-green-700 border-green-300';
                          return (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${cls}`}>
                              {csvRecord.Estado || 'N/D'}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="border rounded-md p-3 bg-background/60">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Etapa</p>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {csvRecord.Etapa || 'N/D'}
                        </span>
                      </div>
                    </div>
                    <div className="border rounded-md p-3 bg-background/60">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Impacto Financiero</p>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                          {csvRecord['Impacto Financiero'] || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="border rounded-md p-3 bg-background/60">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nivel Impacto</p>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          {csvRecord['Nivel Impacto Financiero'] || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="border rounded-md p-3 bg-background/60">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unidad</p>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                          {csvRecord['Unidad del Impacto Financiero'] || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {/* Resumen del Proyecto */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Resumen del Proyecto</CardTitle>
                        <CardDescription>Información proveniente del CSV</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Entidad</p>
                            <p className="font-medium">{csvRecord.Entidad || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Proyecto</p>
                            <p className="font-medium">{csvRecord.Proyecto || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Estado</p>
                            <p className="font-medium">{csvRecord.Estado || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Etapa</p>
                            <p className="font-medium">{csvRecord.Etapa || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Tipo Proyecto</p>
                            <p className="font-medium">{csvRecord['Tipo Proyecto'] || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Impacto Financiero</p>
                            <p className="font-medium">{csvRecord['Impacto Financiero'] || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Nivel Impacto</p>
                            <p className="font-medium">{csvRecord['Nivel Impacto Financiero'] || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Unidad Impacto</p>
                            <p className="font-medium">{csvRecord['Unidad del Impacto Financiero'] || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Sponsor</p>
                            <p className="font-medium">{csvRecord.Sponsor || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Main Contact</p>
                            <p className="font-medium">{csvRecord['Main Contact'] || '—'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Equipo y Fechas */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Equipo y Fechas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">DS Principal</p>
                            <p className="font-medium">{csvRecord.DS1 || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">DS Apoyo</p>
                            <p className="font-medium">{csvRecord.DS2 || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">DE</p>
                            <p className="font-medium">{csvRecord.DE || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">MDS</p>
                            <p className="font-medium">{csvRecord.MDS || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha Inicio</p>
                            <p className="font-medium">{csvRecord['Fecha de Inicio'] || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha Entrega</p>
                            <p className="font-medium">{csvRecord['Fecha de Entrega'] || '—'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Observaciones */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Observaciones</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {csvRecord.Observaciones ? (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Observaciones</p>
                            <div className="text-sm p-3 rounded-md bg-muted/30 border border-muted">{csvRecord.Observaciones}</div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Sin observaciones registradas.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No hay información de CSV disponible.</div>
              )}
            </TabsContent>
            
            <TabsContent value="financieras" className="space-y-4 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Impacto Financiero</h3>
                <p className="text-muted-foreground">
                  Métricas relacionadas con el retorno de inversión y beneficios económicos
                </p>
              </div>
              {renderMetricas('financieras')}
            </TabsContent>
            
            <TabsContent value="negocio" className="space-y-4 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Métricas de Negocio</h3>
                <p className="text-muted-foreground">
                  Indicadores de rendimiento del negocio y satisfacción del cliente
                </p>
              </div>
              {renderMetricas('negocio')}
            </TabsContent>
            
            <TabsContent value="tecnicas" className="space-y-4 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Métricas Técnicas</h3>
                <p className="text-muted-foreground">
                  Rendimiento técnico del modelo y métricas de machine learning
                </p>
              </div>
              {renderMetricas('tecnicas')}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CasoUso;