import type {
  MapConfig,
  MapValidationError,
  Tile,
} from "__&interfaces/map.config"
import type { LogStore } from "__&stores/utils/log"
import * as BABYLON from "babylonjs"

export class EagerWing___Map {
  private logStore: LogStore
  private scene: BABYLON.Scene
  private player: BABYLON.TransformNode | null

  private loadingPromises: Set<string> = new Set()
  private skeletonMeshes: { [key: string]: BABYLON.AbstractMesh } = {}
  private loadedMeshes: { [key: string]: BABYLON.AbstractMesh[] } = {}
  private errors: MapValidationError[] = []
  private config: MapConfig

  public isInitialized = false
  public isReady = false
  public initialLoadPromise: Promise<void> | null = null

  constructor(
    logStore: LogStore,
    scene: BABYLON.Scene,
    player: BABYLON.TransformNode | null,
    config: MapConfig,
  ) {
    this.logStore = logStore
    this.scene = scene
    this.player = player
    this.config = config

    this.createSkeleton()
    this.isInitialized = true
  }

  private createSkeleton() {
    const okMat = new BABYLON.StandardMaterial("ok", this.scene)
    okMat.wireframe = true
    okMat.emissiveColor = new BABYLON.Color3(0, 1, 0)

    const badMat = new BABYLON.StandardMaterial("bad", this.scene)
    badMat.wireframe = true
    badMat.emissiveColor = new BABYLON.Color3(1, 0, 0)

    this.config.manifest.forEach((tile) => {
      const [w, d] = tile.size
      const box = BABYLON.MeshBuilder.CreateBox(
        `tile_${tile.x}_${tile.z}`,
        { width: w, height: 1, depth: d },
        this.scene,
      )
      box.position.x = tile.center[0]
      box.position.z = tile.center[1]
      box.position.y = 0.5

      const hasError = this.errors.some((e) => e.tile === tile)
      box.material = hasError ? badMat : okMat
      this.skeletonMeshes[`${tile.x},${tile.z}`] = box
    })
  }

  public approxEq(a: number, b: number): boolean {
    return Math.abs(a - b) < this.config.eps
  }

  private unloadTile(tile: Tile): void {
    const key = `${tile.x},${tile.z}`
    if (this.loadedMeshes[key]) {
      this.loadedMeshes[key].forEach((m) => m.dispose())
      delete this.loadedMeshes[key]
      this.logStore.addMessage({
        type: "info",
        content: `Unloaded (${tile.x},${tile.z})`,
      })
    }
  }

  public updateTiles() {
    if (this.player) {
      const boxPos = this.player.position

      const gridX = -Math.round(boxPos.x / this.config.tile_size)
      const gridZ = -Math.round(boxPos.z / this.config.tile_size)

      for (const tile of this.config.manifest) {
        const dX = Math.abs(tile.x - gridX)
        const dZ = Math.abs(tile.z - gridZ)
        const dist = Math.max(dX, dZ)

        if (dist <= this.config.load_grid_radius) {
          this.loadTile(tile)
        } else {
          this.unloadTile(tile)
        }
      }
    }
  }

  private async loadInitialTiles(): Promise<void> {
    if (!this.player) return

    const pos = this.player.position

    const gridX = -Math.round(pos.x / this.config.tile_size)
    const gridZ = -Math.round(pos.z / this.config.tile_size)

    // Collect load promises
    const promises: Promise<void>[] = []

    for (const tile of this.config.manifest) {
      const dX = Math.abs(tile.x - gridX)
      const dZ = Math.abs(tile.z - gridZ)
      const dist = Math.max(dX, dZ)

      if (dist <= this.config.load_grid_radius) {
        promises.push(this.loadTile(tile))
      }
    }

    await Promise.all(promises)

    this.isReady = true
  }

  private async loadTile(tile: Tile): Promise<void> {
    const key = `${tile.x},${tile.z}`
    if (this.loadedMeshes[key] || this.loadingPromises.has(key)) return

    this.loadingPromises.add(key)
    this.logStore.addMessage({
      type: "info",
      content: `Loading ${tile.lod0}`,
    })

    try {
      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        this.config.url,
        tile.lod0,
        this.scene,
      )

      if (result.meshes.length === 0) {
        this.logStore.addMessage({
          type: "warning",
          content: `No meshes in ${tile.lod0}`,
        })
        return
      }

      this.loadedMeshes[key] = result.meshes

      result.meshes.forEach((mesh) => {
        mesh.isPickable = true
        mesh.name = "ground"
      })

      this.logStore.addMessage({
        type: "info",
        content: `Loaded ${tile.lod0}`,
      })
    } catch (err: any) {
      this.logStore.addMessage({
        type: "error",
        content: `Failed ${tile.lod0}: ${err.message}`,
      })
    } finally {
      this.loadingPromises.delete(key)
    }
  }

  public getPlayer(): BABYLON.TransformNode | null {
    return this.player
  }

  public setPlayer(player: BABYLON.TransformNode) {
    this.player = player
    if (!this.initialLoadPromise) {
      this.initialLoadPromise = this.loadInitialTiles()
    }
  }

  /**
   * @public
   * Clear instance
   *
   * @returns { void }
   */
  public dispose(): void {
    //
  }
}
