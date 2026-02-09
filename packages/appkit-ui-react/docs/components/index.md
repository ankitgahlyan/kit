# Components

`@ton/appkit-ui-react` provides a set of themed, ready-to-use UI components for building TON dApps.

## Wallet Connection

### `ConnectButton`

A button that triggers the wallet connection flow.

```tsx
import { ConnectButton } from '@ton/appkit-ui-react';

function Header() {
    return (
        <header>
            <ConnectButton />
        </header>
    );
}
```

### `ChooseConnectorModal`
A modal dialog that lists available wallet providers for the user to choose from.

### `ConnectorsList`
A standalone list of connectors, useful for custom connection UIs.

### `ConnectorItem`
Renders a single connector option with its icon and name.

## Asset Display

### `BalanceBadge`
Displays the TON balance with a currency icon. Useful for headers or wallet info sections.
```tsx
import { BalanceBadge } from '@ton/appkit-ui-react';

<BalanceBadge />
```

### `CurrencyItem`
Displays a single asset (TON or Jetton) with its icon, name, and balance.

### `NftItem`
Displays a single NFT with its image, name, and collection info.

## Transactions

### `Transaction`
A drop-in component that handles the entire transaction flow. See [transaction.md](./transaction.md) for detailed usage.

### `SendButton`
A generic send button that works with the Transaction context.

### `SendTonButton`
A specialized button for sending TON. Pre-configured for TON transfers.

### `SendJettonButton`
A specialized button for sending Jettons. Handles jetton-specific logic.

## Base Components

These are the building blocks of the AppKit design system. Use them to match the AppKit aesthetic in your custom components.

### `Button`
The themed button component used throughout the library.

### `Block`
A themed container/card component.

### `Modal`
The base modal component for dialogs and popups.

## Icons

### `TonIcon`
The TON crystal icon.

### `CircleIcon`
A generic circle icon wrapper.

### `CloseIcon`
An X/close icon for dismiss buttons.
