/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState } from 'react';
import type { FC, ComponentProps } from 'react';
import clsx from 'clsx';
import { middleEllipsis } from '@ton/appkit';

import styles from './connect-button.module.css';
import { Button } from '../../../../components/button';
import { useSelectedWallet } from '../../hooks/use-selected-wallet';
import { useConnectors } from '../../hooks/use-connectors';
import { useConnect } from '../../hooks/use-connect';
import { useDisconnect } from '../../hooks/use-disconnect';
import { TonIcon } from '../../../../components/ton-icon';
import { ChooseConnectorModal } from '../choose-connector-modal';

type ConnectButtonProps = Omit<ComponentProps<'button'>, 'onClick' | 'children'>;

export const ConnectButton: FC<ConnectButtonProps> = ({ className, ...props }) => {
    const [selectedWallet] = useSelectedWallet();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const connectors = useConnectors();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    const onClick = () => {
        if (selectedWallet) {
            // const connector = connectors.find((c) => c.id === selectedWallet.connectorId);
            const connector = connectors[0];

            if (!connector) {
                return;
            }

            disconnect({ connectorId: connector.id });
            return;
        }

        // if (connectors.length === 1 && connectors[0]) {
        //     connect({ connectorId: connectors[0].id });
        //     return;
        // }

        setIsModalOpen(true);
    };

    return (
        <>
            <Button className={clsx(styles.connectButton, className)} onClick={onClick} {...props}>
                <TonIcon size={14} />
                {selectedWallet ? middleEllipsis(selectedWallet.getAddress()) : 'Connect'}
            </Button>

            <ChooseConnectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};
