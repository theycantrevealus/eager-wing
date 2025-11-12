// src/checker.ts
import * as BABYLON from "@babylonjs/core"
import "@babylonjs/loaders"
import manifest from "../manifest.json" assert { type: "json" }

interface Tile {
  x: number
  z: number
  gridOffset: [number, number]
  center: [number, number]
  size: [number, number]
  min: [number, number]
  max: [number, number]
  lod0: string
  lod1?: string
  lod2?: string
}
const LOAD_GRID_RADIUS = 2
const TILE_SIZE = 408.8
const EPS = 1e-6
function approxEq(a: number, b: number): boolean {
  return Math.abs(a - b) < EPS
}

interface ValidationError {
  tile: Tile
  message: string
}

const errors: ValidationError[] = []
const tiles: Tile[] = manifest as Tile[]

function validateTile(tile: Tile) {
  const [cx, cz] = tile.center
  const [sx, sz] = tile.size
  const [minX, minZ] = tile.min
  const [maxX, maxZ] = tile.max

  const expectedCx = (minX + maxX) * 0.5
  const expectedCz = (minZ + maxZ) * 0.5
  if (!approxEq(cx, expectedCx) || !approxEq(cz, expectedCz)) {
    errors.push({
      tile,
      message: `Center mismatch – expected (${expectedCx.toFixed(
        3,
      )}, ${expectedCz.toFixed(3)}) but got (${cx}, ${cz})`,
    })
  }

  const expectedSx = maxX - minX
  const expectedSz = maxZ - minZ
  if (!approxEq(sx, expectedSx) || !approxEq(sz, expectedSz)) {
    errors.push({
      tile,
      message: `Size mismatch – expected [${expectedSx.toFixed(
        3,
      )}, ${expectedSz.toFixed(3)}] but got [${sx}, ${sz}]`,
    })
  }

  const TARGET_SIZE = 408.8
  if (!approxEq(sx, TARGET_SIZE) || !approxEq(sz, TARGET_SIZE)) {
    errors.push({
      tile,
      message: `Tile size not ${TARGET_SIZE} – got [${sx}, ${sz}]`,
    })
  }
}

function checkNeighbours(tiles: Tile[]) {
  const map = new Map<string, Tile>()
  for (const t of tiles) map.set(`${t.x},${t.z}`, t)

  for (const t of tiles) {
    const right = map.get(`${t.x + 1},${t.z}`)
    if (right) {
      const gapX = right.min[0] - t.max[0]
      if (!approxEq(gapX, 0)) {
        errors.push({
          tile: t,
          message: `Gap/overlap with right neighbour (x+1) = ${gapX.toFixed(
            6,
          )}`,
        })
      }
    }
    const top = map.get(`${t.x},${t.z + 1}`)
    if (top) {
      const gapZ = top.min[1] - t.max[1]
      if (!approxEq(gapZ, 0)) {
        errors.push({
          tile: t,
          message: `Gap/overlap with top neighbour (z+1) = ${gapZ.toFixed(6)}`,
        })
      }
    }
  }
}

// Run validation
tiles.forEach(validateTile)
checkNeighbours(tiles)

// === VISUALIZATION SETUP ===
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement
const engine = new BABYLON.Engine(canvas, true)
const scene = new BABYLON.Scene(engine)

new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)

// FIXED TOP-DOWN CAMERA
const camera = new BABYLON.ArcRotateCamera(
  "cam",
  Math.PI / 2, // Look along +Z
  Math.PI / 6, // 30° from vertical (top-down-ish)
  8000, // High altitude
  BABYLON.Vector3.Zero(),
  scene,
)
camera.attachControl(canvas, true)
camera.lowerBetaLimit = 0.1
camera.upperBetaLimit = Math.PI / 2

// === TILE BOXES (DEBUG GRID) ===
const okMat = new BABYLON.StandardMaterial("ok", scene)
okMat.wireframe = true
okMat.emissiveColor = new BABYLON.Color3(0, 1, 0)

const badMat = new BABYLON.StandardMaterial("bad", scene)
badMat.wireframe = true
badMat.emissiveColor = new BABYLON.Color3(1, 0, 0)

const tileMeshes: { [key: string]: BABYLON.AbstractMesh } = {}
tiles.forEach((tile) => {
  const [w, d] = tile.size
  const box = BABYLON.MeshBuilder.CreateBox(
    `tile_${tile.x}_${tile.z}`,
    { width: w, height: 1, depth: d },
    scene,
  )
  box.position.x = tile.center[0]
  box.position.z = tile.center[1]
  box.position.y = 0.5

  const hasError = errors.some((e) => e.tile === tile)
  box.material = hasError ? badMat : okMat
  tileMeshes[`${tile.x},${tile.z}`] = box
})

