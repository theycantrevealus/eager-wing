import * as BABYLON from "babylonjs"
import "babylonjs-loaders"

interface LabConfig {
  width: number
  height: number
  color: string | BABYLON.Color3
}

export class __Map__ {
  private ray: BABYLON.Ray
  private terrain: BABYLON.Mesh | null = null
  private terrainHeight: number = 0
  private targetSize: number
  private scene: BABYLON.Scene

  constructor(
    scene: BABYLON.Scene,
    mapFileName: string = "",
    size: number = 100,
  ) {
    this.scene = scene
    this.ray = new BABYLON.Ray(
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, -1, 0),
    )
    this.targetSize = size
    this.loadLab(scene)
  }

  private loadLab(
    scene: BABYLON.Scene,
    config: LabConfig = {
      width: 100,
      height: 100,
      color: "#737373",
    },
  ): BABYLON.Mesh {
    const material = new BABYLON.StandardMaterial("planeMaterial", scene)
    material.diffuseColor = new BABYLON.Color3(156, 156, 156)

    const plane = BABYLON.MeshBuilder.CreateGround(
      "plane",
      { width: config.width, height: config.height },
      scene,
    )
    plane.material = material
    plane.receiveShadows = true
    plane.isPickable = true

    // Add to shadow generator
    // const shadowGenerator = scene.getLightByName("dirLight")?.metadata
    //   ?.shadowGenerator as BABYLON.ShadowGenerator | undefined
    // if (shadowGenerator) {
    //   shadowGenerator.addShadowCaster(plane)
    // }

    this.terrain = plane
    return plane
  }

  public updateGroundContact(
    object: BABYLON.Mesh | BABYLON.TransformNode | null,
    offset: number = 0.5,
  ): void {
    if (object) {
      // object.receiveShadows = true
      if (object instanceof BABYLON.Mesh) {
        const shadowGenerator = this.scene.getLightByName("dirLight")?.metadata
          ?.shadowGenerator as BABYLON.ShadowGenerator | undefined
        if (shadowGenerator) {
          shadowGenerator.addShadowCaster(object)
        }
      }
    }

    if (!this.terrain || !object) return

    const origin = object.position.clone()
    origin.y += 5
    this.ray.origin = origin
    this.ray.direction = new BABYLON.Vector3(0, -1, 0)

    const pickInfo = this.scene.pickWithRay(
      this.ray,
      (mesh) =>
        mesh === this.terrain || this.terrain!.getDescendants().includes(mesh),
    )
    if (pickInfo?.hit && pickInfo.pickedPoint) {
      object.position.y = BABYLON.Scalar.Lerp(
        object.position.y,
        pickInfo.pickedPoint.y + offset,
        0.3,
      )
    }
  }

  public getTerrainTopY(offset: number = 0): number {
    return this.terrainHeight + offset
  }
}
