import * as BABYLON from "babylonjs"

export class __AssetManager__ {
  private scene: BABYLON.Scene
  private cache: Map<string, BABYLON.AssetContainer> = new Map()

  /**
   * @constructor
   * GLTF / GLB assets manager. Use it to async load asset on scene
   *
   * @param scene - Master scene
   */
  constructor(scene: BABYLON.Scene) {
    this.scene = scene
  }

  /**
   * @public
   * @async
   * Start loading assets
   *
   * @param { Record<string, string> } assets - List asset to load
   */
  public async loadAll(assets: Record<string, string>) {
    try {
      const assetsManager = new BABYLON.AssetsManager(this.scene)

      for (const [key, path] of Object.entries(assets)) {
        const task = assetsManager.addContainerTask(key, "", path, "")
        task.onSuccess = (task: BABYLON.ContainerAssetTask) => {
          const container = task.loadedContainer
          container.meshes.forEach((mesh) => mesh.setEnabled(false))
          this.cache.set(task.name, container)
        }
      }

      await assetsManager.loadAsync()
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * @public
   * @param name - Asset identifier name
   *
   * @returns { BABYLON.AssetContainer | undefined }
   */
  public get(name: string): BABYLON.AssetContainer | undefined {
    return this.cache.get(name)
  }

  /**
   * @public
   * @param name - New instance name for asset
   *
   * @returns { BABYLON.AssetContainer | undefined }
   */
  public instantiate(name: string): BABYLON.AssetContainer | undefined {
    const original = this.cache.get(name)
    if (!original) return undefined

    // TODO : Check for this instantiate  function
    // return original.instantiateModelsToScene()
  }
}
