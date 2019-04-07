import { Condition } from './Condition';

export interface Rule {
  condition: Condition;
  tags: string[];
}
/*
  time?: Time;
  phone?: string;
  paymentMethod?: string;
  date?: Date;
  amount?: { value: number; currency: string };
  address?: Address;
  timestamp?: Date;
  place?: GeocodingResult & PlaceDetailsResult; */
