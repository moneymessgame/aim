'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import ContractInteractionForm from '../../components/ContractInteractionForm';
import ContractInfo from '../../components/ContractInfo';
import TransactionHistory from '../../components/TransactionHistory';

export default function ContractPage() {
	const { isConnected } = useAccount();
	const [activeTab, setActiveTab] = useState<'info' | 'interact' | 'history'>(
		'info'
	);

	// Используем useCallback, чтобы предотвратить ненужные перерисовки
	const handleTabChange = useCallback(
		(tab: 'info' | 'interact' | 'history') => {
			setActiveTab(tab);
		},
		[]
	);

	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bebas-neue">
					Управление контрактом Sonic Token
				</h1>
			</div>

			{!isConnected ? (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-sm">
					<h2 className="text-xl font-semibold mb-2 font-montserrat">
						Требуется подключение к кошельку
					</h2>
					<p className="text-gray-700 mb-4">
						Для взаимодействия с контрактом Sonic Token необходимо подключить
						кошелек MetaMask в верхней части страницы.
					</p>
				</div>
			) : (
				<>
					<div className="flex border-b border-gray-200 mb-6 font-montserrat">
						<button
							className={`px-4 py-2 border-b-2 ${
								activeTab === 'info'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
							onClick={() => handleTabChange('info')}
						>
							Информация о контракте
						</button>
						<button
							className={`px-4 py-2 border-b-2 ${
								activeTab === 'interact'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
							onClick={() => handleTabChange('interact')}
						>
							Взаимодействие
						</button>
						<button
							className={`px-4 py-2 border-b-2 ${
								activeTab === 'history'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
							onClick={() => handleTabChange('history')}
						>
							История транзакций
						</button>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						{activeTab === 'info' && <ContractInfo />}
						{activeTab === 'interact' && <ContractInteractionForm />}
						{activeTab === 'history' && <TransactionHistory />}
					</div>
				</>
			)}
		</div>
	);
}
