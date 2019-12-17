export type FunctionReturningPromise<T> = (data?: GenericData | ResponseData) => Promise<T>;
export type Validator = (data: GenericData | ResponseData) => Promise<boolean>;
export type FunctionWithConditionReturningPromise<T> = (condition: boolean) => Promise<T>;
export type ResponseData = {
  data?: boolean;
};
export type GenericData = {
  aLotOfData: boolean;
  aNumber: number;
};
export type SomeRequest = () => Promise<ResponseData>;
export type SyncFunction<O, P, Q> = (arg0?: O, arg1?: P) => Q;