import type { Matrix } from "./Matrix"

export type CharacterDimension = {
  scale: number
  bones?: Map<string, Matrix>
}

export type CharacterInformation = {
  name: string
  level: number
  health: number
  mana: number
  job: string
  race: string
  dimension: CharacterDimension
}

export type CharacterAttribute = {
  modelId: string
  information: CharacterInformation
  position: Matrix
  speed: number
  turnSpeed: number
}
