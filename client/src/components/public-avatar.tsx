"use client";

import Image from "next/image";
import { useState } from "react";

type PublicAvatarProps = {
  avatarUrl: string | null;
  initials: string;
};

export function PublicAvatar({ avatarUrl, initials }: PublicAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (!avatarUrl || failed) {
    return (
      <div className="grid h-28 w-28 place-items-center rounded-lg bg-mint text-4xl font-black text-ink shadow-sm">
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt=""
      width={112}
      height={112}
      unoptimized
      onError={() => setFailed(true)}
      className="h-28 w-28 rounded-lg border border-white/15 object-cover"
    />
  );
}
