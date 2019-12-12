import {FunctionReturningPromise, ResponseData, SomeRequest} from "../types";
import {myRequest} from "../helpers";

const someFunction: FunctionReturningPromise = () => {
  let someValueIWantToUseLater: ResponseData = {};

  return myRequest()
    .then(someValue => {
      someValueIWantToUseLater = someValue;
      return 'something';
    })
    .then(() => {
      if (someValueIWantToUseLater) return 'Hi';
      return 'Bye'
    })
};

const someFunctionTRW: FunctionReturningPromise = () =>
  myRequest()
    .then(someValue => someValue ? 'Hi' : 'Bye');

