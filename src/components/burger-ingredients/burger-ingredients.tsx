import { useState, useRef, useEffect, useCallback, FC } from 'react';

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
  const bunsRef = useRef<HTMLUListElement>(null);
  const mainsRef = useRef<HTMLUListElement>(null);
  const saucesRef = useRef<HTMLUListElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateTabByScrollPosition = useCallback(() => {
    if (isManualTabChange.current || !contentRef.current) return;

    const containerTop = contentRef.current.getBoundingClientRect().top;
    const tabsPositions: Array<{ tab: TTabMode; distance: number }> = [];

    if (titleBunRef.current) {
      tabsPositions.push({
        tab: 'bun',
        distance: Math.abs(
          titleBunRef.current.getBoundingClientRect().top - containerTop
        )
      });
    }

    if (titleMainRef.current) {
      tabsPositions.push({
        tab: 'main',
        distance: Math.abs(
          titleMainRef.current.getBoundingClientRect().top - containerTop
        )
      });
    }

    if (titleSaucesRef.current) {
      tabsPositions.push({
        tab: 'sauce',
        distance: Math.abs(
          titleSaucesRef.current.getBoundingClientRect().top - containerTop
        )
      });
    }

    if (!tabsPositions.length) return;

    const nextTab = tabsPositions.sort((a, b) => a.distance - b.distance)[0]
      .tab;
    setCurrentTab((prevTab) => (prevTab === nextTab ? prevTab : nextTab));
  }, []);

  useEffect(() => {
    updateTabByScrollPosition();
  }, [buns.length, mains.length, sauces.length, updateTabByScrollPosition]);

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

  const onIngredientsScroll = () => {
    updateTabByScrollPosition();
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
      contentRef={contentRef}
      onScroll={onIngredientsScroll}
      onTabClick={onTabClick}
    />
  );
};
