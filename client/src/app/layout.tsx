import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { WagmiContextProvider } from '../lib/wagmi-provider';
import AppLayout from '../components/layout/AppLayout';

import { cn } from '../lib/utils';
import { ThemeProvider } from '../components/theme-provider';
import { siteConfig } from '@/config/site';
import { Toaster } from '@/components/ui/sonner';
import { TranslationsProvider } from '@/components/translations-context';
import { Banner } from '@/components/banner';
import { ptSansNarrow } from '../lib/fonts';

const montserrat = Montserrat({
	variable: '--font-montserrat',
	subsets: ['cyrillic-ext'],
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'AIM',
	description: 'Создание и настройка агентов для ZerePy',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={cn(
					'min-h-dvh bg-background font-sans antialiased',
					montserrat.variable,
					ptSansNarrow.variable
				)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<TranslationsProvider>
						<WagmiContextProvider>
							<AppLayout>{children}</AppLayout>
						</WagmiContextProvider>
					</TranslationsProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
