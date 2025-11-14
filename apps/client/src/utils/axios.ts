import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"
import { Result } from "./result.pattern"

export type RequestMiddleware = (
  config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>

export type ResponseMiddleware = (
  response: AxiosResponse,
) => AxiosResponse | Promise<AxiosResponse>

export type ErrorMiddleware = (error: any) => any | Promise<any>

export interface HttpClientOptions {
  baseURL?: string
  timeout?: number
  requestMiddlewares?: RequestMiddleware[]
  responseMiddlewares?: ResponseMiddleware[]
  errorMiddlewares?: ErrorMiddleware[]
}

export class HttpClient {
  private instance: AxiosInstance

  constructor(options: HttpClientOptions = {}) {
    const {
      baseURL,
      timeout = 10000,
      requestMiddlewares = [],
      responseMiddlewares = [],
      errorMiddlewares = [],
    } = options

    this.instance = axios.create({
      baseURL,
      timeout,
    })

    requestMiddlewares.forEach((mw) => {
      this.instance.interceptors.request.use(
        async (config) => {
          console.log(
            "[HTTP][REQUEST]",
            config.method?.toUpperCase(),
            config.url,
          )
          return mw(config)
        },
        (error) => {
          console.error("[HTTP][REQUEST][ERROR]", error)
          return Promise.reject(error)
        },
      )
    })

    responseMiddlewares.forEach((mw) => {
      this.instance.interceptors.response.use(async (response) => {
        console.log("[HTTP][RESPONSE]", response.status, response.config.url)
        return mw(response)
      })
    })

    errorMiddlewares.forEach((mw) => {
      this.instance.interceptors.response.use(undefined, async (error) => {
        console.error("[HTTP][RESPONSE][ERROR]", error.message)
        return mw(error)
      })
    })
  }

  public get axios(): AxiosInstance {
    return this.instance
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
    return Result.tryAsync(async () => {
      const res = await this.instance.get<T>(url, config)
      return res.data
    })
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Result<T>> {
    return Result.tryAsync(async () => {
      const res = await this.instance.post<T>(url, data, config)
      return res.data
    })
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Result<T>> {
    return Result.tryAsync(async () => {
      const res = await this.instance.put<T>(url, data, config)
      return res.data
    })
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Result<T>> {
    return Result.tryAsync(async () => {
      const res = await this.instance.delete<T>(url, config)
      return res.data
    })
  }
}
