/**
 * Geometry-related type definitions
 */

// TODO: Define proper geometry type
export interface HoldGeometry {
  thingId: string
  geometry: any
}

export interface HoldGeometryRequest {
  thingId: string
  geometry?: any
}