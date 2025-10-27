/**
 * @fileoverview Camera used for action in game mode
 * @module EagerWing___CameraAction
 */

import * as BABYLON from "babylonjs"

export class EagerWing___CameraAction {
  /** Camera instance. */
  private camera: BABYLON.ArcRotateCamera

  /**
   * Action Camera
   * This camera used as a main view in game
   *
   * @param { BABYLON.Engine } engine - Parent Engine
   * @param { BABYLON.Scene } scene - Parent Scene
   */
  constructor(engine: BABYLON.Engine, scene: BABYLON.Scene) {
    const initialRadius = 112
    const initialAlpha = BABYLON.Tools.ToRadians(0)
    const initialBeta = BABYLON.Tools.ToRadians(63)

    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      initialAlpha,
      initialBeta,
      initialRadius,
      new BABYLON.Vector3(0, 0, 0),
      scene,
    )

    const fov = BABYLON.Tools.ToRadians(10)
    const near = 2
    const far = 200

    this.camera.fov = fov
    this.camera.minZ = near
    this.camera.maxZ = far

    const canvas = engine.getRenderingCanvas()
    if (canvas) {
      this.camera.attachControl(canvas, true)
    }

    /** Minimum zoom. */
    this.camera.lowerRadiusLimit = 20

    /** Maximum zoom. */
    this.camera.upperRadiusLimit = 100

    this.camera.lowerBetaLimit = BABYLON.Tools.ToRadians(45)
    this.camera.upperBetaLimit = BABYLON.Tools.ToRadians(80)

    this.camera.angularSensibilityX = 1000
    this.camera.angularSensibilityY = 1000
    this.camera.wheelPrecision = 3
  }

  /**
   * In case you need the camera instance
   * @returns { BABYLON.ArcRotateCamera }
   */
  getCamera(): BABYLON.ArcRotateCamera {
    return this.camera
  }

  /**
   * This function will translate the camera instances to follow the character from behind POV
   * @param ( BABYLON.TransformNode ) followTarget - Target to follow. Usually is the character object
   *
   * @returns { void }
   */
  updateCameraFollow(
    followTarget: BABYLON.TransformNode | BABYLON.AbstractMesh | null,
  ): void {
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

  /**
   * Camera instance disposal
   *
   * @returns { void }
   */
  destroy(): void {
    if (this.camera) {
      this.camera.dispose()
    }
  }
}
