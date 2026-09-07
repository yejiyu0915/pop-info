'use client';

import {
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import { POPUP_CATEGORIES } from '@/constants/categories';
import { LOCATION_AREA_FILTER_OPTIONS } from '@/constants/areas';
import { POPUP_STATUS_FILTER_OPTIONS, POST_ORDER_BY_OPTIONS } from '@/constants/postFilters';
import type { LocationArea, PopupCategory, PostFilters } from '@/types/post';

interface PostFilterBarProps {
  filters: PostFilters;
  onChange: (filters: PostFilters) => void;
}

export function PostFilterBar({ filters, onChange }: PostFilterBarProps) {
  const [q, setQ] = useState(filters.q ?? '');
  const [expanded, setExpanded] = useState(false);

  const commitTextFilters = () => {
    onChange({
      ...filters,
      q: q.trim() || undefined,
      page: 1,
    });
  };

  const handleTextKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTextFilters();
    }
  };

  const handleReset = () => {
    setQ('');
    onChange({ page: 1, limit: filters.limit ?? 12 });
  };

  return (
    <div className={`filter${expanded ? ' filter--expanded' : ''}`}>
      <div className="filter__top">
        <label className="filter__field">
          <span className="filter__label">
            <Search className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            검색
          </span>
          <div className="filter__input-wrap">
            <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
              <Search className="icon-line" size={14} strokeWidth={1.5} />
            </span>
            <input
              type="text"
              className="filter__input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleTextKeyDown}
              placeholder="제목, 내용, 지역"
            />
          </div>
        </label>

        <label className="filter__field filter__field--date">
          <span className="filter__label">
            <CalendarDays className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            날짜 선택
          </span>
          <div className="filter__input-wrap filter__input-wrap--date">
            <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
              <CalendarDays className="icon-line" size={14} strokeWidth={1.5} />
            </span>
            <input
              type="date"
              className="filter__input filter__input--date"
              value={filters.targetDate ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  targetDate: e.target.value || undefined,
                  page: 1,
                })
              }
              aria-label="운영일 기준 날짜 검색"
            />
          </div>
        </label>

        <div className="filter__actions">
          <button type="button" className="filter__search" onClick={commitTextFilters}>
            <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
              <Search className="icon-line" size={14} strokeWidth={1.5} />
            </span>
            검색
          </button>
          <button type="button" className="filter__reset" onClick={handleReset}>
            <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
              <RotateCcw className="icon-line" size={14} strokeWidth={1.5} />
            </span>
            필터 초기화
          </button>
        </div>
      </div>

      <div className="filter__matrix">
        <div className="filter__group">
          <p className="filter__group-label" id="filter-status-label">
            <SlidersHorizontal className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            진행 상태
          </p>
          <div
            className="filter__segment"
            role="radiogroup"
            aria-labelledby="filter-status-label"
          >
            {POPUP_STATUS_FILTER_OPTIONS.map((option) => {
              const isActive = (filters.status ?? '') === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={`filter__segment-btn${isActive ? ' filter__segment-btn--active' : ''}`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      status: option.value ? (option.value as PostFilters['status']) : undefined,
                      page: 1,
                    })
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter__group filter__group--advanced">
          <p className="filter__group-label" id="filter-order-label">
            <ArrowUpDown className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            정렬
          </p>
          <div
            className="filter__segment"
            role="radiogroup"
            aria-labelledby="filter-order-label"
          >
            {POST_ORDER_BY_OPTIONS.map((option) => {
              const isActive = (filters.orderBy ?? 'latest') === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={`filter__segment-btn${isActive ? ' filter__segment-btn--active' : ''}`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      orderBy: option.value as PostFilters['orderBy'],
                      page: 1,
                    })
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="filter__more"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <ChevronUp className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
          ) : (
            <ChevronDown className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
          )}
          {expanded ? '필터 접기' : '필터 더보기'}
        </button>

        <div className="filter__group filter__group--advanced">
          <p className="filter__group-label" id="filter-area-label">
            <MapPin className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            주요 지역
          </p>
          <div
            className="filter__toggles"
            role="radiogroup"
            aria-labelledby="filter-area-label"
          >
            {LOCATION_AREA_FILTER_OPTIONS.map((option) => {
              const isActive = (filters.area ?? '') === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={`filter__toggle${isActive ? ' filter__toggle--active' : ''}`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      area: option.value ? (option.value as LocationArea) : undefined,
                      page: 1,
                    })
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter__group filter__group--advanced">
          <p className="filter__group-label" id="filter-category-label">
            <Tag className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            카테고리
          </p>
          <div
            className="filter__toggles"
            role="radiogroup"
            aria-labelledby="filter-category-label"
          >
            <button
              type="button"
              role="radio"
              aria-checked={!filters.category}
              className={`filter__toggle${!filters.category ? ' filter__toggle--active' : ''}`}
              onClick={() =>
                onChange({
                  ...filters,
                  category: undefined,
                  page: 1,
                })
              }
            >
              전체
            </button>
            {POPUP_CATEGORIES.map((c) => {
              const isActive = filters.category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={`filter__toggle${isActive ? ' filter__toggle--active' : ''}`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      category: c.value as PopupCategory,
                      page: 1,
                    })
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
