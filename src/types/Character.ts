import * as BABYLON from "babylonjs"
import type { Matrix } from "./Matrix"

export type CharacterDimension = {
  scale: number
  bones?: Map<string, Matrix> | null
}

export type CharacterStyle = {
  body: {
    color: string
    hair: {
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
  gender: string
  level: number
  health: number
  mana: number
  job: string
  race: string
  dimension: CharacterDimension | null
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

export type CharacterBoneSingleCollection = {
  name: string
  bone?: BABYLON.Bone
  minimum: number
  maximum: number
  type?: string
  group: string
  configurable: boolean
}

export type CharacterBoneCollection = {
  [key: string]: CharacterBoneSingleCollection
}
