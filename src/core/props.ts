import { Effect, SubscriptionRef } from "effect";

export type RefProps<T extends object> = {
  [K in keyof T]: T[K] extends SubscriptionRef.SubscriptionRef<infer U>
    ? T[K]
    : T[K] extends undefined // Handle optional properties
    ? T[K] extends infer R // Distribute over union types for R
      ? R | SubscriptionRef.SubscriptionRef<R> | undefined
      : never
    : T[K] extends infer U
    ? U extends infer R
      ? R | SubscriptionRef.SubscriptionRef<R>
      : never
    : never;
};

export const ref = <T>(_: Effect.Adapter, value: T) =>
  _(SubscriptionRef.make(value));

export const update = <T>(
  ref: SubscriptionRef.SubscriptionRef<T>,
  updater: (value: T) => T
) => SubscriptionRef.update(ref, updater);
