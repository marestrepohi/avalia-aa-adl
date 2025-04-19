
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

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
}

const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  data, 
  emptyMessage = "No hay datos disponibles",
  className = "",
  showCheckboxes = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const itemsPerPage = 5;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const handleCheckboxChange = (index: number) => {
    setSelectedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className={`bg-white rounded-lg shadow-card p-5 overflow-hidden card-hover ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {showCheckboxes && (
                <th className="py-3 px-4 text-left w-10">
                  <span className="sr-only">Seleccionar</span>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`py-3 px-4 text-left text-sm font-medium text-foreground ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr 
                  key={index} 
                  className="table-row-hover border-b border-border last:border-0"
                >
                  {showCheckboxes && (
                    <td className="py-3 px-4 w-10">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedRows[index] || false}
                          onChange={() => handleCheckboxChange(index)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={`${index}-${column.key}`}
                      className={`py-3 px-4 text-sm ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showCheckboxes ? columns.length + 1 : columns.length}
                  className="py-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4 py-2 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a{" "}
            {Math.min(startIndex + itemsPerPage, data.length)} de {data.length}{" "}
            resultados
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="icon-button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="icon-button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
