import * as BABYLON from "babylonjs"

export class EagerWing___Map {
  private scene: BABYLON.Scene
  private player: BABYLON.TransformNode
  private loadRadius = 100
  private chunkSize = 100
  private loadedChunks = new Map<string, BABYLON.AssetContainer>()
  private groundName = "ground"

  constructor(scene: BABYLON.Scene, player: BABYLON.TransformNode) {
    this.scene = scene
    this.player = player
    this.scene.onBeforeRenderObservable.add(() => this.updateChunks())
  }

  private getChunkKey(pos: BABYLON.Vector3): string {
    const x = Math.floor(pos.x / this.chunkSize)
    const z = Math.floor(pos.z / this.chunkSize)
    return `${x}_${z}`
  }

  private async loadChunk(key: string, cx: number, cz: number): Promise<void> {
    if (this.loadedChunks.has(key)) return

    const path = `maps/mountain001/chunk_${cx}_${cz}.glb`

    try {
      const container = await BABYLON.SceneLoader.LoadAssetContainerAsync(
        "",
        path,
        this.scene,
        null,
        ".glb",
      )

      container.meshes.forEach((mesh) => {
        if (mesh.name === "__root__") return

        mesh.isPickable = true
        mesh.name = `ground_${mesh.name}` // <-- force "ground", last test using ground hehe

        mesh.position.x += cx * this.chunkSize
        mesh.position.z += cz * this.chunkSize
      })

      container.addAllToScene()
      this.loadedChunks.set(key, container)
      console.log(`[ChunkManager] Loaded ${path}`)
    } catch (e) {
      console.error(`[ChunkManager] Load failed ${path}`, e)
    }
  }

  private unloadChunk(key: string): void {
    const container = this.loadedChunks.get(key)
    if (!container) return

    container.removeAllFromScene()
    container.dispose()
    this.loadedChunks.delete(key)
    console.log(`[ChunkManager] Unloaded ${key}`)
  }

  private getGroundHeight(worldPosXZ: BABYLON.Vector3): number {
    const origin = worldPosXZ.clone()
    origin.y += 500
    const direction = new BABYLON.Vector3(0, -1, 0)
    const ray = new BABYLON.Ray(origin, direction, 1000)

    const pick = this.scene.pickWithRay(ray, (mesh) => {
      return (
        mesh.isPickable && mesh.name.toLowerCase().includes(this.groundName)
      )
    })

    return pick?.hit ? pick.pickedPoint!.y : worldPosXZ.y
  }

  private updateChunks(): void {
    const playerPos = this.player.getAbsolutePosition()
    const playerXZ = new BABYLON.Vector3(playerPos.x, 0, playerPos.z)

    // Snap force. Capek kalau ngitung terus.
    // Pakai ini aja deh buat maksa y position ketemu ground.
    //
    // const groundY = this.getGroundHeight(playerXZ);
    // this.player.position.y = groundY + 1.7;

    const centerChunkX = Math.floor(playerPos.x / this.chunkSize)
    const centerChunkZ = Math.floor(playerPos.z / this.chunkSize)
    const toLoad = new Set<string>()

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const cx = centerChunkX + dx
        const cz = centerChunkZ + dz
        const key = `${cx}_${cz}`

        const chunkCenter = new BABYLON.Vector3(
          cx * this.chunkSize + this.chunkSize / 2,
          0,
          cz * this.chunkSize + this.chunkSize / 2,
        )

        const dist = BABYLON.Vector3.Distance(playerXZ, chunkCenter)
        if (dist <= this.loadRadius + this.chunkSize / 2) {
          toLoad.add(key)
          if (!this.loadedChunks.has(key)) {
            this.loadChunk(key, cx, cz)
          }
        }
      }
    }

    // Unload far chunks
    for (const [key] of this.loadedChunks) {
      if (!toLoad.has(key)) {
        const [cx, cz] = key.split("_").map(Number)
        if (cx && cz) {
          const chunkCenter = new BABYLON.Vector3(
            cx * this.chunkSize + this.chunkSize / 2,
            0,
            cz * this.chunkSize + this.chunkSize / 2,
          )
          if (
            BABYLON.Vector3.Distance(playerXZ, chunkCenter) >
            this.loadRadius * 1.5
          ) {
            this.unloadChunk(key)
          }
        }
      }
    }
  }

  public dispose(): void {
    this.scene.onBeforeRenderObservable.removeCallback(() =>
      this.updateChunks(),
    )
    for (const key of this.loadedChunks.keys()) {
      this.unloadChunk(key)
    }
  }
}
