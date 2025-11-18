import {
  Scene,
  Mesh,
  MeshBuilder,
  TransformNode,
  Observer,
  Vector3,
} from "babylonjs"
import * as GUI from "babylonjs-gui"

/**
 * @fileoverview Handle render label GUI
 * @module EagerWing___Label
 */

/**
 * Add label to scene
 *
 * @example
 * const manager = new EagerWing___Label(scene);
 * await manager.makeLabel("Hello There", characterRoot);
 */

export class EagerWing___Label {
  /** The active BabylonJS scene used for asset loading. */
  private scene: Scene

  /**
   * Label Management
   *
   * @param { Scene } scene - Main scene instance
   * @param { AssetContainer } characterSharedAsset - Character shared asset
   * @param { CharacterAttribute } characterAttribute - Character attribute
   */
  constructor(scene: Scene) {
    this.scene = scene
  }
  /**
   * @public
   * @param { string } text - Text to display
   * @param { TransformNode } parent - Parent node
   * @returns
   */
  public makeLabel(
    text: string,
    parent: TransformNode,
    isEnemy: boolean = true,
  ): {
    plane: Mesh
    observer: Observer<Scene>
  } {
    const plane = MeshBuilder.CreatePlane(
      "labelPlane",
      { width: 1, height: 0.25 },
      this.scene,
    )

    plane.billboardMode = Mesh.BILLBOARDMODE_ALL
    plane.parent = parent
    plane.position.y = 2.2

    const texture = GUI.AdvancedDynamicTexture.CreateForMesh(
      plane,
      512,
      128,
      false,
    )

    const textBlock = new GUI.TextBlock()
    textBlock.text = text
    textBlock.color = isEnemy ? "red" : "white"
    textBlock.fontSize = 64
    textBlock.outlineColor = "black"
    textBlock.outlineWidth = 8
    textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER
    texture.addControl(textBlock)

    const updateScale = () => {
      const camera = this.scene.activeCamera
      if (!camera) return

      const distance = Vector3.Distance(
        camera.position,
        plane.getAbsolutePosition(),
      )
      const scale = distance * 0.015
      plane.scaling.setAll(scale)
    }

    return {
      plane,
      observer: this.scene.onBeforeRenderObservable.add(updateScale),
    }
  }
}
