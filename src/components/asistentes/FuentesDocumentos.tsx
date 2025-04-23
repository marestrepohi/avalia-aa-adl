
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Documento {
  id: string;
  nombre: string;
  tipo: 'archivo' | 'enlace';
  tamaño?: string;
  fechaAgregado: Date;
}

interface FuentesDocumentosProps {
  asistenteId: string;
}

const FuentesDocumentos: React.FC<FuentesDocumentosProps> = ({ asistenteId }) => {
  // Sample data for documents
  const documentos: Documento[] = [
    {
      id: "doc-001",
      nombre: "Guía de productos crediticios 2025.pdf",
      tipo: "archivo",
      tamaño: "1.2 MB",
      fechaAgregado: new Date(2025, 2, 15)
    },
    {
      id: "doc-002",
      nombre: "FAQ Clientes Corporativos.docx",
      tipo: "archivo",
      tamaño: "485 KB",
      fechaAgregado: new Date(2025, 3, 2)
    },
    {
      id: "doc-003",
      nombre: "Manual de Procedimientos.pdf",
      tipo: "archivo",
      tamaño: "3.7 MB",
      fechaAgregado: new Date(2025, 1, 28)
    },
    {
      id: "link-001",
      nombre: "Base de Conocimiento Interna",
      tipo: "enlace",
      fechaAgregado: new Date(2025, 3, 10)
    },
    {
      id: "link-002",
      nombre: "Catálogo de Productos Actualizado",
      tipo: "enlace",
      fechaAgregado: new Date(2025, 2, 25)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fuentes de Conocimiento</h3>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Fuente
        </Button>
      </div>
      
      <Card>
        <CardHeader className="p-4 pb-2">
          <Tabs defaultValue="documentos" className="w-full">
            <TabsList>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="enlaces">Enlaces</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="p-4">
          <TabsContent value="documentos">
            <div className="space-y-2">
              {documentos
                .filter(doc => doc.tipo === 'archivo')
                .map(doc => (
                  <div key={doc.id} className="border rounded-md p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.nombre}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>{doc.tamaño}</span>
                          <span>Agregado: {format(doc.fechaAgregado, 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="enlaces">
            <div className="space-y-2">
              {documentos
                .filter(doc => doc.tipo === 'enlace')
                .map(doc => (
                  <div key={doc.id} className="border rounded-md p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.nombre}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>Agregado: {format(doc.fechaAgregado, 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuentesDocumentos;
