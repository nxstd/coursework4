import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CardForm } from "@/components/card-form";

export default function NewCardPage() {
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
        <h1 className="mt-4 text-4xl font-black tracking-tight">Новая визитка</h1>
        <p className="mt-3 max-w-2xl text-ink/70">
          Заполните публичный профиль и выберите короткий адрес для ссылки
        </p>
      </div>

      <CardForm mode="create" />
    </section>
  );
}
