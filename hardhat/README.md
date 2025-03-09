# Проект Hardhat для тестовой сети SonicBlaze

## Описание

Данный проект представляет собой настроенное окружение для разработки и деплоя смарт-контрактов в тестовой сети SonicBlaze с использованием Hardhat и TypeScript. Включает пример ERC20 токена и скрипт для его деплоя.

## Установка и настройка

### Предварительные требования

- Node.js (версия 16.x или выше)
- npm или yarn

### Установка зависимостей

```shell
npm install
```

### Настройка переменных окружения

1. Создайте файл `.env` в корне проекта
2. Заполните следующие переменные:

```
PRIVATE_KEY=ваш_приватный_ключ_без_0x
SONICBLAZE_TESTNET_URL=https://rpc-sonic-testnet.blastblockchain.com
SONICBLAZE_API_KEY=ваш_api_ключ_если_необходим
ETHERSCAN_API_KEY=ваш_ключ_etherscan_для_верификации
```

## Использование

### Компиляция контрактов

```shell
npx hardhat compile
```

### Запуск тестов

```shell
npx hardhat test
```

### Деплой токена в тестовую сеть SonicBlaze

```shell
npx hardhat run scripts/deploy.ts --network sonicblaze
```

### Запуск локальной ноды

```shell
npx hardhat node
```

### Верификация контракта

```shell
npx hardhat verify --network sonicblaze АДРЕС_КОНТРАКТА ИМЯ_ТОКЕНА СИМВОЛ_ТОКЕНА НАЧАЛЬНОЕ_КОЛИЧЕСТВО АДРЕС_ВЛАДЕЛЬЦА
```

## Структура проекта

- `/contracts` - Смарт-контракты Solidity
- `/scripts` - Скрипты для деплоя и взаимодействия с контрактами
- `/test` - Тесты для контрактов

## Контракт SonicToken

Проект включает пример ERC20 токена с функцией минтинга, доступной только владельцу контракта. Контракт использует библиотеки OpenZeppelin для обеспечения безопасности и стандартных функций.

## Тестовая сеть SonicBlaze

SonicBlaze - тестовая сеть от Blast blockchain:
- Chain ID: 1632
- Валюта: BFT (Blast Test Token)
- Обозреватель: https://sonic-testnet.blastscan.io
- RPC URL: https://rpc-sonic-testnet.blastblockchain.com

## Дополнительные команды

```shell
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
```
