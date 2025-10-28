interface ImportMeta {
  readonly hot?: {
    readonly data: any
    accept(callback?: (mod: any) => void): void
    dispose(callback: (data: any) => void): void
  }
}
