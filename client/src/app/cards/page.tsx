import Link from "next/link";
import { Plus } from "lucide-react";
import { CardsList } from "@/components/cards-list";
import { getCards } from "@/lib/api";

export default async function CardsPage() {
  const cards = await getCards();

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Визитки</h1>
          <p className="mt-3 max-w-2xl text-ink/70">
            Управляйте профилями, обновляйте контакты и открывайте публичные страницы
          </p>
        </div>
        <Link href="/cards/new" className="btn-primary w-full sm:w-auto">
          <Plus size={18} />
          Создать визитку
        </Link>
      </div>

      <CardsList cards={cards} />
    </section>
  );
}
