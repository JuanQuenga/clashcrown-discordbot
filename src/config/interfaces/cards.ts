import { IApiIconUrls } from './common';

/**
 * Interfaces for the cards api endpoint
 */
export interface IApiCards {
  items: IApiCard[];
}

export interface IApiCard {
  name: string;
  id: number;
  maxLevel: number;
  iconUrls: IApiIconUrls;
}
