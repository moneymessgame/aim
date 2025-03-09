import { ethers } from "hardhat";
import { SonicToken__factory } from "../typechain-types";

async function main() {
  console.log("Подключение к контракту SonicToken...");
  
  // Адрес контракта
  const tokenAddress = "0x6d4fe915d6a2523F295e73007D8c0538434080db";
  
  // Получение провайдера для выбранной сети
  const provider = ethers.provider;
  
  // Получение подписчика (первый аккаунт по умолчанию)
  const [signer] = await ethers.getSigners();
  
  // Подключение к контракту
  const tokenContract = SonicToken__factory.connect(tokenAddress, signer);
  
  console.log("\n------ Информация о контракте ------");
  
  // Получение основной информации о токене
  const name = await tokenContract.name();
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  const totalSupply = await tokenContract.totalSupply();
  const formattedSupply = ethers.formatUnits(totalSupply, await tokenContract.decimals());
  
  console.log(`Название: ${name}`);
  console.log(`Символ: ${symbol}`);
  console.log(`Десятичные разряды: ${decimals}`);
  console.log(`Общее предложение: ${formattedSupply} ${symbol}`);
  
  // Информация о балансе владельца
  const owner = await tokenContract.owner();
  const ownerBalance = await tokenContract.balanceOf(owner);
  const formattedBalance = ethers.formatUnits(ownerBalance, await tokenContract.decimals());
  
  console.log(`\nАдрес владельца: ${owner}`);
  console.log(`Баланс владельца: ${formattedBalance} ${symbol}`);
  
  // Баланс текущего аккаунта
  const currentAccount = signer.address;
  const currentBalance = await tokenContract.balanceOf(currentAccount);
  const formattedCurrentBalance = ethers.formatUnits(currentBalance, await tokenContract.decimals());
  
  console.log(`\nАдрес текущего аккаунта: ${currentAccount}`);
  console.log(`Баланс текущего аккаунта: ${formattedCurrentBalance} ${symbol}`);
  
  console.log("\n------ Доступные функции контракта ------");
  console.log("1. name() - Получение названия токена");
  console.log("2. symbol() - Получение символа токена");
  console.log("3. decimals() - Получение количества десятичных разрядов");
  console.log("4. totalSupply() - Получение общего предложения токенов");
  console.log("5. balanceOf(address) - Получение баланса указанного адреса");
  console.log("6. transfer(address to, uint256 amount) - Перевод токенов на указанный адрес");
  console.log("7. allowance(address owner, address spender) - Проверка разрешенной суммы для траты");
  console.log("8. approve(address spender, uint256 amount) - Разрешение на трату токенов");
  console.log("9. transferFrom(address from, address to, uint256 amount) - Перевод токенов от имени другого адреса");
  console.log("10. mint(address to, uint256 amount) - Выпуск новых токенов (только для владельца)");
  console.log("11. owner() - Получение адреса владельца контракта");
  console.log("12. renounceOwnership() - Отказ от владения контрактом (только для владельца)");
  console.log("13. transferOwnership(address newOwner) - Передача владения контрактом новому адресу (только для владельца)");
  
  console.log("\n------ Примеры использования функций ------");
  
  // Пример использования transfer
  console.log("\nПример вызова функции transfer:");
  console.log(`tokenContract.transfer("АДРЕС_ПОЛУЧАТЕЛЯ", ethers.parseUnits("10", ${decimals}))`);
  
  // Пример использования approve и transferFrom
  console.log("\nПример вызова функции approve:");
  console.log(`tokenContract.approve("АДРЕС_ДОВЕРЕННОГО_ЛИЦА", ethers.parseUnits("5", ${decimals}))`);
  console.log("\nПример вызова функции transferFrom (от имени доверенного лица):");
  console.log(`tokenContract.transferFrom("ВАШ_АДРЕС", "АДРЕС_ПОЛУЧАТЕЛЯ", ethers.parseUnits("5", ${decimals}))`);
  
  // Пример использования mint (только для владельца)
  console.log("\nПример вызова функции mint (только для владельца):");
  console.log(`tokenContract.mint("АДРЕС_ПОЛУЧАТЕЛЯ", ethers.parseUnits("1000", ${decimals}))`);
}

main().catch((error) => {
  console.error("Ошибка при взаимодействии с контрактом:", error);
  process.exitCode = 1;
});
