# AppKit UI React Hooks

`@ton/appkit-react` provides a React-friendly interface to AppKit, leveraging TanStack Query for data fetching.

## Core Hooks

### `useAppKit`
Returns the global AppKit instance. Useful when you need to call standalone actions directly.

### `useAppKitTheme`
Returns the current theme (`'light'` or `'dark'`) and a function to switch it.

### `useI18n`
Provides access to the internationalization context.

## Wallet & Connection

### `useConnect` / `useDisconnect`
Hooks to programmatically trigger the connection or disconnection flows.

### `useConnectors`
Returns a list of all available wallet connection providers (e.g., TonConnect).

### `useConnectedWallets`
A reactive hook that returns an array of all currently connected wallets.

### `useSelectedWallet`
Returns the currently "active" wallet that the user is interacting with.

## Asset Hooks

These hooks are reactive and will automatically update when the balance or asset list changes.

### `useBalance` / `useSelectedWalletBalance`
Fetch TON balance. `useSelectedWalletBalance` is a zero-config hook for the active wallet.

### `useJettons` / `useSelectedWalletJettons`
Fetch the list of Jettons. `useSelectedWalletJettons` handles the address logic for you.

### `useJettonInfo`
Fetches metadata (name, decimals) for a specific Jetton.

### `useNfts` / `useSelectedWalletNfts`
Fetch NFTs. `useSelectedWalletNfts` lists NFTs for the currently connected wallet.

## Transaction Hooks

Reactive hooks for performing operations with built-in loading and error states.

### `useSendTransaction`
The general-purpose hook for sending any transaction request.

### `useTransferTon` / `useTransferJetton` / `useTransferNft`
Convenience hooks for specific asset transfers.

## DeFi Hooks

### `useSwapQuote` / `useBuildSwapTransaction`
Hooks for integrating DEX swap functionality into your UI.

## Network Hooks

### `useNetworks`
Returns the list of configured networks (mainnet, testnet, custom).

### `useSelectedWalletNetwork`
Returns the network associated with the currently selected wallet.

## Signing Hooks

### `useSignText` / `useSignBinary` / `useSignCell`
Hooks for requesting digital signatures from the connected wallet.
