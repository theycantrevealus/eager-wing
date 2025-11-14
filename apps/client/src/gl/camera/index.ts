import type { Matrix } from "__&types/Matrix"
import * as BABYLON from "babylonjs"

export class __Camera__ {
  private engine: BABYLON.Engine
  private scene: BABYLON.Scene
  private camera: BABYLON.ArcRotateCamera

  constructor(
    engine: BABYLON.Engine,
    scene: BABYLON.Scene,
    initialTarget: Matrix,
  ) {
    this.engine = engine
    this.scene = scene

    const fov = BABYLON.Tools.ToRadians(10)
    const near = 2
    const far = 200

    const initialRadius = 112
    const initialAlpha = BABYLON.Tools.ToRadians(0)
    const initialBeta = BABYLON.Tools.ToRadians(63)

    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      initialAlpha,
      initialBeta,
      initialRadius,
      new BABYLON.Vector3(initialTarget.x, initialTarget.y, initialTarget.z),
      this.scene,
    )

    this.camera.fov = fov
    this.camera.minZ = near
    this.camera.maxZ = far

    const canvas = this.engine.getRenderingCanvas()
    if (canvas) {
      this.camera.attachControl(canvas, true)
    }

    this.camera.lowerRadiusLimit = 10 // Zoom in max
    this.camera.upperRadiusLimit = 100 // Zoom out max
    this.camera.lowerBetaLimit = BABYLON.Tools.ToRadians(45)
    this.camera.upperBetaLimit = BABYLON.Tools.ToRadians(80)

    this.camera.angularSensibilityX = 1000
    this.camera.angularSensibilityY = 1000
    this.camera.wheelPrecision = 3
  }

  getCamera(): BABYLON.ArcRotateCamera {
    return this.camera
  }

  updateCameraFollow(
    followTarget: BABYLON.TransformNode | BABYLON.AbstractMesh | null,
  ) {
    if (followTarget) {
      const offset = new BABYLON.Vector3(0, 1, 0)
      const desiredTarget = followTarget.position.clone().add(offset)

      this.camera.target = BABYLON.Vector3.Lerp(
        this.camera.target,
        desiredTarget,
        0.2,
      )
    }
  }
}
