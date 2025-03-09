import { ethers } from "hardhat";

async function main() {
  // Получаем аккаунт деплоера
  const [deployer] = await ethers.getSigners();
  console.log("Деплой с аккаунта:", deployer.address);

  // Получаем баланс деплоера
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Баланс аккаунта:", ethers.formatEther(balance));

  // Деплоим контракт SonicToken
  const tokenName = "Sonic Test Token";
  const tokenSymbol = "STT";
  const initialSupply = 1000000; // 1 миллион токенов

  const SonicToken = await ethers.getContractFactory("SonicToken");
  console.log("Деплой токена...");
  
  const token = await SonicToken.deploy(
    tokenName,
    tokenSymbol,
    initialSupply,
    deployer.address
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log(`Контракт SonicToken развернут по адресу: ${tokenAddress}`);
  console.log("Транзакция деплоя:", token.deploymentTransaction()?.hash);
}

// Запускаем функцию деплоя и обрабатываем ошибки
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
