import {GenericData} from "../types";

const someData: GenericData = {
  aLotOfData: true,
  aNumber: 5
};

const newSomeData: any = {... someData};
const otherNewData = {...someData};

otherNewData.aNumber = 'hola';
newSomeData.aNumber = 'hola';

type Message = {
  hello: string;
  test: string;
}

const myFunction = ({ head, ...rest }: Message) => rest;

const response = myFunction({ hello: 'world', test: 'test' });