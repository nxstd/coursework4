"use client";

export default function CardsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="surface border-coral/25 p-8">
      <h1 className="text-3xl font-black tracking-tight">Не удалось загрузить визитки</h1>
      <p className="mt-3 max-w-2xl text-ink/70">{error.message}</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Попробовать снова
      </button>
    </section>
  );
}
