import "dotenv/config"

import { HttpStatus, Injectable } from "@nestjs/common"
import { JwtModuleOptions, JwtOptionsFactory, JwtService } from "@nestjs/jwt"

import { JWTTokenDecodeResponse, JWTTokenResponse } from "./dto"
import { TimeManagement } from "@utilities/time"

@Injectable()
export class AuthService implements JwtOptionsFactory {
  constructor(private jwtService: JwtService) {}
  createJwtOptions(): JwtModuleOptions {
    return {
      secret: process.env.JWT_SECRET,
    }
  }

  async create_token(data: any): Promise<JWTTokenResponse> {
    let result: JWTTokenResponse
    const TM = new TimeManagement()
    if (data && data.id) {
      try {
        const expiresIn = 30 * 24 * 60 * 60

        const token = this.jwtService.sign(data, {
          expiresIn: expiresIn,
          secret: null,
        })

        result = {
          account: data.account,
          login_id: data.id,
          status: HttpStatus.CREATED,
          message: "token_create_success",
          expired_at: TM.addTime(
            data.currentTime,
            expiresIn,
            "seconds",
            "YYYY-MM-DD HH:mm:ss",
            "Asia/Jakarta",
          ),
          token: token,
        }
      } catch (e) {
        result = {
          account: data.account,
          login_id: 0,
          status: HttpStatus.BAD_REQUEST,
          message: `token_create_bad_request ${e.message}`,
          expired_at: TM.getTimezone("Asia/Jakarta"),
          token: null,
        }
      }
    } else {
      result = {
        account: data.account,
        login_id: 0,
        status: HttpStatus.BAD_REQUEST,
        expired_at: TM.getTimezone("Asia/Jakarta"),
        message: "token_create_bad_request",
        token: null,
      }
    }
    return result
  }

  /**
   * Validate given token is valid or invalid
   * @param {{token: string}} data - Token for validate
   * @returns
   */
  async validate_token(data: {
    token: string
  }): Promise<JWTTokenDecodeResponse> {
    let result: JWTTokenDecodeResponse
    if (data && data.token) {
      try {
        const cleanToken = data.token.trim()

        await this.jwtService.verify(cleanToken, { secret: null })

        const decoded = await this.jwtService.decode(cleanToken, {
          complete: true,
        })

        const decodedData = (decoded as any).payload

        if (decoded) {
          result = {
            status: HttpStatus.OK,
            message: "token_decoded_success",
            account: decodedData.account,
            login_id: decodedData.login_id,
            token: data.token,
          }
        } else {
          result = {
            status: HttpStatus.UNAUTHORIZED,
            message: "token_unauthorized",
            account: null,
            login_id: 0,
            token: data.token,
          }
        }
      } catch (e) {
        result = {
          status: HttpStatus.BAD_REQUEST,
          message: e.message,
          account: null,
          login_id: 0,
          token: data.token,
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: "undefined token",
        account: null,
        login_id: 0,
        token: data.token,
      }
    }
    return result
  }
}
