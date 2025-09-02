import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  emptyMessage?: string;
  className?: string;
  showCheckboxes?: boolean;
  renderExpandedRow?: (row: Record<string, any>) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  data, 
  emptyMessage = "No hay datos disponibles",
  className = "",
  showCheckboxes = false,
  renderExpandedRow,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Record<string | number, boolean>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});
  const itemsPerPage = 5;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (Object.keys(selectedRows).length === paginatedData.length) {
      setSelectedRows({});
    } else {
      const newSelectedRows = { ...selectedRows };
      paginatedData.forEach((row, index) => {
        newSelectedRows[row.id || index] = true;
      });
      setSelectedRows(newSelectedRows);
    }
  };

  const toggleSelectRow = (id: string | number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleExpandRow = (id: string | number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const areAllSelected = selectedCount === paginatedData.length && paginatedData.length > 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {renderExpandedRow && (
                <TableHead className="w-10 px-2"></TableHead>
              )}
              {showCheckboxes && (
                <TableHead className="w-10">
                  <div className="flex items-center justify-center">
                    <button 
                      className={`h-4 w-4 rounded border ${areAllSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input'} flex items-center justify-center`}
                      onClick={toggleSelectAll}
                    >
                      {areAllSelected && <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.className || ""}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <React.Fragment key={row.id || index}>
                  <TableRow className="hover:bg-muted/50">
                    {renderExpandedRow && (
                      <TableCell className="w-10 px-2">
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors"
                          onClick={() => toggleExpandRow(row.id || index)}
                          aria-label="Expandir fila"
                        >
                          {expandedRows[row.id || index] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                    )}
                    {showCheckboxes && (
                      <TableCell className="w-10">
                        <div className="flex items-center justify-center">
                          <button 
                            className={`h-4 w-4 rounded border ${selectedRows[row.id || index] ? 'bg-primary border-primary text-primary-foreground' : 'border-input'} flex items-center justify-center`}
                            onClick={() => toggleSelectRow(row.id || index)}
                          >
                            {selectedRows[row.id || index] && <Check className="h-3 w-3" />}
                          </button>
                        </div>
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={`${index}-${column.key}`}
                        className={column.className || ""}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows[row.id || index] && renderExpandedRow && (
                    <TableRow>
                      <TableCell 
                        colSpan={(showCheckboxes ? 1 : 0) + (renderExpandedRow ? 1 : 0) + columns.length} 
                        className="bg-muted/30 p-0"
                      >
                        <div className="p-4 animate-accordion-down">
                          {renderExpandedRow(row)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={(showCheckboxes ? 1 : 0) + (renderExpandedRow ? 1 : 0) + columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-3">
          <div className="text-sm text-muted-foreground">
            {selectedCount > 0 && (
              <span className="font-medium">
                {selectedCount} de {paginatedData.length} filas seleccionadas.
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Página</p>
              <p className="text-sm text-muted-foreground">
                {currentPage} de {totalPages}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="h-8 w-8 flex items-center justify-center border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="h-8 w-8 flex items-center justify-center border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;