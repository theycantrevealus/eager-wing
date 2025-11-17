/**
 * @fileoverview Gateway Core
 * @module bootstrap
 */

import { NestFactory } from "@nestjs/core"
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify"

import * as fs from "fs"
import * as path from "path"
import * as winston from "winston"
import { GatewayCoreModule } from "./gateway.core.module"

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
    GatewayCoreModule,
    fastifyAdapter,
    {
      logger: ["verbose", "error", "warn"],
    },
  )
  await app.listen(process.env.PORT || 3000)
  console.log("Gateway Core")
}
bootstrap()
