import { FC, useEffect, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { fetchOrderByNumber } from '../../services/slices';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const orderDataFromRequest = useSelector(
    (state) => state.orderDetails.orderData
  );
  const feedOrders = useSelector((state) => state.feed.orders);
  const profileOrders = useSelector((state) => state.profileOrders.orders);
  const ingredients: TIngredient[] = useSelector(
    (state) => state.ingredients.items
  );

  const orderNumber = Number(number);
  const localOrder = useMemo(
    () =>
      [...feedOrders, ...profileOrders].find(
        (order) => order.number === orderNumber
      ),
    [feedOrders, profileOrders, orderNumber]
  );
  const orderData =
    localOrder ||
    (orderDataFromRequest?.number === orderNumber
      ? orderDataFromRequest
      : null);

  useEffect(() => {
    if (Number.isNaN(orderNumber)) return;
    if (localOrder) return;
    dispatch(fetchOrderByNumber(orderNumber));
  }, [dispatch, localOrder, orderNumber]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo || Number.isNaN(orderNumber)) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
