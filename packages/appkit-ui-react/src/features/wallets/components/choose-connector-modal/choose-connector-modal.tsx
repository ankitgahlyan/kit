/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';

import { Modal } from '../../../../components/modal';
import { ConnectorsList } from '../connectors-list';

export interface ChooseConnectorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChooseConnectorModal: FC<ChooseConnectorModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet">
            <ConnectorsList onConnectorSelect={onClose} />
        </Modal>
    );
};
