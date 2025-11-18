import { HttpStatus } from "@nestjs/common"

export const modCodes = {
  Global: {
    success: "S0000",
    failed: "F0000",
    error: {
      generalError: {
        defaultCode: HttpStatus.INTERNAL_SERVER_ERROR,
        customCode: "E0000",
      },
      databaseError: {
        defaultCode: HttpStatus.BAD_REQUEST,
        customCode: "E0001",
      },
      isNotFound: {
        defaultCode: HttpStatus.NOT_FOUND,
        customCode: "E0002",
      },
      isNoAccess: {
        defaultCode: HttpStatus.FORBIDDEN,
        customCode: "E0003",
      },
    },
  },
}
