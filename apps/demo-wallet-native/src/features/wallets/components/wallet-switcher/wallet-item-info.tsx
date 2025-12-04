/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { SavedWallet } from '@ton/demo-core';
import { type FC } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/core/components/app-text';

interface WalletItemInfoProps {
    wallet: SavedWallet;
    formatAddress: (address: string) => string;
}

export const WalletItemInfo: FC<WalletItemInfoProps> = ({ wallet, formatAddress }) => {
    return (
        <View style={styles.container}>
            <AppText style={styles.name} textType="body1">
                {wallet.name}
            </AppText>

            <AppText style={styles.address} textType="caption1">
                {formatAddress(wallet.address)}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
    },
    name: {
        color: theme.colors.text.highlight,
    },
    address: {
        color: theme.colors.text.secondary,
        fontFamily: 'monospace',
    },
}));
