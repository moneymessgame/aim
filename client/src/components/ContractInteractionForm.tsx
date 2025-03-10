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

	// State for transfer form
	const [transferForm, setTransferForm] = useState({
		recipient: '',
		amount: '',
	});

	// State for minting form (owner only)
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

				// Get the number of decimal places for the token
				const tokenDecimals = await contract.decimals();
				setDecimals(tokenDecimals);
			} catch (err) {
				console.error('Error checking contract owner:', err);
			}
		};

		checkIfOwner();
	}, [address, getSonicTokenContract]);

	const handleTransfer = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!transferForm.recipient || !transferForm.amount) {
			setError('Please fill in all fields');
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
				`Successfully sent ${transferForm.amount} tokens to address ${transferForm.recipient}`
			);
			setTransferForm({ recipient: '', amount: '' });
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			console.error('Error sending tokens:', err);
			setError(err.message || 'An error occurred while sending tokens');
		} finally {
			setLoading(false);
		}
	};

	const handleMint = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!mintForm.recipient || !mintForm.amount) {
			setError('Please fill in all fields');
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
				`Successfully minted ${mintForm.amount} new tokens to address ${mintForm.recipient}`
			);
			setMintForm({ recipient: '', amount: '' });
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			console.error('Error minting tokens:', err);

			if (err.message.includes('OwnableUnauthorizedAccount')) {
				setError(
					'You do not have permission to mint new tokens. This function is only available to the contract owner.'
				);
			} else {
				setError(err.message || 'An error occurred while minting new tokens');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="font-montserrat">
			<h2 className="text-2xl font-semibold mb-6">
				Contract Interaction
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
				{/* Form for sending tokens */}
				<div className="bg-gray-50 p-6 rounded-lg">
					<h3 className="text-xl font-semibold mb-4">Send Tokens</h3>
					<form onSubmit={handleTransfer}>
						<div className="mb-4">
							<label
								htmlFor="transfer-recipient"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Recipient Address
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
							{loading ? 'Sending...' : 'Send Tokens'}
						</button>
					</form>
				</div>

				{/* Form for minting tokens (owner only) */}
				{isOwner && (
					<div className="bg-gray-50 p-6 rounded-lg">
						<h3 className="text-xl font-semibold mb-4">
							Mint New Tokens
						</h3>
						<form onSubmit={handleMint}>
							<div className="mb-4">
								<label
									htmlFor="mint-recipient"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Recipient Address for New Tokens
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
									Amount of Tokens to Mint
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
								{loading ? 'Minting...' : 'Mint Tokens'}
							</button>
						</form>
					</div>
				)}

				{!isOwner && (
					<div className="bg-gray-50 p-6 rounded-lg">
						<h3 className="text-xl font-semibold mb-4">Mint New Tokens</h3>
						<p className="text-gray-600">
							Only the contract owner can mint new tokens. You are not
							the contract owner.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
