import { CopyLinkButton } from "@/components/copy-link-button";
import { PublicAvatar } from "@/components/public-avatar";
import type { BusinessCard } from "@/lib/api";

type PublicCardProps = {
  card: BusinessCard;
  publicUrl: string;
  qrCodeSvg: string;
};

export function PublicCard({ card, publicUrl, qrCodeSvg }: PublicCardProps) {
  const initials = card.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="surface mx-auto max-w-7xl overflow-hidden 2xl:max-w-[86rem]">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-ink p-8 text-white sm:p-10 2xl:p-12">
            <PublicAvatar avatarUrl={card.avatarUrl} initials={initials} />
            <h1 className="mt-12 text-4xl font-black tracking-tight sm:text-5xl 2xl:text-6xl">{card.fullName}</h1>
            <p className="mt-4 text-lg leading-8 text-white/75">
              {[card.jobTitle, card.company].filter(Boolean).join(", ") || "Цифровая визитка"}
            </p>
            {card.location ? <p className="mt-8 text-sm font-medium text-white/60">{card.location}</p> : null}
          </div>

          <div className="space-y-8 p-8 sm:p-10 2xl:p-12">
            {card.bio ? (
              <p className="text-lg leading-8 text-ink/75">{card.bio}</p>
            ) : (
              <p className="text-lg leading-8 text-ink/60">Цифровая визитка с контактами и полезными ссылками</p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <ContactLink label="Почта" value={card.email} href={card.email ? `mailto:${card.email}` : null} />
              <ContactLink label="Телефон" value={card.phone} href={card.phone ? `tel:${card.phone}` : null} />
              <ContactLink label="Сайт" value={card.website} href={card.website} />
            </div>

            {card.socialLinks.length > 0 ? (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-ink/45">Соцсети</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {card.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-ink/10 bg-ink/[0.03] px-4 py-2 text-sm font-semibold transition hover:border-ink/25 hover:bg-white"
                    >
                      {link.label || link.platform}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="border-t border-ink/10 bg-white/70 p-8 sm:p-10 xl:border-l xl:border-t-0 2xl:p-12">
          <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
            <div
              className="mx-auto h-60 w-60 2xl:h-64 2xl:w-64 [&_svg]:h-full [&_svg]:w-full"
              aria-label={`QR-код для ${publicUrl}`}
              dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
            />
          </div>
          <h2 className="mt-6 text-2xl font-black tracking-tight">Поделиться</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Отсканируйте QR-код или скопируйте публичную ссылку на визитку
          </p>
          <div className="mt-5">
            <CopyLinkButton url={publicUrl} />
          </div>
          <p className="mt-4 break-all rounded-md bg-ink/[0.04] p-3 text-xs font-semibold text-ink/65">
            {publicUrl}
          </p>
        </aside>
      </div>
    </article>
  );
}

function ContactLink({ href, label, value }: { href: string | null; label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <a
      href={href ?? undefined}
      className="rounded-md border border-ink/10 bg-ink/[0.03] p-4 transition hover:border-ink/20 hover:bg-white focus:outline-none focus:ring-4 focus:ring-mint/20"
    >
      <span className="block text-xs font-bold uppercase tracking-widest text-ink/45">{label}</span>
      <span className="mt-2 block break-words text-sm font-semibold text-ink">{value}</span>
    </a>
  );
}
