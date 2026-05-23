import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PublicCard } from "@/components/public-card";
import { ApiRequestError, getCardBySlug } from "@/lib/api";

type PublicCardPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicCardPage({ params }: PublicCardPageProps) {
  const { slug } = await params;
  const card = await loadCard(slug);
  const publicUrl = await getPublicUrl(slug);
  const qrCodeSvg = await QRCode.toString(publicUrl, {
    color: {
      dark: "#101820",
      light: "#ffffff"
    },
    errorCorrectionLevel: "M",
    margin: 1,
    type: "svg",
    width: 224
  });

  return (
    <section className="space-y-8">
      <Link
        href="/cards"
        className="inline-flex w-fit items-center gap-2 rounded-md border border-ink/10 bg-white/75 px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-ink/25 hover:bg-white focus:outline-none focus:ring-4 focus:ring-mint/20"
      >
        <ArrowLeft size={16} />
        К списку
      </Link>
      <PublicCard card={card} publicUrl={publicUrl} qrCodeSvg={qrCodeSvg} />
    </section>
  );
}

export async function generateMetadata({ params }: PublicCardPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const card = await getCardBySlug(slug);
    const publicUrl = await getPublicUrl(slug);
    const title = `${card.fullName} | Цифровая визитка`;
    const role = [card.jobTitle, card.company].filter(Boolean).join(", ");
    const description =
      card.bio ??
      (role ? `${card.fullName}, ${role}` : null) ??
      `Откройте цифровую визитку ${card.fullName}`;

    return {
      title,
      description,
      alternates: {
        canonical: publicUrl
      },
      openGraph: {
        title,
        description,
        type: "profile",
        url: publicUrl
      },
      twitter: {
        card: "summary",
        title,
        description
      }
    };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return {
        title: "Визитка не найдена",
        description: "Эта цифровая визитка недоступна или была удалена"
      };
    }

    throw error;
  }
}

async function loadCard(slug: string) {
  try {
    return await getCardBySlug(slug);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

async function getPublicUrl(slug: string) {
  const headerStore = await headers();
  // Prefer forwarded headers so QR and metadata stay correct behind a reverse proxy.
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;

  return `${baseUrl.replace(/\/$/g, "")}/v/${slug}`;
}
