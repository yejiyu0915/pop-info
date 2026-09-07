'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Pause, Play, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  KV_FEATURE_SLIDES,
  resolveKvBgVariant,
  type KvBgVariant,
  type KvFeatureSlide,
} from '@/lib/kvFeatures';
import { getClosingSoonLabel } from '@/lib/popupStatus';
import { fetchKvPosts } from '@/lib/posts';
import type { Post } from '@/types/post';

const KV_AUTOPLAY_MS = 5000;
const RING_SIZE = 36;
const RING_STROKE = 2.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const KV_BG_VARIANTS: KvBgVariant[] = ['grass', 'cream', 'ink', 'coral', 'paper'];

type KvSlide =
  | { type: 'post'; post: Post }
  | { type: 'feature'; feature: KvFeatureSlide };

function formatDateRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = new Date(start).toLocaleDateString('ko-KR', opts);
  const endStr = new Date(end).toLocaleDateString('ko-KR', opts);
  return `${startStr} — ${endStr}`;
}

function slideKey(slide: KvSlide) {
  return slide.type === 'post' ? `post-${slide.post.id}` : slide.feature.id;
}

export function KvBannerSlider() {
  const [postSlides, setPostSlides] = useState<Post[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progressNonce, setProgressNonce] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchKvPosts()
      .then((data) => {
        if (!cancelled) setPostSlides(data);
      })
      .catch(() => {
        if (!cancelled) setPostSlides([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const slides: KvSlide[] = useMemo(() => {
    const fromPosts: KvSlide[] = postSlides.map((post) => ({ type: 'post', post }));
    // KV에는 실제 이미지가 있는 기획 콘텐츠만 노출한다.
    const fromFeatures: KvSlide[] = KV_FEATURE_SLIDES.filter((feature) => Boolean(feature.imageUrl)).map((feature) => ({
      type: 'feature',
      feature,
    }));
    return [...fromFeatures, ...fromPosts];
  }, [postSlides]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || paused || reducedMotion) return;

    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, KV_AUTOPLAY_MS);

    return () => clearTimeout(timer);
  }, [slides.length, paused, reducedMotion, index, progressNonce]);

  if (loading) return null;
  if (slides.length === 0) return null;

  const safeIndex = index % slides.length;
  const current = slides[safeIndex] ?? slides[0];
  const autoPlayActive = slides.length > 1 && !paused && !reducedMotion;
  const bgVariant =
    current.type === 'feature'
      ? resolveKvBgVariant(safeIndex, current.feature.bgVariant)
      : resolveKvBgVariant(safeIndex);
  const key = slideKey(current);

  const handlePauseToggle = () => {
    if (paused) setProgressNonce((n) => n + 1);
    setPaused((p) => !p);
  };

  const handleSelect = (i: number) => {
    setIndex(i);
    setProgressNonce((n) => n + 1);
  };

  return (
    <section
      className={`kv kv--bg-${bgVariant}${reducedMotion ? ' kv--instant' : ''}`}
      role="region"
      aria-label="주목할 콘텐츠 배너"
      data-bg={bgVariant}
    >
      <div className="kv__washes" aria-hidden>
        {KV_BG_VARIANTS.map((variant) => (
          <div
            key={variant}
            className={`kv__wash kv__wash--${variant}${
              variant === bgVariant ? ' is-active' : ''
            }`}
          />
        ))}
      </div>

      <div className="kv__inner">
        <div className="kv__content">
          <div key={key} className="kv__copy">
            {current.type === 'post' ? (
              <PostKvCopy post={current.post} />
            ) : (
              <FeatureKvCopy feature={current.feature} />
            )}
          </div>
          <Link
            href={current.type === 'post' ? `/posts/${current.post.id}` : current.feature.href}
            className="kv__cta"
          >
            {current.type === 'post' ? '자세히 보기' : current.feature.ctaLabel}
            <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
              <ArrowRight size={14} strokeWidth={1.5} />
            </span>
          </Link>
          <KvNav
            slides={slides}
            index={safeIndex}
            paused={paused}
            reducedMotion={reducedMotion}
            autoPlayActive={autoPlayActive}
            progressNonce={progressNonce}
            onPauseToggle={handlePauseToggle}
            onSelect={handleSelect}
          />
        </div>
        <div className="kv__visual">
          <div key={key} className="kv__visual-swap">
            {current.type === 'post' ? (
              <PostKvVisual post={current.post} />
            ) : (
              <FeatureKvVisual feature={current.feature} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function KvNav({
  slides,
  index,
  paused,
  reducedMotion,
  autoPlayActive,
  progressNonce,
  onPauseToggle,
  onSelect,
}: {
  slides: KvSlide[];
  index: number;
  paused: boolean;
  reducedMotion: boolean;
  autoPlayActive: boolean;
  progressNonce: number;
  onPauseToggle: () => void;
  onSelect: (i: number) => void;
}) {
  if (slides.length <= 1) return null;

  return (
    <div className="kv__nav">
      <button
        type="button"
        className="kv__pause"
        aria-pressed={paused}
        aria-label={paused ? '슬라이드 자동 재생 재개' : '슬라이드 자동 재생 일시정지'}
        onClick={onPauseToggle}
      >
        <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
          {paused ? (
            <Play size={14} strokeWidth={1.5} />
          ) : (
            <Pause size={14} strokeWidth={1.5} />
          )}
        </span>
        {paused ? '재생' : '일시정지'}
      </button>
      {slides.map((slide, i) => {
        const isActive = i === index;
        return (
          <button
            key={slideKey(slide)}
            type="button"
            aria-label={`배너 ${i + 1}`}
            aria-pressed={isActive}
            onClick={() => onSelect(i)}
            className={`kv__nav-btn${isActive ? ' kv__nav-btn--active' : ''}`}
          >
            <svg
              className="kv__nav-ring"
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              width={RING_SIZE}
              height={RING_SIZE}
              aria-hidden
            >
              <circle
                className="kv__nav-ring-track"
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                strokeWidth={RING_STROKE}
              />
              {isActive && (
                <circle
                  key={`${index}-${progressNonce}`}
                  className={`kv__nav-ring-fill${
                    paused || reducedMotion || !autoPlayActive
                      ? ' kv__nav-ring-fill--paused'
                      : ''
                  }${reducedMotion ? ' kv__nav-ring-fill--static' : ''}`}
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth={RING_STROKE}
                  pathLength={100}
                  strokeDasharray={100}
                  strokeDashoffset={100}
                  style={{ animationDuration: `${KV_AUTOPLAY_MS}ms` }}
                />
              )}
            </svg>
            <span className="kv__nav-num">{String(i + 1).padStart(2, '0')}</span>
          </button>
        );
      })}
      <span aria-live="polite" aria-atomic="true">
        / {String(slides.length).padStart(2, '0')}
      </span>
      {!autoPlayActive && reducedMotion && <span className="kv__nav-note">자동 재생 꺼짐</span>}
    </div>
  );
}

function PostKvCopy({ post }: { post: Post }) {
  const closingLabel = getClosingSoonLabel(post.startDate, post.endDate);

  return (
    <>
      <span className="kv__eyebrow">주목할 팝업</span>
      <h2 className="kv__title">{post.title}</h2>
      <div className="kv__meta">
        <span className="kv__meta-item">
          <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
            <CalendarDays size={14} strokeWidth={1.5} />
          </span>
          <span>
            <strong>기간</strong> {formatDateRange(post.startDate, post.endDate)}
          </span>
        </span>
        <span className="kv__meta-item">
          <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
            <MapPin size={14} strokeWidth={1.5} />
          </span>
          <span>{post.location}</span>
        </span>
        {closingLabel && (
          <span className="kv__meta-item kv__meta-item--accent">
            <strong>{closingLabel}</strong>
          </span>
        )}
      </div>
    </>
  );
}

function PostKvVisual({ post }: { post: Post }) {
  return (
    <div
      className={`kv__poster${post.imageUrl ? '' : ' kv__poster--empty'}`}
      aria-hidden={!!post.imageUrl}
    >
      {post.imageUrl && (
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="kv__poster-img"
          sizes="(max-width: 768px) 88vw, 520px"
          priority
          unoptimized
        />
      )}
    </div>
  );
}

function FeatureKvCopy({ feature }: { feature: KvFeatureSlide }) {
  return (
    <>
      <span className="kv__eyebrow kv__eyebrow--feature">
        <Sparkles size={12} strokeWidth={1.5} aria-hidden />
        {feature.eyebrow}
      </span>
      <h2 className="kv__title">{feature.title}</h2>
      <p className="kv__briefing">{feature.briefing}</p>
    </>
  );
}

function FeatureKvVisual({ feature }: { feature: KvFeatureSlide }) {
  return (
    <div className={`kv__poster kv__poster--feature kv__poster--${feature.bgVariant}`} aria-hidden>
      <span className="kv__feature-mark">POPCAST</span>
    </div>
  );
}
