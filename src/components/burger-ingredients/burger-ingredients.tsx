import { useState, useRef, useEffect, FC } from 'react';
import { useInView } from 'react-intersection-observer';

import { TTabMode } from '@utils-types';
import { BurgerIngredientsUI } from '../ui/burger-ingredients';
import { useSelector } from '../../services/store';

export const BurgerIngredients: FC = () => {
  const ingredients = useSelector((state) => state.ingredients.items);
  const buns = ingredients.filter((item) => item.type === 'bun');
  const mains = ingredients.filter((item) => item.type === 'main');
  const sauces = ingredients.filter((item) => item.type === 'sauce');

  const [currentTab, setCurrentTab] = useState<TTabMode>('bun');
  const isManualTabChange = useRef(false);
  const manualTabTimer = useRef<number | null>(null);
  const titleBunRef = useRef<HTMLHeadingElement>(null);
  const titleMainRef = useRef<HTMLHeadingElement>(null);
  const titleSaucesRef = useRef<HTMLHeadingElement>(null);

  const [bunsRef, inViewBuns] = useInView({
    threshold: 0
  });

  const [mainsRef, inViewFilling] = useInView({
    threshold: 0
  });

  const [saucesRef, inViewSauces] = useInView({
    threshold: 0
  });

  useEffect(() => {
    if (isManualTabChange.current) return;

    // Приоритет "ниже по списку" нужен, чтобы tab не прилипал к bun,
    // пока верхняя секция частично видна.
    if (inViewSauces) {
      setCurrentTab('sauce');
    } else if (inViewFilling) {
      setCurrentTab('main');
    } else if (inViewBuns) {
      setCurrentTab('bun');
    }
  }, [inViewBuns, inViewFilling, inViewSauces]);

  useEffect(
    () => () => {
      if (manualTabTimer.current) {
        window.clearTimeout(manualTabTimer.current);
      }
    },
    []
  );

  const onTabClick = (tab: string) => {
    setCurrentTab(tab as TTabMode);
    isManualTabChange.current = true;

    if (manualTabTimer.current) {
      window.clearTimeout(manualTabTimer.current);
    }
    manualTabTimer.current = window.setTimeout(() => {
      isManualTabChange.current = false;
    }, 700);

    if (tab === 'bun')
      titleBunRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'main')
      titleMainRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'sauce')
      titleSaucesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <BurgerIngredientsUI
      currentTab={currentTab}
      buns={buns}
      mains={mains}
      sauces={sauces}
      titleBunRef={titleBunRef}
      titleMainRef={titleMainRef}
      titleSaucesRef={titleSaucesRef}
      bunsRef={bunsRef}
      mainsRef={mainsRef}
      saucesRef={saucesRef}
      onTabClick={onTabClick}
    />
  );
};
