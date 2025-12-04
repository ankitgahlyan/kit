/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useAuth } from '@ton/demo-core';
import { type FC, useState } from 'react';
import { useWallet } from '@ton/demo-core';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { NetworkSelectorSheet } from '../network-selector-sheet';

import { DataBlock } from '@/core/components/data-block';
import { ActiveTouchAction } from '@/core/components/active-touch-action';

export const WalletInfoSection: FC = () => {
    const { address, publicKey } = useWallet();
    const { network } = useAuth();
    const [isNetworkSelectorOpen, setIsNetworkSelectorOpen] = useState(false);

    const { theme } = useUnistyles();

    const networkLabel = network === 'mainnet' ? 'Mainnet' : 'Testnet';

    return (
        <DataBlock.Container>
            <DataBlock.Row>
                <DataBlock.Key>
                    <DataBlock.Text>Address</DataBlock.Text>
                </DataBlock.Key>
                <DataBlock.Value>
                    <DataBlock.Text>{address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'N/A'}</DataBlock.Text>
                </DataBlock.Value>
            </DataBlock.Row>

            <DataBlock.Row>
                <DataBlock.Key>
                    <DataBlock.Text>Public Key</DataBlock.Text>
                </DataBlock.Key>
                <DataBlock.Value>
                    <DataBlock.Text>
                        {publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-6)}` : 'N/A'}
                    </DataBlock.Text>
                </DataBlock.Value>
            </DataBlock.Row>

            <DataBlock.Row isLastRow>
                <DataBlock.Key>
                    <DataBlock.Text>Network</DataBlock.Text>
                </DataBlock.Key>

                <ActiveTouchAction onPress={() => setIsNetworkSelectorOpen(true)}>
                    <DataBlock.Value style={styles.networkSelector}>
                        <DataBlock.Text>{networkLabel}</DataBlock.Text>
                        <Ionicons name="chevron-down" size={14} color={theme.colors.text.secondary} />
                    </DataBlock.Value>
                </ActiveTouchAction>
            </DataBlock.Row>

            <NetworkSelectorSheet isOpen={isNetworkSelectorOpen} onClose={() => setIsNetworkSelectorOpen(false)} />
        </DataBlock.Container>
    );
};

const styles = StyleSheet.create(({ sizes }) => ({
    networkSelector: {
        alignItems: 'center',
        gap: sizes.space.horizontal / 4,
    },
}));
