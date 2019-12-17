import {FunctionReturningPromise} from "../types";
import {myRequest, someAsyncOperation, someSyncOperation, validateAsync} from "../helpers";

const myFuncion: FunctionReturningPromise = (someRelevantData) => {
  return myRequest()
    .then(response => {
      return validateAsync(response)
        .then(isValid => {
          return someAsyncOperation(response)
            .then(secondResponse => {
              return someSyncOperation(secondResponse, someRelevantData);
            });
        });
    });
};

const muFunctionEvenWorst: FunctionReturningPromise = (someRelevantData) =>
  myRequest()
    .then(response => validateAsync(response)
      .then(isValid =>
        someAsyncOperation(response)
          .then(secondResponse => someSyncOperation(secondResponse, someRelevantData))
      ));

const myFunctionTRW: FunctionReturningPromise = (someRelevantData) =>
  myRequest()
    .then(response => Promise.all([response, validateAsync(response)]))
    .then(([response]) => someAsyncOperation(response))
    .then(secondResponse => someSyncOperation(secondResponse, someRelevantData));



const validate = async (response): Promise => {
  try {
    await validateAsync(response);
    return response;
  } catch (e) {
    return Promise.reject();
  }
};

const handleFirstResponse = response => someAsyncOperation(response);
const handleSecondResponse = someRelevantData => secondResponse => someSyncOperation(secondResponse, someRelevantData);

const myFunctionTRW_: FunctionReturningPromise = (someRelevantData) =>
  myRequest()
    .then(validate)
    .then(handleFirstResponse)
    .then(handleSecondResponse(someRelevantData));

