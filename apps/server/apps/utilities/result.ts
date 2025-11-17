export abstract class Result<T, E = Error> {
  protected constructor() {}

  abstract isSuccess(): this is Success<T, E>

  isFailure(): this is Failure<T, E> {
    return !this.isSuccess()
  }

  unwrap(): T {
    if (this.isSuccess()) return this.value
    throw this.error
  }

  unwrapOr(defaultValue: T): T {
    return this.isSuccess() ? this.value : defaultValue
  }

  unwrapOrElse(fn: (error: E) => T): T {
    return this.isSuccess() ? this.value : fn(this.error)
  }

  async unwrapAsync(): Promise<T> {
    return this.isSuccess() ? this.value : Promise.reject(this.error)
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isSuccess()
      ? new Success(fn(this.value))
      : (this as unknown as Failure<U, E>)
  }

  async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Result<U, E>> {
    if (this.isFailure()) return this as unknown as Failure<U, E>
    try {
      const newValue = await fn(this.value)
      return Result.ok(newValue)
    } catch (err) {
      return Result.fail(err as E)
    }
  }

  chain<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.isSuccess()
      ? fn(this.value)
      : (this as unknown as Failure<U, E>)
  }

  async chainAsync<U>(
    fn: (value: T) => Promise<Result<U, E>>,
  ): Promise<Result<U, E>> {
    if (this.isFailure()) return this as unknown as Failure<U, E>
    try {
      return await fn(this.value)
    } catch (err) {
      return Result.fail(err as E)
    }
  }

  getOrElse(defaultValue: T): T {
    return this.isSuccess() ? this.value : defaultValue
  }

  match<U>(handlers: {
    success: (value: T) => U
    failure: (error: E) => U
  }): U {
    return this.isSuccess()
      ? handlers.success(this.value)
      : handlers.failure(this.error)
  }

  get value(): T {
    throw new Error("Cannot access value of a Failure result")
  }

  get error(): E {
    throw new Error("Cannot access error of a Success result")
  }

  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Success(value)
  }

  static fail<T, E = Error>(error: E): Result<T, E> {
    return new Failure(error)
  }

  static trySync<T, E = Error>(fn: () => T): Result<T, E> {
    try {
      return Result.ok(fn())
    } catch (err) {
      return Result.fail(err as E)
    }
  }

  static async tryAsync<T, E = Error>(
    fn: () => Promise<T>,
  ): Promise<Result<T, E>> {
    try {
      const value = await fn()
      return Result.ok(value)
    } catch (err) {
      return Result.fail(err as E)
    }
  }
}

export class Success<T, E = Error> extends Result<T, E> {
  private readonly _value: T
  constructor(value: T) {
    super()
    this._value = value
  }
  isSuccess(): this is Success<T, E> {
    return true
  }
  override get value(): T {
    return this._value
  }
}

export class Failure<T, E = Error> extends Result<T, E> {
  private readonly _error: E
  constructor(error: E) {
    super()
    this._error = error
  }
  isSuccess(): this is Success<T, E> {
    return false
  }
  override get error(): E {
    return this._error
  }
}
