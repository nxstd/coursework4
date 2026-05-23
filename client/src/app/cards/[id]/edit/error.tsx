"use client";

export default function EditCardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="surface mx-auto max-w-3xl border-coral/25 p-8">
      <h1 className="text-3xl font-black tracking-tight">Не удалось открыть редактор</h1>
      <p className="mt-3 text-ink/70">{error.message}</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Попробовать снова
      </button>
    </section>
  );
}
