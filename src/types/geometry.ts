import z from 'zod'

/**
 * Geometry-related type definitions
 */

export const Point3D = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
}).strict()

export type Point3D = z.infer<typeof Point3D>

// TODO: Define proper geometry type
export interface HoldGeometry {
  thingId: string
  geometry: any
}

export interface HoldGeometryRequest {
  thingId: string
  geometry?: any
}