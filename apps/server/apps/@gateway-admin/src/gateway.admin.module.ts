import {
  ApplicationConfig,
  environmentIdentifier,
  environmentName,
} from "@constants/environment"
import { ClientDecoratorProcessorService } from "@decorators/kafka.client"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { WinstonModule } from "@utilities/logger/winston/module"
import { WinstonCustomTransports } from "@utilities/logger/winston/transport"
import { AuthModule } from "@utilities/security/module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: environmentIdentifier,
      load: [ApplicationConfig],
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          handleRejections: true,
          handleExceptions: true,
          colorize: configService.get<boolean>("application.log.colorize"),
          transports: WinstonCustomTransports[environmentName],
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [ClientDecoratorProcessorService],
  exports: [],
})
export class GatewayAdminModule {}
