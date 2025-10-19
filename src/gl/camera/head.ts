import * as BABYLON from "babylonjs"

export class __CameraHead__ {
  private scene: BABYLON.Scene
  private camera: BABYLON.ArcRotateCamera | null = null

  /**
   * Custom camera for head focus only
   * @param {BABYLON.Engine} engine - Engine from master class
   * @param {BABYLON.Scene} scene - Scene from master class
   * @param {string} modelId - Model ID target to customize
   * @param {BABYLON.TransformNode} characterRoot - getRoot from __Character__ class
   */
  constructor(
    engine: BABYLON.Engine,
    scene: BABYLON.Scene,
    modelId: string,
    characterRoot: BABYLON.TransformNode,
  ) {
    this.scene = scene

    // Find head bone and estimate head size
    const headBone = this.findHeadBone(characterRoot)
    let center: BABYLON.Vector3
    let headSize: number

    // Try to find a head mesh for size estimation
    const headMesh = this.findHeadMesh(characterRoot)
    if (headMesh) {
      const { min, max } = headMesh.getHierarchyBoundingVectors(true)
      const extent = max.subtract(min)
      headSize = Math.max(extent.x, extent.y, extent.z)
      console.log(`Head mesh found: ${headMesh.name}, headSize: ${headSize}`)
    } else {
      console.warn("No head mesh found. Using fallback head size.")
      headSize = 0.4 // Increased for better framing (adjust for model scale)
    }

    if (!headBone) {
      console.warn("No head bone found. Using characterRoot as fallback.")
      center = characterRoot.position
    } else {
      const transformNode = headBone.getTransformNode()
      center = transformNode
        ? transformNode.getAbsolutePosition()
        : characterRoot.position
    }

    console.log(`Camera target: ${center.toString()}, headSize: ${headSize}`)

    this.camera = new BABYLON.ArcRotateCamera(
      `head_camera_${modelId}`,
      Math.PI / 2, // Initial alpha (side view)
      Math.PI / 2, // Initial beta (horizon)
      headSize * 5, // Increased initial radius for full head framing
      center,
      scene,
    )

    // Restrict to horizontal orbit (no up/down tilt)
    this.camera.lowerBetaLimit = Math.PI / 2
    this.camera.upperBetaLimit = Math.PI / 2
    this.camera.lowerAlphaLimit = null // Full 360-degree rotation
    this.camera.upperAlphaLimit = null
    this.camera.lowerRadiusLimit = headSize * 3 // Increased to prevent clipping
    this.camera.upperRadiusLimit = headSize * 5 // Adjusted for zoom range
    this.camera.allowUpsideDown = false

    // Adjust field of view for full-screen head framing
    this.camera.fov = 0.6 // Narrower FOV (default is ~0.8) to make head appear larger

    const canvas = engine.getRenderingCanvas()
    if (canvas) {
      this.camera.attachControl(canvas, true)
    }

    // Update camera target if character moves/animates
    if (headBone) {
      scene.registerBeforeRender(() => {
        const transformNode = headBone.getTransformNode()
        if (transformNode) {
          const newTarget = transformNode.getAbsolutePosition()
          this.camera!.target = newTarget
          console.log(`Updated camera target: ${newTarget.toString()}`)
        }
      })
    }
  }

  private findHeadBone(rootNode: BABYLON.TransformNode): BABYLON.Bone | null {
    const skeletons = this.scene.skeletons
    console.log(`Found ${skeletons.length} skeleton(s)`)

    for (const skeleton of skeletons) {
      // console.log(
      //   "Bones in skeleton:",
      //   skeleton.bones.map((bone) => ({
      //     name: bone.name,
      //     id: bone.id,
      //     parent: bone.getParent()?.name || "none",
      //   })),
      // )

      skeleton.bones
        .filter(
          (bone) =>
            bone.getParent()?.name.includes("006") || bone.name.includes("lip"),
        )
        .map((bone) =>
          console.log(
            `/${bone.getParent()?.name || "none"}/[${bone.id}]${bone.name}`,
          ),
        )

      const headBone = skeleton.bones.find(
        (bone) =>
          bone.name.toLowerCase().includes("head") ||
          bone.name.toLowerCase().includes("face") ||
          bone.name.toLowerCase().includes("skull"),
      )

      if (headBone) {
        return headBone
      }
    }

    const transformNodes = this.getAllTransformNodes(rootNode)
    console.log(
      "Transform nodes in hierarchy:",
      transformNodes.map((node) => ({
        name: node.name,
        id: node.id,
        parent: node.parent?.name || "none",
      })),
    )

    const headTransform = transformNodes.find(
      (node) =>
        node.name.toLowerCase().includes("head") ||
        node.name.toLowerCase().includes("face") ||
        node.name.toLowerCase().includes("skull"),
    )

    if (headTransform) {
      for (const skeleton of skeletons) {
        const bone = skeleton.bones.find(
          (b) => b.getTransformNode() === headTransform,
        )
        if (bone) {
          return bone
        }
      }
    }

    return null
  }

  private findHeadMesh(rootNode: BABYLON.TransformNode): BABYLON.Mesh | null {
    const allMeshes = this.getAllMeshes(rootNode)
    console.log(
      "Meshes in hierarchy:",
      allMeshes.map((mesh) => ({
        name: mesh.name,
        id: mesh.id,
        parent: mesh.parent?.name || "none",
      })),
    )

    const headMesh = allMeshes.find(
      (mesh) =>
        mesh.name.toLowerCase().includes("head") ||
        mesh.name.toLowerCase().includes("face") ||
        mesh.name.toLowerCase().includes("skull"),
    )

    return headMesh || null
  }

  private getAllMeshes(node: BABYLON.Node): BABYLON.Mesh[] {
    const meshes: BABYLON.Mesh[] = []
    if (node instanceof BABYLON.Mesh) {
      meshes.push(node)
    }
    const children = node.getChildren()
    for (const child of children) {
      meshes.push(...this.getAllMeshes(child))
    }
    return meshes
  }

  private getAllTransformNodes(node: BABYLON.Node): BABYLON.TransformNode[] {
    const transformNodes: BABYLON.TransformNode[] = []
    if (node instanceof BABYLON.TransformNode) {
      transformNodes.push(node)
    }
    const children = node.getChildren()
    for (const child of children) {
      transformNodes.push(...this.getAllTransformNodes(child))
    }
    return transformNodes
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
