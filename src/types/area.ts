import z from 'zod'
import { Point3D } from './geometry'

/**
 * Area-related type definitions
 */

export const AreaListArea = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  playerCount: z.number(),
}).strict()

export const AreaList = z.object({
  visited: z.array(AreaListArea).optional().default([]),
  created: z.array(AreaListArea).optional().default([]),
  totalOnline: z.number(),
  totalAreas: z.number(),
  totalPublicAreas: z.number(),
  totalSearchablePublicAreas: z.number(),
  popular: z.array(AreaListArea).optional().default([]),
  popular_rnd: z.array(AreaListArea).optional().default([]),
  newest: z.array(AreaListArea).optional().default([]),
  popularNew: z.array(AreaListArea).optional().default([]),
  popularNew_rnd: z.array(AreaListArea).optional().default([]),
  lively: z.array(AreaListArea).optional().default([]),
  favorite: z.array(AreaListArea).optional().default([]),
  mostFavorited: z.array(AreaListArea).optional().default([]),
  featured: z.array(AreaListArea).optional()
}).strict()

export const AreaSearchSchema = z.object({
  areas: z.array(AreaListArea),
  ownPrivateAreas: z.array(AreaListArea),
}).strict()

export const AreaInfoMetadataSchema = z.object({
  id: z.string(),
  editors: z.array(z.object({
    id: z.string(),
    name: z.string().nullable(),
    isOwner: z.boolean().optional().default(false)
  })),
  copiedFromAreas: z.array(z.object({
    id: z.string(),
    name: z.string()
  })).default([]),
  name: z.string(),
  description: z.string().nullable().optional(),
  urlName: z.string().optional(),
  creatorId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isZeroGravity: z.union([z.boolean(), z.number(), z.null()]).transform(val => Boolean(val)).default(false),
  hasFloatingDust: z.union([z.boolean(), z.number(), z.null()]).transform(val => Boolean(val)).default(false),
  isCopyable: z.union([z.boolean(), z.number(), z.null()]).transform(val => Boolean(val)).default(false),
  isExcluded: z.union([z.boolean(), z.number()]).transform(val => Boolean(val)).default(false),
  renameCount: z.number().default(0),
  copiedCount: z.number().default(0),
  isFavorited: z.union([z.boolean(), z.number()]).transform(val => Boolean(val)).default(false)
}).strict()

export type AreaInfoMetadata = z.infer<typeof AreaInfoMetadataSchema>

export const EditorSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  isOwner: z.boolean().optional()
}).strict()

export const AreaInfoSchema = z.object({
  editors: z.array(EditorSchema),
  listEditors: z.array(EditorSchema),
  copiedFromAreas: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      creatorId: z.string(),
    }).strict()),
  name: z.string(),
  description: z.string().optional(),
  creationDate: z.string().datetime(),
  totalVisitors: z.number(),
  parentAreaId: z.string().optional(),
  isZeroGravity: z.boolean().optional(),
  hasFloatingDust: z.boolean().optional(),
  isCopyable: z.boolean().optional(),
  onlyOwnerSetsLocks: z.boolean().optional(),
  isExcluded: z.boolean(),
  renameCount: z.number(),
  copiedCount: z.number(),
  isFavorited: z.boolean()
}).strict()

export const SubareaListSchema = z.object({
  subAreas: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      id: z.string(),
    }).strict()
  )
}).strict()

export const AreaBundleSchema = z.object({
  thingDefinitions: z.array(
    z.object({
      id: z.string(),
      def: z.string(),
    }).strict()
  ),
  serveTime: z.number(),
}).strict()

export const AreaLoadSchema = z.union([
  z.object({
    ok: z.literal(false),
    _reasonDenied: z.string(),
    serveTime: z.number(),
  }).strict(),
  z.object({
    ok: z.literal(true),

    areaId: z.string(),
    areaName: z.string(),
    areaKey: z.string().optional(),
    areaCreatorId: z.string(),
    parentAreaId: z.string().optional(),

    isPrivate: z.boolean(),
    isZeroGravity: z.boolean().optional(),
    hasFloatingDust: z.boolean().optional(),
    isCopyable: z.boolean().optional(),
    onlyOwnerSetsLocks: z.boolean().optional(),
    isExcluded: z.boolean(),

    _environmentType: z.string().nullable().optional(),
    environmentChangersJSON: z.string(),
    settingsJSON: z.string().optional(),

    requestorIsEditor: z.boolean(),
    requestorIsListEditor: z.boolean(),
    requestorIsOwner: z.boolean(),

    placements: z.array(
      z.object({
        Id: z.string(),
        Tid: z.string(),
        P: Point3D,
        R: Point3D,
        D: z.number().optional(),
        S: z.number().optional(),
        A: z.array(z.number()).optional(),
      }).strict()
    ),

    serveTime: z.number(),
  }).strict()
]);

// Export TypeScript types
export type AreaListArea = z.infer<typeof AreaListArea>
export type AreaList = z.infer<typeof AreaList>
export type AreaSearch = z.infer<typeof AreaSearchSchema>
export type Editor = z.infer<typeof EditorSchema>
export type AreaInfo = z.infer<typeof AreaInfoSchema>
export type SubareaList = z.infer<typeof SubareaListSchema>
export type AreaBundle = z.infer<typeof AreaBundleSchema>
export type AreaLoad = z.infer<typeof AreaLoadSchema>

// Keep existing interface definitions
export interface AreaIndexEntry {
  name: string
  description?: string
  id: string
  playerCount: number
}

export interface AreaSearchResponse {
  areas: AreaIndexEntry[]
  ownPrivateAreas: AreaIndexEntry[]
}