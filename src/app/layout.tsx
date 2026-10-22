import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitStore | Produtos para academia",
  description: "Acesse sua conta FitStore e gerencie seu perfil de cliente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
