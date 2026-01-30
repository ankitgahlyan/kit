/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import clsx from 'clsx';

import { TonIcon } from '../../../../components/ton-icon';
import styles from './connector-item.module.css';

export interface ConnectorItemProps {
    name: string;
    iconUrl?: string; // Optional, can fallback to a default icon
    onClick: () => void;
    className?: string;
}

export const ConnectorItem: FC<ConnectorItemProps> = ({ name, iconUrl, onClick, className }) => {
    return (
        <div className={clsx(styles.item, className)} onClick={onClick} role="button" tabIndex={0}>
            {iconUrl ? (
                <img src={iconUrl} alt={name} className={styles.icon} />
            ) : (
                <div className={styles.icon}>
                    <TonIcon name="wallet" size={32} />
                </div>
            )}
            <span className={styles.name}>{name}</span>
        </div>
    );
};
