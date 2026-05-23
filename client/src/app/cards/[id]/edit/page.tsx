import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CardForm } from "@/components/card-form";
import { ApiRequestError, getCard } from "@/lib/api";

type EditCardPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCardPage({ params }: EditCardPageProps) {
  const { id } = await params;
  const card = await loadCard(id);

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <div>
        <Link
          href="/cards"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-ink/10 bg-white/75 px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-ink/25 hover:bg-white focus:outline-none focus:ring-4 focus:ring-mint/20"
        >
          <ArrowLeft size={16} />
          К списку
        </Link>
        <h1 className="mt-4 text-4xl font-black tracking-tight">Редактирование: {card.fullName}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">Обновите профиль, публичный адрес и ссылки</p>
      </div>

      <CardForm card={card} mode="edit" />
    </section>
  );
}

async function loadCard(id: string) {
  try {
    return await getCard(id);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
