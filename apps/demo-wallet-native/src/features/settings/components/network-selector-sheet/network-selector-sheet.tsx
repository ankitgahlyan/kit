/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@ton/demo-core';
import type { FC } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ActiveTouchAction } from '@/core/components/active-touch-action';
import { AppBottomSheet } from '@/core/components/app-bottom-sheet';
import { AppText } from '@/core/components/app-text';

interface NetworkSelectorSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const NETWORKS = [
    { id: 'mainnet' as const, name: 'Mainnet', description: 'Production network' },
    { id: 'testnet' as const, name: 'Testnet', description: 'Test network for development' },
];

export const NetworkSelectorSheet: FC<NetworkSelectorSheetProps> = ({ isOpen, onClose }) => {
    const { network, setNetwork } = useAuth();
    const { theme } = useUnistyles();

    const handleSelectNetwork = async (selectedNetwork: 'mainnet' | 'testnet') => {
        if (selectedNetwork !== network) {
            await setNetwork(selectedNetwork);
        }
        onClose();
    };

    return (
        <AppBottomSheet isOpened={isOpen} onClose={onClose} snapPoints={['40%']} title="Select Network">
            <View style={styles.container}>
                {NETWORKS.map((net) => {
                    const isSelected = network === net.id;

                    return (
                        <ActiveTouchAction
                            key={net.id}
                            onPress={() => handleSelectNetwork(net.id)}
                            style={[styles.networkItem, isSelected && styles.selectedNetworkItem]}
                        >
                            <View style={styles.networkInfo}>
                                <View
                                    style={[
                                        styles.networkIcon,
                                        {
                                            backgroundColor: isSelected
                                                ? theme.colors.accent.primary
                                                : theme.colors.navigation.default,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        color={isSelected ? theme.colors.text.inverted : theme.colors.text.secondary}
                                        name="globe-outline"
                                        size={20}
                                    />
                                </View>

                                <View style={styles.networkDetails}>
                                    <AppText style={styles.networkName} textType="body1">
                                        {net.name}
                                    </AppText>
                                    <AppText style={styles.networkDescription} textType="caption1">
                                        {net.description}
                                    </AppText>
                                </View>
                            </View>

                            {isSelected && (
                                <Ionicons color={theme.colors.accent.primary} name="checkmark-circle" size={24} />
                            )}
                        </ActiveTouchAction>
                    );
                })}
            </View>
        </AppBottomSheet>
    );
};

const styles = StyleSheet.create(({ sizes, colors }) => ({
    container: {
        paddingTop: sizes.space.vertical,
        gap: sizes.space.vertical,
    },
    networkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: sizes.block.paddingVertical,
        paddingHorizontal: sizes.block.paddingHorizontal,
        borderRadius: sizes.borderRadius.md,
        backgroundColor: colors.background.block,
    },
    selectedNetworkItem: {
        backgroundColor: colors.accent.primary + '15',
    },
    networkInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.space.horizontal,
        flex: 1,
    },
    networkIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    networkDetails: {
        flex: 1,
    },
    networkName: {
        color: colors.text.highlight,
        marginBottom: 2,
    },
    networkDescription: {
        color: colors.text.secondary,
    },
}));
