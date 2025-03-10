'use client';

import Link from 'next/link';
import { UserDropdown } from '../ui/user-dropdown';
import { useAccount } from 'wagmi';
import { usePathname } from 'next/navigation';
import AimLogo from '../ui/AimLogo';
import { LanguageSwitcher } from '../language-switcher';
import { ThemeSwitcher } from '../theme-switcher';

export default function Header() {
	const { isConnected } = useAccount();
	const pathname = usePathname(); // Получаем текущий путь

	return (
		<header className="bg-background border-b border-gray-200 py-3 sticky top-0 z-10 shadow-sm">
			<div className="container mx-auto px-4 flex justify-between items-center">
				<div className="flex items-center">
					<Link
						href="/"
						className="flex items-center transition mr-6 hover:opacity-80"
					>
						<AimLogo size="md" />
					</Link>

					{isConnected && (
						<nav className="hidden sm:flex space-x-1">
							<Link
								href="/"
								className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition ${
									pathname === '/'
										? 'text-blue-600 bg-slate-50'
										: 'text-gray-600 hover:text-blue-600'
								}`}
							>
								Home
							</Link>
							<Link
								href="/agent"
								className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition ${
									pathname === '/agent'
										? 'text-blue-600 bg-slate-50'
										: 'text-gray-600 hover:text-blue-600'
								}`}
							>
								Agent
							</Link>
							<Link
								href="/contract"
								className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition ${
									pathname === '/contract'
										? 'text-blue-600 bg-slate-50'
										: 'text-gray-600 hover:text-blue-600'
								}`}
							>
								Tokens
							</Link>
							<Link
								href="/api-test"
								className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition ${
									pathname === '/api-test'
										? 'text-blue-600 bg-slate-50'
										: 'text-gray-600 hover:text-blue-600'
								}`}
							>
								API Test
							</Link>
							<Link
								href="/createagent"
								className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition ${
									pathname === '/createagent'
										? 'text-blue-600 bg-slate-50'
										: 'text-gray-600 hover:text-blue-600'
								}`}
							>
								Create agent
							</Link>
							<Link
								href="/test"
								className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition ${
									pathname === '/test'
										? 'text-blue-600 bg-slate-50'
										: 'text-gray-600 hover:text-blue-600'
								}`}
							>
								Test
							</Link>
						</nav>
					)}
				</div>

				<div className="flex items-center">
					<UserDropdown />
				</div>
				<LanguageSwitcher />
				<ThemeSwitcher />
			</div>
		</header>
	);
}
