import { CharacterAttribute } from "#types/Character.ts"
import { Mesh } from "babylonjs"

export interface CharacterControlStatus {
  selectedObject?: {
    attribute: CharacterAttribute
    indicator: {
      circle: Mesh
    }
    isEnemy: boolean
    targetFocus?: CharacterAttribute
  } | null
}
