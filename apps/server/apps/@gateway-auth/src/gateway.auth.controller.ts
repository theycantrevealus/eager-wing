import { Body, Controller, Inject, Post, Version } from "@nestjs/common"
import { GatewayAuthService } from "./gateway.auth.service"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { AccountSignInDTO } from "./dto/signIn.dto"

@Controller("auth")
@ApiTags("Authentication Management")
export class GatewayAuthController {
  constructor(
    @Inject(GatewayAuthService)
    private readonly gatewayAuthService: GatewayAuthService,
  ) {}

  @Post()
  @Version("1")
  @ApiOperation({
    summary: "Generate account access token",
    description: ``,
  })
  async signIn(@Body() body: AccountSignInDTO) {
    await this.gatewayAuthService.signIn(body).then((result) => {
      result.match({
        success: (u) => {
          //
        },
        failure: (err) => {
          //
        },
      })
    })
  }
}
