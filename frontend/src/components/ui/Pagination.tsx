'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | 'ellipsis';

function getVisiblePages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const result: PageItem[] = [1];
  const siblingRange = 2;
  const start = Math.max(2, page - siblingRange);
  const end = Math.min(totalPages - 1, page + siblingRange);

  if (start > 2) result.push('ellipsis');

  for (let p = start; p <= end; p++) {
    result.push(p);
  }

  if (end < totalPages - 1) result.push('ellipsis');

  result.push(totalPages);
  return result;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav className="pager" aria-label="페이지 네비게이션">
      <button
        type="button"
        className="pager__control"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="icon-line" size={16} strokeWidth={1.5} aria-hidden />
        이전
      </button>
      {visiblePages.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="pager__ellipsis">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            disabled={item === page}
            onClick={() => onPageChange(item)}
            className={`pager__item${item === page ? ' pager__item--active' : ''}`}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className="pager__control"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        다음
        <ChevronRight className="icon-line" size={16} strokeWidth={1.5} aria-hidden />
      </button>
    </nav>
  );
}
