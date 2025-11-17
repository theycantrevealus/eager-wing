/**
 * @fileoverview Gateway Core
 * @module bootstrap
 */

import { NestFactory } from "@nestjs/core"
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify"
import { ConfigService } from "@nestjs/config"
import { VersioningType } from "@nestjs/common"
import * as fs from "fs"
import * as path from "path"
import * as winston from "winston"
import { GatewayAuthModule } from "./gateway.auth.module"
import { environmentName } from "@constants/environment"
import { WinstonCustomTransports } from "@utilities/logger/winston/transport"
import { CommonErrorFilter } from "@filters/error"
import { GatewayPipe } from "@pipes/gateway"
import { ClientDecoratorProcessorService } from "@decorators/kafka.client"
import { KAFKA_CLIENTS } from "@constants/kafka.client"
import { Client } from "@nestjs/microservices"

declare const module: any

/**
 * Gateway Core Bootstrapper
 * Start gateway core functionality
 *
 */
async function bootstrap() {
  let fastifyAdapter: FastifyAdapter
  const protocol: boolean = process.env.NODE_SECURE === "true"

  if (protocol) {
    fastifyAdapter = new FastifyAdapter({
      logger: false,
      disableRequestLogging: true,
      ignoreTrailingSlash: true,
      ignoreDuplicateSlashes: true,
      https: {
        ca: fs.readFileSync(path.resolve(__dirname, "certificates/CA.pem")),
        pfx: fs.readFileSync(
          path.resolve(__dirname, "certificates/localhost.pfx"),
        ),
        // requestCert: true,
        rejectUnauthorized: true,
        key: fs.readFileSync(
          path.resolve(__dirname, "certificates/localhost.decrypted.key"),
        ),
        cert: fs.readFileSync(
          path.resolve(__dirname, "certificates/localhost.crt"),
        ),
        passphrase: process.env.CA_PASS,
      },
    })
  } else {
    fastifyAdapter = new FastifyAdapter({
      logger: false,
      disableRequestLogging: true,
      ignoreTrailingSlash: true,
      ignoreDuplicateSlashes: true,
    })
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    GatewayAuthModule,
    fastifyAdapter,
    {
      logger: ["verbose", "error", "warn"],
    },
  )

  const configService = app.get<ConfigService>(ConfigService)

  const logger = winston.createLogger({
    transports: WinstonCustomTransports[environmentName],
    levels: {
      error: 0,
      warn: 1,
      info: 2,
    },
  })

  const staticUrl: string =
    configService.get<string>("application.images.core_dir") ?? ""
  if (staticUrl)
    fastifyAdapter.register(require("@fastify/static"), {
      root: path.join(__dirname, staticUrl),
      prefix: `/${configService.get<string>("application.images.core_prefix")}/`,
    })

  app.useGlobalFilters(new CommonErrorFilter(logger))
  app.useGlobalPipes(new GatewayPipe())
  app.enableVersioning({
    type: VersioningType.URI,
  })
  app.enableCors()

  const mode = configService.get<string>("application.node_env")

  // app.get(ClientDecoratorProcessorService).processDecorators([
  //   {
  //     target: OperationQueueService,
  //     constant: KAFKA_CLIENTS,
  //     meta: `kafka.queue`,
  //     decorator: Client,
  //   },
  // ])

  const port = configService.get<number>("gateway_core.port") ?? 3000
  await app.listen(port)

  if (mode === "" || mode === "development") {
    if (module.hot) {
      module.hot.accept()
      module.hot.dispose(() => app.close())
    }
  }
}
bootstrap()
