'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import {
	SONIC_TOKEN_ABI,
	useSonicTokenContract,
	formatTokenAmount,
} from '../lib/utils/contract';
import { SONIC_TOKEN_ADDRESS } from '../lib/config';

export default function ContractInfo() {
	const { address } = useAccount();
	const { getSonicTokenContract } = useSonicTokenContract();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [contractInfo, setContractInfo] = useState<{
		name: string;
		symbol: string;
		decimals: number;
		totalSupply: string;
		ownerAddress: string;
		isOwner: boolean;
		userBalance: string;
	} | null>(null);

	// Мемоизируем функцию запроса данных, чтобы она не пересоздавалась при каждом рендере
	const fetchContractInfo = useCallback(async () => {
		if (!address) return;

		// Проверка, если данные уже загружены, не обновляем состояние загрузки
		if (!loading && contractInfo !== null && !error) return;

		setLoading(true);
		setError(null);

		try {
			const { contract } = await getSonicTokenContract();

			const [name, symbol, decimals, totalSupply, ownerAddress, userBalance] =
				await Promise.all([
					contract.name(),
					contract.symbol(),
					contract.decimals(),
					contract.totalSupply(),
					contract.owner(),
					contract.balanceOf(address),
				]);

			// Проверяем, что компонент все еще смонтирован (не размонтирован)
			setContractInfo({
				name,
				symbol,
				decimals,
				totalSupply: formatTokenAmount(totalSupply, decimals),
				ownerAddress,
				isOwner: ownerAddress.toLowerCase() === address.toLowerCase(),
				userBalance: formatTokenAmount(userBalance, decimals),
			});
		} catch (err) {
			console.error('Ошибка при получении информации о контракте:', err);
			setError(
				'Не удалось загрузить информацию о контракте. Попробуйте перезагрузить страницу.'
			);
		} finally {
			setLoading(false);
		}
	}, [address, contractInfo, error, getSonicTokenContract, loading]);

	// Используем useEffect с минимальными зависимостями
	useEffect(() => {
		// Запрашиваем данные только при монтировании компонента или при изменении адреса
		if (address) {
			fetchContractInfo();
		}

		// Добавляем интервал для периодического обновления баланса (30 секунд)
		const intervalId = setInterval(() => {
			if (address) {
				// Обновляем только баланс, а не всю информацию о контракте
				updateUserBalance();
			}
		}, 30000);

		return () => clearInterval(intervalId);
	}, [address, fetchContractInfo]);

	// Функция обновления только баланса пользователя
	const updateUserBalance = useCallback(async () => {
		if (!address || !contractInfo) return;

		try {
			const { contract } = await getSonicTokenContract();
			const userBalance = await contract.balanceOf(address);

			// Обновляем только баланс, не трогая другие свойства
			setContractInfo((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					userBalance: formatTokenAmount(userBalance, prev.decimals),
				};
			});
		} catch (err) {
			console.error('Ошибка при обновлении баланса:', err);
		}
	}, [address, contractInfo, getSonicTokenContract]);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-10 font-montserrat">
				Загрузка информации о контракте...
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

	if (!contractInfo) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 font-montserrat">
				<p>Информация о контракте недоступна.</p>
			</div>
		);
	}

	return (
		<div className="font-montserrat">
			<h2 className="text-2xl font-semibold mb-6">Информация о токене</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<div>
						<h3 className="text-sm font-medium text-gray-500">
							Адрес контракта
						</h3>
						<p className="mt-1 break-all">{SONIC_TOKEN_ADDRESS}</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500">
							Название токена
						</h3>
						<p className="mt-1">{contractInfo.name}</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500">Символ</h3>
						<p className="mt-1">{contractInfo.symbol}</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500">
							Десятичные знаки
						</h3>
						<p className="mt-1">{contractInfo.decimals}</p>
					</div>
				</div>

				<div className="space-y-4">
					<div>
						<h3 className="text-sm font-medium text-gray-500">
							Общее предложение
						</h3>
						<p className="mt-1">
							{contractInfo.totalSupply} {contractInfo.symbol}
						</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500">
							Владелец контракта
						</h3>
						<p className="mt-1 break-all">{contractInfo.ownerAddress}</p>
						{contractInfo.isOwner && (
							<span className="inline-block mt-1 text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
								Вы являетесь владельцем контракта
							</span>
						)}
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500">Ваш баланс</h3>
						<p className="mt-1">
							{contractInfo.userBalance} {contractInfo.symbol}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
