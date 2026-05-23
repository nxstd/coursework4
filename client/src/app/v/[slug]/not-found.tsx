import Link from "next/link";

export default function PublicCardNotFound() {
  return (
    <section className="surface mx-auto max-w-3xl p-8 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-coral">Визитка не найдена</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight">Эта визитка недоступна</h1>
      <p className="mx-auto mt-4 max-w-xl text-ink/70">
        Возможно, ссылка указана неверно или владелец удалил страницу
      </p>
      <Link href="/cards" className="btn-primary mt-7 inline-flex">
        К списку визиток
      </Link>
    </section>
  );
}
