/**
 * Area-related type definitions
 */

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