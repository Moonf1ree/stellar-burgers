import { FC } from 'react';

import styles from './profile-orders.module.css';
import clsx from 'clsx';

import { ProfileOrdersUIProps } from './type';
import { ProfileMenu, OrdersList } from '@components';

export const ProfileOrdersUI: FC<ProfileOrdersUIProps> = ({ orders }) => (
  <main className={styles.main}>
    <div className={clsx('mt-30 mr-15', styles.menu)}>
      <ProfileMenu />
    </div>
    <div className={clsx('mt-10', styles.orders)}>
      <OrdersList orders={orders} />
    </div>
  </main>
);
