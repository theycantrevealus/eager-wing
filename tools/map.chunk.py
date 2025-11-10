import bpy
import os
import json
import math

mesh_name = "Terrain"
chunks_x = 10
chunks_z = 10
export_folder = "chunks_lod"
EPS = 0.0001
lod_levels = [1.0, 0.75, 0.5]
use_draco = True

compression_settings = [
    dict(pos=14, norm=10, tex=12),
    dict(pos=12, norm=8, tex=10),
    dict(pos=10, norm=6, tex=8),
]
manifest = []
blend_dir = bpy.path.abspath("//")
export_path = os.path.join(blend_dir, export_folder)
os.makedirs(export_path, exist_ok=True)

obj = bpy.data.objects.get(mesh_name)
if not obj or obj.type != 'MESH':
    raise RuntimeError(f"Mesh '{mesh_name}' not found")

bpy.context.view_layer.objects.active = obj
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

min_x = min(v.co.x for v in obj.data.vertices)
max_x = max(v.co.x for v in obj.data.vertices)
min_z = min(v.co.z for v in obj.data.vertices)
max_z = max(v.co.z for v in obj.data.vertices)

step_x = (max_x - min_x) / chunks_x
step_z = (max_z - min_z) / chunks_z

# SET CENTER
offset_x = chunks_x // 2
offset_z = chunks_z // 2

for ix in range(chunks_x):
    for iz in range(chunks_z):
        chunk_x = ix - offset_x
        chunk_z = iz - offset_z

        bx_min = min_x + ix * step_x
        bx_max = bx_min + step_x
        bz_min = min_z + iz * step_z
        bz_max = bz_min + step_z
        
        center_x = bx_min + (bx_max - bx_min) / 2
        center_z = bz_min + (bz_max - bz_min) / 2
        
        center_gltf = [
            center_x,     # X → X
            -center_z,    # Z → -Z
            0             # Y → Z = 0
        ]

        min_gltf = [
            bx_min,       # X → X
            -bz_max       # Z_max → -Z (because +Z becomes -Y)
        ]

        max_gltf = [
            bx_max,       # X → X
            -bz_min       # Z_min → -Z (because +Z becomes -Y)
        ]
        
        manifest.append({
            "x": chunk_x,
            "z": chunk_z,
            "gridOffset": [offset_x, offset_z],
            "center": [center_gltf[0], center_gltf[1]],
            "size": [step_x, step_z],
            "min": min_gltf,
            "max": max_gltf,
            "lod0": f"chunk_{chunk_x}_{chunk_z}_lod0.gltf",
            "lod1": f"chunk_{chunk_x}_{chunk_z}_lod1.gltf",
            "lod2": f"chunk_{chunk_x}_{chunk_z}_lod2.gltf",
        })

        # DUPLICATE + SLICE
        chunk_obj = obj.copy()
        chunk_obj.data = obj.data.copy()
        bpy.context.collection.objects.link(chunk_obj)
        chunk_obj.name = f"chunk_{chunk_x}_{chunk_z}_lod0"

        bpy.context.view_layer.objects.active = chunk_obj
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='DESELECT')
        bpy.ops.object.mode_set(mode='OBJECT')

        for v in chunk_obj.data.vertices:
            if (bx_min - EPS) <= v.co.x <= (bx_max + EPS) and (bz_min - EPS) <= v.co.z <= (bz_max + EPS):
                v.select = False
            else:
                v.select = True

        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.delete(type='VERT')
        bpy.ops.object.mode_set(mode='OBJECT')

        # LODs
        for level, factor in enumerate(lod_levels[1:], start=1):
            lod_obj = chunk_obj.copy()
            lod_obj.data = chunk_obj.data.copy()
            lod_obj.name = f"chunk_{chunk_x}_{chunk_z}_lod{level}"
            bpy.context.collection.objects.link(lod_obj)

            dec = lod_obj.modifiers.new(name=f"Decimate_LOD{level}", type='DECIMATE')
            dec.ratio = factor
            bpy.context.view_layer.objects.active = lod_obj
            bpy.ops.object.modifier_apply(modifier=dec.name)

        # EXPORT
        for level in range(len(lod_levels)):
            lod_name = f"chunk_{chunk_x}_{chunk_z}_lod{level}.gltf"
            lod_obj = bpy.data.objects.get(f"chunk_{chunk_x}_{chunk_z}_lod{level}")
            bpy.ops.object.select_all(action='DESELECT')
            lod_obj.select_set(True)
            bpy.context.view_layer.objects.active = lod_obj
            
            lod_obj.rotation_euler = (math.radians(90), 0, 0)
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

            export_file = os.path.join(export_path, lod_name)
            settings = compression_settings[level]

            bpy.ops.export_scene.gltf(
                filepath=export_file,
                export_format='GLTF_SEPARATE',
                export_apply=True,
                export_yup=True,
                export_draco_mesh_compression_enable=True,
                export_draco_position_quantization=settings['pos'],
                export_draco_normal_quantization=settings['norm'],
                export_draco_texcoord_quantization=settings['tex'],
                use_selection=True
            )

            print(f"Exported: {lod_name}")

        # CLEANUP
        for level in range(len(lod_levels)):
            lod_obj = bpy.data.objects.get(f"chunk_{chunk_x}_{chunk_z}_lod{level}")
            if lod_obj:
                bpy.data.objects.remove(lod_obj, do_unlink=True)

        bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)
        bpy.context.view_layer.update()

print(f"All chunk exported {export_file}")
manifest_path = os.path.join(export_path, "tile_manifest.json")
with open(manifest_path, 'w') as f:
    json.dump(manifest, f, indent=2)
print(f"Manifest exported: {manifest_path}")
