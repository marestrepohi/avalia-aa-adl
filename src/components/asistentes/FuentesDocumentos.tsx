import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Folder, ChevronRight, ChevronDown, FileText, Link as LinkIcon, Plus, Trash2, FolderPlus, FilePlus, X, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Documento {
  id: string;
  nombre: string;
  tipo: 'archivo' | 'enlace' | 'carpeta';
  tamaño?: string;
  fechaAgregado?: Date;
  description?: string;  // descripción breve
  createdBy?: string;   // creador
  modifiedBy?: string;  // último modificador
  version?: number;     // versión actual
  history?: Array<{      // historial de versiones
    version: number;
    modifiedBy: string;
    fecha: Date;
    changes: string;
  }>;
  children?: Documento[];
}

interface FuentesDocumentosProps {
  asistenteId: string;
}

// Estructura de ejemplo con carpetas y archivos
const estructura: Documento[] = [
  {
    id: 'folder-1',
    nombre: 'Manuales',
    tipo: 'carpeta',
    children: [
      {
        id: 'doc-001',
        nombre: 'Guía de productos crediticios 2025.pdf',
        tipo: 'archivo',
        tamaño: '1.2 MB',
        fechaAgregado: new Date(2025, 2, 15)
      },
      {
        id: 'doc-002',
        nombre: 'FAQ Clientes Corporativos.docx',
        tipo: 'archivo',
        tamaño: '485 KB',
        fechaAgregado: new Date(2025, 3, 2)
      }
    ]
  },
  {
    id: 'folder-2',
    nombre: 'Enlaces útiles',
    tipo: 'carpeta',
    children: [
      {
        id: 'link-001',
        nombre: 'Base de Conocimiento Interna',
        tipo: 'enlace',
        fechaAgregado: new Date(2025, 3, 10)
      },
      {
        id: 'link-002',
        nombre: 'Catálogo de Productos Actualizado',
        tipo: 'enlace',
        fechaAgregado: new Date(2025, 2, 25)
      }
    ]
  },
  {
    id: 'doc-003',
    nombre: 'Manual de Procedimientos.pdf',
    tipo: 'archivo',
    tamaño: '3.7 MB',
    fechaAgregado: new Date(2025, 1, 28)
  }
];

// Ejemplos detallados de fuentes con versiones y modificadores
const initialFuentes: Documento[] = [
  {
    id: 'folder-1',
    nombre: 'Manuales',
    tipo: 'carpeta',
    description: 'Colección de manuales de productos bancarios',
    createdBy: 'María Gómez',
    modifiedBy: 'Carlos Pérez',
    version: 2,
    history: [
      { version: 1, modifiedBy: 'María Gómez', fecha: new Date(2025, 0, 5), changes: 'Se agregaron manuales iniciales.' },
      { version: 2, modifiedBy: 'Carlos Pérez', fecha: new Date(2025, 3, 12), changes: 'Actualizada guía de crédito.' }
    ],
    children: [
      {
        id: 'doc-001',
        nombre: 'Guía de productos crediticios 2025.pdf',
        tipo: 'archivo',
        tamaño: '1.2 MB',
        fechaAgregado: new Date(2025, 2, 15),
        description: 'Detalle completo de productos de crédito.',
        createdBy: 'Ana Ruiz',
        modifiedBy: 'Luis Torres',
        version: 3,
        history: [
          { version: 1, modifiedBy: 'Ana Ruiz', fecha: new Date(2025, 2, 15), changes: 'Versión inicial.' },
          { version: 2, modifiedBy: 'Luis Torres', fecha: new Date(2025, 2, 20), changes: 'Corrección de formato.' },
          { version: 3, modifiedBy: 'Luis Torres', fecha: new Date(2025, 3, 1), changes: 'Actualización de tasas.' }
        ]
      },
      {
        id: 'doc-002',
        nombre: 'FAQ Clientes Corporativos.docx',
        tipo: 'archivo',
        tamaño: '485 KB',
        fechaAgregado: new Date(2025, 3, 2),
        description: 'Preguntas frecuentes para clientes corporativos.',
        createdBy: 'Javier López',
        modifiedBy: 'María Gómez',
        version: 2,
        history: [
          { version: 1, modifiedBy: 'Javier López', fecha: new Date(2025, 3, 2), changes: 'Documento inicial.' },
          { version: 2, modifiedBy: 'María Gómez', fecha: new Date(2025, 4, 10), changes: 'Agregadas preguntas sobre nuevos servicios.' }
        ]
      }
    ]
  },
  {
    id: 'link-001',
    nombre: 'Base de Conocimiento Interna',
    tipo: 'enlace',
    fechaAgregado: new Date(2025, 3, 10),
    description: 'Portal interno con artículos de soporte.',
    createdBy: 'Soporte TI',
    modifiedBy: 'Soporte TI',
    version: 1,
    history: [
      { version: 1, modifiedBy: 'Soporte TI', fecha: new Date(2025, 3, 10), changes: 'Enlace inicial configurado.' }
    ]
  },
  {
    id: 'doc-003',
    nombre: 'Manual de Procedimientos.pdf',
    tipo: 'archivo',
    tamaño: '3.7 MB',
    fechaAgregado: new Date(2025, 1, 28),
    description: 'Procedimientos operativos internos.',
    createdBy: 'Laura Sánchez',
    modifiedBy: 'Laura Sánchez',
    version: 1,
    history: [
      { version: 1, modifiedBy: 'Laura Sánchez', fecha: new Date(2025, 1, 28), changes: 'Versión inicial.' }
    ]
  }
];

