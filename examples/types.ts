export type FunctionReturningPromise<T> = (data?) => Promise<T>;
export type ResponseData = {
  data?: boolean
};
export type GenericData = {
  aLotOfData: boolean,
  aNumber: number
}
export type SomeRequest = () => Promise<ResponseData>;
export type SyncFunction<T, P> = (T, P) => T;