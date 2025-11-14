import * as BABYLON from "babylonjs"

export class EagerWing___CameraCreation {
  private scene: BABYLON.Scene
  private camera: BABYLON.ArcRotateCamera | null = null

  /**
   * Custom camera for head focus only
   * @param {BABYLON.Engine} engine - Engine from master class
   * @param {BABYLON.Scene} scene - Scene from master class
   * @param {string} modelId - Model ID target to customize
   */
  constructor(engine: BABYLON.Engine, scene: BABYLON.Scene, modelId: string) {
    this.scene = scene
    let headSize: number = 0.4

    this.camera = new BABYLON.ArcRotateCamera(
      `head_camera_${modelId}`,
      Math.PI / 2, // Initial alpha (side view)
      Math.PI / 2, // Initial beta (horizon)
      headSize * 2, // Increased initial radius for full head framing
      new BABYLON.Vector3(0, 0, 0),
      scene,
    )

    // Restrict to horizontal orbit (no up/down tilt)
    this.camera.lowerBetaLimit = Math.PI / 2
    this.camera.upperBetaLimit = Math.PI / 2
    this.camera.lowerAlphaLimit = null // Full 360-degree rotation
    this.camera.upperAlphaLimit = null
    this.camera.lowerRadiusLimit = headSize * 2 // Increased to prevent clipping
    this.camera.upperRadiusLimit = headSize * 10 // Adjusted for zoom range
    this.camera.allowUpsideDown = false
    this.camera.minZ = 0.01

    // Adjust field of view for full-screen head framing
    this.camera.fov = 0.8 // Narrower FOV (default is ~0.8) to make head appear larger

    const canvas = engine.getRenderingCanvas()
    if (canvas) {
      this.camera.attachControl(canvas, true)
      this.camera.wheelPrecision = 50
    }

    // Update camera target if character moves/animates
    // if (headBone) {
    //   scene.registerBeforeRender(() => {
    //     const transformNode = headBone.getTransformNode()
    //     if (transformNode) {
    //       const newTarget = transformNode.getAbsolutePosition()
    //       this.camera!.target = newTarget
    //       console.log(`Updated camera target: ${newTarget.toString()}`)
    //     }
    //   })
    // }
  }

  public focusTo(focusTo: BABYLON.Vector3, zoomTo: number, duration = 60) {
    if (this.camera) {
      const animTarget = new BABYLON.Animation(
        "animTarget",
        "target",
        60, // fps
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      )

      const animRadius = new BABYLON.Animation(
        "animRadius",
        "radius",
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      )

      animTarget.setKeys([
        { frame: 0, value: this.camera.target.clone() },
        { frame: duration, value: focusTo.clone() },
      ])

      animRadius.setKeys([
        { frame: 0, value: this.camera.radius },
        { frame: duration, value: zoomTo },
      ])

      // Optional easing function for smoothness
      const easing = new BABYLON.CubicEase()
      easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT)
      animTarget.setEasingFunction(easing)
      animRadius.setEasingFunction(easing)

      // Stop any previous animations first
      this.camera.getScene().stopAnimation(this.camera)

      // Run both animations together
      this.camera
        .getScene()
        .beginDirectAnimation(
          this.camera,
          [animTarget, animRadius],
          0,
          duration,
          false,
        )
    }
  }

  getCamera(): BABYLON.ArcRotateCamera | null {
    return this.camera
  }

  destroy(): void {
    if (this.camera) {
      this.camera.dispose()
    }
  }
}
