import {FunctionReturningPromise, ResponseData, SomeRequest} from "../types";
import {myRequest} from "../helpers";

const someFunction: FunctionReturningPromise = () => {
    let someValueIWantToUseLater: ResponseData = {};

    return myRequest()
        .then(someValue => {
            someValueIWantToUseLater = someValue;
            return 0;
        })
        .then(num => {
            if (someValueIWantToUseLater) return num;
            return num + 1
        })
};

const someFunctionTRW: FunctionReturningPromise = () =>
    myRequest()
        .then(someValue => Promise.all([someValue, 0]))
        .then(([someValue, num]) => someValue ? num : num + 1);

