import {someAsyncOperation} from "../helpers";

const waitingForValues = async (items): Promise => {
  await items.forEach(item => {
    return someAsyncOperation(item);
  });
  return someAsyncOperation();
};

const waitingForValues2 = (items): Promise => {
  items.forEach(async item => {
    await someAsyncOperation(item);
  });
  return someAsyncOperation();
};

const waitingForValuesMap = async (items): Promise => {
  await Promise.all(items.map(item => someAsyncOperation(item)));
  return someAsyncOperation();
};

const waitingForValuesReduce = async (items): Promise => {

};