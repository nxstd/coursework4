export default function AboutPage() {
  return (
    <section className="surface max-w-3xl space-y-5 p-6">
      <h1 className="text-4xl font-black tracking-tight">О проекте</h1>
      <p className="text-lg leading-8 text-ink/70">
        Это компактная платформа для цифровых визиток: Next.js-клиент, FastAPI и SQLite-база
        Авторизация намеренно не добавлена
      </p>
    </section>
  );
}
