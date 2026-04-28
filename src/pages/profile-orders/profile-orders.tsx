import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchProfileOrders } from '../../services/slices';
import { Preloader } from '@ui';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.profileOrders.orders);
  const isLoading = useSelector((state) => state.profileOrders.isLoading);

  useEffect(() => {
    dispatch(fetchProfileOrders());
    const interval = setInterval(() => {
      dispatch(fetchProfileOrders());
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={orders} />;
};
