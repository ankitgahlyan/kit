/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Event, Action } from '@ton/walletkit';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { type FC, memo } from 'react';
import type { ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ActiveTouchAction } from '@/core/components/active-touch-action';
import { AppText } from '@/core/components/app-text';
import { Block } from '@/core/components/block';
import { Column, Row } from '@/core/components/grid';
import { TextAmount } from '@/core/components/text-amount';

interface TransactionEventRowProps {
    event: Event;
    myAddress: string;
    onPress?: () => void;
    style?: ViewProps['style'];
}

export const TransactionEventRow: FC<TransactionEventRowProps> = memo(({ event, myAddress, onPress, style }) => {
    const { theme } = useUnistyles();

    const formatAddress = (addr: string): string => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
    };

    // Determine transaction type and details from the event
    const getTransactionDetails = () => {
        if (!event.actions || event.actions.length === 0) {
            return {
                type: 'unknown' as const,
                amount: '0',
                address: '',
                description: 'Unknown transaction',
            };
        }

        // Find the most relevant action
        const relevantAction =
            event.actions.find((a: Action) =>
                a.simplePreview?.accounts?.some((acc) => acc.address === myAddress),
            ) || event.actions[0];

        // Determine transaction type based on action
        const actionType = relevantAction.type;
        let type: 'send' | 'receive' | 'unknown' = 'unknown';
        let amount = '0';
        let address = '';
        let description = relevantAction.simplePreview?.description || 'Transaction';

        // Handle TonTransfer action
        if (actionType === 'TonTransfer') {
            const tonTransfer = relevantAction as any;
            amount = tonTransfer.tonTransfer?.amount || '0';
            
            const sender = tonTransfer.tonTransfer?.sender?.address;
            const recipient = tonTransfer.tonTransfer?.recipient?.address;

            if (sender === myAddress) {
                type = 'send';
                address = recipient || '';
            } else if (recipient === myAddress) {
                type = 'receive';
                address = sender || '';
            }
        }

        // Handle JettonTransfer action
        if (actionType === 'JettonTransfer') {
            const jettonTransfer = relevantAction as any;
            amount = jettonTransfer.jettonTransfer?.amount || '0';
            
            const sender = jettonTransfer.jettonTransfer?.sender?.address;
            const recipient = jettonTransfer.jettonTransfer?.recipient?.address;

            if (sender === myAddress) {
                type = 'send';
                address = recipient || '';
            } else if (recipient === myAddress) {
                type = 'receive';
                address = sender || '';
            }
        }

        return { type, amount, address, description };
    };

    const { type, amount, address, description } = getTransactionDetails();
    const isSend = type === 'send';
    const isReceive = type === 'receive';

    const iconName = isSend ? 'arrow-up-outline' : isReceive ? 'arrow-down-outline' : 'swap-horizontal-outline';
    const iconColor = theme.colors.text.secondary;

    return (
        <ActiveTouchAction disabled={!onPress} onPress={onPress} scaling={0.98}>
            <Block style={[styles.container, style]}>
                <Row style={styles.leftSide}>
                    <Ionicons color={iconColor} name={iconName} size={24} style={styles.icon} />

                    <Column style={styles.typeColumn}>
                        <AppText style={styles.title} textType="body1">
                            {description}
                        </AppText>

                        <AppText textType="caption2">{dayjs(event.timestamp * 1000).format('DD MMM, HH:mm')}</AppText>
                    </Column>
                </Row>

                <Column style={styles.rightSide}>
                    {address && (
                        <AppText style={styles.address} textType="caption2">
                            {formatAddress(address)}
                        </AppText>
                    )}

                    {amount !== '0' && (
                        <AppText numberOfLines={1} style={styles.balances}>
                            {isSend && (
                                <AppText style={styles.sign} textType="body1">
                                    -
                                </AppText>
                            )}
                            {isReceive && (
                                <AppText style={styles.sign} textType="body1">
                                    +
                                </AppText>
                            )}
                            <TextAmount
                                amount={amount}
                                decimals={9}
                                style={styles.cryptoBalance}
                                textType="body1"
                                tokenCode="TON"
                            />
                        </AppText>
                    )}
                </Column>
            </Block>
        </ActiveTouchAction>
    );
});

TransactionEventRow.displayName = 'TransactionEventRow';

const styles = StyleSheet.create(({ colors }) => ({
    container: {
        minHeight: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        paddingVertical: 10,
    },
    leftSide: {
        flex: 1,
        maxWidth: '60%',
        marginRight: 6,
        alignItems: 'center',
    },
    typeColumn: {
        flex: 1,
    },
    rightSide: {
        flex: 1,
        maxWidth: '40%',
        alignItems: 'flex-end',
    },
    icon: {
        marginRight: 10,
    },
    title: {
        color: colors.text.highlight,
        marginBottom: 2,
    },
    address: {
        color: colors.text.secondary,
        textAlign: 'right',
        marginBottom: 2,
    },
    balances: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        textAlign: 'right',
    },
    cryptoBalance: {
        color: colors.text.highlight,
        textAlign: 'right',
    },
    sign: {
        color: colors.text.highlight,
        textAlign: 'right',
    },
}));
