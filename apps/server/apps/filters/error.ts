import { ArgumentsHost, Catch, ExceptionFilter, Inject } from "@nestjs/common"
import { Logger } from "winston"

import { errorHttpHandler } from "./http"
import { errorRpcHandler } from "./rpc"
import { WINSTON_MODULE_PROVIDER } from "@constants/winston"

@Catch()
export class CommonErrorFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}
  async catch(exception: any, host: ArgumentsHost) {
    if (host.getType() === "http") {
      await errorHttpHandler(exception, host, this.logger)
    } else {
      await errorRpcHandler(exception, host)
    }
  }
}
