'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
	useSonicTokenContract,
	parseTokenAmount,
	formatTokenAmount,
} from '../lib/utils/contract';

export default function ContractInteractionForm() {
	const { address } = useAccount();
	const { getSonicTokenContract } = useSonicTokenContract();

	const [isOwner, setIsOwner] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [decimals, setDecimals] = useState(18);

	// Состояние для формы перевода
	const [transferForm, setTransferForm] = useState({
		recipient: '',
		amount: '',
	});

	// Состояние для формы минтинга (только для владельца)
	const [mintForm, setMintForm] = useState({
		recipient: '',
		amount: '',
	});

	useEffect(() => {
		const checkIfOwner = async () => {
			if (!address) return;

			try {
				const { contract } = await getSonicTokenContract();
				const ownerAddress = await contract.owner();
				setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());

				// Получаем количество десятичных знаков для токена
				const tokenDecimals = await contract.decimals();
				setDecimals(tokenDecimals);
			} catch (err) {
				console.error('Ошибка при проверке владельца контракта:', err);
			}
		};

		checkIfOwner();
	}, [address, getSonicTokenContract]);

	const handleTransfer = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!transferForm.recipient || !transferForm.amount) {
			setError('Пожалуйста, заполните все поля');
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const { contract } = await getSonicTokenContract();
			const amountToSend = parseTokenAmount(transferForm.amount, decimals);

			const tx = await contract.transfer(transferForm.recipient, amountToSend);
			await tx.wait();

			setSuccess(
				`Успешно отправлено ${transferForm.amount} токенов на адрес ${transferForm.recipient}`
			);
			setTransferForm({ recipient: '', amount: '' });
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			console.error('Ошибка при отправке токенов:', err);
			setError(err.message || 'Произошла ошибка при отправке токенов');
		} finally {
			setLoading(false);
		}
	};

	const handleMint = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!mintForm.recipient || !mintForm.amount) {
			setError('Пожалуйста, заполните все поля');
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const { contract } = await getSonicTokenContract();
			const amountToMint = parseTokenAmount(mintForm.amount, decimals);

			const tx = await contract.mint(mintForm.recipient, amountToMint);
			await tx.wait();

			setSuccess(
				`Успешно выпущено ${mintForm.amount} новых токенов на адрес ${mintForm.recipient}`
			);
			setMintForm({ recipient: '', amount: '' });
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			console.error('Ошибка при минтинге токенов:', err);

			if (err.message.includes('OwnableUnauthorizedAccount')) {
				setError(
					'У вас нет прав для выпуска новых токенов. Эта функция доступна только владельцу контракта.'
				);
			} else {
				setError(err.message || 'Произошла ошибка при выпуске новых токенов');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="font-montserrat">
			<h2 className="text-2xl font-semibold mb-6">
				Взаимодействие с контрактом
			</h2>

			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
					<p>{error}</p>
				</div>
			)}

			{success && (
				<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
					<p>{success}</p>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Форма для отправки токенов */}
				<div className="bg-gray-50 p-6 rounded-lg">
					<h3 className="text-xl font-semibold mb-4">Отправить токены</h3>
					<form onSubmit={handleTransfer}>
						<div className="mb-4">
							<label
								htmlFor="transfer-recipient"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Адрес получателя
							</label>
							<input
								id="transfer-recipient"
								type="text"
								value={transferForm.recipient}
								onChange={(e) =>
									setTransferForm({
										...transferForm,
										recipient: e.target.value,
									})
								}
								placeholder="0x..."
								className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								disabled={loading}
							/>
						</div>

						<div className="mb-4">
							<label
								htmlFor="transfer-amount"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Количество токенов
							</label>
							<input
								id="transfer-amount"
								type="text"
								value={transferForm.amount}
								onChange={(e) =>
									setTransferForm({ ...transferForm, amount: e.target.value })
								}
								placeholder="0.0"
								className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								disabled={loading}
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
						>
							{loading ? 'Отправка...' : 'Отправить токены'}
						</button>
					</form>
				</div>

				{/* Форма для минтинга токенов (только для владельца) */}
				{isOwner && (
					<div className="bg-gray-50 p-6 rounded-lg">
						<h3 className="text-xl font-semibold mb-4">
							Выпустить новые токены
						</h3>
						<form onSubmit={handleMint}>
							<div className="mb-4">
								<label
									htmlFor="mint-recipient"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Адрес получателя новых токенов
								</label>
								<input
									id="mint-recipient"
									type="text"
									value={mintForm.recipient}
									onChange={(e) =>
										setMintForm({ ...mintForm, recipient: e.target.value })
									}
									placeholder="0x..."
									className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									disabled={loading}
								/>
							</div>

							<div className="mb-4">
								<label
									htmlFor="mint-amount"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Количество токенов для выпуска
								</label>
								<input
									id="mint-amount"
									type="text"
									value={mintForm.amount}
									onChange={(e) =>
										setMintForm({ ...mintForm, amount: e.target.value })
									}
									placeholder="0.0"
									className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									disabled={loading}
								/>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
							>
								{loading ? 'Выпуск...' : 'Выпустить токены'}
							</button>
						</form>
					</div>
				)}

				{!isOwner && (
					<div className="bg-gray-50 p-6 rounded-lg">
						<h3 className="text-xl font-semibold mb-4">Выпуск новых токенов</h3>
						<p className="text-gray-600">
							Только владелец контракта может выпускать новые токены. Вы не
							являетесь владельцем контракта.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
