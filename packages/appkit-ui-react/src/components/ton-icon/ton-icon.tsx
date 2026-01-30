/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC, ComponentProps } from 'react';

export interface TonIconProps extends Omit<ComponentProps<'svg'>, 'width' | 'height'> {
    size?: number;
}

export const TonIcon: FC<TonIconProps> = ({ size = 16, ...props }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                d="M23.7861 0H4.58614C1.08614 0 -1.11386 3.8 0.586136 6.9L12.3861 27.4C13.1861 28.7 15.0861 28.7 15.8861 27.4L27.6861 6.9C29.4861 3.8 27.2861 0 23.7861 0ZM12.4861 21.2L9.88614 16.2L3.68614 5.1C3.28614 4.4 3.78614 3.5 4.68614 3.5H12.4861V21.2ZM24.6861 5.1L18.4861 16.2L15.8861 21.2V3.5H23.6861C24.5861 3.5 25.0861 4.4 24.6861 5.1Z"
                fill="currentColor"
            />
        </svg>
    );
};
