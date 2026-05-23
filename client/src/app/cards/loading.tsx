export default function CardsLoading() {
  return (
    <section className="space-y-8">
      <div className="surface h-24 animate-pulse" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface h-48 animate-pulse" />
        ))}
      </div>
    </section>
  );
}
