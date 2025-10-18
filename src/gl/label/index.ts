import * as BABYLON from "babylonjs"
import * as GUI from "babylonjs-gui"

export class __Label__ {
  /** @private */
  private scene: BABYLON.Scene
  /**
   * Label Management
   *
   * @param { BABYLON.Scene } scene - Main scene instance
   * @param { BABYLON.AssetContainer } characterSharedAsset - Character shared asset
   * @param { CharacterAttribute } characterAttribute - Character attribute
   */
  constructor(scene: BABYLON.Scene) {
    this.scene = scene
  }
  /**
   * @public
   * @param { string } text - Text to display
   * @param { BABYLON.TransformNode } parent - Parent node
   * @returns
   */
  public makeLabel(
    text: string,
    parent: BABYLON.TransformNode,
  ): {
    plane: BABYLON.Mesh
    observer: BABYLON.Observer<BABYLON.Scene>
  } {
    const plane = BABYLON.MeshBuilder.CreatePlane(
      "labelPlane",
      { width: 1, height: 0.25 },
      this.scene,
    )

    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL
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
    textBlock.color = "white"
    textBlock.fontSize = 64
    textBlock.outlineColor = "black"
    textBlock.outlineWidth = 8
    textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER
    texture.addControl(textBlock)

    const updateScale = () => {
      const camera = this.scene.activeCamera
      if (!camera) return

      const distance = BABYLON.Vector3.Distance(
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
