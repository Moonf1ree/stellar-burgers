import { RefObject, UIEventHandler } from 'react';
import { TIngredient, TTabMode } from '@utils-types';

export type BurgerIngredientsUIProps = {
  currentTab: TTabMode;
  buns: TIngredient[];
  mains: TIngredient[];
  sauces: TIngredient[];
  titleBunRef: RefObject<HTMLHeadingElement>;
  titleMainRef: RefObject<HTMLHeadingElement>;
  titleSaucesRef: RefObject<HTMLHeadingElement>;
  bunsRef: RefObject<HTMLUListElement>;
  mainsRef: RefObject<HTMLUListElement>;
  saucesRef: RefObject<HTMLUListElement>;
  contentRef: RefObject<HTMLDivElement>;
  onScroll: UIEventHandler<HTMLDivElement>;
  onTabClick: (val: string) => void;
};
