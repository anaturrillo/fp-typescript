import {FunctionReturningPromise, SomeRequest, SyncFunction} from "../types";

export const myRequest: SomeRequest = () => Promise.resolve({data: true});

export const someAsyncOperation: FunctionReturningPromise = () => Promise.resolve('OK');

export const validateAsync: FunctionReturningPromise = () => Promise.resolve({valid: true});

export const someSyncOperation: SyncFunction = (a, b) => a;