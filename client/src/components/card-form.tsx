"use client";

import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import {
  createCard,
  type BusinessCard,
  type BusinessCardInput,
  type SocialLinkInput,
  updateCard
} from "@/lib/api";

type CardFormProps = {
  card?: BusinessCard;
  mode: "create" | "edit";
};

type FormState = {
  slug: string;
  fullName: string;
  jobTitle: string;
  company: string;
  bio: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  avatarUrl: string;
  socialLinks: SocialLinkInput[];
};

const emptyState: FormState = {
  slug: "",
  fullName: "",
  jobTitle: "",
  company: "",
  bio: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  avatarUrl: "",
  socialLinks: [
    {
      platform: "",
      url: "",
      label: ""
    }
  ]
};

export function CardForm({ card, mode }: CardFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(card));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewSlug = useMemo(() => cleanSlug(form.slug) || "novaya-vizitka", [form.slug]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const input = toPayload(form);
      const validationError = validatePayload(input);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsSubmitting(true);
      const savedCard = mode === "create" ? await createCard(input) : await updateCard(card!.id, input);

      router.push(mode === "create" ? `/v/${savedCard.slug}` : "/cards");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось сохранить визитку");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        {error ? (
          <div className="rounded-md border border-coral/25 bg-coral/10 px-4 py-3 text-sm font-medium text-ink">
            {error}
          </div>
        ) : null}

        <section className="surface p-5">
          <div className="mb-5">
            <h2 className="text-xl font-black tracking-tight">Данные визитки</h2>
            <p className="mt-1 text-sm text-ink/60">Заполните основную информацию для публичной страницы</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Публичный адрес"
              name="slug"
              pattern="[a-z0-9-]+"
              placeholder="anna-smirnova"
              required
              title="Используйте латиницу, цифры и дефис"
              value={form.slug}
              onChange={(value) => setForm((current) => ({ ...current, slug: normalizeSlug(value) }))}
            />
            <TextField
              label="Имя и фамилия"
              name="fullName"
              placeholder="Анна Смирнова"
              required
              value={form.fullName}
              onChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
            />
            <TextField
              label="Должность"
              name="jobTitle"
              placeholder="Продуктовый дизайнер"
              value={form.jobTitle}
              onChange={(value) => setForm((current) => ({ ...current, jobTitle: value }))}
            />
            <TextField
              label="Компания"
              name="company"
              placeholder="Studio One"
              value={form.company}
              onChange={(value) => setForm((current) => ({ ...current, company: value }))}
            />
            <TextField
              label="Почта"
              name="email"
              placeholder="anna@example.com"
              type="email"
              value={form.email}
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            />
            <TextField
              label="Телефон"
              name="phone"
              placeholder="+7 999 123-45-67"
              value={form.phone}
              onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
            />
            <TextField
              label="Сайт"
              name="website"
              placeholder="https://example.com"
              type="url"
              value={form.website}
              onChange={(value) => setForm((current) => ({ ...current, website: value }))}
            />
            <TextField
              label="Город"
              name="location"
              placeholder="Москва"
              value={form.location}
              onChange={(value) => setForm((current) => ({ ...current, location: value }))}
            />
            <TextField
              label="Ссылка на фото"
              name="avatarUrl"
              placeholder="https://example.com/photo.jpg"
              type="url"
              value={form.avatarUrl}
              onChange={(value) => setForm((current) => ({ ...current, avatarUrl: value }))}
              wrapperClassName="md:col-span-2"
            />
            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink/75">Короткое описание</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                placeholder="Коротко расскажите, чем вы занимаетесь"
                rows={4}
                className="field-area"
              />
            </label>
          </div>
        </section>

        <section className="surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight">Соцсети</h2>
              <p className="mt-1 text-sm text-ink/60">Добавьте ссылки, которые будут видны на визитке</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  socialLinks: [...current.socialLinks, { platform: "", url: "", label: "" }]
                }))
              }
              className="btn-secondary"
            >
              <Plus size={17} />
              Добавить ссылку
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {form.socialLinks.map((link, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-md bg-ink/[0.03] p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)]"
              >
                <TextField
                  label="Платформа"
                  name={`platform-${index}`}
                  placeholder="Telegram"
                  value={link.platform}
                  onChange={(value) => updateSocialLink(index, "platform", value)}
                />
                <TextField
                  label="Подпись"
                  name={`label-${index}`}
                  placeholder="Написать"
                  value={link.label ?? ""}
                  onChange={(value) => updateSocialLink(index, "label", value)}
                />
                <TextField
                  label="Ссылка"
                  name={`url-${index}`}
                  placeholder="https://t.me/username"
                  type="url"
                  value={link.url}
                  onChange={(value) => updateSocialLink(index, "url", value)}
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="btn-danger w-full lg:col-span-3 lg:ml-auto lg:w-auto"
                >
                  <Trash2 size={17} />
                  Убрать
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/55">
            Публичная ссылка: <span className="font-semibold text-ink">/v/{previewSlug}</span>
          </p>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
            {isSubmitting ? "Сохраняем..." : mode === "create" ? "Создать визитку" : "Сохранить изменения"}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <LivePreview form={form} previewSlug={previewSlug} />
      </aside>
    </form>
  );

  function updateSocialLink(index: number, field: keyof SocialLinkInput, value: string) {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link
      )
    }));
  }

  function removeSocialLink(index: number) {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter((_, linkIndex) => linkIndex !== index)
    }));
  }
}

