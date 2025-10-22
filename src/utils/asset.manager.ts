import * as BABYLON from "babylonjs"
import { Result, Success, Failure } from "__&utils/result.pattern"

/**
 * @fileoverview Handles shared BabylonJS asset loading and caching.
 * @module EagerWing___AssetManager
 */

/**
 * Manages shared BabylonJS asset loading and caching.
 *
 * @example
 * const manager = new EagerWing___AssetManager(scene);
 * await manager.loadAll({
 *   spaceship: "assets/spaceship.glb",
 *   pilot: "assets/pilot.glb"
 * });
 */
export class EagerWing___AssetManager {
  /** The active BabylonJS scene used for asset loading. */
  private scene: BABYLON.Scene

  /** Cached asset containers indexed by identifier name. */
  private cache: Map<string, BABYLON.AssetContainer> = new Map()

  /**
   * GLTF / GLB assets manager. Use it to load multiple assets asynchronously.
   *
   * @param {BABYLON.Scene} scene - The active BabylonJS scene.
   */
  constructor(scene: BABYLON.Scene) {
    this.scene = scene
  }

  /**
   * Starts the async loading of multiple assets.
   *
   * @async
   * @param {Record<string, string>} assets - Map of asset identifiers to file URLs.
   * @returns {Promise<Result>} Resolves to `Result.Ok` on success, or `Result.Err(error)` on failure.
   * @throws {Error} If Babylon's AssetsManager encounters a load issue.
   */
  public async loadAll(
    assets: Record<string, string>,
  ): Promise<Result<any, string>> {
    try {
      const assetsManager = new BABYLON.AssetsManager(this.scene)

      for (const [key, path] of Object.entries(assets)) {
        if (path) {
          const task = assetsManager.addContainerTask(key, "", path, "")
          task.onSuccess = (task: BABYLON.ContainerAssetTask) => {
            const container = task.loadedContainer
            container.meshes.forEach((mesh) => mesh.setEnabled(false))
            this.cache.set(task.name, container)
          }
        }
      }

      await assetsManager.loadAsync()
      return new Success("Asset task executed successfully")
    } catch (error) {
      return new Failure(`[Asset Manager Error] - ${error}`)
    }
  }

  /**
   * Retrieves a cached asset container by name.
   *
   * @param {string} name - Asset identifier name.
   * @returns {BABYLON.AssetContainer | undefined} The cached container, if found.
   */
  public get(name: string): BABYLON.AssetContainer | undefined {
    return this.cache.get(name)
  }

  /**
   * Instantiates a cached asset by name.
   *
   * @beta
   * @param {string} name - Name of the cached asset to instantiate.
   * @returns {BABYLON.AssetContainer | undefined} A new instance of the asset, or `undefined` if not found.
   */
  public instantiate(name: string): BABYLON.AssetContainer | undefined {
    const original = this.cache.get(name)
    if (!original) return undefined
    // TODO: Implement instantiate logic.
  }
}
