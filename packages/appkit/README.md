# TonAppKit

A dApp-side integration layer for TON Connect with a unified asset API for TON, Jettons, and NFTs

## Overview

- **Asset Operations** - Send TON, Jettons, and NFTs
- **React Integration** - Hooks for easy React/Next.js integration
- **Type Safety** - Full TypeScript support
- **TonConnect Integration** - Seamlessly work with TonConnect wallets

**Live Demo**: [AppKit Minter](https://github.com/ton-connect/kit/tree/main/apps/appkit-minter)

## Quick start

This guide shows how to integrate `@ton/appkit` into your dApp for asset operations with TonConnect wallets.

```bash
npm install @ton/appkit @tonconnect/sdk
```

## Initialize AppKit and wrap wallet

```ts
// Initialize AppKit
const appKit = new AppKit({
    networks: {
        [Network.mainnet().chainId]: {
            apiClient: {
                url: 'https://toncenter.com',
                key: 'your-key',
            },
        },
        // Optional: add testnet
        // [Network.testnet().chainId]: {
        //     apiClient: {
        //         url: 'https://testnet.toncenter.com',
        //         key: 'your-key',
        //     },
        // },
    },
    connectors: [
        new TonConnectConnector({
            tonConnectOptions: {
                manifestUrl: 'your-manifest-url',
            },
        }),
    ],
});
```

## Usage
 
### Get Balance
 
```ts
const balance = await getBalance(appKit);
if (balance) {
    console.log('Balance:', balance.toString());
}
```
 
### Transfer TON
 
```ts
const result = await transferTon(appKit, {
    recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    amount: '100000000', // 0.1 TON
    comment: 'Hello from AppKit!',
});

console.log('Transfer Result:', result);
```
 
> See all available actions in the [Actions Documentation](./docs/actions.md).
 
## React Integration
 
If you are using React, you can use `@ton/appkit-react` which provides hooks for all AppKit actions.
 
[Read more about AppKit React](https://github.com/ton-connect/kit/tree/main/packages/appkit-react/README.md)
 
## Documentation

- [Actions](./docs/actions.md) - Standardized blockchain actions
- [Connectors](./docs/connectors.md) - Wallet connection management (TonConnect)
- [Queries](./docs/query.md) - TanStack Query options for easy data fetching
- [Swap](./docs/swap.md) - Swap assets using DEX aggregators (Omniston)