function LivePreview({ form, previewSlug }: { form: FormState; previewSlug: string }) {
  const name = form.fullName.trim() || "Имя Фамилия";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const role = [form.jobTitle, form.company].filter((value) => value.trim() !== "").join(", ");
  const links = form.socialLinks.filter((link) => link.platform.trim() !== "" || (link.label ?? "").trim() !== "");

  return (
    <div className="surface overflow-hidden">
      <div className="bg-ink p-6 text-white">
        <p className="text-sm text-white/60">Живой предпросмотр</p>
        <div className="mt-8 grid h-20 w-20 place-items-center rounded-lg bg-mint text-2xl font-black text-ink">
          {initials || "В"}
        </div>
        <h2 className="mt-8 text-3xl font-black tracking-tight">{name}</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">{role || "Должность и компания"}</p>
      </div>
      <div className="space-y-5 p-5">
        <p className="text-sm leading-6 text-ink/70">
          {form.bio.trim() || "Короткое описание появится здесь сразу после ввода"}
        </p>
        <div className="grid gap-2 text-sm">
          {form.email ? <PreviewLine label="Почта" value={form.email} /> : null}
          {form.phone ? <PreviewLine label="Телефон" value={form.phone} /> : null}
          {form.website ? <PreviewLine label="Сайт" value={form.website} /> : null}
          {form.location ? <PreviewLine label="Город" value={form.location} /> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {links.length > 0 ? (
            links.map((link, index) => (
              <span key={index} className="rounded-md bg-ink/[0.06] px-3 py-2 text-xs font-semibold text-ink/70">
                {link.label || link.platform}
              </span>
            ))
          ) : (
            <span className="rounded-md bg-ink/[0.04] px-3 py-2 text-xs font-semibold text-ink/45">Соцсети</span>
          )}
        </div>
        <p className="break-all rounded-md bg-mint/20 p-3 text-xs font-semibold text-ink/70">/v/{previewSlug}</p>
      </div>
    </div>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink/10 bg-white/60 p-3">
      <p className="text-xs font-bold uppercase tracking-widest text-ink/40">{label}</p>
      <p className="mt-1 break-words font-semibold text-ink">{value}</p>
    </div>
  );
}

function TextField({
  label,
  name,
  onChange,
  pattern,
  placeholder,
  required = false,
  title,
  type = "text",
  value,
  wrapperClassName
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  pattern?: string;
  placeholder?: string;
  required?: boolean;
  title?: string;
  type?: string;
  value: string;
  wrapperClassName?: string;
}) {
  return (
    <label className={`grid gap-2 ${wrapperClassName ?? ""}`}>
      <span className="text-sm font-semibold text-ink/75">
        {label}
        {required ? <span className="text-coral" aria-hidden="true"> *</span> : null}
      </span>
      <input
        aria-label={label}
        name={name}
        pattern={pattern}
        placeholder={placeholder}
        required={required}
        title={title}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      />
    </label>
  );
}

function toFormState(card?: BusinessCard): FormState {
  if (!card) {
    return emptyState;
  }

  return {
    slug: card.slug,
    fullName: card.fullName,
    jobTitle: card.jobTitle ?? "",
    company: card.company ?? "",
    bio: card.bio ?? "",
    email: card.email ?? "",
    phone: card.phone ?? "",
    website: card.website ?? "",
    location: card.location ?? "",
    avatarUrl: card.avatarUrl ?? "",
    socialLinks:
      card.socialLinks.length > 0
        ? card.socialLinks.map((link) => ({
            platform: link.platform,
            url: link.url,
            label: link.label ?? ""
          }))
        : emptyState.socialLinks
  };
}

function toPayload(form: FormState): BusinessCardInput {
  return {
    slug: cleanSlug(form.slug),
    fullName: form.fullName.trim(),
    jobTitle: nullIfEmpty(form.jobTitle),
    company: nullIfEmpty(form.company),
    bio: nullIfEmpty(form.bio),
    email: nullIfEmpty(form.email),
    phone: nullIfEmpty(form.phone),
    website: nullIfEmpty(form.website),
    location: nullIfEmpty(form.location),
    avatarUrl: nullIfEmpty(form.avatarUrl),
    socialLinks: form.socialLinks
      // Ignore the placeholder row until the user starts filling at least one field.
      .filter((link) => link.platform.trim() !== "" || link.url.trim() !== "" || (link.label ?? "").trim() !== "")
      .map((link) => ({
        platform: link.platform.trim(),
        url: link.url.trim(),
        label: nullIfEmpty(link.label ?? "")
      }))
  };
}

function nullIfEmpty(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeSlug(value: string) {
  // Keep the draft URL readable while the user types; final validation is stricter.
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/g, "");
}

function cleanSlug(value: string) {
  return normalizeSlug(value).replace(/-+$/g, "");
}

function validatePayload(input: BusinessCardInput) {
  if (!input.slug) {
    return "Укажите публичный адрес";
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    return "Публичный адрес может содержать только латиницу, цифры и дефис";
  }
  if (!input.fullName) {
    return "Укажите имя и фамилию";
  }
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return "Укажите корректную почту";
  }
  for (const [index, link] of (input.socialLinks ?? []).entries()) {
    if (!link.platform || !link.url) {
      return `Соцсеть ${index + 1}: заполните платформу и ссылку`;
    }
  }

  const urlFields: [string, string | null | undefined][] = [
    ["Сайт", input.website],
    ["Ссылка на фото", input.avatarUrl],
    // Social links are dynamic, so include their index in the validation label.
    ...((input.socialLinks ?? []).map((link, index) => [`Ссылка соцсети ${index + 1}`, link.url]) as [
      string,
      string
    ][])
  ];

  for (const [label, value] of urlFields) {
    if (value && !isValidHttpUrl(value)) {
      return `${label}: укажите корректный URL с http:// или https://`;
    }
  }

  return null;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
