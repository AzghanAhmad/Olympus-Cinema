import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= pageSize) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const pageNumbers: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-card/60 text-xs text-muted-foreground ${className}`}
    >
      <div>
        Showing <span className="font-bold text-foreground">{startItem}</span> to{' '}
        <span className="font-bold text-foreground">{endItem}</span> of{' '}
        <span className="font-bold text-foreground">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                currentPage === 1
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:bg-secondary text-foreground'
              }`}
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-muted-foreground">…</span>}
          </>
        )}

        {pageNumbers.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              currentPage === p
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border hover:bg-secondary text-foreground'
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-muted-foreground">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                currentPage === totalPages
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:bg-secondary text-foreground'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
