export const Result = {
  Ok: (value: any) => ({ isOk: true, value }),
  Err: (error: any) => ({ isOk: false, error }),
}
