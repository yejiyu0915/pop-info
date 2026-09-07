'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { getEditorialSlides, HOME_EDITORIAL_SLIDE_LIMIT } from '@/lib/editorial';

const AUTOPLAY_MS = 5000;
const TONE_COUNT = 3;

type PillBox = {
  y: number;
  width: number;
  height: number;
  ready: boolean;
};

function toneFor(index: number) {
  return String((index % TONE_COUNT) + 1);
}

export function EditorsPickSection() {
  const slides = getEditorialSlides(HOME_EDITORIAL_SLIDE_LIMIT);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pill, setPill] = useState<PillBox>({ y: 0, width: 0, height: 0, ready: false });
  const tablistId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const selected = slides[index] ?? slides[0];

  const select = useCallback(
    (next: number) => {
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const syncPill = useCallback(() => {
    const list = listRef.current;
    const item = itemRefs.current[index];
    if (!list || !item) return;

    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    setPill({
      y: itemRect.top - listRect.top,
      width: itemRect.width,
      height: itemRect.height,
      ready: true,
    });
  }, [index]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || paused || reducedMotion) return;

    const timer = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [index, paused, reducedMotion, slides.length]);

  useLayoutEffect(() => {
    syncPill();
  }, [syncPill, slides.length]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const ro = new ResizeObserver(() => {
      syncPill();
    });

    ro.observe(list);
    for (const item of itemRefs.current) {
      if (item) ro.observe(item);
    }

    window.addEventListener('resize', syncPill);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', syncPill);
    };
  }, [syncPill, slides.length]);

  const onRailClick = (i: number, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    if (i !== index) {
      event.preventDefault();
      select(i);
    }
  };

  const onRailKeyDown = (i: number, event: KeyboardEvent<HTMLAnchorElement>) => {
    if (slides.length <= 1) return;

    let next: number | null = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      next = (i + 1) % slides.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      next = (i - 1 + slides.length) % slides.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = slides.length - 1;
    }

    if (next === null) return;
    event.preventDefault();
    select(next);
    document.getElementById(`${tablistId}-tab-${next}`)?.focus();
  };

  if (!selected) return null;

  const pillStyle: CSSProperties = pill.ready
    ? {
        width: pill.width,
        height: pill.height,
        transform: `translateY(${pill.y}px)`,
      }
    : { visibility: 'hidden' };

  return (
    <section className="editors" aria-labelledby="editors-pick-title">
      <div className="editors__head">
        <div className="editors__head-copy">
          <h2 id="editors-pick-title" className="home__section-title">
            Editor&apos;s Pick
          </h2>
          <p className="editors__lead">에디터가 고른 매거진형 큐레이션</p>
        </div>
      </div>

      <div
        className="editors__grid"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        <div className="editors__hero-panel">
          <Link
            href={`/editors-pick/${selected.slug}`}
            className={`editors__hero${reducedMotion ? ' editors__hero--instant' : ''}`}
            data-tone={toneFor(index)}
            id={`${tablistId}-panel`}
            role="tabpanel"
            aria-labelledby={`${tablistId}-tab-${index}`}
          >
            <div key={selected.slug} className="editors__hero-swap">
              <div className="editors__hero-visual" aria-hidden>
                {selected.imageUrl && (
                  <Image
                    src={selected.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 60vw"
                    className="editors__hero-image"
                  />
                )}
                <span className="editors__hero-glow" />
              </div>
              <div className="editors__hero-body">
                <span className="editors__eyebrow">{selected.meta}</span>
                <h3 className="editors__hero-title">{selected.title}</h3>
                <p className="editors__hero-brief">{selected.briefing}</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="editors__rail">
          <Link href="/editors-pick" className="home__cta-chip editors__rail-cta">
            에디터 픽 더보기
            <ArrowUpRight className="icon-line" size={16} strokeWidth={1.5} aria-hidden />
          </Link>

          <ul
            ref={listRef}
            className="editors__subs"
            role="tablist"
            aria-label="Editor's Pick 목록"
            aria-orientation="vertical"
          >
            <li
              className={`editors__active-bg${reducedMotion ? ' editors__active-bg--instant' : ''}`}
              aria-hidden
              style={pillStyle}
            />
            {slides.map((article, i) => {
              const isSelected = i === index;

              return (
                <li key={article.slug} role="presentation">
                  <Link
                    ref={(node) => {
                      itemRefs.current[i] = node;
                    }}
                    id={`${tablistId}-tab-${i}`}
                    href={`/editors-pick/${article.slug}`}
                    className={`editors__sub${isSelected ? ' is-active' : ''}`}
                    data-tone={toneFor(i)}
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`${tablistId}-panel`}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={(event) => onRailClick(i, event)}
                    onKeyDown={(event) => onRailKeyDown(i, event)}
                  >
                    <div className="editors__sub-thumb" aria-hidden>
                      {article.imageUrl && (
                        <Image
                          src={article.imageUrl}
                          alt=""
                          fill
                          sizes="72px"
                          className="editors__sub-thumb-image"
                        />
                      )}
                    </div>
                    <div className="editors__sub-body">
                      <span className="editors__sub-meta">{article.meta}</span>
                      <span className="editors__sub-title">{article.title}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
