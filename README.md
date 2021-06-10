# Robo Ape

A simple bot which will buy into every new BNB pair created on PancakeSwap. Built by a programmer for other programmers.

## Motivation

Every day, every hour, almost every minute there are new LPs (liquidity pool) created on [PancakeSwap](https://bscscan.com/txsInternal?a=0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73&p=1). Almost all of them (probably 99%) are rug pulls (meaning 100% loss), but the remaining 1% is worth it in the long run.

Open any newly created LP on PancakeSwap and you will see multiple transactions buying 0.002 BNB worth of tokens right away. This bot does the same thing - buys in as early as possible and later on sells in smalls portions (when profitable).

The idea is that given enough time, bot will build up enough good tokens to generate constant revenue. But to get there you will need to first burn through those rug pulls.

## Bot logic

- Listen for `PairCreated` events on PancakeSwap Factory contract.
- Optionally (`BSSCAN_CHECK`) see if Token's smart contract is verified and if source code contains known "bad words" which we don't want buying into (see `src/Services/BscScan.ts`).
- If pair (LP) is between BNB and any other token and BNB reserve is > 0 - buy in (`BUY_IN_AMOUNT`).
- Every 30 minutes check all pairs that were not already rug pulled and:
    - If less than 0.5% of initial BNB reserve is remaining and current position is not profitable - mark possition as `rug`.
    - Check if 20% (`AUTOSELL_PERCENTAGE`) of our tokens is more than 0.1 BNB (`AUTOSELL_MIN_PROFIT`) and if so - sell those 20%.
- Rinse & repeat.

Bot will stop buying into new positions if it's balance drops below 0.05 BNB (`MIN_BALANCE`).

## Requirements

- Node (developed and tested on v15.4.0)
- PostgreSQL (developed and tested ov v13.3)
- NPM

## Build & Install

Copy and edit `.env` file, install `npm` packages, `build`, `syncModels` to initiate DB.

```bash
cp .env.sample .env
npm install
npm run build
node build/syncModels.js
```

## Local development

If you need PostgreSQL you can spin it up quickly using Docker:

```bash
docker run --name roboape-db -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

Instead of `npm run build` you can use `npm run dev` to watch files for changes and compile on-the-fly.

## Usage

Don't forget to set your private key (`ACCOUNT_PK`), BscScan.com API KEY (`BSCSCAN_API_KEY`) (if `BSSCAN_CHECK=true`) and database credentials in `.env` file!

To run bot:
```bash
node build/app.js
```

To dump all profitable tokens:
```bash
node build/dumpAll.js
```

To dump single profitable token provide LP pair address:
```bash
node build/dumpAll.js --single 0xLpPairAddressHere
```

If you want to keep bot running in background, a very easy way is to use PM2 (`npm install -g pm2`):
```bash
pm2 start pm2.json
```

## Notes

- Bot supports, but does not account for deflation ("fee on token transfer" inside of token contract)
- Bot is optimised for PancakeSwap v2, but can be very easily adjusted to work with any other PancakeSwap (UniSwap) fork.
- No UI is provided, this is a console application.

## Warning

- This bot comes with no warranty - use at your own risk!
- Most of the trade will not be profitable! (see "Motivation" section)

## Examples

Several examples of profitable trades:
- https://bscscan.com/token/0x5f8ed6eaf2e26a63dddc9baa2bb0a9bf97e6ca13?a=0x3c1acf05c4dcc8ef94cf7ff48f64f5757aafb9db
- https://bscscan.com/token/0x7c0e2f47207ea0619aaf2381ce846dbae978b7ad?a=0x74ab14b94a1b98c8ac116310189e7f121eaea56a
- https://bscscan.com/token/0xac7d00ca9e5809584e78d11b68f6b9e9257c0d05?a=0x7c3270c1a6d91a77dce9354d47a36df1e9c5c258
- https://bscscan.com/token/0xba42fd16cee5e860c2ffc1a3ff1d37e1802bbffa?a=0x3c1acf05c4dcc8ef94cf7ff48f64f5757aafb9db
- https://bscscan.com/token/0xd06f0b5b04f3bc0062c69d73d98c5c9ccfebe9bb?a=0x3c1acf05c4dcc8ef94cf7ff48f64f5757aafb9db
- etc...
