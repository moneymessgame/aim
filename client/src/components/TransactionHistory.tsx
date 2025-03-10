'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { SONIC_TOKEN_ADDRESS } from '../lib/config';
import {
	useSonicTokenContract,
	formatTokenAmount,
} from '../lib/utils/contract';
import { sonicBlazeChain } from '../lib/config';

type Transaction = {
	hash: string;
	blockNumber: number;
	timestamp: number;
	from: string;
	to: string;
	value: string;
	event: 'transfer' | 'mint';
};

export default function TransactionHistory() {
	const { address } = useAccount();
	const { getSonicTokenContract } = useSonicTokenContract();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [decimals, setDecimals] = useState(18);

	// Флаг для отслеживания запущенных запросов
	const [isLoadingInProgress, setIsLoadingInProgress] = useState(false);
	// Флаг для отслеживания, были ли когда-либо загружены транзакции
	const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

	// Мемоизируем функцию загрузки истории транзакций
	const fetchTransactionHistory = useCallback(async () => {
		if (!address) return;

		// Проверяем, чтобы не запускать повторные запросы
		if (isLoadingInProgress) return;

		// Устанавливаем флаг, что загрузка в процессе
		setIsLoadingInProgress(true);
		// Показываем загрузку только при первой попытке
		if (!hasAttemptedLoad) {
			setLoading(true);
		}
		setError(null);

		try {
			const { contract, provider } = await getSonicTokenContract();

			// Получаем десятичные знаки
			const tokenDecimals = await contract.decimals();
			setDecimals(tokenDecimals);

			// В ethers.js v6 изменились методы работы с событиями
			// Для предотвращения ошибки таймаута, запрашиваем только последние 1000 блоков
			const currentBlock = await provider.getBlockNumber();
			// Используем ограниченный диапазон из последней 1000 блоков
			const fromBlock = Math.max(0, currentBlock - 1000);

			// Определяем фильтр события Transfer, который имеет подпись 'Transfer(address,address,uint256)'
			// Получаем события напрямую, без использования filters
			const transferEventSignature = 'Transfer(address,address,uint256)';
			const transferEventHash = ethers.id(transferEventSignature);

			// Получаем события конкретного контракта в ограниченном диапазоне блоков
			console.log(
				`Запрашиваем события с блока ${fromBlock} до ${currentBlock}`
			);

			// Используем текущий адрес контракта
			const logs = await provider.getLogs({
				address: SONIC_TOKEN_ADDRESS,
				topics: [transferEventHash],
				fromBlock: fromBlock,
				toBlock: currentBlock,
			});

			console.log(`Найдено ${logs.length} событий Transfer`);

			// Форматируем транзакции
			const txPromises = logs.map(async (log) => {
				const block = await provider.getBlock(log.blockNumber);

				// Декодируем данные события
				// В Transfer(address,address,uint256) первая тема (индекс 0) - это хеш сигнатуры события
				// Вторая тема (индекс 1) - это from адрес (первый индексированный параметр)
				// Третья тема (индекс 2) - это to адрес (второй индексированный параметр)
				// data содержит неиндексированные параметры (value)

				// Извлекаем адреса из topics, удаляя первые 12 байтов
				const from =
					log.topics && log.topics[1]
						? `0x${log.topics[1].slice(26)}`
						: '0x0000000000000000000000000000000000000000';

				const to =
					log.topics && log.topics[2]
						? `0x${log.topics[2].slice(26)}`
						: '0x0000000000000000000000000000000000000000';

				// Пытаемся декодировать значение из data
				let value = BigInt(0);
				if (log.data && log.data !== '0x') {
					value = BigInt(log.data);
				}

				// Проверяем, является ли это минтингом (from = 0x0)
				const isTransfer =
					from !== '0x0000000000000000000000000000000000000000';

				return {
					hash: log.transactionHash,
					blockNumber: log.blockNumber,
					timestamp: block?.timestamp || 0,
					from,
					to,
					value: formatTokenAmount(value, tokenDecimals),
					event: isTransfer ? ('transfer' as const) : ('mint' as const),
				};
			});

			const formattedTxs = await Promise.all(txPromises);

			// Сортируем по времени (сначала новые)
			formattedTxs.sort((a, b) => b.timestamp - a.timestamp);

			console.log(`Отформатировано ${formattedTxs.length} транзакций`);

			// Сохраняем отсортированные транзакции
			setTransactions(formattedTxs);
			// Отмечаем, что попытка загрузки была сделана
			setHasAttemptedLoad(true);
		} catch (err) {
			console.error('Ошибка при получении истории транзакций:', err);
			setError(
				'Не удалось загрузить историю транзакций. Попробуйте перезагрузить страницу.'
			);
		} finally {
			setLoading(false);
			setIsLoadingInProgress(false);
		}
	}, [address, error, getSonicTokenContract, loading, transactions]);

	// Используем useEffect только для начальной загрузки и при изменении адреса
	useEffect(() => {
		let mounted = true;

		// Загружаем данные только если компонент смонтирован и есть адрес
		if (address && mounted) {
			// Откладываем загрузку немного, чтобы избежать проблем с параллельными запросами
			const timer = setTimeout(() => {
				if (mounted) {
					fetchTransactionHistory();
				}
			}, 500);

			return () => {
				mounted = false;
				clearTimeout(timer);
			};
		}

		return () => {
			mounted = false;
		};
	}, [address, fetchTransactionHistory]);

	// Убрали автообновление, чтобы избежать смещения компонентов

	const formatAddress = (addr: string) => {
		return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
	};

	const getExplorerTxUrl = (txHash: string) => {
		const explorer = sonicBlazeChain.blockExplorers?.default?.url;
		return explorer ? `${explorer}/tx/${txHash}` : '#';
	};

	const getExplorerAddressUrl = (addr: string) => {
		const explorer = sonicBlazeChain.blockExplorers?.default?.url;
		return explorer ? `${explorer}/address/${addr}` : '#';
	};

	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp * 1000);
		return date.toLocaleString('ru-RU');
	};

	if (loading && !hasAttemptedLoad) {
		return (
			<div className="flex justify-center items-center py-10 font-montserrat">
				Загрузка истории транзакций...
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 font-montserrat">
				<h3 className="text-lg font-semibold mb-2">Ошибка</h3>
				<p>{error}</p>
			</div>
		);
	}

	// Показываем основной интерфейс даже если транзакций нет
	// но с соответствующим сообщением внутри

	return (
		<div className="font-montserrat">
			<h2 className="text-2xl font-semibold mb-6">История транзакций</h2>

			{/* Индикатор загрузки будет показан только при начальной загрузке */}

			{transactions.length === 0 && hasAttemptedLoad ? (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4 font-montserrat">
					<p>Транзакции не найдены за последний период.</p>
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Тип
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Хэш транзакции
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Время
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									От кого
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Кому
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Сумма
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{transactions.map((tx) => (
								<tr key={tx.hash} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												tx.event === 'mint'
													? 'bg-green-100 text-green-800'
													: 'bg-blue-100 text-blue-800'
											}`}
										>
											{tx.event === 'mint' ? 'Выпуск' : 'Перевод'}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<a
											href={getExplorerTxUrl(tx.hash)}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline"
										>
											{formatAddress(tx.hash)}
										</a>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{formatTimestamp(tx.timestamp)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<a
											href={getExplorerAddressUrl(tx.from)}
											target="_blank"
											rel="noopener noreferrer"
											className={`hover:underline ${
												address &&
												tx.from.toLowerCase() === address.toLowerCase()
													? 'font-medium text-green-600'
													: 'text-gray-900'
											}`}
										>
											{formatAddress(tx.from)}
										</a>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<a
											href={getExplorerAddressUrl(tx.to)}
											target="_blank"
											rel="noopener noreferrer"
											className={`hover:underline ${
												address && tx.to.toLowerCase() === address.toLowerCase()
													? 'font-medium text-green-600'
													: 'text-gray-900'
											}`}
										>
											{formatAddress(tx.to)}
										</a>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{tx.value}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
