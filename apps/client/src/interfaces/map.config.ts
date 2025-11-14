export interface MapConfig {
  name: string
  url: string
  manifest: Tile[]
  load_radius: number
  load_grid_radius: number
  tile_size: number
  eps: number
}

export interface MapValidationError {
  tile: Tile
  message: string
}

export interface Tile {
  x: number
  y: number
  z: number
  gridOffset: [number, number]
  center: [number, number]
  size: [number, number]
  min: [number, number]
  max: [number, number]
  lod0: string
  lod1: string
  lod2: string
}
