import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CardsPage from "@/app/cards/page";
import { getCards, type BusinessCard } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn()
  })
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");

  return {
    ...actual,
    getCards: vi.fn()
  };
});

describe("CardsPage", () => {
  beforeEach(() => {
    vi.mocked(getCards).mockReset();
  });

  it("показывает пустое состояние списка", async () => {
    vi.mocked(getCards).mockResolvedValue([]);

    render(await CardsPage());

    expect(screen.getByRole("heading", { name: "Визитки" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Пока нет визиток" })).toBeInTheDocument();
    expect(screen.getByText(/Создайте первую цифровую визитку/)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Создать визитку" })).toHaveLength(2);
  });

  it("фильтрует визитки по поисковому запросу", async () => {
    vi.mocked(getCards).mockResolvedValue([
      makeCard({ id: "1", slug: "anna-smirnova", fullName: "Анна Смирнова", company: "Studio One" }),
      makeCard({ id: "2", slug: "ivan-petrov", fullName: "Иван Петров", jobTitle: "Разработчик" })
    ]);
    const user = userEvent.setup();

    render(await CardsPage());
    await user.type(screen.getByLabelText("Поиск визиток"), "studio");

    expect(screen.getByText("Анна Смирнова")).toBeInTheDocument();
    expect(screen.queryByText("Иван Петров")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сбросить" })).toBeInTheDocument();
  });

  it("дозагружает визитки по кнопке после первой порции", async () => {
    vi.mocked(getCards).mockResolvedValue([
      makeCard({ id: "1", slug: "anna-smirnova", fullName: "Анна Смирнова" }),
      makeCard({ id: "2", slug: "ivan-petrov", fullName: "Иван Петров" }),
      makeCard({ id: "3", slug: "olga-demo", fullName: "Ольга Демо" })
    ]);
    const user = userEvent.setup();

    render(await CardsPage());

    expect(screen.getByText("Анна Смирнова")).toBeInTheDocument();
    expect(screen.getByText("Иван Петров")).toBeInTheDocument();
    expect(screen.queryByText("Ольга Демо")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Загрузить ещё" }));

    expect(screen.getByText("Ольга Демо")).toBeInTheDocument();
  });
});

function makeCard(overrides: Partial<BusinessCard>): BusinessCard {
  return {
    id: "card-id",
    slug: "card-slug",
    fullName: "Имя Фамилия",
    jobTitle: null,
    company: null,
    bio: null,
    email: null,
    phone: null,
    website: null,
    location: null,
    avatarUrl: null,
    socialLinks: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides
  };
}
