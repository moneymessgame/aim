import type { Metadata } from "next";
import { Bebas_Neue, Montserrat } from "next/font/google";
import "./globals.css";
import { WagmiContextProvider } from "../lib/wagmi-provider";
import AppLayout from "../components/layout/AppLayout";

const bebasNeue = Bebas_Neue({
  weight: '400',
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: 'swap',
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ZerePy Agent Creator",
  description: "Создание и настройка агентов для ZerePy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${bebasNeue.variable} ${montserrat.variable} antialiased`}
      >
        <WagmiContextProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </WagmiContextProvider>
      </body>
    </html>
  );
}