const FuentesDocumentos: React.FC<FuentesDocumentosProps> = ({ asistenteId }) => {
  // Usa initialFuentes en lugar de map
  const [fuentes, setFuentes] = useState<Documento[]>(initialFuentes);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<'archivo' | 'carpeta' | 'enlace' | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editDoc, setEditDoc] = useState<Documento | null>(null);
  const [editChanges, setEditChanges] = useState<string>('');
  const [showDetail, setShowDetail] = useState(false);
  const [detailDoc, setDetailDoc] = useState<Documento | null>(null);

  const openEdit = (doc: Documento) => {
    setEditDoc(doc);
    setEditChanges('');
    setShowEdit(true);
  };

  const openDetail = (doc: Documento) => {
    setDetailDoc(doc);
    setShowDetail(true);
  };

  // Handler para guardar edición
  const handleSaveEdit = (updated: Documento, changes: string) => {
    setFuentes(prev => prev.map(doc => {
      if (doc.id === updated.id) {
        const newVersion = (doc.version || 1) + 1;
        return {
          ...updated,
          version: newVersion,
          modifiedBy: 'Admin',
          history: [
            ...(doc.history || []),
            { version: newVersion, modifiedBy: 'Admin', fecha: new Date(), changes }
          ]
        };
      }
      return doc;
    }));
    setShowEdit(false);
    setEditDoc(null);
  };

  function renderTree(nodes: Documento[], expanded: { [key: string]: boolean }, setExpanded: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>) {
    return nodes.map(node => {
      if (node.tipo === 'carpeta') {
        const isOpen = expanded[node.id];
        return (
          <div key={node.id} className="mb-1">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/40 rounded px-2 py-1" onClick={() => setExpanded(e => ({ ...e, [node.id]: !e[node.id] }))}>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Folder className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">{node.nombre}</span>
            </div>
            {isOpen && (
              <div className="ml-6 border-l border-muted/30 pl-2">
                {renderTree(node.children || [], expanded, setExpanded)}
              </div>
            )}
          </div>
        );
      }
      if (node.tipo === 'archivo' || node.tipo === 'enlace') {
        return (
          <div key={node.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted-30">
            {node.tipo === 'archivo' ? <FileText className="h-4 w-4 text-muted-foreground" /> : <LinkIcon className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm font-medium flex-1 truncate">{node.nombre}</span>
            <span className="text-xs text-muted-foreground">v{node.version}</span>
            <Button variant="ghost" size="icon" onClick={() => openDetail(node)}>
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      }
      return null;
    });
  }

  return (
    <>
    <div className="space-y-6">
      {/* Diálogo de edición */}
      {showEdit && editDoc && (
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Fuente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Metadata Summary */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Creado por:</strong> {editDoc.createdBy}</p>
                <p><strong>Última modificación:</strong> {editDoc.modifiedBy} en v{editDoc.version}</p>
                <p><strong>Cambios previos:</strong> {(editDoc.history?.length) || 0}</p>
              </div>
              <label>Nombre</label>
              <input type="text" value={editDoc.nombre} onChange={e => setEditDoc({ ...editDoc, nombre: e.target.value })} />
              <label>Descripción</label>
              <textarea value={editDoc.description} onChange={e => setEditDoc({ ...editDoc, description: e.target.value || '' })} />
              <label>Cambios</label>
              <textarea placeholder="Describe qué cambió" value={editChanges} onChange={e => setEditChanges(e.target.value)} />
              <Button onClick={() => handleSaveEdit(editDoc, editChanges)}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Diálogo de detalle */}
      {showDetail && detailDoc && (
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-3xl w-full p-6">
            <DialogHeader>
              <DialogTitle>Detalle de Fuente</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Resumen</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
                <TabsTrigger value="diff">Diff</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="summary">
                <div className="space-y-2">
                  <p><strong>Nombre:</strong> {detailDoc.nombre}</p>
                  <p><strong>Tipo:</strong> {detailDoc.tipo}</p>
                  {detailDoc.fechaAgregado && <p><strong>Fecha agregado:</strong> {format(detailDoc.fechaAgregado, 'dd/MM/yyyy')}</p>}
                  <p><strong>Descripción:</strong> {detailDoc.description}</p>
                  <p><strong>Creado por:</strong> {detailDoc.createdBy}</p>
                  <p><strong>Última mod:</strong> {detailDoc.modifiedBy}</p>
                  <p><strong>Versión:</strong> {detailDoc.version}</p>
                </div>
              </TabsContent>
              <TabsContent value="history">
                <div className="space-y-2">
                  {detailDoc.history && detailDoc.history.length > 0 ? detailDoc.history.map(h => (
                    <div key={h.version} className="p-2 border rounded">
                      <p><strong>v{h.version}</strong> — {h.modifiedBy} — {format(h.fecha, 'dd/MM/yyyy')}</p>
                      <p className="text-sm">{h.changes}</p>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">Sin historial</p>}
                </div>
              </TabsContent>
              <TabsContent value="diff">
                <div>
                  {detailDoc.history && detailDoc.history.length > 0 ? (
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">{detailDoc.history[detailDoc.history.length-1].changes}</pre>
                  ) : <p className="text-sm">No hay cambios previos</p>}
                </div>
              </TabsContent>
              <TabsContent value="preview">
                {detailDoc.tipo === 'archivo' && (
                  <div className="h-64 border rounded overflow-auto flex items-center justify-center bg-background">
                    <p className="text-sm text-muted-foreground">Vista previa del documento: {detailDoc.nombre}</p>
                  </div>
                )}
                {detailDoc.tipo === 'enlace' && (
                  <div className="h-64 border rounded overflow-auto">
                    <iframe src={detailDoc.nombre.startsWith('http') ? detailDoc.nombre : 'https://'+detailDoc.nombre} className="w-full h-full" />
                  </div>
                )}
                {detailDoc.tipo === 'carpeta' && (
                  <div className="text-sm text-muted-foreground">Vista previa no disponible para carpetas.</div>
                )}
              </TabsContent>
            </Tabs>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowDetail(false)}>Cerrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fuentes de Conocimiento</h3>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Fuente
        </Button>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-3xl w-full p-6">
          <DialogHeader>
            <DialogTitle>Agregar Fuente</DialogTitle>
          </DialogHeader>
          {!addType ? (
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-2 py-4" onClick={() => setAddType('archivo')}>
                <FilePlus className="h-6 w-6" /> Documento/Archivo
              </Button>
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-2 py-4" onClick={() => setAddType('carpeta')}>
                <FolderPlus className="h-6 w-6" /> Carpeta
              </Button>
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-2 py-4" onClick={() => setAddType('enlace')}>
                <LinkIcon className="h-6 w-6" /> Web/Enlace
              </Button>
            </div>
          ) : (
            <div className="space-y-6 mt-4 relative">
              <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setAddType(null)}>
                <X className="h-5 w-5" />
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {addType === 'archivo' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Selecciona un documento</label>
                    <input type="file" className="block w-full" />
                  </div>
                )}
                {addType === 'carpeta' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre de la carpeta</label>
                    <input type="text" className="input-field w-full" placeholder="Ej: Manuales 2025" />
                  </div>
                )}
                {addType === 'enlace' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">URL del sitio o recurso</label>
                    <input type="url" className="input-field w-full" placeholder="https://..." />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Creado por</label>
                  <input type="text" className="input-field w-full" placeholder="Nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de agregado</label>
                  <input type="date" className="input-field w-full" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea className="input-field w-full" rows={3} placeholder="Descripción breve" />
              </div>
              <div className="flex justify-end">
                <Button className="px-8 py-2">Agregar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="max-h-[420px] overflow-y-auto pr-2">
            {renderTree(fuentes, expanded, setExpanded)}
          </div>
        </CardHeader>
      </Card>
    </div>
    </>
  );
}

export default FuentesDocumentos;
