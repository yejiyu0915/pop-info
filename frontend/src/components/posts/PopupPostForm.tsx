'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { LOCATION_AREAS } from '@/constants/areas';
import { POPUP_CATEGORIES } from '@/constants/categories';
import { isAdmin } from '@/lib/roles';
import { isEndDateBeforeStartDate, parseDateInput } from '@/lib/popupStatus';
import { useAuthStore } from '@/store/useAuthStore';
import type { CreatePostInput, LocationArea, PopupCategory, Post } from '@/types/post';

/** ISO → `<input type="date">`용 로컬 캘린더 날짜 (UTC slice 금지) */
function toDateInputValue(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface PopupPostFormProps {
  mode: 'create' | 'edit';
  initialValues?: Post;
  onSubmit: (values: CreatePostInput) => Promise<void>;
  submitLabel: string;
  cancelHref: string;
}

export function PopupPostForm({
  mode,
  initialValues,
  onSubmit,
  submitLabel,
  cancelHref,
}: PopupPostFormProps) {
  const { user } = useAuthStore();
  const canSetKv = isAdmin(user?.role);
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [content, setContent] = useState(initialValues?.content ?? '');
  const [startDate, setStartDate] = useState(
    initialValues ? toDateInputValue(initialValues.startDate) : '',
  );
  const [endDate, setEndDate] = useState(
    initialValues ? toDateInputValue(initialValues.endDate) : '',
  );
  const [location, setLocation] = useState(initialValues?.location ?? '');
  const [area, setArea] = useState<LocationArea>(initialValues?.area ?? 'ETC');
  const [category, setCategory] = useState<PopupCategory>(initialValues?.category ?? 'ETC');
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? '');
  const [isKv, setIsKv] = useState(initialValues?.isKv ?? false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isEndDateBeforeStartDate(startDate, endDate)) {
      toast.error('종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    setSubmitting(true);
    try {
      const start = parseDateInput(startDate);
      const end = parseDateInput(endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        toast.error('날짜 형식이 올바르지 않습니다.');
        return;
      }

      await onSubmit({
        title,
        content,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        location,
        area,
        category,
        imageUrl: imageUrl.trim() || (mode === 'edit' ? '' : undefined),
        isKv,
      });
    } catch {
      // API 에러는 axios 인터셉터가 토스트 처리. 그 외(날짜 변환 등)만 대비.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <label className="post-form__field">
        <span className="post-form__label">제목</span>
        <input
          type="text"
          className="post-form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />
      </label>
      <label className="post-form__field">
        <span className="post-form__label">내용</span>
        <textarea
          className="post-form__textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          maxLength={5000}
        />
      </label>
      <div className="post-form__row">
        <label className="post-form__field">
          <span className="post-form__label">시작일</span>
          <input
            type="date"
            className="post-form__input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>
        <label className="post-form__field">
          <span className="post-form__label">종료일</span>
          <input
            type="date"
            className="post-form__input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </label>
      </div>
      <label className="post-form__field">
        <span className="post-form__label">주요 지역</span>
        <select
          className="post-form__select"
          value={area}
          onChange={(e) => setArea(e.target.value as LocationArea)}
          required
        >
          {LOCATION_AREAS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </label>
      <label className="post-form__field">
        <span className="post-form__label">상세 주소</span>
        <input
          type="text"
          className="post-form__input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          maxLength={200}
          placeholder="예: 서울 강남구 테헤란로 123"
        />
      </label>
      <label className="post-form__field">
        <span className="post-form__label">카테고리</span>
        <select
          className="post-form__select"
          value={category}
          onChange={(e) => setCategory(e.target.value as PopupCategory)}
        >
          {POPUP_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="post-form__field">
        <span className="post-form__label">이미지 URL (선택)</span>
        <input
          type="url"
          className="post-form__input"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </label>
      <label className={`post-form__checkbox${!canSetKv ? ' post-form__checkbox--disabled' : ''}`}>
        <input
          type="checkbox"
          checked={isKv}
          onChange={(e) => setIsKv(e.target.checked)}
          disabled={!canSetKv}
        />
        <span className="post-form__checkbox-label">메인 KV 배너 등록</span>
        {!canSetKv && (
          <span className="post-form__checkbox-hint">(관리자 승인 후 메인 배너에 노출됩니다)</span>
        )}
      </label>
      <div className="post-form__actions">
        <button type="submit" className="auth__btn auth__btn--primary" disabled={submitting}>
          {submitting ? (mode === 'create' ? '등록 중...' : '저장 중...') : submitLabel}
        </button>
        <Link href={cancelHref} className="action__text">
          취소
        </Link>
      </div>
    </form>
  );
}
