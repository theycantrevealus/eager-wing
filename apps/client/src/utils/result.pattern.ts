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

/**
 * 
 
interface User {
  id: number
  name: string
  email: string
}

async function fetchUser(id: number): Promise<Result<User, string>> {
  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
    if (!res.ok) return Result.fail(`Network error: ${res.status}`)
    const user = await res.json()
    return Result.ok(user)
  } catch {
    return Result.fail("Request failed")
  }
}



function validateUser(user: User): Result<User, string> {
  if (!user.email.includes("@")) return Result.fail("Invalid email address")
  if (user.name.trim().length === 0) return Result.fail("Name is required")
  return Result.ok(user)
}


async function getValidatedUser(id: number): Promise<Result<User, string>> {
  const fetched = await fetchUser(id)

  return fetched
    .chain(validateUser) // only runs if fetchUser was successful
    .map(user => ({
      ...user,
      name: user.name.toUpperCase(), // safe transformation
    }))
}


async function run() {
  const result = await getValidatedUser(1)

  result.match({
    success: (user) => console.log("✅ User:", user),
    failure: (err) => console.error("❌ Error:", err),
  })
}


/////////

async function saveUser(user: User): Promise<Result<User, string>> {
  try {
    const res = await fetch("https://example.com/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
    if (!res.ok) return Result.fail(`Save failed: ${res.status}`)
    return Result.ok(user)
  } catch {
    return Result.fail("Network failure on save")
  }
}

async function processUser(id: number) {
  const result = await fetchUser(id)
    .chain(validateUser)
    .chain(saveUser)

  result.match({
    success: (user) => console.log("🎉 User saved:", user),
    failure: (err) => console.error("💥 Failed:", err),
  })
}




async function fetchUser(id: number): Promise<Result<any, Error>> {
  return Result.tryAsync(async () => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  })
}



async function processUser(id: number) {
  const result = await Result.tryAsync(() => fetchUser(id))
    .then(r =>
      r.chain(user => Result.trySync(() => user.name.toUpperCase())),
    )

  result.match({
    success: (name) => console.log("✅ Processed:", name),
    failure: (err) => console.error("💥 Failed:", err.message),
  })
}


async function getUserNameUpper(id: number): Promise<Result<string, Error>> {
  return (await Result.tryAsync(() => fetchUser(id)))
    .chain(res => Result.trySync(() => res.value.name.toUpperCase()))
}


const result = await getUserNameUpper(1)
result.match({
  success: (name) => console.log("✅ Name:", name),
  failure: (err) => console.error("❌ Error:", err.message),
})


////////////////////

interface User {
  id: number
  name: string
  email: string
}

async function fetchUser(id: number): Promise<Result<User, Error>> {
  return Result.tryAsync(async () => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  })
}

async function validateUser(user: User): Promise<Result<User, Error>> {
  if (!user.email.includes("@")) return Result.fail(new Error("Invalid email"))
  return Result.ok(user)
}

async function saveUser(user: User): Promise<Result<User, Error>> {
  // fake save
  console.log("Saving user:", user.name)
  return Result.ok(user)
}





async function processUser(id: number) {
  const result = await Result.tryAsync(() => fetchUser(id)) // Wrap outer async call

    // flatten nested Results automatically
    .then(r => r.chainAsync(validateUser))
    .then(r => r.chainAsync(saveUser))
    .then(r => r.mapAsync(async user => user.name.toUpperCase()))

  result.match({
    success: (name) => console.log("🎉 Success:", name),
    failure: (err) => console.error("💥 Error:", err.message),
  })
}


////////////////
const result = Result.ok("Hello")
console.log(result.unwrap()) // "Hello"

const result = Result.fail(new Error("Boom"))
console.log(result.unwrap()) // ❌ throws Error("Boom")

const result = Result.fail("not found")
console.log(result.unwrapOr("default")) // "default"


const result = Result.fail("network")
const user = result.unwrapOrElse(err => `guest-${err}`)
console.log(user) // "guest-network"


const user = await Result.unwrapAsync(fetchUser(1))
console.log(user.name)



 */
