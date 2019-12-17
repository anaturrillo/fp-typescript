import {FunctionReturningPromise, GenericData, ResponseData, SomeRequest, SyncFunction, Validator} from "../types";

export const myRequest: SomeRequest = () => Promise.resolve({data: true});

export const someAsyncOperation: FunctionReturningPromise = () => Promise.resolve('OK');

export const validateAsync: Validator = (data) => Promise.resolve(true);

export const someSyncOperation: SyncFunction = (a, b) => a;