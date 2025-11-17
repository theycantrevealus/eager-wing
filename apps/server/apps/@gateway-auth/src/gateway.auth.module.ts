import { Module } from "@nestjs/common"
import { AuthModule } from "@utilities/security/module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigService } from "@nestjs/config"

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => {
        return {
          type: "mysql",
          host: "localhost",
          port: 3306,
          username: "root",
          password: "root",
          database: "test",
          autoLoadEntities: true,
          synchronize: true,
        }
      },
    }),
    AuthModule,
  ],
})
export class GatewayAuthModule {}
