import { useSelector } from '../../services/store';
import clsx from 'clsx';
import styles from './constructor-page.module.css';

import { BurgerIngredients } from '../../components';
import { BurgerConstructor } from '../../components';
import { Preloader } from '../../components/ui';
import { FC } from 'react';

export const ConstructorPage: FC = () => {
  const isIngredientsLoading = useSelector(
    (state) => state.ingredients.isLoading
  );

  if (isIngredientsLoading) {
    return <Preloader />;
  }

  return (
    <main className={styles.containerMain}>
      <h1
        className={clsx(
          styles.title,
          'text text_type_main-large mt-10 mb-5 pl-5'
        )}
      >
        Соберите бургер
      </h1>
      <div className={clsx(styles.main, 'pl-5 pr-5')}>
        <BurgerIngredients />
        <BurgerConstructor />
      </div>
    </main>
  );
};
