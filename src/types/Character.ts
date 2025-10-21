import * as BABYLON from "babylonjs"
import type { Matrix } from "./Matrix"

export type CharacterDimension = {
  scale: number
  bones?: Map<string, Matrix>
}

export type CharacterStyle = {
  body: {
    color: string
    hair: {
      asset: BABYLON.AssetContainer | undefined
      color: string
    }
    brow: {
      color: string
    }
    eye: {
      color: string
      scale: number
    }
    blush: {
      color: string
    }
    lip: {
      color: string
    }
  }
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
  style: CharacterStyle
  speed: number
  turnSpeed: number
  classConfig: {
    needDebug: boolean
  }
}
