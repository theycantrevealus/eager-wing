/**
 * @fileoverview Gateway Admin
 * @module bootstrap
 */

import { NestFactory } from "@nestjs/core"
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify"
import * as fs from "fs"
import * as path from "path"
import { GatewayAdminModule } from "./gateway.admin.module"

async function bootstrap() {
  let fastifyAdapter: FastifyAdapter
  const protocol: boolean = process.env.NODE_SECURE === "true"

  if (protocol) {
    fastifyAdapter = new FastifyAdapter({
      logger: false,
      disableRequestLogging: true,
      routerOptions: {
        ignoreTrailingSlash: true,
        ignoreDuplicateSlashes: true,
      },
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
      routerOptions: {
        ignoreTrailingSlash: true,
        ignoreDuplicateSlashes: true,
      },
    })
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    GatewayAdminModule,
    fastifyAdapter,
    {
      logger: ["verbose", "error", "warn"],
    },
  )
  await app.listen(process.env.PORT || 3000)
  console.log("Gateway Admin")
}

bootstrap()
