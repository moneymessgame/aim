import { expect } from "chai";
import { ethers } from "hardhat";
import { SonicToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SonicToken", function () {
  let sonicToken: SonicToken;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  const name = "Sonic Test Token";
  const symbol = "STT";
  const initialSupply = 1000000;

  beforeEach(async function () {
    // Получаем аккаунты для тестирования
    [owner, user] = await ethers.getSigners();

    // Деплоим контракт для каждого теста
    const SonicTokenFactory = await ethers.getContractFactory("SonicToken");
    sonicToken = await SonicTokenFactory.deploy(
      name,
      symbol, 
      initialSupply,
      owner.address
    ) as SonicToken;
  });

  describe("Deployment", function () {
    it("Должен установить правильное имя и символ", async function () {
      expect(await sonicToken.name()).to.equal(name);
      expect(await sonicToken.symbol()).to.equal(symbol);
    });

    it("Должен выдать все токены владельцу", async function () {
      const ownerBalance = await sonicToken.balanceOf(owner.address);
      // При деплое supply умножается на 10^18 (decimals)
      expect(ownerBalance).to.equal(ethers.parseEther(initialSupply.toString()));
    });

    it("Должен установить правильного владельца", async function () {
      expect(await sonicToken.owner()).to.equal(owner.address);
    });
  });

  describe("Транзакции", function () {
    it("Должен разрешать перевод токенов между аккаунтами", async function () {
      // Переводим 50 токенов от владельца пользователю
      const transferAmount = ethers.parseEther("50");
      await sonicToken.transfer(user.address, transferAmount);
      
      const userBalance = await sonicToken.balanceOf(user.address);
      expect(userBalance).to.equal(transferAmount);
    });

    it("Должен запрещать перевод при недостаточном балансе", async function () {
      const userTokenFromStart = await sonicToken.connect(user);
      const sendAmount = ethers.parseEther("1");
      // У пользователя нет токенов, транзакция должна быть отклонена
      await expect(
        userTokenFromStart.transfer(owner.address, sendAmount)
      ).to.be.reverted;
    });
  });

  describe("Минтинг", function () {
    it("Должен разрешать владельцу минтить токены", async function () {
      const mintAmount = ethers.parseEther("500");
      const initialOwnerBalance = await sonicToken.balanceOf(owner.address);
      
      await sonicToken.mint(user.address, mintAmount);
      
      // Проверяем, что токены были выпущены пользователю
      const userBalance = await sonicToken.balanceOf(user.address);
      expect(userBalance).to.equal(mintAmount);
      
      // Проверяем, что баланс владельца не изменился
      const finalOwnerBalance = await sonicToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance);
    });

    it("Должен запрещать не-владельцу минтить токены", async function () {
      const userToken = sonicToken.connect(user);
      const mintAmount = ethers.parseEther("500");
      
      // Пытаемся минтить от имени пользователя, должно быть отклонено
      await expect(
        userToken.mint(user.address, mintAmount)
      ).to.be.revertedWithCustomError(sonicToken, "OwnableUnauthorizedAccount");
    });
  });
});
