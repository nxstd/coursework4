import { redirect } from "next/navigation";
import { getCards } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const cards = await getCards();
  if (cards.length === 0) {
    redirect("/cards/new");
  }

  const card = cards[Math.floor(Math.random() * cards.length)];
  redirect(`/v/${card.slug}`);
}
