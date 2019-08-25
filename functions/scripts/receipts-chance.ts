import {
  Receipt,
  placeTypeMappings,
  paymentMethods,
  PaymentMethod,
} from '@dexpenses/core';
import * as Chance from 'chance';
import { DateTime, Duration } from 'luxon';
import { LatLngLiteral } from '@google/maps';

export interface GeneratedReceipt {
  id: string;
  data: Receipt;
  tags: string[];
}
interface Mixin extends Chance.MixinDescriptor {
  timestampWithinLast(duration: Duration): Date;
  receiptTag(): string;
  customReceiptTag(): string;
  paymentMethod(): PaymentMethod;
  latLng(): LatLngLiteral;
  receipt(): GeneratedReceipt;
}

const chance = new Chance() as Chance.Chance & Mixin;
chance.mixin({
  timestampWithinLast(duration: Duration) {
    const min = DateTime.fromJSDate(new Date())
      .minus(duration)
      .toJSDate()
      .getTime();
    return new Date(chance.integer({ min, max: new Date().getTime() }));
  },
  receiptTag() {
    return chance.pickone([
      ...new Set(Object.values(placeTypeMappings).filter((t) => !!t)),
    ]);
  },
  customReceiptTag() {
    return chance.pickone([
      'custom',
      'tag',
      'melikey',
      'awesome',
      'justhadto',
      'moneyz',
      'iknow',
      'inevitable',
      'music',
      'dev',
      'hacking',
    ]);
  },
  paymentMethod() {
    return chance.pickone(paymentMethods);
  },
  latLng() {
    const [lat, lng] = chance
      .coordinates()
      .split(',')
      .map((s) => parseFloat(s.trim()));
    return { lat, lng };
  },
  receipt(opts: {
    withinLast: Duration;
  }): { id: string; data: Receipt; tags: string[] } {
    return {
      id: chance.guid(),
      data: {
        amount: {
          value: chance.floating({ min: 0, max: 200, fixed: 2 }),
          currency: 'EUR',
        },
        paymentMethod: chance.paymentMethod(),
        place: {
          geometry: {
            location: chance.latLng(),
          } as any,
        } as any,
        timestamp: chance.timestampWithinLast(opts.withinLast),
        header: chance.n(chance.word, 3),
      },
      tags: [
        chance.receiptTag(),
        ...chance.unique(
          chance.customReceiptTag,
          chance.pickone([0, 0, 0, 0, 0, 0, 1, 1, 2])
        ),
      ],
    };
  },
} as Mixin);

export default chance;
