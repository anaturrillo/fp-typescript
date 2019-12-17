import {FunctionReturningPromise, FunctionWithConditionReturningPromise, GenericData, SyncFunction} from "../types";
import {myRequest, someAsyncOperation, someSyncOperation, validateAsync} from "../helpers";

const someFunction: SyncFunction = (someCondition: boolean) => {
  let someValue = '';

  if (someCondition) {
    someValue = 'hi';
  } else {
    someValue = 'bye';
  }

  return someValue;
};


const someFunctionTRW: SyncFunction = (someCondition: boolean) => someCondition ? 'hi' : 'bye';

const someFunctionTRW2: SyncFunction = (someCondition: boolean) => {
  if (someCondition) return 'hi';
  return 'bye';
};

const someMoreComplexFunction: FunctionWithConditionReturningPromise = (someCondition: boolean) => {
  return someAsyncOperation()
    .then(() => {
      if (someCondition)
        return someAsyncOperation()
          .then((result: GenericData) => validateAsync(result).then((isValid) => {
            if (isValid) return {};
            return Promise.reject();
          }));

      return myRequest()
        .then(response => validateAsync(response).then(isValid => {
          if (isValid) return Promise.reject();
          return {};
        }));
    });
};

const someOption: FunctionReturningPromise = () =>
  someAsyncOperation()
    .then(otherResult => validateAsync(otherResult))
    .then(isValid => isValid ? {} : Promise.reject());

const someOtherOption: FunctionReturningPromise = () =>
  myRequest()
    .then(response => someSyncOperation(0, 1));

const evaluateCondition = condition => (): Promise =>  condition ? someOption() : someOtherOption();

const someMoreComplexFunctionTRW: FunctionReturningPromise = someCondition => {
  return someAsyncOperation()
    .then(evaluateCondition(someCondition));
};