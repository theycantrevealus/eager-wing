export type Panel = {
  id: number
  identifier: string
  title: string
  component?: string
  resizable: boolean
  x: number
  y: number
  z: number
  width: number
  height: number
  parameter?: Record<string, any>
  passingProp?: any
}
