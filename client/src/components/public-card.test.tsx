import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicCard } from "@/components/public-card";
import type { BusinessCard } from "@/lib/api";

const card: BusinessCard = {
  id: "card-1",
  slug: "anna-smirnova",
  fullName: "Анна Смирнова",
  jobTitle: "Дизайнер",
  company: "Studio One",
  bio: "Помогаю запускать аккуратные цифровые продукты.",
  email: "anna@example.com",
  phone: "+7 999 000-00-00",
  website: "https://anna.example.com",
  location: "Москва",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  socialLinks: [
    {
      id: "link-1",
      platform: "telegram",
      label: "Telegram",
      url: "https://t.me/anna",
      businessCardId: "card-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
  ]
};

describe("PublicCard", () => {
  it("показывает публичную визитку с контактами, соцссылкой и QR", () => {
    render(
      <PublicCard
        card={card}
        publicUrl="http://localhost:3000/v/anna-smirnova"
        qrCodeSvg="<svg role='img' aria-label='QR'></svg>"
      />
    );

    expect(screen.getByRole("heading", { name: "Анна Смирнова" })).toBeInTheDocument();
    expect(screen.getByText("Дизайнер, Studio One")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /anna@example.com/i })).toHaveAttribute("href", "mailto:anna@example.com");
    expect(screen.getByRole("link", { name: "Telegram" })).toHaveAttribute("href", "https://t.me/anna");
    expect(screen.getByLabelText("QR-код для http://localhost:3000/v/anna-smirnova")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Скопировать ссылку" })).toBeInTheDocument();
  });
});
