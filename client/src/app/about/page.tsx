export default function AboutPage() {
  return (
    <section className="surface max-w-3xl space-y-5 p-6">
      <h1 className="text-4xl font-black tracking-tight">О проекте</h1>
      <p className="text-lg leading-8 text-ink/70">
        Digital Card Platform combines a Next.js client, FastAPI REST API, and PostgreSQL database.
        Authentication is intentionally outside the current project scope.
      </p>
    </section>
  );
}
