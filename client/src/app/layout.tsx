import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Scale, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Цифровые визитки",
  description: "Создавайте и редактируйте цифровые визитки"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-7 2xl:max-w-[88rem]">
          <SiteHeader />
          <main className="flex-1 py-8 sm:py-12">{children}</main>
          <footer className="surface mt-8 grid gap-6 px-5 py-6 text-sm text-ink/65 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="inline-flex items-center gap-2 font-black text-ink">
                <ShieldCheck size={18} className="text-mint" />
                Цифровые визитки
              </p>
              <p className="mt-2 max-w-xl">Клиентская часть сервиса для создания и управления публичными визитками</p>
              <p className="mt-4">© 2026 Digital Card Platform</p>
            </div>
            <nav className="flex flex-wrap gap-2 md:justify-end" aria-label="Юридические ссылки">
              <Link href="#" className="btn-secondary px-3 py-2">
                <FileText size={15} />
                Политика конфиденциальности
              </Link>
              <Link href="#" className="btn-secondary px-3 py-2">
                <Scale size={15} />
                Пользовательское соглашение
              </Link>
              <Link href="#" className="btn-secondary px-3 py-2">
                <ShieldCheck size={15} />
                Обработка данных
              </Link>
            </nav>
          </footer>
        </div>
      </body>
    </html>
  );
}
