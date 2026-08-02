/**
 * Branded primitive types — give string IDs and lat/lng nominal typing
 * so that an EmergencyIncidentId can't be accidentally passed where a
 * SafeZoneId is expected. Cost is zero at runtime.
 */
declare const __brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type Uuid = Brand<string, "Uuid">;
export type Latitude = Brand<number, "Latitude">;
export type Longitude = Brand<number, "Longitude">;
export type Meters = Brand<number, "Meters">;
export type IsoTimestamp = Brand<string, "IsoTimestamp">;

export const asUuid = (v: string) => v as Uuid;
export const asLat = (v: number) => v as Latitude;
export const asLng = (v: number) => v as Longitude;
export const asMeters = (v: number) => v as Meters;
export const asIso = (v: string) => v as IsoTimestamp;

export interface GeoPoint {
  lat: Latitude;
  lng: Longitude;
  accuracy?: Meters;
}
