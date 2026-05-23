import Link from "next/link";
import type { ReactNode } from "react";
import { BadgeCheck, Database, FilePenLine, List, Plus, QrCode, Search, Share2, Shuffle } from "lucide-react";
import { getCards, type BusinessCard, type SocialLink } from "@/lib/api";

export const dynamic = "force-dynamic";

type PreviewCard = Pick<
  BusinessCard,
  "slug" | "fullName" | "jobTitle" | "company" | "bio" | "email" | "phone" | "website" | "location"
> & {
  socialLinks: Pick<SocialLink, "id" | "platform" | "label">[];
};

export default async function HomePage() {
  const cards = await getCards();
  const previewCard = cards[0] ?? sampleCard;

  return (
    <section className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <div className="space-y-7">
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-ink sm:text-6xl">
              Создавайте, редактируйте и публикуйте визитки за пару минут
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-ink/70">
              В одном интерфейсе собраны профиль, контакты, соцсети, публичная ссылка и QR-код, данные
              сохраняются в API, а публичная страница сразу готова для отправки с телефона
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/cards" className="btn-primary">
              <List size={18} />
              Открыть список
            </Link>
            <Link href="/cards/new" className="btn-primary">
              <Plus size={18} />
              Создать визитку
            </Link>
            <Link href="/v/random" className="btn-secondary px-5 py-3">
              <Shuffle size={18} />
              Мне повезёт
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Визиток" value={String(cards.length)} icon={<Database size={18} />} />
            <StatCard label="Поля профиля" value="9" icon={<BadgeCheck size={18} />} />
            <StatCard label="Публичный формат" value="QR" icon={<QrCode size={18} />} />
          </div>
        </div>

        <RealCardPreview card={previewCard} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard
          title="Форма без лишнего"
          text="Вводите имя, должность, компанию, контакты, описание и ссылки, предпросмотр меняется прямо во время заполнения"
          icon={<FilePenLine size={20} />}
        />
        <InfoCard
          title="Управление списком"
          text="На странице визиток есть поиск, открытие публичной страницы, редактирование и удаление с подтверждением"
          icon={<Search size={20} />}
        />
        <InfoCard
          title="Публичная карточка"
          text="Страница /v/slug рендерится на сервере, содержит SEO-метаданные, QR-код и кнопку копирования ссылки"
          icon={<Share2 size={20} />}
        />
      </div>
    </section>
  );
}

function RealCardPreview({ card }: { card: PreviewCard }) {
  const initials = card.fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const role = [card.jobTitle, card.company].filter(Boolean).join(", ");

  return (
    <div className="surface h-full overflow-hidden">
      <div className="grid h-full lg:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-ink p-7 text-white sm:p-8">
          <p className="text-sm font-semibold text-white/60">Реальное превью визитки</p>
          <div className="mt-8 grid h-24 w-24 place-items-center rounded-lg bg-mint text-3xl font-black text-ink">
            {initials || "В"}
          </div>
          <h2 className="mt-10 text-4xl font-black tracking-tight">{card.fullName}</h2>
          <p className="mt-3 text-lg leading-8 text-white/75">{role || "Цифровая визитка"}</p>
          {card.location ? <p className="mt-8 text-sm font-semibold text-white/55">{card.location}</p> : null}
        </div>

        <div className="space-y-6 p-7 sm:p-8">
          <p className="text-base leading-7 text-ink/70">
            {withoutTrailingPeriod(card.bio) || "Публичная визитка с контактами и полезными ссылками"}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <PreviewField label="Почта" value={card.email ?? "не указана"} />
            <PreviewField label="Телефон" value={card.phone ?? "не указан"} />
            <PreviewField label="Сайт" value={card.website ?? "не указан"} />
            <PreviewField label="Адрес" value={`/v/${card.slug}`} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink/40">Соцсети</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {card.socialLinks.length > 0 ? (
                card.socialLinks.slice(0, 4).map((link) => (
                  <span key={link.id} className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink/70">
                    {link.label || link.platform}
                  </span>
                ))
              ) : (
                <span className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink/45">
                  Ссылки появятся здесь
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink/10 bg-ink/[0.03] p-3">
      <p className="text-xs font-bold uppercase tracking-widest text-ink/40">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-3xl font-black tracking-tight">{value}</p>
        <span className="grid h-9 w-9 place-items-center rounded-md bg-mint/25 text-ink">{icon}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-ink/55">{label}</p>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="surface surface-hover p-5">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-mint/25 text-ink">{icon}</div>
      <h2 className="text-xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink/65">{text}</p>
    </article>
  );
}

function withoutTrailingPeriod(value: string | null | undefined) {
  return value?.replace(/\.\s*$/g, "") ?? "";
}

const sampleCard: PreviewCard = {
  slug: "anna-smirnova",
  fullName: "Анна Смирнова",
  jobTitle: "Product Designer",
  company: "Studio One",
  bio: "Помогаю командам быстро упаковывать контакты, соцсети и публичные профили в аккуратную цифровую визитку",
  email: "anna@example.com",
  phone: "+7 999 123-45-67",
  website: "https://example.com",
  location: "Москва",
  socialLinks: [
    { id: "telegram", platform: "telegram", label: "Telegram" },
    { id: "linkedin", platform: "linkedin", label: "LinkedIn" }
  ]
};
