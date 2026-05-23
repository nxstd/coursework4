import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CardForm } from "@/components/card-form";
import { createCard } from "@/lib/api";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh
  })
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");

  return {
    ...actual,
    createCard: vi.fn(),
    updateCard: vi.fn()
  };
});

describe("CardForm", () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    vi.mocked(createCard).mockReset();
  });

  it("создаёт визитку и обновляет предпросмотр при вводе", async () => {
    vi.mocked(createCard).mockResolvedValue({
      id: "card-1",
      slug: "anna-smirnova",
      fullName: "Анна Смирнова",
      jobTitle: "Дизайнер",
      company: "Studio One",
      bio: null,
      email: null,
      phone: null,
      website: null,
      location: null,
      avatarUrl: null,
      socialLinks: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    });

    const user = userEvent.setup();
    render(<CardForm mode="create" />);

    await user.type(screen.getByLabelText("Публичный адрес"), "Anna Smirnova");
    await user.type(screen.getByLabelText("Имя и фамилия"), "Анна Смирнова");
    await user.type(screen.getByLabelText("Должность"), "Дизайнер");
    await user.type(screen.getByLabelText("Компания"), "Studio One");

    expect(screen.getAllByText("Анна Смирнова").length).toBeGreaterThan(0);
    expect(screen.getByText("Дизайнер, Studio One")).toBeInTheDocument();
    expect(screen.getAllByText("/v/anna-smirnova").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Создать визитку" }));

    await waitFor(() => {
      expect(createCard).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: "anna-smirnova",
          fullName: "Анна Смирнова",
          jobTitle: "Дизайнер",
          company: "Studio One"
        })
      );
    });
    expect(push).toHaveBeenCalledWith("/v/anna-smirnova");
    expect(refresh).toHaveBeenCalled();
  });

  it("показывает ошибку при некорректном URL", async () => {
    const user = userEvent.setup();
    render(<CardForm mode="create" />);

    await user.type(screen.getByLabelText("Публичный адрес"), "test-card");
    await user.type(screen.getByLabelText("Имя и фамилия"), "Тестовая Визитка");
    await user.type(screen.getByLabelText("Сайт"), "wrong-url");
    fireEvent.submit(screen.getByRole("button", { name: "Создать визитку" }).closest("form")!);

    expect(await screen.findByText("Сайт: укажите корректный URL с http:// или https://")).toBeInTheDocument();
    expect(createCard).not.toHaveBeenCalled();
  });
});
