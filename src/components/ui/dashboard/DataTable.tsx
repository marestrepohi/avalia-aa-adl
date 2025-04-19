
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
}

const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  data, 
  emptyMessage = "No hay datos disponibles",
  className = "",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className={`bg-white rounded-lg shadow-card p-5 overflow-hidden card-hover ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`py-3 px-4 text-left text-sm font-medium text-foreground whitespace-nowrap ${column.className || ""}`}
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
                  colSpan={columns.length}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 px-4 py-2 border-t border-border gap-4">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            Mostrando {startIndex + 1} a{" "}
            {Math.min(startIndex + itemsPerPage, data.length)} de {data.length}{" "}
            resultados
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
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
