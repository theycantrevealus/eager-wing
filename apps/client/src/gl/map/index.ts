import type {
  MapConfig,
  MapValidationError,
  Tile,
} from "#interfaces/map.config"
import type { LogStore } from "#stores/utils/log"
import {
  Scene,
  TransformNode,
  AbstractMesh,
  StandardMaterial,
  Color3,
  MeshBuilder,
  SceneLoader,
} from "babylonjs"

export class EagerWing___Map {
  private logStore: LogStore
  private scene: Scene
  private player: TransformNode | null

  private loadingPromises: Set<string> = new Set()
  private skeletonMeshes: { [key: string]: AbstractMesh } = {}
  private loadedMeshes: { [key: string]: AbstractMesh[] } = {}
  private errors: MapValidationError[] = []
  private config: MapConfig

  public isInitialized = false
  public isReady = false
  public initialLoadPromise: Promise<void> | null = null

  constructor(
    logStore: LogStore,
    scene: Scene,
    player: TransformNode | null,
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
    const okMat = new StandardMaterial("ok", this.scene)
    okMat.wireframe = true
    okMat.emissiveColor = new Color3(0, 1, 0)

    const badMat = new StandardMaterial("bad", this.scene)
    badMat.wireframe = true
    badMat.emissiveColor = new Color3(1, 0, 0)

    this.config.manifest.forEach((tile) => {
      const [w, d] = tile.size
      const box = MeshBuilder.CreateBox(
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
    const meshContainer = this.loadedMeshes[key]
    if (meshContainer) {
      meshContainer.forEach((m) => {
        m.dispose()
        m.setParent(null)
      })

      delete this.loadedMeshes[key]
    }
  }

  public updateTiles() {
    if (this.player) {
      const boxPos = this.player.position

      const gridX = -Math.round(boxPos.x / this.config.tile_size)
      const gridZ = -Math.round(boxPos.z / this.config.tile_size)
      const radius = this.config.load_grid_radius

      for (const tile of this.config.manifest) {
        const dX = Math.abs(tile.x - gridX)
        const dZ = Math.abs(tile.z - gridZ)
        const dist = Math.max(dX, dZ)

        if (dX > radius + 1 || dZ > radius + 1) continue

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

    try {
      const result = await SceneLoader.ImportMeshAsync(
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
    } catch (err: any) {
      this.logStore.addMessage({
        type: "error",
        content: `Failed ${tile.lod0}: ${err.message}`,
      })
    } finally {
      this.loadingPromises.delete(key)
    }
  }

  public getPlayer(): TransformNode | null {
    return this.player
  }

  public setPlayer(player: TransformNode) {
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
    // Unload all loaded tiles
    for (const tile of this.config.manifest) {
      this.unloadTile(tile)
    }

    // Dispose skeleton boxes
    Object.values(this.skeletonMeshes).forEach((box) => {
      box.dispose()
    })
    this.skeletonMeshes = {}

    // Dispose materials
    this.scene.materials.forEach((mat) => {
      if (mat.name === "ok" || mat.name === "bad") {
        mat.dispose()
      }
    })

    this.loadingPromises.clear()
    this.isInitialized = false
    this.isReady = false
    this.initialLoadPromise = null
  }
}
