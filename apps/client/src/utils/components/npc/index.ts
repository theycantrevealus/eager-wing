import * as BABYLON from "babylonjs"
import type { Coordinate } from "../../../types/coordinate"
import type { NPCAttribute, NPCDimension } from "./type"
import { __Character__ } from "../character"
import { useCharacterStore } from "../../../stores/character"

export class __NPC__ extends __Character__ {
  constructor(
    scene: BABYLON.Scene,
    camera: BABYLON.ArcRotateCamera,
    dimension: NPCDimension,
    position: Coordinate,
    highlightLayer: BABYLON.HighlightLayer,
    color: BABYLON.Color3,
    attribute: NPCAttribute,
    isPlayerControlled: boolean = false,
    gltfMesh: BABYLON.AbstractMesh,
    animations: BABYLON.AnimationGroup[],
    skeletons: BABYLON.Skeleton[],
  ) {
    super(
      scene,
      camera,
      dimension,
      position,
      highlightLayer,
      color,
      attribute,
      isPlayerControlled,
      gltfMesh,
      animations,
      skeletons,
    )
  }

  public update(): void {
    if (!this.isLoaded || !this.characterRoot || !this.characterMesh) return
    // this.updateAnimation() // Only update animations (Idle for NPCs)
  }

  public getAttribute(): NPCAttribute {
    return this.attribute
  }

  public updateTarget(selectionAttribute: NPCAttribute): void {
    this.selectionAttribute = selectionAttribute
    useCharacterStore().setTargetSelection(this.selectionAttribute)
    let targetColor = BABYLON.Color3.Green()
    if (useCharacterStore().MyCharacter.race !== selectionAttribute.race) {
      targetColor = BABYLON.Color3.FromHexString("#FA02A0")
    }
    if (this.characterMesh && this.characterMesh instanceof BABYLON.Mesh) {
      this.highlightLayer.addMesh(this.characterMesh, targetColor)
    }
  }
}
