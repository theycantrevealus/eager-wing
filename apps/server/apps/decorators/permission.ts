import { applyDecorators, SetMetadata } from "@nestjs/common"
import { PermissionDescriptor } from "@interfaces/permission.descriptor"

export function PermissionManager(...permission: PermissionDescriptor[]) {
  return applyDecorators(SetMetadata("permission", permission))
}
