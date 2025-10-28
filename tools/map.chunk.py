# ------------------------------------------------------------
# GLB CHUNK AND EXPORT
# Script to split a large mesh into smaller chunks and export them as individual GLB files.
# Run on blender
# ------------------------------------------------------------
import bpy
import bmesh
import os
from mathutils import Vector

print("\n=== CHUNK EXPORTER – FINAL VERSION ===")

# ------------------- USER SETTINGS ---------------------------
chunks_x = 5
chunks_y = 5
chunk_size = 100.0
export_folder = "chunks"
draco_compression = True
# ------------------------------------------------------------

# ---- 1. Find mesh ------------------------------------------------
obj = bpy.context.active_object
if not obj or obj.type != 'MESH':
    mesh_obj = next((o for o in bpy.data.objects if o.type == 'MESH'), None)
    if not mesh_obj:
        raise RuntimeError("No mesh found! Import your GLB.")
    obj = mesh_obj
print(f"Using mesh: {obj.name}")

# ---- 2. Save blend file -----------------------------------------
if not bpy.data.filepath:
    raise RuntimeError("Save your .blend file first!")
blend_dir = bpy.path.abspath("//")
export_path = os.path.join(blend_dir, export_folder)
os.makedirs(export_path, exist_ok=True)
print(f"Export folder: {export_path}")

# ---- 3. AUTO-SCALE MESH -----------------------------------------
print("Scaling mesh...")
bounds = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
min_x = min(v.x for v in bounds); max_x = max(v.x for v in bounds)
min_z = min(v.z for v in bounds); max_z = max(v.z for v in bounds)
width = max_x - min_x; depth = max_z - min_z

target_width = chunks_x * chunk_size
target_depth = chunks_y * chunk_size

scale = min(target_width / width if width > 0 else 1,
            target_depth / depth if depth > 0 else 1)

# Apply scale to vertices
for v in obj.data.vertices:
    v.co *= scale

obj.location.x = -target_width / 2
obj.location.z = -target_depth / 2
print(f"Scaled to {target_width}x{target_depth}m")

# ---- 4. Duplicate mesh data -------------------------------------
print("Duplicating mesh data...")
mesh_copy = obj.data.copy()
split_obj = bpy.data.objects.new(f"{obj.name}_split", mesh_copy)
bpy.context.scene.collection.objects.link(split_obj)

# ---- 5. Create bmesh --------------------------------------------
bm = bmesh.new()
bm.from_mesh(mesh_copy)

# ---- 6. Bisect planes -------------------------------------------
def bisect(axis, cuts):
    if not bm.verts:
        print(f"Skipping bisect {axis}: no vertices")
        return
    coords = [v.co.x if axis=='X' else v.co.z for v in bm.verts]
    min_val, max_val = min(coords), max(coords)
    step = (max_val - min_val) / cuts
    for i in range(1, cuts):
        pos = min_val + i * step
        plane_co = Vector((pos, 0, 0)) if axis == 'X' else Vector((0, 0, pos))
        plane_no = Vector((1, 0, 0)) if axis == 'X' else Vector((0, 0, 1))
        bmesh.ops.bisect_plane(
            bm,
            geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
            plane_co=plane_co,
            plane_no=plane_no,
            clear_inner=False,
            clear_outer=False
        )

bisect('X', chunks_x)
bisect('Y', chunks_y)
bm.to_mesh(mesh_copy)
bm.free()

# ---- 7. Separate into chunks ------------------------------------
print("Separating chunks...")
face_chunks = {}
mesh = split_obj.data
for f in mesh.polygons:
    center = sum((mesh.vertices[v].co for v in f.vertices), Vector()) / len(f.vertices)
    cx = int((center.x + target_width / 2) // chunk_size)
    cz = int((center.z + target_depth / 2) // chunk_size)
    key = (cx, cz)
    face_chunks.setdefault(key, []).append(f.index)

chunks = []
for (cx, cz), face_indices in face_chunks.items():
    bm_src = bmesh.new()
    bm_src.from_mesh(mesh)
    bm_src.faces.ensure_lookup_table()

    faces_to_copy = []
    for idx in face_indices:
        if idx < len(bm_src.faces):
            faces_to_copy.append(bm_src.faces[idx])

    if not faces_to_copy:
        bm_src.free()
        continue

    geom_copied = bmesh.ops.duplicate(bm_src, geom=faces_to_copy)["geom"]

    bm_chunk = bmesh.new()
    vert_map = {}
    for elem in geom_copied:
        if isinstance(elem, bmesh.types.BMVert):
            new_v = bm_chunk.verts.new(elem.co)
            vert_map[elem] = new_v
        elif isinstance(elem, bmesh.types.BMEdge):
            v1 = vert_map[elem.verts[0]]
            v2 = vert_map[elem.verts[1]]
            bm_chunk.edges.new((v1, v2))
        elif isinstance(elem, bmesh.types.BMFace):
            verts = [vert_map[v] for v in elem.verts]
            bm_chunk.faces.new(verts)

    bm_chunk.normal_update()
    new_mesh = bpy.data.meshes.new(f"chunk_{cx}_{cz}_mesh")
    bm_chunk.to_mesh(new_mesh)
    bm_chunk.free()
    bm_src.free()

    new_obj = bpy.data.objects.new(f"chunk_{cx}_{cz}", new_mesh)
    bpy.context.scene.collection.objects.link(new_obj)
    new_obj.location = Vector((
        (cx - chunks_x * 0.5 + 0.5) * chunk_size,
        0,
        (cz - chunks_y * 0.5 + 0.5) * chunk_size
    ))

    # TANAKA >> ADD "ground" TAG: This is for eager-wing purposes only. It used to identify ground meshes in game engine.
    new_obj["ground"] = True
    new_mesh["ground"] = True

    chunks.append(new_obj)

print(f"Created {len(chunks)} chunks")

# ---- 8. Export GLB files (Auto to chunks/) ----------------------
print("Exporting chunks to GLB...")
exported = 0
for chunk in chunks:
    glb_path = os.path.join(export_path, f"{chunk.name}.glb")

    # Hide all objects, show only current chunk
    for o in bpy.context.scene.objects:
        o.hide_set(True)
    chunk.hide_set(False)

    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        export_apply=True,
        export_draco_mesh_compression_enable=draco_compression,
        export_materials='EXPORT',
        export_yup=True
    )

    # Restore visibility
    for o in bpy.context.scene.objects:
        o.hide_set(False)


# ---- 9. Cleanup -------------------------------------------------
bpy.data.objects.remove(split_obj, do_unlink=True)
for chunk in chunks:
    bpy.data.objects.remove(chunk, do_unlink=True)
    bpy.data.meshes.remove(chunk.data, do_unlink=True)

print(f"\n=== SUCCESS: {exported}/{len(chunks)} chunks exported to '{export_folder}/' ===")
print("   → Each chunk has: obj['ground'] = True")
print("   → Ready for Babylon.js ChunkManager!")