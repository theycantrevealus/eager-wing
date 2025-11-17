/**
 * @fileoverview Authenticate account service.
 * @module GatewayAuthService
 */

import { Injectable } from "@nestjs/common"
import { Account } from "@schemas/account/account.model"
import { Result } from "@utilities/result"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { AccountSignInDTO } from "./dto/signIn.dto"

/**
 * This is lab renderer to develop basic character control module
 *
 * @example
 * constructor(@Inject(GatewayAuthService) private readonly gatewayAuthService: GatewayAuthService)
 *
 */

@Injectable()
export class GatewayAuthService {
  constructor(
    @InjectRepository(Account)
    private accountRep: Repository<Account>,
  ) {}

  /**
   * Validate sign in activity
   */
  async signIn<T>(data: AccountSignInDTO): Promise<Result<T>> {
    const user = await this.accountRep.findOneBy({ email: data.email })

    if (!user) {
      return Result.fail(new Error("Account not found"))
    }

    return Result.ok(user as T)
  }

  /**
   * Sign out of given token
   * @params {string} token - Token for sign out
   */
  async signOut(token: string) {}

  /**
   * Refresh the token expire time
   *
   * @param token - Token for refresh
   * @param refreshToken - Refresh token to validate the action
   */
  async refreshToken(token: string, refreshToken: string) {}
}
