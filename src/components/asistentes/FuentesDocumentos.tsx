import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Folder, ChevronRight, ChevronDown, FileText, Link as LinkIcon, Plus, Trash2, FolderPlus, FilePlus, X } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Documento {
  id: string;
  nombre: string;
  tipo: 'archivo' | 'enlace' | 'carpeta';
  tamaño?: string;
  fechaAgregado?: Date;
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

const FuentesDocumentos: React.FC<FuentesDocumentosProps> = ({ asistenteId }) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<'archivo' | 'carpeta' | 'enlace' | null>(null);

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
      if (node.tipo === 'archivo') {
        return (
          <div key={node.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/30">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium flex-1 truncate">{node.nombre}</span>
            <span className="text-xs text-muted-foreground">{node.tamaño}</span>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      }
      if (node.tipo === 'enlace') {
        return (
          <div key={node.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/30">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium flex-1 truncate">{node.nombre}</span>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fuentes de Conocimiento</h3>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Fuente
        </Button>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Fuente</DialogTitle>
          </DialogHeader>
          {!addType ? (
            <div className="grid grid-cols-1 gap-4 mt-2">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setAddType('archivo')}>
                <FilePlus className="h-5 w-5" /> Documento/Archivo
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setAddType('carpeta')}>
                <FolderPlus className="h-5 w-5" /> Carpeta
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setAddType('enlace')}>
                <LinkIcon className="h-5 w-5" /> Web/Enlace
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setAddType(null)}>
                <X className="h-4 w-4" />
              </Button>
              {addType === 'archivo' && (
                <div>
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
              <Button className="w-full mt-2">Agregar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="max-h-[420px] overflow-y-auto pr-2">
            {renderTree(estructura, expanded, setExpanded)}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default FuentesDocumentos;
