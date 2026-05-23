"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteCard } from "@/lib/api";

type DeleteCardButtonProps = {
  cardId: string;
  cardName: string;
  compact?: boolean;
};

export function DeleteCardButton({ cardId, cardName, compact = false }: DeleteCardButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete() {
    const confirmed = window.confirm(`Удалить визитку «${cardName}»? Это действие нельзя отменить`);

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await deleteCard(cardId);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить визитку");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className={compact ? "btn-icon border-coral/25 text-coral hover:bg-coral/10 focus:ring-coral/15" : "btn-danger"}
        aria-label={compact ? `Удалить ${cardName}` : undefined}
        title={compact ? "Удалить" : undefined}
      >
        {compact ? <Trash2 size={17} /> : isDeleting ? "Удаляем..." : "Удалить"}
      </button>
      {error ? <p className="text-sm font-medium text-coral">{error}</p> : null}
    </div>
  );
}
