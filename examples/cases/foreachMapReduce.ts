import {GenericData, IndexCreator} from "../types";

const functionToCreateNewArray = (arr: GenericData[]): GenericData[] => {
  const result = [];
  arr.forEach((item) => {
    result.push({aNumber: item.aNumber, aString: item.aString});
  });
  return result;
};

const functionToCreateIndex: IndexCreator = arr => {
  const result = {};
  arr.forEach(item => {
    result[item.aNumber] = item;
  });
  return result;
};

const reducerFunction = (arr: GenericData[]): GenericData => {
  const result = {
    aNumber: 0,
    aString: ''
  };

  arr.forEach(item => {
    result.aNumber = result.aNumber + item.aNumber;
    result.aString = result.aString + item.aString;
  });

  return result;
};

const functionToCreateNewArrayTRW = (arr: GenericData[]): GenericData[] =>
  arr.map((e) => ({
    aNumber: e.aNumber + 1,
    aString: e.aString
  }));

const functionToCreateIndexTRW: IndexCreator = arr =>
  arr.reduce((index, item) => ({...index, [item.aNumber]: item}), {});

const reducerFunctionTRW = (arr: GenericData[]): GenericData =>
  arr.reduce((result, item) => ({
    aNumber: result.aNumber + item.aNumber,
    aString: result.aString + item.aString
  }), {aNumber: 0, aString: ''});