// === MOVING BOX (WASD PLAYER) ===
const BOX_SIZE = 100
const LOAD_RADIUS = 600 // Load tiles within 600 units of box

const playerBox = BABYLON.MeshBuilder.CreateBox("player", {
  width: BOX_SIZE,
  height: BOX_SIZE,
  depth: BOX_SIZE,
})
playerBox.position.y = BOX_SIZE / 2 // Always Y=0 base
const playerMat = new BABYLON.StandardMaterial("playerMat", scene)
playerMat.diffuseColor = new BABYLON.Color3(0, 0.7, 1) // Cyan
playerMat.alpha = 0.8
playerBox.material = playerMat

// WASD Movement
const moveSpeed = 5
const keys: { [key: string]: boolean } = {}

window.addEventListener("keydown", (ev) => {
  keys[ev.code] = true
})
window.addEventListener("keyup", (ev) => {
  keys[ev.code] = false
})

scene.onBeforeRenderObservable.add(() => {
  // WASD movement (Y always 0)
  if (keys["KeyW"]) playerBox.position.z -= moveSpeed
  if (keys["KeyS"]) playerBox.position.z += moveSpeed
  if (keys["KeyD"]) playerBox.position.x -= moveSpeed
  if (keys["KeyA"]) playerBox.position.x += moveSpeed

  // Follow player with camera
  camera.setTarget(playerBox.position)

  // Lazy load/unload tiles
  updateTiles()
})

// === GLTF LOADING MANAGEMENT ===
const loadedMeshes: { [key: string]: BABYLON.AbstractMesh[] } = {}
const loadingPromises: Set<string> = new Set()

async function loadTile(tile: Tile): Promise<void> {
  const key = `${tile.x},${tile.z}`
  if (loadedMeshes[key] || loadingPromises.has(key)) return

  loadingPromises.add(key)
  console.log(`Loading ${tile.lod0}`)

  try {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "http://localhost:3000/chunks_lod/",
      tile.lod0,
      scene,
    )

    if (result.meshes.length === 0) {
      console.warn(`No meshes in ${tile.lod0}`)
      return
    }

    loadedMeshes[key] = result.meshes

    // NO POSITION SETTING — baked in GLB
    result.meshes.forEach((mesh) => {
      mesh.isPickable = false
    })

    console.log(`Loaded ${tile.lod0}`)
  } catch (err: any) {
    console.error(`Failed ${tile.lod0}:`, err.message)
  } finally {
    loadingPromises.delete(key)
  }
}

function unloadTile(tile: Tile): void {
  const key = `${tile.x},${tile.z}`
  if (loadedMeshes[key]) {
    loadedMeshes[key].forEach((m) => m.dispose())
    delete loadedMeshes[key]
    console.log(`Unloaded (${tile.x},${tile.z})`)
  }
}

function updateTiles() {
  const boxPos = playerBox.position

  // FLIP BOTH X and Z due to +90° X rotation in Blender
  const gridX = -Math.round(boxPos.x / TILE_SIZE) // X flipped
  const gridZ = -Math.round(boxPos.z / TILE_SIZE) // Z flipped

  console.log(
    `Box (${boxPos.x.toFixed(0)}, ${boxPos.z.toFixed(
      0,
    )}) → grid (${gridX}, ${gridZ})`,
  )

  for (const tile of tiles) {
    const dX = Math.abs(tile.x - gridX)
    const dZ = Math.abs(tile.z - gridZ)
    const dist = Math.max(dX, dZ)

    if (dist <= LOAD_GRID_RADIUS) {
      loadTile(tile)
    } else {
      unloadTile(tile)
    }
  }
}

// === CONSOLE REPORT ===
if (errors.length === 0) {
  console.log("%cAll tiles are correct!", "color:green;font-weight:bold")
} else {
  console.warn(
    `%c${errors.length} problem(s) found:`,
    "color:red;font-weight:bold",
  )
  errors.forEach((e, i) => {
    console.groupCollapsed(`#${i + 1} Tile (${e.tile.x},${e.tile.z})`)
    console.warn(e.message)
    console.groupEnd()
  })
}

console.log(
  `%cWASD to move cyan box | Tiles load within ${LOAD_RADIUS} units`,
  "color:cyan;font-weight:bold",
)

// === RENDER LOOP ===
engine.runRenderLoop(() => scene.render())
window.addEventListener("resize", () => engine.resize())
