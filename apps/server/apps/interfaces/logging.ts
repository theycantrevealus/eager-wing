import { IAccount } from "./account"

export interface Logging {
  ip: string
  path: string
  url: string
  method: string
  payload: any
  result: any
  takeTime: number
  account: IAccount
  time: Date
}
