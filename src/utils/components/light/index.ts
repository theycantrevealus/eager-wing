import * as BABYLON from "babylonjs"

// Type definitions
interface LightConfig {
  name: string
  direction: BABYLON.Vector3
  position?: BABYLON.Vector3
  diffuse: BABYLON.Color3
  groundColor?: BABYLON.Color3
  intensity: number
}

interface ShadowConfig {
  mapSize: number
  darkness: number
  useBlurExponentialShadowMap: boolean
}

export class __Light__ {
  private shadowGenerator: BABYLON.ShadowGenerator

  constructor(scene: BABYLON.Scene) {
    // HemisphereLight
    const hemiLightConfig: LightConfig = {
      name: "hemiLight",
      direction: new BABYLON.Vector3(0, 200, 0),
      diffuse: BABYLON.Color3.FromHexString("#ddeeff"),
      groundColor: BABYLON.Color3.FromHexString("#444444"),
      intensity: 1.2,
    }
    const hemiLight = new BABYLON.HemisphericLight(
      hemiLightConfig.name,
      hemiLightConfig.direction,
      scene,
    )
    hemiLight.diffuse = hemiLightConfig.diffuse
    hemiLight.groundColor = hemiLightConfig.groundColor!
    hemiLight.intensity = hemiLightConfig.intensity

    // DirectionalLight
    const dirLightConfig: LightConfig = {
      name: "dirLight",
      direction: new BABYLON.Vector3(-500, 300, 500).normalize(),
      position: new BABYLON.Vector3(-500, 300, 500),
      diffuse: BABYLON.Color3.FromHexString("#ffffff"),
      intensity: 1.5,
    }
    const dirLight = new BABYLON.DirectionalLight(
      dirLightConfig.name,
      dirLightConfig.direction,
      scene,
    )
    dirLight.position = dirLightConfig.position!
    dirLight.diffuse = dirLightConfig.diffuse
    dirLight.intensity = dirLightConfig.intensity

    // Shadow configuration
    const shadowConfig: ShadowConfig = {
      mapSize: 8192,
      darkness: 0.2,
      useBlurExponentialShadowMap: true,
    }
    this.shadowGenerator = new BABYLON.ShadowGenerator(
      shadowConfig.mapSize,
      dirLight,
    )
    this.shadowGenerator.useBlurExponentialShadowMap =
      shadowConfig.useBlurExponentialShadowMap
    this.shadowGenerator.setDarkness(shadowConfig.darkness)
    this.shadowGenerator.getShadowMap()!.renderList = [] // Meshes added in __Map__ and __Character__

    // Shadow frustum (orthographic projection)
    // this.shadowGenerator.frustumSize = 2400 // Covers -1200 to 1200 (left/right/top/bottom)
    dirLight.shadowMinZ = 0.5
    dirLight.shadowMaxZ = 2000

    // Store shadowGenerator in light's metadata for access in other classes
    dirLight.metadata = dirLight.metadata || {}
    dirLight.metadata.shadowGenerator = this.shadowGenerator

    // AmbientLight (simulated)
    const ambientConfig: LightConfig = {
      name: "ambient",
      direction: new BABYLON.Vector3(0, 1, 0),
      diffuse: BABYLON.Color3.FromHexString("#ffffff"),
      intensity: 0.2,
    }
    const ambient = new BABYLON.HemisphericLight(
      ambientConfig.name,
      ambientConfig.direction,
      scene,
    )
    ambient.diffuse = ambientConfig.diffuse
    ambient.intensity = ambientConfig.intensity

    // Add lights to the scene
    // scene.addLight(hemiLight)
    // scene.addLight(dirLight)
    // scene.addLight(ambient)
  }

  // Getter for shadowGenerator (optional, for external access)
  public getShadowGenerator(): BABYLON.ShadowGenerator {
    return this.shadowGenerator
  }
}
