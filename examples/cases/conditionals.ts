import {FunctionReturningPromise, SyncFunction} from "../types";
import {myRequest, someAsyncOperation, someSyncOperation, validateAsync} from "../helpers";

const someFunction: SyncFunction = someCondition => {
  let someValue = '';

  if (someCondition) {
    someValue = 'hi'
  } else {
    someValue = 'bye'
  }

  return someValue
};


const someFunctionTRW: SyncFunction = someCondition => someCondition ? 'hi' : 'bye';

const someFunctionTRW2: SyncFunction = someCondition => {
  if (someCondition) return 'hi';
  return 'bye'
};

const someMoreComplexFunction: FunctionReturningPromise = someCondition => {
  return someAsyncOperation()
    .then(result => {
      if (someCondition)
        return someAsyncOperation()
          .then(otherResult => validateAsync().then(isValid => {
            if (isValid) return {};
            return Promise.reject()
          }));

      return myRequest()
        .then(response => validateAsync().then(isValid => {
          if (isValid) return Promise.reject();
          return {}
        }))
    })
};

const someOption: FunctionReturningPromise = () =>
  someAsyncOperation()
    .then(otherResult => validateAsync())
    .then(isValid => isValid ? {} : Promise.reject());

const someOtherOption: FunctionReturningPromise = () =>
  myRequest()
    .then(response => someSyncOperation(0, 1));

const evaluateCondition = condition => () =>  condition ? someOption() : someOtherOption();

const someMoreComplexFunctionTRW: FunctionReturningPromise = someCondition => {
  return someAsyncOperation()
    .then(evaluateCondition(someCondition))
};