"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyLinkButtonProps = {
  url: string;
};

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onCopy}
        className="btn-primary w-full"
      >
        {status === "copied" ? <Check size={17} /> : <Copy size={17} />}
        {status === "copied" ? "Ссылка скопирована" : "Скопировать ссылку"}
      </button>
      {status === "error" ? <p className="text-xs font-medium text-coral">Не получилось скопировать, выделите ссылку вручную</p> : null}
    </div>
  );
}
