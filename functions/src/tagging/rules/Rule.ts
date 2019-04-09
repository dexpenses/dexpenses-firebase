import { Condition } from '@dexmo/dexpenses-rule-conditions';

export interface Rule {
  condition: Condition;
  tags: string[];
}
/*
  phone?: string;
  address?: Address;
  timestamp?: Date;
  place?: GeocodingResult & PlaceDetailsResult; */
