"use client";

import Link from "next/link";
import { Pencil, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DeleteCardButton } from "@/components/delete-card-button";
import type { BusinessCard } from "@/lib/api";

const PAGE_SIZE = 2;

type CardsListProps = {
  cards: BusinessCard[];
};

export function CardsList({ cards }: CardsListProps) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return cards;
    }

    return cards.filter((card) =>
      [card.fullName, card.company, card.jobTitle, card.slug].some((value) =>
        (value ?? "").toLowerCase().includes(normalizedQuery)
      )
    );
  }, [cards, query]);

  const visibleCards = filteredCards.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCards.length;

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !hasMore || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredCards.length));
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [filteredCards.length, hasMore]);

  if (cards.length === 0) {
    return (
      <div className="surface border-dashed p-8 text-center">
        <h2 className="text-2xl font-bold">Пока нет визиток</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink/65">
          Создайте первую цифровую визитку, и здесь появятся быстрые действия для редактирования и шаринга
        </p>
        <Link href="/cards/new" className="btn-primary mt-6 inline-flex">
          <Plus size={18} />
          Создать визитку
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="surface flex flex-col gap-3 p-4 sm:flex-row">
        <label className="sr-only" htmlFor="cards-search">
          Поиск визиток
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
          <input
            id="cards-search"
            name="q"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Поиск по ФИО, компании, должности или адресу"
            className="field pl-11"
          />
        </div>
        {query ? (
          <button type="button" onClick={() => setQuery("")} className="btn-secondary sm:w-auto">
            <X size={16} />
            Сбросить
          </button>
        ) : null}
      </div>

      {filteredCards.length === 0 ? (
        <div className="surface border-dashed p-8 text-center">
          <h2 className="text-2xl font-bold">Ничего не найдено</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/65">
            Поиск проверяет все визитки, включая те, которые ещё не показаны на странице
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleCards.map((card) => (
              <CardListItem key={card.id} card={card} />
            ))}
          </div>

          <div ref={loaderRef} className="flex justify-center py-2">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredCards.length))}
                className="btn-secondary"
              >
                <Plus size={16} />
                Загрузить ещё
              </button>
            ) : (
              <p className="text-sm font-semibold text-ink/45">Показаны все найденные визитки</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CardListItem({ card }: { card: BusinessCard }) {
  return (
    <article className="surface surface-hover relative p-5">
      <Link href={`/v/${card.slug}`} className="absolute inset-0 rounded-lg" aria-label={`Открыть ${card.fullName}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1fbf7a]">/v/{card.slug}</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight">{card.fullName}</h2>
          <p className="mt-1 text-sm font-medium text-ink/60">
            {[card.jobTitle, card.company].filter(Boolean).join(", ") || "Цифровая визитка"}
          </p>
        </div>
        <div className="relative z-10 flex shrink-0 gap-2">
          <Link href={`/cards/${card.id}/edit`} className="btn-icon" aria-label={`Редактировать ${card.fullName}`} title="Редактировать">
            <Pencil size={17} />
          </Link>
          <DeleteCardButton cardId={card.id} cardName={card.fullName} compact />
        </div>
      </div>

      {card.bio ? <p className="mt-5 line-clamp-2 text-sm leading-6 text-ink/70">{withoutTrailingPeriod(card.bio)}</p> : null}

    </article>
  );
}

function withoutTrailingPeriod(value: string) {
  return value.replace(/\.\s*$/g, "");
}
