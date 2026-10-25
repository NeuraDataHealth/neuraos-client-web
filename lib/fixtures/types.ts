/**
 * A Firestore document with its id, the shape hooks return.
 * Move to lib/types.ts (shared, additive) when the hooks land.
 */
export type WithId<T> = T & { id: string };
